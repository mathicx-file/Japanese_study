Resumo da aplicacao Japanese Study

O Japanese Study e uma aplicacao web standalone voltada ao estudo inicial da escrita japonesa. Ela foi criada para ajudar no aprendizado de hiragana e katakana, funcionando diretamente no navegador com HTML, CSS e JavaScript puro, sem frameworks ou etapa de build. A aplicacao tambem foi preparada para ser integrada ao ecossistema Mathicx-File como uma aplicacao externa carregada via iframe.

Funcoes atuais

- Exibe uma grade de caracteres hiragana e katakana.
- Permite buscar caracteres por romaji, hiragana ou katakana.
- Possui filtros por escrita, categoria, favoritos e revisoes pendentes.
- Abre um modal de estudo com caractere ampliado, romaji, categoria, numero de tracos e exemplos de palavras.
- Permite favoritar caracteres, salvando os dados localmente no navegador.
- Registra historico de estudo, caracteres visualizados e tempo de sessao usando IndexedDB.
- Possui dashboard de aprendizado com estatisticas, progresso por hiragana/katakana, atividade recente e ultimos caracteres estudados.
- Inclui um dicionario inicial com palavras em hiragana e katakana, busca por palavra, romaji, definicao e categoria.
- Mantem historico e favoritos separados para palavras do dicionario.
- Possui sistema SRS de repeticao espacada, com estados como novo, aprendendo, revisao e dominado.
- Inclui uma aba de quiz com modos de reconhecimento, romaji para japones, producao ativa com conversao romaji para kana, multipla escolha, digitacao e flashcards.
- Possui pratica de escrita em canvas, com avaliacao baseada em tracos, direcao, precisao e distribuicao quando ha modelo disponivel.
- Tenta carregar SVGs do KanjiVG para animar ou guiar a ordem dos tracos.
- Recebe mensagens do host para tema, foco e recarregamento, alem de enviar eventos de progresso e favoritos.
- Possui aba de dados para exportar backup JSON e importar backups por mescla ou substituicao.
- Usa versionamento basico nos registros persistidos e migra o IndexedDB para suportar novos indices.
- Valida backups antes da importacao e valida mensagens recebidas do host por postMessage.
- Tenta carregar SVGs locais em assets/strokes antes de recorrer ao KanjiVG remoto.
- Inclui testes automatizados com o runner nativo do Node para SRS, streak e validacao de backup.
- Possui botao "Estudar agora" que abre uma sessao de quiz recomendada com base no progresso local.
- Inclui flag no quiz para ligar ou desligar revisoes de erros dentro da sessao.
- Mostra nivel de aprendizado em estilo RPG, proximo passo recomendado, ementa inicial e mapa simples de dificuldades no dashboard.
- Registra respostas e erros do quiz para apoiar recomendacoes deterministicas.
- Exibe trilhas guiadas e sessoes rapidas no dashboard, abrindo o quiz ja configurado.
- Permite salvar mnemonicos pessoais por caractere no modal de estudo.

Funcoes planejadas futuramente

- Expandir a aprendizagem adaptativa com caderno de erros dedicado, laboratorio de caracteres parecidos, metas configuraveis, baralhos personalizados e anotacoes mais estruturadas.
- Aprofundar o treino de producao ativa, com audio para resposta, palavra incompleta e escrita no canvas sem guia.
- Adicionar suporte a Kanji, com foco inicial em JLPT N5 e N4.
- Iniciar Kanji por uma fatia vertical pequena, com 10 a 20 kanji completamente integrados a busca, dicionario, SRS, quiz, escrita, dashboard, backup e Mathicx-File.
- Incluir leituras onyomi e kunyomi, significados e exemplos para kanji.
- Expandir o dicionario para aceitar entradas com kanji.
- Aprofundar a integracao com o Mathicx-File, incluindo widgets, launcher, notificacoes e status de estudo.
- Criar um widget de revisao diaria com revisoes pendentes, sequencia de dias estudados e tempo de estudo.
- Integrar resultados da aplicacao na busca global do launcher.
- Adicionar deep links internos para abrir revisao, quiz, caractere, dicionario e pratica de escrita diretamente pelo host.
- Iniciar um assistente deterministico ja na fase de aprendizagem adaptativa, sugerindo o que estudar agora com base em revisoes vencidas, erros recentes, caracteres parecidos e precisao de escrita.
- Evoluir depois para um assistente de estudos mais completo, com planos, analise semanal, adaptacao por objetivo e recomendacoes automaticas baseadas no historico do estudante.
- Avaliar sincronizacao online futura para progresso, favoritos e historico.
- Migrar o dicionario para Firebase quando a base de palavras crescer ou quando houver necessidade real de atualizacoes remotas e sincronizacao entre dispositivos.

Visao geral

A aplicacao ja passou de um simples visualizador de hiragana e katakana para uma ferramenta de estudo mais completa, com dicionario, quiz, pratica de escrita, dashboard, repeticao espacada, backup local, trilhas guiadas, sessoes rapidas e aprendizagem adaptativa inicial. A prioridade imediata agora e preparar uma primeira fatia vertical de Kanji. Depois disso, a integracao profunda com o Mathicx-File tende a ser mais segura e consistente.
