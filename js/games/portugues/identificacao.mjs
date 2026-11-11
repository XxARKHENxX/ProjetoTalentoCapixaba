import {words} from '../shared/words.mjs';
const questions = words.map(([answer,prompt,hint],index) => ({
 prompt,answer,hint,options:[answer,...[7,19,33].map(offset=>words[(index+offset)%words.length][0])]
}));
export const game = {subject:'portugues',title:'Identificação de palavras',instruction:'Leia a pista e escolha a palavra que combina com ela.',questions};
