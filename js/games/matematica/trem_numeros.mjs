// 🚂 Trem dos Números — banco de questões e regras próprias.
function sequenceQuestions(){
  return Array.from({length:48},(_,i)=>{
    const start=i%11, step=Math.floor(i/11)%3+1;
    const seq=[start,start+step,start+2*step,start+3*step];
    const answer=start+4*step;
    return {prompt:`🚂 Trem dos números\n${seq.join('   →   ')}   →   ❓`,
      spoken:`Qual número vem depois de ${seq.join(', ')}?`,
      answer,options:[answer,...[answer-step,answer+step,answer+1,answer+2,answer-2].filter((x,j,arr)=>x>=0&&x!==answer&&arr.indexOf(x)===j).slice(0,3)],
      hint:`Observe quanto o número aumenta a cada vagão. Aqui, aumenta ${step}.`,
      kind:'visual'};
  });
}

export const game = {subject:'matematica',title:'🚂 Trem dos Números',instruction:'Descubra o próximo número do trem.',icon:'🚂',questions:sequenceQuestions()};
