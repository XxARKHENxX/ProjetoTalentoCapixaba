export const subjects = {
  portugues: { title: 'Português', icon: '📖', style: 'language', description: 'Leia, identifique e escreva palavras do dia a dia.' },
  matematica: { title: 'Matemática', icon: '🔢', style: 'math', description: 'Junte e retire quantidades com adição e subtração.' }
};

const words = [
  ['bola', 'Brinquedo redondo que pode rolar.', 'Pode ser chutada num jogo de futebol.'],
  ['gato', 'Animal de estimação que mia.', 'Gosta de brincar com novelos.'],
  ['pato', 'Ave que nada e faz quá-quá.', 'Tem bico e patas com membranas.'],
  ['sapo', 'Animal que pula e coaxa.', 'Pode viver perto de uma lagoa.'],
  ['casa', 'Lugar onde uma família pode morar.', 'Pode ter portas, janelas e telhado.'],
  ['mesa', 'Móvel em que podemos apoiar pratos.', 'Costuma ter um tampo e pés.'],
  ['cama', 'Móvel usado para dormir.', 'Costuma ter colchão e travesseiro.'],
  ['livro', 'Objeto com páginas que podemos ler.', 'Pode contar uma história.'],
  ['lápis', 'Material usado para escrever e apagar depois.', 'Pode ser apontado.'],
  ['papel', 'Material de uma folha de caderno.', 'Você pode dobrá-lo e desenhar nele.'],
  ['cola', 'Material que gruda pedaços de papel.', 'Pode vir num tubo ou bastão.'],
  ['régua', 'Objeto com marcas para medir centímetros.', 'Ajuda a traçar linhas retas.'],
  ['sol', 'Estrela que ilumina a Terra de dia.', 'É visto no céu e sua luz nos aquece.'],
  ['lua', 'Astro que gira em volta da Terra.', 'Às vezes parece redondo e outras vezes parece fino.'],
  ['nuvem', 'Conjunto de gotinhas que vemos no céu.', 'Pode ficar cinza quando vai chover.'],
  ['chuva', 'Água que cai do céu em gotas.', 'Você pode usar guarda-chuva para se proteger.'],
  ['vento', 'Ar em movimento.', 'É capaz de balançar as folhas das árvores.'],
  ['rio', 'Caminho natural por onde corre água.', 'Pode ter duas margens e desaguar no mar.'],
  ['praia', 'Lugar à beira do mar que pode ter areia.', 'Lá podemos ver ondas chegando à beira.'],
  ['flor', 'Parte da planta que pode ter pétalas.', 'Algumas têm cheiro e atraem abelhas.'],
  ['folha', 'Parte geralmente verde de uma planta.', 'Pode cair das árvores no outono.'],
  ['árvore', 'Planta com tronco e galhos.', 'Uma bem alta pode fazer muita sombra.'],
  ['maçã', 'Fruta redonda com sementes, muitas vezes vermelha.', 'Costuma ser crocante e tem cabinho.'],
  ['banana', 'Fruta comprida, curva e geralmente amarela.', 'Descascamos antes de comer.'],
  ['uva', 'Fruta pequena que cresce em cachos.', 'Pode ser verde ou roxa.'],
  ['pera', 'Fruta com base larga e parte de cima estreita.', 'Lembra uma pequena gota.'],
  ['pão', 'Alimento assado que pode virar sanduíche.', 'É comum encontrar na padaria.'],
  ['leite', 'Bebida branca que pode vir da vaca.', 'Pode ser usado para fazer queijo.'],
  ['arroz', 'Grão que é servido cozido e combina com feijão.', 'Depois de cozido, costuma ficar branco e soltinho.'],
  ['feijão', 'Grão que muitas vezes é servido com caldo.', 'Pode ser preto ou carioca.'],
  ['sopa', 'Prato com caldo que comemos de colher.', 'Pode levar legumes ou macarrão.'],
  ['copo', 'Objeto usado para beber água.', 'Costuma ter uma abertura na parte de cima.'],
  ['garfo', 'Talher com pontas que espeta o alimento.', 'Pode ser usado para pegar macarrão.'],
  ['prato', 'Objeto em que servimos comida.', 'Costuma ser redondo e pode ser fundo ou raso.'],
  ['meia', 'Peça de roupa que veste o pé antes do sapato.', 'Normalmente usamos duas.'],
  ['boné', 'Acessório para a cabeça com uma aba na frente.', 'A aba protege os olhos do sol.'],
  ['bota', 'Calçado que pode cobrir o tornozelo.', 'Algumas são usadas para andar na lama.'],
  ['saia', 'Peça de roupa presa à cintura e sem divisão para as pernas.', 'Pode ser curta ou comprida.'],
  ['ponte', 'Construção que ajuda a atravessar um rio.', 'Pode ligar duas margens.'],
  ['barco', 'Veículo que se move sobre a água.', 'Pode usar remos, velas ou motor.'],
  ['trem', 'Transporte que anda sobre trilhos.', 'Pode ter vários vagões.'],
  ['carro', 'Veículo comum de quatro rodas para poucas pessoas.', 'Geralmente estaciona em uma garagem.'],
  ['sino', 'Objeto de metal que toca quando é batido.', 'Pode marcar a hora numa torre.'],
  ['chave', 'Objeto que pode abrir uma fechadura.', 'Geralmente cabe no bolso.'],
  ['peixe', 'Animal que vive na água e tem nadadeiras.', 'Muitos respiram por brânquias.'],
  ['abelha', 'Inseto que visita flores e pode fazer mel.', 'Costuma viver numa colmeia.'],
  ['zebra', 'Animal parecido com um cavalo e com listras.', 'Tem listras pretas e brancas.'],
  ['coelho', 'Animal que tem orelhas longas e dá pulos.', 'Pode ter uma cauda curta e fofa.']
];

export function shuffle(values, random = Math.random) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const typing = words.map(([answer]) => ({
  prompt: answer, spoken: 'Digite a palavra ' + answer,
  answer, hint: 'A palavra começa com ' + answer[0] + ' e tem ' + answer.length + ' letras. Observe se há acentos.'
}));
const reading = words.map(([answer, prompt, hint], index) => ({
  prompt, answer, hint, options: [answer, ...[7, 19, 33].map(offset => words[(index + offset) % words.length][0])]
}));
function mathBank(subtract) {
  return Array.from({length: 48}, (_, i) => {
    const group = Math.floor(i / 8);
    const b = i % 8 + 1;
    const a = subtract ? group + 9 : group + 2;
    const answer = subtract ? a - b : a + b;
    return {
      prompt: a + (subtract ? ' − ' : ' + ') + b,
      spoken: 'Quanto é ' + a + (subtract ? ' menos ' : ' mais ') + b + '?',
      answer, options: [answer, answer - 1, answer + 1, answer + 2],
      hint: 'Comece em ' + a + ' e levante ' + b + (b === 1 ? ' dedo. ' : ' dedos. ') +
        (subtract ? 'Conte para trás, baixando um dedo a cada número.' : 'Conte para a frente, baixando um dedo a cada número.')
    };
  });
}

export const games = {
  digitacao: { subject: 'portugues', title: 'Digitação de palavras', instruction: 'Observe a palavra e escreva do mesmo jeito.', questions: typing, typing: true },
  identificacao: { subject: 'portugues', title: 'Identificação de palavras', instruction: 'Leia a pista e escolha a palavra que combina com ela.', questions: reading },
  adicao: { subject: 'matematica', title: 'Adição', instruction: 'Some os números e escolha a resposta.', questions: mathBank(false) },
  subtracao: { subject: 'matematica', title: 'Subtração', instruction: 'Retire a segunda quantidade da primeira e escolha a resposta.', questions: mathBank(true) }
};
