# Novos minijogos — Além de um Clique

## Português
- **Caça à Letra**: descobrir a letra inicial de palavras acompanhadas por emoji (48 questões).
- **Monte a Palavra**: completar palavras de duas sílabas (40 questões).
- **Figura Secreta**: associar emoji a palavra escrita (48 questões).

## Matemática
- **Conte as Figuras**: contar de 1 a 9 figuras (48 questões).
- **Trem dos Números**: continuar sequências numéricas (48 questões).
- **Sequência Mágica**: reconhecer alternância de duas figuras (48 questões).

## Acessibilidade e funcionamento
- Mantidos botões grandes, cores, leitura em voz alta, dicas e confirmação de 1,5 segundo para gestos.
- Questões selecionadas e respostas embaralhadas a cada partida.
- Todo o conteúdo é local e compatível com hospedagem estática.
- Nenhum banco de dados, login ou backend.

## Limites conhecidos
- Todos os novos minijogos usam o mecanismo de **múltipla escolha** existente; não são jogos de arrastar e soltar.
- Emojis podem variar de aparência conforme sistema e fonte, e alguns são menos inequívocos que ilustrações dedicadas. Recomenda-se teste pedagógico com os alunos.
- O classificador de Libras permanece experimental e não foi alterado.
- Os bancos foram validados por script, mas a interface não foi testada em navegador neste ambiente.

## Executar
Dentro da pasta `TlCap`:
    python3 -m http.server 8765 --bind 127.0.0.1
Abra http://127.0.0.1:8765
