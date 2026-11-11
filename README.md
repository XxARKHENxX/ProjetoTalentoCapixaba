# Além de um Clique

Hub de jogos educativos para estudantes do Ensino Fundamental I atendidos pelo AEE. O catálogo inicial tem Digitação de palavras, Identificação de palavras, Adição e Subtração. Os quatro jogos usam o mesmo motor de partida e as mesmas preferências de acessibilidade.

## Executar localmente

Na pasta do projeto, execute:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Abra `http://127.0.0.1:8765/`. O navegador precisa servir os módulos JavaScript por HTTP ou HTTPS. Para publicar, disponibilize `index.html`, `style.css`, `assets/` e `js/` juntos em uma hospedagem estática. Os caminhos relativos permitem hospedar o projeto em um subdiretório.

## Perfil e cartão

As preferências ficam no fragmento da URL, por exemplo `#v=1&p=0011`. Em **Configurações**, é possível importar o hexadecimal ou o link, copiar o endereço e imprimir um cartão. Gere o cartão no endereço que será acessado pelo dispositivo leitor. Um cartão já impresso mantém as preferências codificadas naquele momento.

| Bits (do menos significativo) | Preferência | Valores aceitos |
| --- | --- | --- |
| 0–1 | Aparência | 0 claro, 1 escuro, 2 alto contraste |
| 2–3 | Paleta | 0 padrão, 1 azul e amarelo, 2 roxo e verde-azulado |
| 4–5 | Fonte | 0 padrão, 1 grande, 2 muito grande |
| 6 | Letras maiúsculas | 0 desligado, 1 ligado |
| 7 | Leitura em voz alta | 0 desligado, 1 ligado |
| 8 | Reduzir movimento | 0 desligado, 1 ligado |
| 9 | Mostrar mascote | 0 ligado, 1 desligado |
| 10 (v2) | Espaço entre linhas | 0 padrão, 1 maior |
| 11 (v2) | Menos distrações | 0 desligado, 1 ligado |
| 12–15 | Reservados | 0 |

O perfil padrão é `0000`. Códigos sem versão explícita aceitam os campos da v2. Links v1 continuam válidos e mantêm as duas novas opções desligadas. Uma versão futura do formato deve preservar a leitura dos links v1. O cartão e o link contêm apenas preferências. Partidas, respostas, pontuação e código de liberação da saída ficam em memória.

## Organização do código

- `js/content.mjs` registra disciplinas, jogos, instruções e questões.
- `js/engine.mjs` reúne sorteio, tentativas, pontuação e finalização.
- `js/profile.mjs` define os formatos v1 e v2 do perfil.
- `js/colors.mjs` mostra o mesmo cenário em diferentes paletas para escolha visual.
- `js/app.mjs` conecta telas, acessibilidade, leitura, mascote e impressão.
- `js/vendor/qrcode.mjs` gera o QR Code no navegador com qrcode-generator 1.4.4, de Kazuhiko Arase (MIT).

## Validação em escola

A ilustração, as paletas, o conteúdo e os tempos são provisórios até a revisão da equipe e os testes supervisionados com o AEE. Em telas estreitas, o mascote fica em linha após os controles de resposta e é ocultado enquanto o teclado virtual ocupa parte da tela, quando o navegador informa essa redução. A leitura em voz alta depende das vozes disponíveis no navegador.

O teste de percepção de cores compara imagens do mesmo cenário. A imagem escolhida aplica a paleta ao perfil. A atividade tem finalidade de personalização e não diagnostica daltonismo. Somente as preferências escolhidas entram no link.

Nos jogos com alternativas, o controle de voz do dispositivo pode acionar os botões existentes. Ative [Acesso por voz no Android](https://support.google.com/accessibility/android/answer/6151854?hl=pt-BR) ou [Controle por Voz no iPhone ou iPad](https://support.apple.com/pt-br/111778), peça para exibir os números dos controles e fale o número sobreposto ao botão da resposta, no idioma configurado no dispositivo. Essa seleção envia a resposta como um toque no botão. A contagem de dedos pela câmera ainda depende de uma integração própria.


A escolha da hospedagem e o endereço público seguem em aberto. Após publicar, teste a impressão e leia o cartão com um segundo dispositivo. Inclua também leitor de tela, teclado virtual e navegadores usados na escola na validação.
