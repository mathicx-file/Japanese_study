# Japanese Study

Aplicacao web para estudar hiragana, katakana e kanji N5, com foco em pratica diaria, consulta rapida e acompanhamento de progresso local.

O projeto e feito com HTML, CSS e JavaScript vanilla usando ES Modules. Nao ha etapa de build, framework ou banco de dados externo: os dados ficam em arquivos JSON e o progresso do usuario e salvo localmente no navegador.

## Recursos

- Estudo de hiragana, katakana e kanji N5.
- Busca por romaji, kana, kanji, leitura ou significado.
- Dicionario local com palavras em japones, romaji e definicoes.
- Dashboard de aprendizado com progresso e atividade recente.
- Quiz, flashcards e revisoes com repeticao espacada.
- Favoritos e historico local.
- Pratica de escrita em canvas.
- Suporte a animacoes de tracos quando assets SVG estiverem disponiveis.

## Requisitos

Para usar a aplicacao localmente, voce precisa de uma destas opcoes:

- Node.js instalado, recomendado para rodar testes e usar ferramentas via `npx`.
- Python 3 instalado, caso prefira subir um servidor estatico simples.

Como o app usa ES Modules e carrega arquivos JSON por `fetch`, abra a aplicacao por um servidor local. Evite abrir o `index.html` diretamente no navegador.

## Instalacao

Clone o repositorio:

```bash
git clone https://github.com/mathicx-file/Japanese_study.git
cd Japanese_study
```

Este projeto nao possui dependencias obrigatorias de runtime. Se quiser apenas usar a aplicacao, nao e necessario instalar pacotes.

## Iniciando o servidor

Opcao com Python:

```bash
python -m http.server 8080
```

Depois acesse:

```text
http://localhost:8080
```

Opcao com Node.js:

```bash
npx http-server . -p 8080
```

Depois acesse:

```text
http://localhost:8080
```

## Testes

Para executar a suite de testes:

```bash
npm test
```

No PowerShell do Windows, se a politica de execucao bloquear o `npm`, use:

```powershell
npm.cmd test
```

## Estrutura do projeto

```text
.
|-- assets/
|-- css/
|   `-- styles.css
|-- data/
|   |-- dictionary.json
|   |-- hiragana.json
|   |-- kanji.json
|   `-- katakana.json
|-- js/
|   |-- app.js
|   |-- dictionary.js
|   |-- kana-input.js
|   |-- learning-levels.js
|   |-- practice.js
|   |-- quiz.js
|   |-- recommendation-engine.js
|   |-- search.js
|   |-- srs-engine.js
|   |-- storage.js
|   |-- stroke-player.js
|   |-- study-engine.js
|   `-- ui.js
|-- tests/
|-- index.html
|-- manifest.js
|-- package.json
`-- view.js
```

## Dados locais

O progresso, favoritos e informacoes de estudo sao armazenados no navegador usando APIs locais como LocalStorage e IndexedDB. Esses dados nao sao enviados para servidor externo.

## Integracao

O arquivo `manifest.js` contem metadados para integracao com o ecossistema Mathicx-File, e `view.js` atua como adaptador para carregamento em iframe pelo host.
