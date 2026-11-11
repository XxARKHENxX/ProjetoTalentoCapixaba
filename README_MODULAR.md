# Além de um Clique — versão modular

Esta versão reorganiza o projeto anterior sem introduzir framework, backend ou banco de dados.

## Organização
- `index.html`: estrutura da página.
- `styles/base.css`: estilos originais.
- `styles/visual-inclusivo.css`: camada visual inclusiva.
- `js/main.mjs`: ponto de entrada.
- `js/app.mjs`: orquestração de navegação, ciclo da partida e eventos globais.
- `js/core/game-engine.mjs`: regras de pontuação, tentativas e progresso.
- `js/games/content.mjs`: disciplinas e bancos de perguntas.
- `js/pages/catalog.mjs`: página inicial e catálogo de jogos.
- `js/components/templates.mjs`: cartões e seletores reutilizáveis.
- `js/components/question-template.mjs`: estrutura HTML da tela de questões.
- `js/features/accessibility/`: voz, câmera, gestos e comparação geométrica experimental.
- `js/features/settings/`: preferências, perfil compartilhável, visualização e configuração.

## Executar
Abra um terminal na pasta que contém `index.html`:

    python3 -m http.server 8765 --bind 127.0.0.1

Acesse http://127.0.0.1:8765/

Alternativamente, use `--directory "/caminho/para/TlCap"`.

## Implantação
Publique o conteúdo de `TlCap/` na raiz do GitHub Pages ou Vercel.
Os caminhos são relativos; não há necessidade de build.
O MediaPipe é carregado de CDN quando o usuário ativa os gestos, exigindo internet.
A webcam requer contexto seguro (HTTPS ou localhost).

## Limitações e validação
- Esta é uma refatoração estrutural. Não houve alteração intencional nas regras dos jogos.
- O classificador de Libras permanece experimental e **não é um tradutor validado**.
- Foi verificada a sintaxe dos módulos e a resolução local dos imports. 
- Não foi possível executar testes de interface com navegador neste ambiente;
  valide navegação, perguntas, respostas, voz, webcam, configurações e QR Code no seu computador.
- A orquestração central `app.mjs` ainda contém lógica de ciclo da partida e eventos:
  esta é uma modularização incremental, não uma separação completa de todos os controladores.
