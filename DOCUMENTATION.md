# Japanese Study App

Aplicação web standalone para estudo de hiragana e katakana, criada para ser carregada pelo ecossistema Mathicx-File como uma aplicação externa via iframe.

O projeto usa apenas HTML5, CSS3 e JavaScript vanilla com ES Modules. Não há etapa de build, bundler ou dependência de framework.

```text
Versão atual: 1.7
Última atualização da documentação: 2026-06-29
Próxima versão recomendada: 2.0 - Kanji N5 Inicial
```

## Objetivo

O app ajuda no aprendizado inicial da escrita japonesa, com foco em:

- reconhecimento visual de hiragana e katakana;
- leitura por romaji;
- consulta de exemplos de palavras;
- favoritos;
- acompanhamento local de progresso;
- dashboard de aprendizado;
- dicionário local;
- repetição espaçada;
- quiz e flashcards;
- reprodução animada de traços quando há SVG disponível;
- prática de escrita em canvas.

Kanji está previsto no roadmap, mas deve entrar primeiro como uma fatia vertical pequena e completa antes da expansão para JLPT N5/N4.

## Estrutura do Projeto

```text
Applications/japanese-study/
├── index.html
├── manifest.js
├── view.js
├── css/
│   └── styles.css
├── js/
│   ├── app.js
│   ├── storage.js
│   ├── ui.js
│   ├── stroke-player.js
│   ├── search.js
│   ├── dictionary.js
│   ├── quiz.js
│   └── practice.js
├── data/
│   ├── hiragana.json
│   ├── katakana.json
│   └── dictionary.json
└── assets/
```

## Arquitetura

O projeto é dividido por responsabilidade:

- `index.html`: estrutura principal da tela.
- `css/styles.css`: estilos, temas, cards, modal, filtros, canvas e responsividade.
- `js/app.js`: inicialização, carregamento dos dados e integração entre módulos.
- `js/ui.js`: renderização da interface, grid, filtros, modal, favoritos e prática.
- `js/search.js`: busca instantânea com debounce e aplicação de filtros.
- `js/storage.js`: favoritos via LocalStorage e progresso via IndexedDB.
- `js/stroke-player.js`: carregamento e animação de SVGs do KanjiVG.
- `js/practice.js`: desenho em canvas e avaliação simples da escrita.
- `js/quiz.js`: geração de perguntas, validação de respostas e pontuação do quiz.
- `js/dictionary.js`: carregamento, busca, histórico e favoritos do dicionário.
- `data/hiragana.json`: base de caracteres hiragana.
- `data/katakana.json`: base de caracteres katakana.
- `data/dictionary.json`: base local inicial de palavras.
- `manifest.js`: metadados para integração com o Mathicx-File.
- `view.js`: adaptador de iframe para montagem dentro do host.

## Fluxo de Funcionamento

1. O host ou navegador carrega `index.html`.
2. `js/app.js` inicializa a UI e carrega `data/hiragana.json` e `data/katakana.json`.
3. Os caracteres recebem o campo `script`, com valores `hiragana` ou `katakana`.
4. A tela inicial exibe a lista filtrada por hiragana.
5. A busca e os filtros atualizam a grade sem recarregar a página.
6. Ao clicar em um card, o modal de estudo é aberto.
7. O modal registra progresso no IndexedDB e tenta carregar SVG de traços.
8. O usuário pode navegar entre caracteres, favoritar ou praticar escrita no canvas.

## Dados

Cada item dos arquivos JSON segue o formato:

```json
{
  "romaji": "ka",
  "char": "か",
  "unicode": "304B",
  "category": "gojuuon",
  "strokes": 3,
  "examples": [
    {
      "word": "かさ",
      "romaji": "kasa",
      "meaning": "umbrella"
    }
  ]
}
```

Categorias usadas:

- `gojuuon`: caracteres básicos;
- `dakuon`: caracteres com dakuten;
- `handakuon`: caracteres com handakuten;
- `youon`: combinações contraídas.

## Persistência

O app usa dois mecanismos locais:

- `LocalStorage`: guarda favoritos na chave `japanese_favorites`.
- `IndexedDB`: guarda histórico e progresso no banco `JapaneseStudyDB`, object store `japanese_progress`.

Registros de progresso usam este formato geral:

```json
{
  "id": "view_a_あ_123456789",
  "charId": "a_あ",
  "type": "view",
  "value": 1,
  "timestamp": 123456789
}
```

## Integração com Mathicx-File

O app foi preparado para rodar em:

```text
Applications/japanese-study/
```

E ser integrado pelo padrão:

```text
src/apps/japanese-study/
```

Arquivos de integração:

- `manifest.js`: registra nome, id, versão, permissões e capacidades.
- `view.js`: cria um iframe, carrega `index.html` e repassa mensagens do host.

Mensagens Host -> App:

- `theme`;
- `refresh`;
- `focus`.

Mensagens App -> Host:

- `study-progress`;
- `favorite-added`;
- `favorite-removed`.

## Estado dos Recursos

Esta tabela substitui a leitura antiga de conformidade por uma visão centralizada do produto. Ela deve ser atualizada sempre que uma versão for concluída.

| Recurso | Estado | Versão | Observações |
|---|---|---|---|
| Hiragana e katakana | Concluído | 1.0 | Fundação principal com grid, filtros, favoritos e modal |
| Integração base com Mathicx-File | Concluído | 1.0 | `manifest.js`, `view.js`, iframe e mensagens básicas |
| Dashboard de aprendizado | Concluído | 1.1 | Métricas, progresso, atividade e últimos caracteres |
| Dicionário local | Concluído | 1.2 | JSON local, busca, histórico e favoritos próprios |
| Sistema SRS | Concluído | 1.3 | Estados, próxima revisão, intervalo, facilidade e filtro de revisão |
| Quiz e flashcards | Concluído | 1.4 | Reconhecimento, romaji, múltipla escolha, digitação e fila de erros |
| Prática de escrita | Concluído | 1.5 | Canvas, guia de traços e avaliação baseada em desenho |
| Consolidação e backup | Concluído | 1.6 | Exportação/importação, versionamento, migrações, SVG local e testes |
| Aprendizagem adaptativa | Concluído | 1.7 | Estudar agora, níveis, recomendações, diagnóstico, mapa de dificuldades e quiz configurável |
| Kanji N5 inicial | Planejado | 2.0 | Primeira fatia vertical com 10 a 20 kanji antes de escalar |
| Integração profunda | Planejado | 2.1 | Widget, launcher, deep links, notificações e status em tempo real |
| Assistente de estudos | Planejado | 3.0 | Camada avançada sobre o motor determinístico iniciado na 1.7 |
| Sincronização opcional | Planejado | 4.0 | Backup remoto, conflitos, conta opcional e cache local |

## Riscos e Pontos Técnicos

- Dependência externa: o carregamento de SVGs usa GitHub raw. Sem internet ou com bloqueio de rede, a ordem real dos traços não aparece.
- Encoding: os arquivos parecem estar em UTF-8, mas alguns terminais podem exibir caracteres japoneses e ícones de forma corrompida se o console não estiver em UTF-8.
- Segurança de HTML: a UI monta alguns trechos com `innerHTML`. Como os dados vêm de JSON local controlado, o risco é baixo, mas isso deve ser revisto se houver importação de dados externos no futuro.
- Escalabilidade: a grade de caracteres já usa event delegation, mas filtros e controles internos ainda podem ser simplificados no futuro.
- Backup: o app já guarda dados de estudo importantes no navegador. Antes de aumentar o escopo com kanji, é recomendável exportar e importar progresso, favoritos, histórico, SRS e preferências.
- Versionamento de dados: a evolução para kanji, metas e sessões adaptativas deve incluir `schemaVersion`, normalização de registros e migrações explícitas do IndexedDB.
- Validação do host: mensagens recebidas por `postMessage` devem validar origem e formato antes de executar ações internas.
- Testes automatizados: SRS, fila de erros do quiz, cálculo de streak, filtros combinados, backup/importação e avaliação de escrita são pontos com risco de erro silencioso.
- Tratamento de falhas: IndexedDB indisponível, backup inválido, JSON corrompido, SVG ausente e falha de comunicação com o host devem gerar mensagens compreensíveis para o usuário.

## Diretrizes de Arquitetura

A aplicação deve continuar local-first e sem framework enquanto essa abordagem permanecer simples o suficiente. Para evitar acoplamento conforme o conteúdo crescer, novas funcionalidades devem preferir módulos com responsabilidade clara:

- `CharacterProvider`: carrega hiragana e katakana.
- `DictionaryProvider`: carrega e consulta palavras.
- `KanjiProvider`: carrega kanji, leituras, radicais e vocabulário.
- `ProgressRepository`: centraliza progresso, histórico, SRS e métricas.
- `SettingsRepository`: guarda preferências, metas e opções de estudo.
- `StrokeProvider`: resolve SVGs locais ou remotos e controla fallback.
- `BackupService`: exporta, valida, importa e migra dados.
- `HostBridge`: centraliza integração com Mathicx-File e valida mensagens.
- `StudyEngine`: monta sessões de revisão, quiz e escrita.
- `RecommendationEngine`: gera recomendações a partir de erros, SRS e dificuldade.

A interface não deve precisar saber se os dados vieram de JSON local, IndexedDB, cache, SVG local, serviço remoto ou Firebase.

## Roadmap

### Versão 1.0 - Fundação

Caracteres:

- Hiragana completo;
- Katakana completo;
- busca instantânea;
- favoritos;
- modal de estudo;
- exemplos de palavras.

Escrita:

- reprodução da ordem dos traços;
- SVGs do KanjiVG;
- controle de animação.

Persistência:

- LocalStorage;
- IndexedDB;
- histórico de estudo.

Integração:

- compatibilidade com Mathicx-File;
- comunicação Host <-> Iframe;
- sincronização de tema.

Status atual: majoritariamente implementado. As pendências restantes da fundação são melhorias incrementais, como favoritos avançados e preparação mais ampla para Kanji.

### Versão 1.1 - Dashboard de Aprendizado

Adicionar estatísticas:

- total de caracteres estudados;
- tempo total de estudo;
- dias consecutivos;
- taxa de conclusão de hiragana;
- taxa de conclusão de katakana.

Adicionar visualizações:

- barra de progresso;
- calendário de atividade;
- últimos caracteres estudados.

Persistência:

- manter dados via IndexedDB.

Status atual: implementado. O dashboard exibe métricas de caracteres estudados, tempo total registrado, dias consecutivos, favoritos, taxa de conclusão por hiragana/katakana, calendário simples de atividade e últimos caracteres estudados. O tempo é salvo em blocos de sessão a cada minuto e ao ocultar/sair da página.

### Versão 1.2 - Dicionário Japonês

Implementar uma área de dicionário inicial, focada apenas em palavras escritas com hiragana e katakana.

Dados de cada palavra:

- palavra em japonês;
- romaji;
- definição;
- tipo de escrita principal, `hiragana` ou `katakana`;
- categoria opcional;
- exemplos opcionais de uso.

Busca:

- localizar palavras pela escrita japonesa;
- localizar palavras pelo romaji;
- localizar palavras pela definição;
- integrar os resultados do dicionário à pesquisa principal do app;
- atualizar resultados sem recarregar a página.

Navegação:

- criar uma aba ou seção dedicada ao dicionário;
- separar visualmente palavras em hiragana e katakana;
- permitir alternar entre lista geral, histórico e favoritos.

Histórico:

- registrar palavras abertas/consultadas;
- armazenar histórico em IndexedDB;
- exibir últimas palavras consultadas.

Favoritos:

- permitir favoritar e remover palavras do dicionário;
- manter favoritos separados dos favoritos de caracteres;
- criar uma aba de palavras favoritas;
- separar favoritos por hiragana e katakana.

Persistência sugerida:

- histórico salvo no IndexedDB como registros `dictionary_view`;
- favoritos salvos separadamente na chave `japanese_dictionary_favorites`;
- manter compatibilidade com a estrutura atual de progresso.

Kanji:

- não implementar kanji no dicionário nesta versão;
- preparar o modelo para receber palavras com kanji futuramente;
- integrar entradas com kanji na versão 2.0, junto ao roadmap de Kanji.

Status atual: implementado. O app possui uma aba de dicionário com palavras em hiragana e katakana, busca por palavra/romaji/definição/categoria, filtros por escrita, histórico de consultas e favoritos de palavras separados dos favoritos de caracteres.

Nota de evolução: manter a lógica do dicionário atrás de um módulo/provider para permitir trocar a fonte de dados futuramente. A versão atual usa JSON local, mas o roadmap prevê migração para uma base remota quando o dicionário crescer.

### Versão 1.3 - Sistema SRS

Implementar repetição espaçada inspirada em Anki e SM-2.

Estados:

- novo;
- aprendendo;
- revisão;
- dominado.

Modelo sugerido:

```json
{
  "nextReview": "2026-06-25",
  "interval": 7,
  "easeFactor": 2.5,
  "repetitions": 4
}
```

Objetivo:

- revisar somente quando necessário.

Status atual: implementado. Cada caractere possui estado SRS local (`new`, `learning`, `review`, `mastered`), próxima revisão, intervalo, fator de facilidade e repetições. O modal permite avaliar o caractere como difícil, bom ou fácil; a grade possui filtro "Revisar hoje"; e o dashboard exibe revisões pendentes e caracteres dominados.

Correção aplicada: revisões repetidas no mesmo dia agora substituem a avaliação diária em vez de multiplicar o intervalo a cada clique. Os registros SRS também são normalizados ao serem lidos, com limite máximo de 90 dias para evitar intervalos corrompidos ou excessivos.

### Versão 1.4 - Quiz

Modos:

- reconhecimento;
- romaji para japonês;
- múltipla escolha;
- digitação;
- flashcards.

Exemplo de reconhecimento:

```text
Mostrar: あ
Respostas: a, e, i, o
```

Exemplo de romaji para japonês:

```text
Mostrar: ka
Resposta: か
```

Status atual: implementado. O app possui uma aba de Quiz com modos de reconhecimento, romaji para japonês, produção ativa, múltipla escolha, digitação e flashcards. O modo de produção ativa converte romaji digitado no teclado físico para hiragana ou katakana em tempo real, sem depender do IME do sistema. O quiz permite escolher hiragana, katakana ou ambos, mantém pontuação local durante a sessão e exibe feedback imediato. Cada sessão pode ter 10, 15 ou 20 perguntas; respostas erradas podem entrar em uma fila de revisão e reaparecer na mesma sessão, com indicação visual de "Revisão", depois de 2 a 4 perguntas. A versão 1.7 adicionou uma flag para ligar ou desligar essas revisões de erros. A seleção do quiz também pode ser refinada por nível, permitindo combinar Gojuuon, Dakuon, Handakuon e Youon com a escrita escolhida.

### Versão 1.5 - Modo de Escrita

Aprimorar o canvas interativo.

Adicionar:

- comparação de traços;
- direção do movimento;
- precisão da escrita.

Avaliações:

- excelente;
- bom;
- regular;
- praticar mais.

Status atual: implementado. O modo de escrita usa o modelo de traços carregado pelo KanjiVG quando disponível, exibe guia no canvas e avalia contagem de traços, direção, precisão e distribuição do desenho. Quando o SVG não está disponível, o app usa guia textual e avaliação limitada. O canvas vazio e rabiscos aleatórios não são mais classificados como bom ou excelente.

### Versão 1.6 - Consolidação, Backup e Robustez

Antes de expandir para Kanji, a prioridade é proteger os dados do estudante e estabilizar as bases técnicas.

Adicionar:

- exportação de dados em JSON;
- importação com validação;
- opções de importação: substituir, mesclar ou pré-visualizar;
- `schemaVersion` no backup e nos principais registros persistidos;
- migrações explícitas do IndexedDB;
- normalização de registros antigos;
- testes automatizados para SRS, quiz, filtros, streak, escrita e backup;
- tratamento visível de falhas de IndexedDB, JSON, SVG e comunicação com o host;
- validação de origem e contrato das mensagens recebidas via `postMessage`;
- armazenamento local dos SVGs essenciais do KanjiVG para kana e primeiro conjunto de kanji.

Backup sugerido:

```json
{
  "format": "japanese-study-backup",
  "schemaVersion": 1,
  "exportedAt": "2026-06-29T00:00:00.000Z",
  "data": {
    "favorites": [],
    "dictionaryFavorites": [],
    "progress": [],
    "srs": [],
    "settings": {}
  }
}
```

Critérios de conclusão:

- o usuário consegue exportar todos os dados importantes;
- backups inválidos são recusados com uma mensagem compreensível;
- importações permitem substituir ou mesclar dados;
- migrações não apagam progresso existente;
- o SRS possui testes para intervalos, revisões no mesmo dia e datas futuras;
- o conteúdo básico funciona sem internet;
- mensagens de origem desconhecida são ignoradas.

Status atual: implementado. A versão 1.6 adiciona aba de dados para exportar e importar backup JSON, validação de formato, modos de importação por mescla ou substituição, versionamento básico dos registros, migração do IndexedDB para versão 2, testes automatizados com `node --test`, validação de mensagens recebidas do host e suporte a SVGs locais antes do fallback remoto do KanjiVG.

### Versão 1.7 - Aprendizagem Adaptativa

Transformar o histórico do estudante em recomendações práticas sem depender inicialmente de IA conversacional. Esta versão deve fazer o app responder melhor à pergunta mais importante para o usuário: "o que eu devo estudar agora?".

Adicionar:

- diagnóstico inicial para identificar o nível do estudante em hiragana e katakana;
- botão principal "Estudar agora";
- sessão diária inteligente;
- trilhas guiadas;
- mapa de dificuldades por caractere;
- laboratório de caracteres parecidos;
- caderno de erros;
- sessões rápidas de estudo;
- treino de produção ativa;
- metas configuráveis;
- baralhos personalizados;
- anotações e mnemônicos pessoais;
- áudio de pronúncia como recurso complementar;
- navegação por teclado.

Diagnóstico inicial:

- aplicar um quiz curto na primeira execução ou quando o usuário solicitar;
- abrir como uma sessão especial dentro da aba Quiz, com aviso próprio de diagnóstico e revisões de erro desativadas;
- estimar domínio por escrita, categoria e caracteres individuais;
- sugerir uma trilha inicial sem bloquear exploração livre;
- permitir pular o diagnóstico.

Botão "Estudar agora":

- montar automaticamente uma sessão com base no estado atual;
- priorizar revisões vencidas;
- incluir erros recentes;
- adicionar poucos caracteres novos quando houver espaço;
- alternar reconhecimento, romaji, flashcard e escrita;
- encerrar com um resumo simples do que melhorou e do que merece atenção.

Sessão diária inteligente sugerida:

```text
60% revisões vencidas
20% erros recentes
10% caracteres parecidos
10% conteúdo novo
```

Essa proporção pode variar de acordo com tempo disponível, dificuldade do usuário e metas configuradas.

Trilhas guiadas sugeridas:

- Hiragana em 7 dias;
- Katakana em 7 dias;
- Katakana para palavras estrangeiras;
- Revisão de caracteres parecidos;
- Escrita básica sem guia;
- Pré-Kanji: vocabulário e radicais iniciais.

Caracteres parecidos sugeridos:

- Hiragana: `さ`/`き`, `ぬ`/`め`, `れ`/`ね`/`わ`.
- Katakana: `シ`/`ツ`, `ソ`/`ン`, `ク`/`ケ`, `ウ`/`ワ`/`フ`.

Sessões rápidas sugeridas:

- revisão de 5 minutos;
- 10 caracteres novos;
- somente erros recentes;
- revisões vencidas;
- treino de escrita;
- katakana de palavras estrangeiras;
- revisão antes de encerrar o dia.

Treino de produção ativa:

- mostrar romaji e pedir o kana correspondente;
- tocar áudio e pedir romaji ou caractere;
- mostrar palavra incompleta e pedir o caractere ausente;
- pedir escrita no canvas sem guia;
- comparar caracteres parecidos em rodadas curtas.

Assistente determinístico inicial:

- recomendar treino comparativo quando detectar confusão recorrente;
- sugerir revisão SRS quando houver itens vencidos;
- sugerir escrita guiada quando a precisão do canvas cair;
- explicar a recomendação com uma frase curta;
- evitar tom punitivo ao lidar com metas perdidas.

Status atual: implementado. A versão 1.7 adiciona flag para incluir ou ignorar revisões de erros no quiz, botão "Estudar agora", sessão recomendada pelo `StudyEngine`, níveis de aprendizado em estilo RPG, recomendações determinísticas, ementa inicial, diagnóstico curto, registro de respostas/erros do quiz e mapa simples de dificuldades no dashboard. O refinamento adicional da 1.7 adiciona trilhas guiadas, sessões rápidas, mnemônicos pessoais salvos localmente e treino de produção ativa.

### Versão 2.0 - Kanji N5 Inicial

Não começar adicionando todo o JLPT N5 e N4 de uma vez. A primeira entrega de Kanji deve ser uma fatia vertical com aproximadamente 10 a 20 kanji, integrada a todos os sistemas já existentes.

Adicionar:

- modelo de dados para kanji;
- conjunto inicial pequeno de kanji N5;
- leituras onyomi;
- leituras kunyomi;
- significados;
- radical principal;
- componentes;
- número de traços;
- exemplos de vocabulário;
- suporte a entradas de dicionário com kanji;
- busca por significado, leitura, radical e nível;
- integração com SRS;
- integração com quiz;
- integração com prática de escrita;
- dashboard com progresso multidimensional.

Modelo sugerido:

```json
{
  "id": "kanji-day",
  "char": "日",
  "unicode": "65E5",
  "level": "N5",
  "strokes": 4,
  "meanings": ["dia", "sol"],
  "onyomi": ["ニチ", "ジツ"],
  "kunyomi": ["ひ", "か"],
  "radical": "日",
  "components": ["日"],
  "examples": [
    {
      "word": "日本",
      "reading": "にほん",
      "romaji": "nihon",
      "meaning": "Japão"
    }
  ],
  "tags": ["tempo", "natureza"]
}
```

Progresso multidimensional sugerido:

```json
{
  "recognition": 0.8,
  "meaning": 0.7,
  "onyomi": 0.4,
  "kunyomi": 0.5,
  "writing": 0.3,
  "vocabulary": 0.6
}
```

O estudante pode reconhecer um kanji sem dominar escrita, leituras e vocabulário. Por isso, Kanji não deve usar apenas `mastered: true` ou `false`.

### Versão 2.1 - Integração Profunda com Mathicx-File

Integrar o app de forma mais profunda ao Mathicx-File, incluindo widgets, launcher, notificações e comunicação de status de estudo.

Widget de revisão diária:

```text
🇯🇵 Revisão de Japonês
```

Exibir:

- caracteres pendentes hoje;
- sequência de dias estudados;
- tempo estudado hoje;
- próxima revisão.

Mensagem para o host:

```json
{
  "type": "study-status",
  "payload": {
    "reviewsDue": 12,
    "streak": 8,
    "studiedToday": 18
  }
}
```

Atalho:

- clique no widget abre diretamente o Japanese Study App.

Widget expandido:

- revisões pendentes;
- kanji aprendidos;
- tempo semanal.

Launcher:

- integrar resultados na busca global.

Exemplo:

```text
Pesquisar: ka
Retornar: か, カ
```

Deep links internos:

```text
japanese-study://review
japanese-study://quiz?script=katakana
japanese-study://character/ぬ
japanese-study://dictionary?query=neko
japanese-study://writing/あ
```

Mensagem de navegação sugerida:

```json
{
  "type": "navigate",
  "payload": {
    "route": "review",
    "filters": {
      "dueOnly": true
    }
  }
}
```

Notificações:

- toast automático para revisões pendentes;
- aviso de meta semanal próxima de conclusão;
- novo recorde de sequência;
- recomendação de revisão para caracteres confundidos.

Exemplo:

```text
Você possui 8 caracteres para revisar hoje.
```

### Versão 3.0 - Assistente de Estudos

Evoluir o assistente determinístico iniciado na versão 1.7 para uma camada mais completa de planejamento, explicação e acompanhamento. Esta versão não deve substituir o SRS nem as sessões inteligentes; deve orquestrar esses recursos com mais contexto.

Adicionar:

- plano de estudos;
- recomendações automáticas mais ricas;
- revisão inteligente entre kana, dicionário e kanji;
- priorização de erros recorrentes;
- sugestão de sessões curtas;
- explicações simples sobre por que uma revisão foi recomendada.
- adaptação por objetivo, como viagem, prova, leitura ou escrita;
- análise semanal de progresso;
- ajuste automático de metas quando o ritmo real do estudante mudar.

Exemplos:

```text
Muitos erros em シ e ツ
-> recomendar comparação visual

Revisões vencidas há três dias
-> priorizar sessão SRS

Baixa precisão na escrita de ぬ
-> recomendar prática guiada
```

Uma IA conversacional pode ser avaliada depois, quando regras, eventos e dados de progresso estiverem estáveis.

### Versão 4.0 - Sincronização

Adicionar:

- conta opcional;
- sincronização online futura;
- backup remoto;
- resolução de conflitos;
- cache local;
- dicionário remoto;
- compartilhamento opcional de baralhos.

### Versão 4.1 - Firebase para Dicionário e Progresso

Migrar o dicionário para Firebase quando a base de palavras crescer além do uso confortável em JSON local.

Objetivos:

- armazenar o dicionário em uma base remota;
- permitir atualização de palavras sem publicar nova versão do app;
- sincronizar favoritos, histórico e progresso entre dispositivos;
- manter cache local em IndexedDB para uso offline e carregamento rápido;
- carregar o dicionário por páginas, filtros ou prefixos em vez de baixar tudo de uma vez.

Arquitetura sugerida:

- criar um `DictionaryProvider` com métodos como `search`, `getById`, `getFavorites` e `getHistory`;
- manter a UI independente da fonte de dados;
- usar Firebase para armazenamento/sincronização;
- avaliar serviço de busca dedicado, como Algolia ou Meilisearch, caso a busca textual do dicionário fique grande ou precise de fuzzy search.

Observação:

- Firebase deve entrar quando houver necessidade real de sincronização remota ou atualização dinâmica da base. Para a fase atual, JSON local e IndexedDB continuam mais simples e rápidos.

## Visão Final

O Japanese Study App deve evoluir de um visualizador de hiragana e katakana para um sistema completo de aprendizado japonês integrado ao Mathicx-File, aproveitando widgets, launcher, notificações, IndexedDB e comunicação via mensagens para criar uma experiência de estudo contínua dentro do desktop.

## Próximos Passos Recomendados

1. Iniciar Kanji na versão 2.0 como uma fatia vertical pequena, com 10 a 20 kanji totalmente integrados.
2. Aprofundar a integração com Mathicx-File por widget, launcher, deep links e notificações úteis.
3. Evoluir o assistente determinístico com planos de estudo explicáveis e priorização de erros recorrentes.
