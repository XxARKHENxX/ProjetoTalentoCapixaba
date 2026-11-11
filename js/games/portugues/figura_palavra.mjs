// 🔎 Figura Secreta — banco de questões e regras próprias.
import {letters} from '../shared/visual-vocabulary.mjs';
function imageWordQuestions(){
  return letters.map(([emoji,word],i)=>{
    const candidates=letters.map(x=>x[1]).filter(x=>x!==word);
    const start=(i*7)%candidates.length;
    return {prompt:`🔎 Qual palavra combina com a figura?\n${emoji}`,
      spoken:'Observe a figura e escolha a palavra correspondente.',
      answer:word,options:[word,...Array.from({length:3},(_,j)=>candidates[(start+j)%candidates.length])],
      hint:`Olhe a figura e fale o nome do que ela representa.`,
      kind:'visual'};
  });
}

export const game = {subject:'portugues',title:'🔎 Figura Secreta',instruction:'Observe a figura e escolha a palavra correspondente.',icon:'🔎',questions:imageWordQuestions()};
