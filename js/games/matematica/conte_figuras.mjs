// 🍎 Conte as Figuras — banco de questões e regras próprias.
import {emojiObjects} from '../shared/visual-vocabulary.mjs';
function countQuestions(){
  return Array.from({length:48},(_,i)=>{
    const n=i%9+1, emoji=emojiObjects[Math.floor(i/4)%emojiObjects.length];
    return {
      prompt:`Quantos objetos você vê?\n${Array(n).fill(emoji).join('  ')}`,
      spoken:`Conte os objetos. Quantos ${emoji === '⭐' ? 'desenhos' : 'objetos'} aparecem?`,
      answer:n, options:[n,...[n-1,n+1,n+2,n-2,n+3].filter(x=>x>=0&&x<=12&&x!==n).slice(0,3)],
      hint:'Aponte para cada figura e conte uma de cada vez.',
      kind:'visual'
    };
  });
}

export const game = {subject:'matematica',title:'🍎 Conte as Figuras',instruction:'Conte os desenhos e escolha a quantidade certa.',icon:'🍎',questions:countQuestions()};
