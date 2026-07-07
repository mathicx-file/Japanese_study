# Reestrutura de Gamificacao e Preparacao para Firebase

> Data: 2026-07-07
>
> Escopo: sistema local-first de XP, niveis, missoes e conquistas, preparado para sincronizacao futura por usuario no Mathicx-File.

## Objetivo

O sistema antigo calculava nivel a partir de metricas agregadas, como caracteres estudados, streak, SRS dominado e respostas no quiz. Isso era simples, mas pouco auditavel e facil de distorcer: muitas respostas no quiz podiam aumentar XP mesmo sem dominio real.

A nova estrutura separa tres dimensoes:

- **Habito**: ritmo, streak, dias ativos e tempo de estudo.
- **Dominio**: conclusao por escrita, itens dominados no SRS, precisao no quiz e precisao de digitacao.
- **Pratica**: eventos reais de estudo, como acertos no quiz, revisoes SRS e sessoes de digitacao.

O nivel final combina as tres dimensoes. A intencao e equilibrar consistencia com aprendizado real.

## Decisao Arquitetural

Foi criado um ledger local de eventos de gamificacao usando o IndexedDB existente:

```text
JapaneseStudyDB/japanese_progress
```

Eventos novos usam:

```json
{
  "type": "gamification_event",
  "entityType": "gamification-event",
  "eventType": "quiz.correct",
  "source": "quiz",
  "action": "correct-answer",
  "xp": 9,
  "skill": "recognition",
  "itemId": "a_あ",
  "syncStatus": "local",
  "schemaVersion": 1
}
```

Essa escolha evita uma migracao IndexedDB nova agora, preserva backup/importacao e prepara o caminho para Firestore append-only.

## Arquivos Principais

- `js/gamification-engine.js`: regras puras de XP, niveis, conquistas e missoes.
- `js/learning-levels.js`: ponte publica para o novo motor.
- `js/storage.js`: grava eventos de gamificacao junto com quiz, SRS e digitacao.
- `js/app.js`: inclui `gamificationStats` no contexto do Dashboard.
- `js/ui.js`: exibe XP total, dimensoes, missoes e conquistas.
- `tests/gamification-engine.test.mjs`: cobre eventos e resumo de progressao.

## Regras de XP

Eventos de pratica:

- `quiz.correct`: XP base por acerto.
- `quiz.incorrect`: XP pequeno por tentativa.
- `quiz.review-correct`: XP maior por corrigir erro reapresentado.
- `quiz.review-incorrect`: XP pequeno por tentativa em revisao.
- `srs.difficult`, `srs.good`, `srs.easy`: XP por revisao de memoria.
- `typing.session`: XP por sessao concluida, com bonus por volume e precisao.

Dimensoes calculadas:

- `dimensions.habit`
- `dimensions.mastery`
- `dimensions.practice`

O `xp` total soma essas dimensoes e usa uma tabela de 10 niveis.

## Comportamento Local-First

Hoje o app continua independente:

- sem dependencia de Firebase;
- sem usuario remoto;
- backup JSON continua incluindo os eventos;
- importacao por mescla preserva eventos;
- o Dashboard recalcula o nivel a partir dos dados locais.

## Preparacao para Firebase

Quando o Japanese Study for integrado ao Mathicx-File, a estrutura recomendada e:

```text
users/{uid}/japaneseStudy/profile/progression
users/{uid}/japaneseStudy/events/{eventId}
users/{uid}/japaneseStudy/achievements/{achievementId}
users/{uid}/japaneseStudy/stats/summary
users/{uid}/japaneseStudy/srs/{itemId}
users/{uid}/japaneseStudy/settings/main
```

### Eventos

`events/{eventId}` deve receber os registros `gamification_event`.

Recomendacao:

- tratar eventos como append-only;
- usar o `id` local como `eventId`;
- manter `createdAt`, `timestamp`, `source`, `eventType`, `xp`, `skill`, `itemId` e `schemaVersion`;
- atualizar `syncStatus` local para `synced` depois do envio.

### Perfil de Progressao

`profile/progression` deve guardar um resumo cacheado:

```json
{
  "schemaVersion": 1,
  "level": 4,
  "title": "Praticante Constante",
  "xp": 620,
  "progress": 30,
  "dimensions": {
    "habit": 120,
    "mastery": 350,
    "practice": 150
  },
  "updatedAt": "serverTimestamp"
}
```

Esse resumo e cache. A fonte auditavel continua sendo `events`.

### Conflitos

Regra sugerida:

- Eventos: mesclar por `eventId`; nunca sobrescrever evento existente.
- Perfil/resumo: recalcular depois da sincronizacao.
- SRS: usar `updatedAt` mais recente por item.
- Settings: ultimo update vence, enquanto nao houver colaboracao multi-dispositivo simultanea.

## Integracao com Mathicx-File

Quando rodar como iframe:

1. O Japanese Study inicializa Firebase separadamente.
2. O app observa `onAuthStateChanged`.
3. O path base vem do usuario autenticado:

```text
users/{uid}/japaneseStudy
```

4. Nao enviar token por `postMessage`.
5. Dicionario e dados estaticos continuam locais.
6. Firestore sincroniza apenas dados pessoais de estudo.

## Rules Futuras

Exemplo conceitual:

```text
match /users/{uid}/japaneseStudy/{document=**} {
  allow read, write: if request.auth != null
    && request.auth.uid == uid
    && get(/databases/$(database)/documents/users/$(uid)).data.accessStatus == "approved";
}
```

As rules reais devem ser adicionadas no projeto Mathicx-File quando o app for integrado.

## Trade-offs

Alternativa considerada: salvar apenas `xpTotal` no perfil local.

Motivo para nao escolher:

- dificil auditar;
- dificil sincronizar sem conflito;
- dificil explicar por que o usuario subiu de nivel;
- ruim para recalcular regras de XP no futuro.

Escolha atual: ledger de eventos + resumo calculado.

Beneficios:

- local-first;
- pronto para Firestore;
- facil de testar;
- permite recalcular niveis;
- preserva historico de aprendizado.

Custo:

- mais registros no IndexedDB;
- precisa de compactacao/resumo se o uso crescer muito.

## Proximos Passos

1. Criar um caderno visual de erros a partir dos eventos e `difficultyMap`.
2. Adicionar metas configuraveis pelo usuario.
3. Transformar conquistas em registros persistidos quando houver notificacao/desbloqueio visual.
4. Criar repositorio Firebase apenas depois da integracao iframe no Mathicx-File.
