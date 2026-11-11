export function questionTemplate({round, number, count, dino}) {
  return `<section class="narrow"><div class="split"><p class="eyebrow">${round.options.speedrun ? 'SpeedRun' : 'Modo normal'}</p>
    <div class="actions"><span id="clock" class="clock" role="timer" hidden></span><button type="button" id="toggle-voice" data-toggle-voice="false">🎤 Ativar Voz</button><button type="button" id="toggle-gesture" data-toggle-gesture="false">✋ Ativar Gestos</button><button data-exit>↩ Sair</button></div></div>
    <h1>${round.game.title}</h1><p>${round.game.instruction}</p>
    <div class="play-layout section"><div class="box" id="play-card"><p id="progress-label">Questão ${number} de ${count}</p>
      <progress max="${count}" value="${number}" aria-labelledby="progress-label"></progress>
      <h2 class="question" id="question" tabindex="-1"></h2>
      <button id="repeat" data-repeat hidden>🔊 Ouvir novamente</button>
      ${round.game.typing ?
        '<form id="answer-form" class="typing section"><label class="field">Sua resposta<input id="answer" required maxlength="40" autocomplete="off" autocapitalize="none" spellcheck="false"></label><button class="primary" type="submit">✓ Confirmar resposta</button></form>' :
        '<div class="grid options section" id="answers" role="group" aria-label="Respostas possíveis"></div>'}
      <p class="feedback" id="feedback" role="status"></p>
      <p class="bubble" id="text-hint" role="status" hidden></p>
      <button data-hint>💡 Quero uma dica</button>
    </div>
    <aside class="mascot" id="mascot" aria-label="Mascote">
      <p class="bubble" id="bubble" hidden></p>
      <button type="button" data-mascot aria-label="Pedir ajuda ao dinossauro"><img src="${dino}" alt=""></button>
    </aside></div></section>`;
}
