// 🧩 Monte a Palavra — banco de questões e regras próprias.
import {syllables} from '../shared/visual-vocabulary.mjs';
function syllableQuestions(){
  return syllables.map(([a,b,emoji],i)=>{
    const others=[...new Set(syllables.map(x=>x[1]).filter(x=>x!==b))];
    const start=i*5%others.length;
    return {prompt:`🧩 Complete a palavra\n${emoji}  ${a} + ❓ = ${a}${b}`,
      spoken:`Qual sílaba completa a palavra ${a+b}?`,
      answer:b,options:[b,...Array.from({length:3},(_,j)=>others[(start+j)%others.length])],
      hint:`Diga ${a+b} devagar e escute a última parte.`,
      kind:'visual'};
  });
}

export const game = {subject:'portugues',title:'🧩 Monte a Palavra',instruction:'Escolha a sílaba que completa a palavra.',icon:'🧩',questions:syllableQuestions()};
