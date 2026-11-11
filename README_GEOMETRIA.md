# Protótipo geométrico de letras — Além de um Clique

## O que é
Esta versão mantém a câmera e o MediaPipe originais e acrescenta um comparador geométrico por similaridade, configurado em `js/libras-rules.json`. **Não é um modelo treinado, nem reconhecimento de Libras validado.** As sete letras (A, B, D, I, L, V, Y) são hipóteses iniciais para testar a viabilidade. Letras dinâmicas não estão implementadas.

## Como funciona
Os 21 landmarks são convertidos em cinco estimativas contínuas de extensão dos dedos e três distâncias normalizadas. Cada regra do JSON produz uma pontuação de similaridade entre 0 e 1. A letra só é candidata quando a maior pontuação atinge 0,88 **e** supera a segunda por pelo menos 0,10. Depois, permanece o mecanismo existente de confirmação por 1,5 segundo e bloqueio de repetição.

**A pontuação não é probabilidade de acerto.** As regras são aproximações e podem errar especialmente em gestos semelhantes, diferentes ângulos e mãos. Não usar para avaliar alunos ou ensinar sinais como se estivessem validados.

## Hospedagem
Arquivos estáticos, sem banco de dados, persistência ou backend. O MediaPipe continua sendo baixado de CDN e o modelo Hand Landmarker é carregado de um endereço externo; portanto, **a primeira execução exige conexão**. GitHub Pages e Vercel funcionam com HTTPS. Para testar localmente, execute `python3 -m http.server 8765` na pasta `TlCap` e abra `http://localhost:8765`.

## Próxima validação
Testar cada letra com diferentes pessoas, distâncias e iluminação, registrando falsos positivos. Ajustar os parâmetros do JSON somente com evidência. Para confiabilidade educacional, buscar referências de Libras e validação com pessoas fluentes.


## Expansão v0.2 (experimental)

Mantidas as 7 letras iniciais: A, B, D, I, L, V, Y.
Novas hipóteses: C, O, E, F, S, U, W, R.

**Atenção:** as novas regras são aproximações baseadas em landmarks e NÃO foram validadas com webcam, com diferentes mãos ou por especialista em Libras. Elas podem produzir falsos positivos e confusões. As letras que não constam no JSON não são reconhecidas. J e Z exigem reconhecimento de movimento e permanecem fora do escopo.

O classificador continua sem treinamento, persistência e backend. As pontuações não são probabilidades. Para testes, registre tanto a letra mostrada quanto qualquer classificação errada.


## Expansão v0.3 — alfabeto A–Z (experimental)

Foram adicionadas regras estáticas para G, H, K, M, N, P, Q, T e X. As letras J e Z receberam um detector simples de trajetória com janela temporal. Agora há entradas para todas as 26 letras.

**Limitações sérias:** os novos padrões são hipóteses, não dados de Libras validados. Algumas letras (especialmente M/N/T/S/E e P/K) podem ser indistinguíveis com os recursos geométricos atuais; nesse caso o algoritmo deve rejeitar em vez de adivinhar. Os detectores J/Z usam heurísticas de movimento, não reconhecedores certificados de sinais. Não utilize esta versão para ensinar ou avaliar a correção de Libras.

A confirmação continua em 1,5 segundo, e o sistema não depende de backend, calibração ou persistência. O carregamento inicial do MediaPipe ainda usa recursos externos.
