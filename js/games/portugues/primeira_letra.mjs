// 🔤 Caça à Letra — banco de questões e regras próprias.
import {letters} from '../shared/visual-vocabulary.mjs';
function initialQuestions(){
  return letters.map(([emoji,word,initial],i)=>{
    const distractors=['B','C','D','F','G','L','M','P','S','T','V','A','E','R','U','Z'].filter(x=>x!==initial);
    const start=(i*3)%distractors.length;
    return {prompt:`🔤 Qual é a primeira letra?\n${emoji}  ${word}`,
      spoken:`Qual é a primeira letra da palavra ${word}?`,
      answer:initial,options:[initial,...Array.from({length:3},(_,j)=>distractors[(start+j)%distractors.length])],
      hint:`Fale ${word} devagar e escute o som do começo.`,
      kind:'visual'};
  });
}

export const game = {subject:'portugues',title:'🔤 Caça à Letra',instruction:'Veja a palavra e descubra a primeira letra.',icon:'🔤',questions:initialQuestions()};
