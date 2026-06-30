# Feedback e Ideias de Evolução — Japanese Study App

**Data da análise:** 27 de junho de 2026  
**Projeto:** Japanese Study App  
**Integração prevista:** Mathicx-File

---

## 1. Visão geral

O Japanese Study App já ultrapassou o escopo de um simples visualizador de hiragana e katakana.

Atualmente, a aplicação reúne recursos importantes para um ciclo completo de estudo:

- consulta de hiragana e katakana;
- busca e filtros;
- favoritos;
- histórico de estudo;
- dashboard de progresso;
- dicionário;
- sistema SRS de repetição espaçada;
- diferentes modos de quiz;
- flashcards;
- prática de escrita em canvas;
- reprodução e orientação de traços;
- integração com o Mathicx-File por iframe e `postMessage`.

A direção do projeto é boa. Ele está evoluindo de uma ferramenta de consulta para uma plataforma de aprendizagem local, modular e integrada ao desktop virtual.

O próximo desafio não é apenas adicionar mais funcionalidades. A prioridade deve ser manter a aplicação confiável, organizada e preparada para crescer sem acumular fragilidade técnica.

---

## 2. Avaliação geral

| Área | Avaliação | Observação |
|---|---:|---|
| Escopo educacional | 9/10 | A aplicação já oferece várias formas de contato com o conteúdo |
| Organização do roadmap | 8,5/10 | As versões estão bem separadas e possuem objetivos claros |
| Arquitetura | 8/10 | A divisão por módulos é adequada para JavaScript vanilla |
| Persistência | 7,5/10 | LocalStorage e IndexedDB atendem bem, mas precisam de versionamento e backup |
| Experiência de estudo | 8/10 | SRS, quiz, escrita e dashboard formam um bom ciclo de aprendizagem |
| Robustez técnica | 6,5/10 | Testes, migrações, validação e recuperação de dados precisam avançar |
| Integração com Mathicx-File | 7/10 | A base existe, mas widget, launcher e notificações ainda podem ser aprofundados |

---

## 3. Pontos fortes do projeto

### 3.1 Arquitetura simples e adequada

A escolha de HTML, CSS e JavaScript vanilla com ES Modules é coerente com o objetivo de manter a aplicação rápida, portátil e fácil de integrar ao Mathicx-File.

A separação de responsabilidades entre módulos, como interface, busca, persistência, quiz, prática de escrita e reprodução de traços, ajuda a evitar que toda a lógica fique concentrada em um único arquivo.

No momento, não existe uma necessidade urgente de migrar para React, Vue, Angular ou outro framework. O projeto ainda pode crescer bastante com JavaScript vanilla, desde que continue separando responsabilidades.

### 3.2 Bom ciclo de aprendizagem

A aplicação já possui elementos importantes de uma experiência educacional completa:

1. o estudante conhece o caractere;
2. consulta exemplos;
3. pratica a escrita;
4. responde quizzes;
5. registra erros;
6. revisa pelo SRS;
7. acompanha o progresso no dashboard.

Essa combinação é mais valiosa do que simplesmente aumentar a quantidade de caracteres disponíveis.

### 3.3 Estratégia local-first

O uso de JSON local, LocalStorage e IndexedDB mantém a aplicação rápida, independente de servidor e utilizável sem autenticação.

Essa abordagem é especialmente adequada para a fase atual. Serviços remotos devem ser introduzidos apenas quando houver uma necessidade real de sincronização entre dispositivos, atualização dinâmica de conteúdo ou colaboração.

### 3.4 Integração com o Mathicx-File

O uso de `manifest.js`, `view.js`, iframe e comunicação por mensagens oferece uma boa fundação para:

- widgets;
- busca global;
- notificações;
- atalhos;
- restauração de estado;
- abertura direta em telas específicas.

Essa integração pode se tornar um dos principais diferenciais do projeto.

---

## 4. Pontos que merecem revisão

### 4.1 Inconsistência na documentação

A documentação possui seções que indicam dashboard, SRS, quiz e outros recursos como pendentes, mas as seções posteriores informam que eles já foram implementados.

É recomendado substituir a seção de conformidade por uma tabela centralizada:

| Recurso | Estado | Versão | Observações |
|---|---|---|---|
| Hiragana e katakana | Concluído | 1.0 | Fundação principal |
| Dashboard | Concluído | 1.1 | Métricas, progresso e atividade |
| Dicionário | Concluído | 1.2 | JSON local |
| SRS | Concluído | 1.3 | Revisão espaçada |
| Quiz | Concluído | 1.4 | Vários modos e fila de erros |
| Escrita | Concluído | 1.5 | Avaliação baseada em traços |
| Consolidação e backup | Planejado | 1.6 | Recomendação desta análise |
| Aprendizagem adaptativa | Planejado | 1.7 | Recomendação desta análise |
| Kanji | Planejado | 2.0 | JLPT N5 e N4 |
| Integração profunda | Planejado | 2.1 | Widget, launcher e notificações |

Também é recomendado adicionar no início da documentação:

```text
Versão atual: 1.5
Última atualização: AAAA-MM-DD
Próxima versão: 1.6 — Consolidação e Backup
```

### 4.2 Dependência remota do KanjiVG

O carregamento de SVGs por uma fonte remota pode falhar por:

- ausência de internet;
- bloqueio de rede;
- indisponibilidade do endereço;
- mudanças na estrutura do repositório;
- restrições de CORS.

Para hiragana, katakana e o conjunto inicial de kanji, é recomendado armazenar localmente os SVGs utilizados.

Exemplo:

```text
assets/strokes/
├── kana/
│   ├── 03042.svg
│   └── 03044.svg
└── kanji/
    ├── 065E5.svg
    └── 06708.svg
```

A licença e a atribuição do KanjiVG devem permanecer documentadas.

### 4.3 Uso de `innerHTML`

O risco é baixo enquanto todos os dados são locais e controlados. Entretanto, o risco aumenta quando forem adicionados:

- importação de JSON;
- sincronização online;
- Firebase;
- dicionários externos;
- anotações criadas pelo usuário.

Sempre que possível, deve-se preferir:

```javascript
element.textContent = value;
```

Quando for necessário construir estruturas maiores, é melhor criar os elementos explicitamente ou utilizar uma solução confiável de sanitização.

### 4.4 Validação de mensagens do iframe

As mensagens recebidas pelo aplicativo devem validar a origem e o formato dos dados.

Exemplo:

```javascript
if (!ALLOWED_ORIGINS.includes(event.origin)) {
  return;
}
```

Também é recomendado validar o contrato da mensagem:

```javascript
function isValidHostMessage(data) {
  return (
    data &&
    typeof data === "object" &&
    typeof data.type === "string"
  );
}
```

---

## 5. Prioridade recomendada antes de Kanji

Antes de iniciar uma grande base de kanji, é recomendado criar uma versão intermediária de consolidação.

## Versão 1.6 — Consolidação e Backup

### 5.1 Exportação e importação de dados

A aplicação já armazena informações importantes demais para depender apenas do navegador.

O backup deve incluir:

- favoritos de caracteres;
- favoritos do dicionário;
- histórico;
- progresso;
- dados do SRS;
- estatísticas;
- metas;
- preferências;
- versão do banco.

Estrutura sugerida:

```json
{
  "format": "japanese-study-backup",
  "schemaVersion": 1,
  "exportedAt": "2026-06-27T20:00:00Z",
  "data": {
    "favorites": [],
    "dictionaryFavorites": [],
    "progress": [],
    "srs": [],
    "settings": {}
  }
}
```

Na importação, podem ser oferecidas três opções:

1. substituir os dados atuais;
2. mesclar com os dados atuais;
3. visualizar o conteúdo antes de importar.

### 5.2 Versionamento do IndexedDB

A evolução para kanji exigirá modelos de dados maiores e mais variados.

Cada estrutura importante deve possuir uma versão:

```json
{
  "schemaVersion": 2,
  "entityType": "character-progress",
  "entityId": "hiragana-ka",
  "updatedAt": 1782600000000
}
```

Funções recomendadas:

```javascript
migrateDatabase(oldVersion, newVersion);
normalizeProgressRecord(record);
validateImportedBackup(data);
```

### 5.3 Testes automatizados

Não é necessário testar cada detalhe visual inicialmente. Os primeiros testes devem se concentrar nas áreas que podem gerar erros silenciosos:

- cálculo do SRS;
- próxima data de revisão;
- substituição de avaliações no mesmo dia;
- normalização de intervalos;
- cálculo de dias consecutivos;
- fila de erros do quiz;
- filtros combinados;
- exportação e importação;
- classificação da prática de escrita.

O test runner nativo do Node pode ser suficiente para preservar uma estrutura simples. Vitest também é uma opção, caso seja aceitável possuir uma etapa de desenvolvimento separada.

### 5.4 Tratamento de falhas

A aplicação deve apresentar mensagens compreensíveis quando ocorrerem problemas como:

- IndexedDB indisponível;
- backup inválido;
- SVG não encontrado;
- erro ao carregar JSON;
- dados antigos incompatíveis;
- falha de comunicação com o host.

---

## 6. Ideias de funcionalidades educacionais

## 6.1 Laboratório de caracteres parecidos

Criar sessões específicas para caracteres frequentemente confundidos:

### Hiragana

- `さ` e `き`;
- `ぬ` e `め`;
- `れ`, `ね` e `わ`.

### Katakana

- `シ` e `ツ`;
- `ソ` e `ン`;
- `ク` e `ケ`;
- `ウ`, `ワ` e `フ`.

A interface pode destacar:

- posição inicial dos traços;
- direção;
- inclinação;
- quantidade de traços;
- diferenças visuais;
- palavras de exemplo.

O sistema pode sugerir automaticamente esses pares com base nos erros do estudante.

## 6.2 Mapa de dificuldades

Criar uma visão por caractere:

| Caractere | Acertos | Erros | Tempo médio | Escrita | Estado |
|---|---:|---:|---:|---:|---|
| ぬ | 63% | 12 | 4,2 s | Regular | Aprendendo |
| め | 71% | 8 | 3,7 s | Bom | Revisão |

Esses dados podem gerar recomendações:

> Você está confundindo ぬ e め. Faça uma revisão comparativa de cinco minutos.

Essa funcionalidade forma a base do futuro assistente de estudos sem depender de inteligência artificial.

## 6.3 Caderno de erros

Registrar:

- pergunta exibida;
- resposta informada;
- resposta correta;
- tipo de quiz;
- tempo de resposta;
- data;
- quantidade de erros anteriores;
- caractere confundido.

Filtros sugeridos:

- erros recentes;
- erros recorrentes;
- caracteres confundidos;
- erros de escrita;
- erros já corrigidos.

## 6.4 Sessões rápidas

Adicionar modos prontos:

- revisão de 5 minutos;
- 10 caracteres novos;
- somente erros recentes;
- revisões vencidas;
- treino de escrita;
- katakana de palavras estrangeiras;
- modo surpresa;
- revisão antes de encerrar o dia.

Essas sessões combinam muito bem com o futuro widget do Mathicx-File.

## 6.5 Metas configuráveis

Permitir que o estudante defina metas como:

- estudar 10 minutos por dia;
- concluir 20 revisões;
- aprender 5 caracteres por semana;
- praticar escrita três vezes por semana;
- dominar hiragana até uma data específica.

As metas devem servir como orientação, sem punir o usuário por perder um dia.

## 6.6 Baralhos personalizados

Permitir criar conjuntos como:

- katakana que confundo;
- linha SA;
- revisão da prova;
- palavras de comida;
- primeiros kanji;
- erros da semana.

## 6.7 Anotações e mnemônicos pessoais

Cada caractere pode possuir um campo de anotação local.

Exemplo:

> シ aponta mais para cima, enquanto ツ possui os traços menores mais verticais.

Mnemônicos pessoais costumam ser mais memoráveis do que descrições genéricas.

## 6.8 Áudio de pronúncia

Possíveis fontes:

- arquivos de áudio locais;
- áudio gravado por falante;
- Web Speech API como fallback;
- reprodução opcional em flashcards.

O áudio deve ser tratado como recurso complementar, não como única referência de pronúncia.

## 6.9 Navegação por teclado

Atalhos sugeridos:

```text
J / K       caractere anterior ou próximo
F           favoritar
Espaço      revelar flashcard
1 / 2 / 3   difícil, bom ou fácil
R           reproduzir traços
P           abrir prática
Esc         fechar modal
```

---

## 7. Estratégia recomendada para Kanji

Não é recomendado começar adicionando todo o JLPT N5 e N4 de uma vez.

O ideal é criar uma primeira fatia vertical com aproximadamente 10 a 20 kanji e integrar completamente esses itens a todos os sistemas existentes:

1. exibição;
2. busca;
3. leituras;
4. significados;
5. vocabulário;
6. ordem dos traços;
7. escrita;
8. quiz;
9. SRS;
10. dashboard;
11. backup;
12. integração com o host.

Depois que esse fluxo estiver estável, a base pode ser expandida.

### Modelo de dados sugerido

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

### Funcionalidades para Kanji

- leituras onyomi e kunyomi;
- significados;
- radical principal;
- componentes;
- número de traços;
- vocabulário relacionado;
- comparação entre leituras;
- filtro por nível JLPT;
- filtro por quantidade de traços;
- agrupamento por tema;
- ordem de frequência;
- histórias mnemônicas;
- anotações pessoais;
- treino de leitura em contexto;
- quiz para completar palavras;
- quiz de leitura dentro de vocabulário.

### Progresso multidimensional

O progresso de kanji não deve ser apenas `mastered: true` ou `false`.

É melhor registrar separadamente:

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

Um estudante pode reconhecer um kanji sem conseguir escrevê-lo ou conhecer todas as leituras.

---

## 8. Arquitetura de dados sugerida

A ideia de utilizar providers deve ser expandida.

Camadas sugeridas:

```text
CharacterProvider
DictionaryProvider
KanjiProvider
ProgressRepository
SettingsRepository
StrokeProvider
BackupService
HostBridge
StudyEngine
RecommendationEngine
```

### Responsabilidades

- **Providers:** carregam conteúdo educacional;
- **Repositories:** armazenam e recuperam progresso;
- **Services:** executam regras e operações;
- **HostBridge:** centraliza comunicação com o Mathicx-File;
- **StudyEngine:** controla sessões de estudo;
- **RecommendationEngine:** gera sugestões com base em erros e progresso.

A interface não deve precisar saber se os dados vieram de JSON, IndexedDB, cache ou Firebase.

---

## 9. Integração com Mathicx-File

## 9.1 Widget de revisão diária

Informações sugeridas:

- revisões pendentes;
- sequência de dias;
- tempo estudado hoje;
- próxima revisão;
- progresso semanal;
- botão “Revisar agora”.

## 9.2 Deep links internos

Exemplos conceituais:

```text
japanese-study://review
japanese-study://quiz?script=katakana
japanese-study://character/ぬ
japanese-study://dictionary?query=neko
japanese-study://writing/あ
```

Mensagem do host:

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

Isso permitiria:

- clicar em uma notificação e abrir diretamente as revisões;
- pesquisar `ka` no launcher e abrir `か` ou `カ`;
- iniciar uma sessão curta pelo widget;
- restaurar a última tela aberta;
- abrir diretamente a prática de escrita.

## 9.3 Notificações inteligentes

Evitar notificações excessivas.

Exemplos úteis:

- revisões pendentes há mais de um dia;
- meta semanal próxima de ser concluída;
- novo recorde de sequência;
- recomendação de revisão de caracteres confundidos.

---

## 10. PWA e funcionamento offline

Mesmo integrado ao Mathicx-File, o aplicativo pode se beneficiar de um Service Worker.

Itens que podem ser armazenados:

- HTML;
- CSS;
- JavaScript;
- arquivos JSON;
- SVGs;
- fontes;
- tela principal;
- último conteúdo consultado.

Benefícios:

- funcionamento offline;
- carregamento mais rápido;
- instalação independente;
- maior estabilidade;
- menor dependência de rede.

---

## 11. Quando utilizar Firebase

A decisão de não utilizar Firebase agora é adequada.

Firebase deve ser considerado quando existir pelo menos uma destas necessidades:

- sincronização entre dispositivos;
- autenticação;
- dicionário atualizado remotamente;
- grande volume de conteúdo;
- compartilhamento de baralhos;
- acompanhamento por professor;
- colaboração entre usuários;
- atualização de conteúdo sem nova publicação.

Antes disso, Firebase adicionaria complexidade de autenticação, regras, conflitos, estados offline e custos sem entregar valor proporcional.

Quando a migração ocorrer, o cache local em IndexedDB deve ser mantido.

---

## 12. Roadmap recomendado

## Versão 1.6 — Consolidação

- exportação e importação;
- versionamento do IndexedDB;
- migrações de dados;
- testes do SRS;
- tratamento de falhas;
- KanjiVG offline;
- validação de `postMessage`;
- revisão da documentação;
- melhoria de acessibilidade.

## Versão 1.7 — Aprendizagem adaptativa

- mapa de dificuldades;
- laboratório de caracteres parecidos;
- caderno de erros;
- sessões rápidas;
- metas;
- recomendações baseadas no histórico;
- baralhos personalizados;
- anotações pessoais.

## Versão 2.0 — Kanji N5

- modelo de dados para kanji;
- conjunto inicial pequeno;
- leituras e significados;
- componentes e radicais;
- vocabulário;
- ordem dos traços;
- integração com SRS;
- integração com quiz;
- prática de escrita;
- dashboard multidimensional.

## Versão 2.1 — Integração profunda com Mathicx-File

- widget;
- deep links;
- busca global;
- notificações;
- status em tempo real;
- restauração de tela;
- ações rápidas.

## Versão 3.0 — Assistente de estudos

O assistente deve começar como um sistema determinístico.

Exemplos:

```text
Muitos erros em シ e ツ
→ recomendar comparação visual

Revisões vencidas há três dias
→ priorizar sessão SRS

Baixa precisão na escrita de ぬ
→ recomendar prática guiada
```

Uma IA conversacional pode ser avaliada posteriormente, quando os dados e as regras de recomendação estiverem estáveis.

## Versão 4.0 — Sincronização

- conta opcional;
- sincronização entre dispositivos;
- resolução de conflitos;
- cache local;
- backup remoto;
- dicionário remoto;
- compartilhamento opcional de baralhos.

---

## 13. Critérios de conclusão sugeridos

Cada versão deve possuir critérios claros.

### Exemplo para versão 1.6

- o usuário consegue exportar todos os dados;
- o backup contém uma versão de esquema;
- backups inválidos não são importados;
- o usuário pode escolher entre substituir ou mesclar;
- uma migração de banco não perde progresso;
- o SRS possui testes automatizados;
- a aplicação funciona sem internet para o conteúdo básico;
- mensagens de origem desconhecida são ignoradas;
- erros de armazenamento são apresentados de forma compreensível.

Esses critérios ajudam a impedir que uma funcionalidade seja considerada concluída apenas porque a interface já aparece na tela.

---

## 14. Recomendação final

As próximas entregas com maior impacto são:

1. **Backup, importação e migrações de banco.**
2. **Mapa de dificuldades e treino de caracteres parecidos.**
3. **Uma prova completa de Kanji com poucos caracteres.**
4. **Widget com sessões rápidas e deep links no Mathicx-File.**

O projeto já possui uma base educacional e técnica muito boa.

Neste momento, a melhor estratégia é fortalecer a fundação, proteger os dados do estudante e utilizar o histórico para personalizar as revisões. Depois disso, a expansão para kanji será mais segura e consistente.

A meta deve ser transformar o Japanese Study App em um sistema coerente de aprendizagem, e não apenas em uma coleção crescente de telas e recursos independentes.
