export function mathBank(subtract) {
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

