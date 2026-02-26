# PDF para Excel (Espelho de Ponto)

Site estático pronto para GitHub Pages que converte PDFs de espelho de ponto (como no exemplo enviado) para planilha Excel (`.xlsx`).

## Funcionalidades

- Upload de arquivo PDF no navegador.
- Extração de linhas da tabela por página usando `pdf.js`.
- Exportação para Excel usando `SheetJS (xlsx)`.
- Pré-visualização das primeiras linhas antes/ao mesmo tempo da exportação.

## Como acessar o site

### Opção 1: localmente (no seu computador)

1. Baixe/clone o repositório.
2. Abra um terminal na pasta do projeto.
3. Rode:

```bash
python3 -m http.server 4173
```

4. Abra no navegador:

```text
http://localhost:4173
```

### Opção 2: publicado no GitHub Pages

Depois de publicar, o endereço fica neste padrão:

```text
https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/
```

Exemplo: se seu usuário for `joao` e o repositório `pdf-excel`, a URL será:

```text
https://joao.github.io/pdf-excel/
```

## Como publicar no GitHub Pages

1. Crie um repositório no GitHub e envie estes arquivos.
2. No GitHub, vá em **Settings → Pages**.
3. Em **Build and deployment**, selecione:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` (ou a sua branch padrão)
   - **Folder**: `/ (root)`
4. Salve e aguarde a URL pública do site (ela aparece no topo da tela de **Pages**).

## Como usar

1. Abra o site.
2. Clique em **Selecionar PDF** e escolha o arquivo de espelho.
3. Clique em **Converter para Excel**.
4. O download do `.xlsx` será iniciado automaticamente.

## Limitações atuais

- O parser é otimizado para o layout de tabela do espelho de ponto mostrado no exemplo.
- Se houver grande variação de layout (colunas deslocadas, OCR com baixa qualidade), pode ser necessário ajustar a lógica no `app.js`.
