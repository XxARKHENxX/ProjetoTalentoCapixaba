import {words} from '../shared/words.mjs';
const questions = words.map(([answer]) => ({
  prompt: answer, spoken: 'Digite a palavra ' + answer,
  answer, hint: 'A palavra começa com ' + answer[0] + ' e tem ' + answer.length + ' letras. Observe se há acentos.'
}));
export const game = {subject:'portugues',title:'Digitação de palavras',instruction:'Observe a palavra e escreva do mesmo jeito.',questions,typing:true};
