// 🧩 Sequência Mágica — banco de questões e regras próprias.
import {patterns} from '../shared/visual-vocabulary.mjs';
function patternQuestions(){
  return Array.from({length:48},(_,i)=>{
    const p=patterns[i%patterns.length], swap=Math.floor(i/12)%2;
    const a=p[swap],b=p[swap+1];
    return {prompt:`🧩 Descubra o próximo!\n${a}  ${b}  ${a}  ${b}  ${a}  ❓`,
      spoken:'Observe a sequência de figuras. Qual vem depois?',
      answer:b,options:[a,b,'🌟','🎈'].filter((v,i,arr)=>arr.indexOf(v)===i),
      hint:'As figuras estão se alternando: uma, outra, uma, outra.',
      kind:'visual'};
  });
}

export const game = {subject:'matematica',title:'🧩 Sequência Mágica',instruction:'Observe o padrão e escolha a figura que falta.',icon:'🧩',questions:patternQuestions()};
