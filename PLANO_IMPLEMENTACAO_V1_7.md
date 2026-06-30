# Plano de Implementação da Versão 1.7 — Aprendizagem Adaptativa

## Objetivo

Transformar o Japanese Study App em um orientador de próxima ação, mantendo a base local-first, JavaScript vanilla e compatibilidade com os backups da versão 1.6.

## Ordem de Implementação

1. Flag do quiz para incluir ou ignorar revisões de erros.
2. Botão **Estudar agora** com sessão recomendada.
3. Níveis do usuário em estilo RPG.
4. Recomendações determinísticas e ementa inicial.
5. Diagnóstico inicial.
6. Mapa de dificuldades.
7. Caderno de erros.
8. Trilhas guiadas, sessões rápidas, produção ativa e mnemônicos pessoais.

## Critérios de Conclusão

- O quiz permite ligar/desligar a fila de revisão de erros.
- O botão **Estudar agora** abre o quiz com uma sessão recomendada.
- O dashboard mostra nível, próximo passo, ementa e dificuldades.
- O diagnóstico salva resultado localmente.
- Erros do quiz são registrados como `quiz_error`.
- O dashboard oferece trilhas guiadas e sessões rápidas que abrem o quiz configurado.
- O quiz possui modo de produção ativa, pedindo o kana a partir do romaji.
- O modal do caractere permite salvar mnemônicos pessoais em `japanese_settings.mnemonics`.
- Backups continuam preservando settings e progresso da 1.7.
- `node --test` passa sem falhas.

## Notas de Arquitetura

- `js/study-engine.js` monta sessões recomendadas.
- `js/recommendation-engine.js` gera próximas ações determinísticas.
- `js/learning-levels.js` calcula nível, XP e progresso.
- `JapaneseStorage.getSettings()` e `setSettings()` armazenam preferências e diagnóstico.
