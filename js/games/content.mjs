// Catálogo de jogos: somente registro, sem regras nem questões.
import {game as digitacao} from './portugues/digitacao.mjs';
import {game as identificacao} from './portugues/identificacao.mjs';
import {game as adicao} from './matematica/adicao.mjs';
import {game as subtracao} from './matematica/subtracao.mjs';
import {game as conte_figuras} from './matematica/conte_figuras.mjs';
import {game as trem_numeros} from './matematica/trem_numeros.mjs';
import {game as sequencia_figuras} from './matematica/sequencia_figuras.mjs';
import {game as primeira_letra} from './portugues/primeira_letra.mjs';
import {game as montar_palavras} from './portugues/montar_palavras.mjs';
import {game as figura_palavra} from './portugues/figura_palavra.mjs';
export {shuffle} from './shared/shuffle.mjs';
export const subjects = {
  portugues: { title: 'Português', icon: '📖', style: 'language', description: 'Leia, identifique e escreva palavras do dia a dia.' },
  matematica: { title: 'Matemática', icon: '🔢', style: 'math', description: 'Junte e retire quantidades com adição e subtração.' }
};


export const games = {
  digitacao,
  identificacao,
  adicao,
  subtracao,
  conte_figuras,
  trem_numeros,
  sequencia_figuras,
  primeira_letra,
  montar_palavras,
  figura_palavra,
};
