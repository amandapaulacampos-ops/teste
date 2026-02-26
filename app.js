import * as pdfjsLib from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.3.136/pdf.min.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.3.136/pdf.worker.min.mjs';

const headers = [
  'Data',
  'Dia',
  'Horario Previsto',
  '1º Expediente Entrada',
  '1º Expediente Saida',
  '2º Expediente Entrada',
  '2º Expediente Saida',
  'Hora Extra Entrada',
  'Hora Extra Saida',
  'Codigo Ocorrencia',
  'Rubrica Funcionario'
];

const input = document.getElementById('pdfInput');
const button = document.getElementById('convertBtn');
const statusEl = document.getElementById('status');
const tableHead = document.querySelector('#previewTable thead');
const tableBody = document.querySelector('#previewTable tbody');

let currentRows = [];
let currentFileName = 'espelho-ponto';

input.addEventListener('change', () => {
  const hasFile = Boolean(input.files?.length);
  button.disabled = !hasFile;
  currentRows = [];
  renderPreview([]);
  statusEl.textContent = hasFile
    ? 'Arquivo selecionado. Clique em Converter para Excel.'
    : 'Aguardando arquivo...';
});

button.addEventListener('click', async () => {
  const file = input.files?.[0];
  if (!file) {
    statusEl.textContent = 'Selecione um PDF primeiro.';
    return;
  }

  button.disabled = true;
  statusEl.textContent = 'Lendo PDF...';
  currentFileName = file.name.replace(/\.pdf$/i, '');

  try {
    const buffer = await file.arrayBuffer();
    const rows = await parsePdfRows(buffer);

    if (!rows.length) {
      statusEl.textContent =
        'Não foi possível identificar linhas de tabela. Verifique se o PDF segue o modelo esperado.';
      return;
    }

    currentRows = rows;
    renderPreview(rows.slice(0, 30));
    exportToExcel(rows);
    statusEl.textContent = `Conversão concluída. ${rows.length} linhas exportadas.`;
  } catch (error) {
    console.error(error);
    statusEl.textContent = `Erro na conversão: ${error.message}`;
  } finally {
    button.disabled = false;
  }
});

async function parsePdfRows(arrayBuffer) {
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const allRows = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const items = textContent.items
      .map((item) => ({
        str: item.str.trim(),
        x: item.transform[4],
        y: item.transform[5]
      }))
      .filter((item) => item.str);

    const groupedByLine = groupByY(items);

    for (const lineItems of groupedByLine) {
      const row = parseLineToRow(lineItems);
      if (row) {
        allRows.push(row);
      }
    }
  }

  return allRows;
}

function groupByY(items) {
  const tolerance = 2;
  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
  const lines = [];

  sorted.forEach((item) => {
    const line = lines.find((entry) => Math.abs(entry.y - item.y) <= tolerance);
    if (line) {
      line.items.push(item);
    } else {
      lines.push({ y: item.y, items: [item] });
    }
  });

  return lines
    .sort((a, b) => b.y - a.y)
    .map((line) => line.items.sort((a, b) => a.x - b.x));
}

function parseLineToRow(lineItems) {
  const first = lineItems[0]?.str ?? '';
  if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(first)) {
    return null;
  }

  const tokens = lineItems.map((item) => item.str);
  const date = tokens[0] ?? '';
  const weekday = tokens[1] ?? '';

  const rest = tokens.slice(2).filter((token) => token !== '|');
  const normalized = [];

  rest.forEach((token) => {
    const split = token
      .replace(/\s{2,}/g, ' ')
      .split(' ')
      .filter(Boolean);
    normalized.push(...split);
  });

  const scheduleTokens = normalized.filter((token) => token !== '');

  return [
    date,
    weekday,
    scheduleTokens[0] ?? '',
    scheduleTokens[1] ?? '',
    scheduleTokens[2] ?? '',
    scheduleTokens[3] ?? '',
    scheduleTokens[4] ?? '',
    scheduleTokens[5] ?? '',
    scheduleTokens[6] ?? '',
    scheduleTokens[7] ?? '',
    scheduleTokens.slice(8).join(' ')
  ];
}

function renderPreview(rows) {
  tableHead.innerHTML = `<tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>`;
  tableBody.innerHTML = rows
    .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`)
    .join('');
}

function exportToExcel(rows) {
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Espelho');
  XLSX.writeFile(workbook, `${currentFileName}.xlsx`);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
