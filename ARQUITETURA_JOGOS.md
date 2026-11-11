# Arquitetura de jogos — Além de um Clique

Cada jogo possui um arquivo próprio em `js/games/portugues/` ou `js/games/matematica/`.

- `content.mjs` contém **somente** a lista de importações, o registro de jogos e os dados das disciplinas.
- `shared/words.mjs` contém o vocabulário reutilizado pelos dois jogos originais de Português.
- `shared/visual-vocabulary.mjs` contém figuras, sílabas e padrões reutilizados pelos jogos visuais.
- `shared/math-bank.mjs` gera perguntas para adição e subtração.
- `shared/shuffle.mjs` disponibiliza o embaralhamento usado pelo motor.

## Adicionar um novo jogo
1. Crie `js/games/portugues/meu-jogo.mjs` (ou na pasta de Matemática).
2. Exporte `const game = {subject, title, instruction, questions}`; cada questão deve ter `prompt`, `answer`, `options` (para múltipla escolha), `hint` opcional e `spoken` opcional.
3. Importe `game as meu_jogo` em `js/games/content.mjs` e adicione `meu_jogo` ao objeto `games`.

O sistema atual oferece **um mecanismo compartilhado de perguntas e respostas**. Novas mecânicas (arrastar, memória, associação por linhas) exigem componentes próprios e integração adicional.

## Teste local
Na pasta `TlCap`, execute `python3 -m http.server 8765 --bind 127.0.0.1` e acesse `http://127.0.0.1:8765`.
