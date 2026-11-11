import {createCatalogPages} from './pages/catalog.mjs';
import {choices} from './components/templates.mjs';
import {questionTemplate} from './components/question-template.mjs';
import {settingsTemplate} from './features/settings/settings-template.mjs';
import {setupInputControls} from './features/accessibility/input-controls.mjs';
import { subjects, games } from './games/content.mjs';
import { createRound, submit, next, finish, award, difficulties } from './core/game-engine.mjs';
import { defaults, encode, decode, profileURL } from './features/settings/profile.mjs';
import { startColorCheck } from './features/settings/colors.mjs';

const $ = selector => document.querySelector(selector);
const main = $('#main');
const modal = $('#modal');
const dino = './assets/dino.svg';
const options = [
  ['theme', 'Aparência', [['light', 'Claro'], ['dark', 'Escuro'], ['contrast', 'Alto contraste']]],
  ['palette', 'Paleta de cores', [['default', 'Padrão'], ['blue', 'Azul e amarelo'], ['purple', 'Roxo e verde-azulado']]],
  ['font', 'Tamanho do texto', [['normal', 'Padrão'], ['large', 'Grande'], ['extra', 'Muito grande']]],
  ['upper', 'Letras maiúsculas'], ['tts', 'Leitura em voz alta'],
  ['reduce', 'Reduzir movimento'], ['mascot', 'Mostrar o dinossauro'],
  ['spacing', 'Mais espaço entre linhas'], ['focus', 'Tela com menos distrações']
];
let prefs = {...defaults};
let round;
let timer;
let bubbleTimer;
let messageId = 0;
let resolveSpeech;
let audio;
let questionState;
let release;
let openingError = '';
let priorFocus;
let modalType;
let modalFocusId;
let qrRequest = 0;
let voiceController = null;
let gestureController = null;

function announce(text) {
  $('#announcement').textContent = text;
}

function loadURL() {
  if (!/^#(?:v|p)(?:=|&|$)/.test(location.hash)) return;
  try {
    prefs = decode(location.hash);
    openingError = '';
  } catch (error) {
    prefs = {...defaults};
    openingError = error.message;
  }
}
loadURL();

function applyPrefs() {
  for (const field of ['theme', 'palette', 'font']) document.documentElement.dataset[field] = prefs[field];
  document.body.classList.toggle('upper', prefs.upper);
  document.body.classList.toggle('reduce', prefs.reduce);
  document.body.classList.toggle('wide-spacing', prefs.spacing);
  document.body.classList.toggle('focus-mode', prefs.focus);
  if ($('#mascot')) $('#mascot').hidden = !prefs.mascot;
  if ($('.hero img')) $('.hero img').hidden = !prefs.mascot;
  if ($('#repeat')) $('#repeat').hidden = !prefs.tts;
  if (!prefs.tts && resolveSpeech) stopSpeech();
  positionMascot();
}
function savePrefs() {
  history.replaceState(null, '', profileURL(prefs, location.href));
  openingError = '';
  applyPrefs();
}

function stopSpeech() {
  resolveSpeech?.();
  window.speechSynthesis?.cancel();
}

function say(text) {
  stopSpeech();
  if (!prefs.tts || !window.speechSynthesis || !window.SpeechSynthesisUtterance) return Promise.resolve();
  return new Promise(resolve => {
    const voice = new SpeechSynthesisUtterance(text);
    voice.lang = 'pt-BR';
    const done = () => {
      clearTimeout(timeout);
      voice.onend = null;
      voice.onerror = null;
      resolveSpeech = null;
      resolve();
    };
    const timeout = setTimeout(() => { done(); window.speechSynthesis.cancel(); }, 45000);
    resolveSpeech = done;
    voice.onend = done;
    voice.onerror = done;
    try { window.speechSynthesis.speak(voice); } catch { done(); }
  });
}

function startAudio() {
  if (audio || !window.AudioContext) return;
  try {
    audio = new AudioContext();
    const volume = audio.createGain();
    volume.gain.value = .022;
    volume.connect(audio.destination);
    for (const frequency of [130.81, 196, 261.62]) {
      const tone = audio.createOscillator();
      tone.frequency.value = frequency;
      tone.connect(volume);
      tone.start();
    }
    audio.resume().catch(() => {});
  } catch { stopAudio(); }
}

function stopAudio() {
  audio?.close().catch(() => {});
  audio = null;
}

function view(html, focus = true) {
  main.innerHTML = html;
  if (focus) {
    const heading = $('h1');
    heading.tabIndex = -1;
    heading.focus();
  }
}

const {home, subjectPage} = createCatalogPages({
  view, getPrefs: () => prefs, getOpeningError: () => openingError, dino, $
});

function prepare(id) {
  const game = games[id];
  view(`<section class="narrow"><button class="back" data-subject="${game.subject}">← Voltar aos jogos</button>
    <p class="eyebrow">Antes de jogar</p><h1>${game.title}</h1><p>${game.instruction}</p>
    <form class="box stack section" id="setup">
      ${choices('difficulty', 'Escolha o desafio', [['easy', 'Fácil · 10 questões'], ['medium', 'Médio · 15 questões'], ['hard', 'Difícil · 25 questões']], 'easy')}
      ${choices('mode', 'Como você quer jogar?', [['normal', 'No meu ritmo'], ['speedrun', 'Contra o relógio']], 'normal')}
      <p id="speed-info" hidden></p>
      <div class="choice-grid">
        <label class="choice"><input class="sr-only" type="checkbox" name="clock"><span>Mostrar cronômetro</span></label>
        <label class="choice"><input class="sr-only" type="checkbox" name="ambient"><span>Som ambiente</span></label>
      </div>
      <details><summary>Opções de saída para o professor</summary>
        ${choices('lock', 'Bloqueio de saída', [['none', 'Desativado'], ['2', '2 minutos'], ['5', '5 minutos'], ['end', 'Até o fim']], 'none')}
        <label class="field" id="lock-pin" hidden>Código de liberação escolhido pelo professor<input name="pin" type="password" minlength="4" maxlength="24" autocomplete="off"></label>
        <p>O bloqueio funciona nos controles do jogo. O navegador ainda pode ser fechado.</p>
      </details>
      <button class="primary" type="submit">🚀 Começar aventura</button>
    </form></section>`);
  const form = $('#setup');
  const field = name => form.elements.namedItem(name);
  const isSpeedrun = () => field('mode').value === 'speedrun';
  form.addEventListener('change', () => {
    field('clock').disabled = isSpeedrun();
    $('#speed-info').hidden = !isSpeedrun();
    $('#speed-info').textContent = 'Tempo total: ' + formatTime(difficulties[field('difficulty').value] * 30_000) + '. O tempo continua durante dicas e configurações.';
    $('#lock-pin').hidden = field('lock').value === 'none';
    field('pin').disabled = $('#lock-pin').hidden;
    field('pin').required = !$('#lock-pin').hidden;
  });
  field('pin').disabled = true;
  form.addEventListener('submit', event => {
    event.preventDefault();
    const settings = {
      difficulty: field('difficulty').value, speedrun: isSpeedrun(),
      clock: field('clock').checked, ambient: field('ambient').checked
    };
    const lock = field('lock').value;
    const pin = lock === 'none' ? '' : field('pin').value;
    start(id, settings, pin ? {pin, duration: lock === 'end' ? Infinity : Number(lock) * 60_000} : null);
  });
}

function formatTime(ms) {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  return Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0');
}

function start(id, settings, lock = null) {
  round = createRound(games[id], settings);
  round.id = id;
  release = lock ? {...lock, until: round.started + lock.duration} : null;
  if (settings.ambient) startAudio();
  renderQuestion(true);
  timer = setInterval(tick, 200);
}

function renderQuestion(first = false) {
  questionState = {hint: false, advance: Infinity, talking: false, last: ''};
  const question = round.questions[round.index];
  const count = round.questions.length;
  const number = round.index + 1;
  view(questionTemplate({round, number, count, dino}), first);

  $('#question').textContent = question.prompt;

  // Criação dos botões com containers separados para o número da opção e o valor da resposta
  if (question.options && $('#answers')) {
    let optIndex = 0;
    for (const option of question.options) {
      optIndex++;
      const button = document.createElement('button');
      button.type = 'button';
      button.classList.add("answer-option");;
      const numberBadge = document.createElement('span');
      numberBadge.className = 'option-number';
      numberBadge.setAttribute('aria-hidden','true');
      numberBadge.textContent = String(optIndex);
      const optionLabel = document.createElement('span');
      optionLabel.className = 'option-label';
      optionLabel.textContent = String(option);
      button.append(numberBadge, optionLabel);
      button.dataset.answer = option;
      $('#answers').append(button);
    }
  }

  $('#answer-form')?.addEventListener('submit', event => {
    event.preventDefault();
    answer($('#answer').value);
  });
  applyPrefs();
  tick();

  ({voiceController, gestureController} = setupInputControls({
    $, getRound: () => round, voiceController, gestureController
  }));

  if (!first && !modal.open) $('#question')?.focus();
  if (first) say(round.game.instruction);
}

function positionMascot() {
  const mascot = $('#mascot');
  if (!mascot || mascot.hidden) return;
  const keyboardOpen = window.visualViewport && innerHeight - visualViewport.height > 120 &&
    document.activeElement?.matches('#answer');
  mascot.classList.toggle('keyboard-open', Boolean(keyboardOpen));
}
window.visualViewport?.addEventListener('resize', positionMascot);

function tick() {
  if (!round || round.stage === 'finished') return;
  const now = performance.now();
  if (now >= round.deadline) {
    finish(round, now);
    result();
    return;
  }
  const clock = $('#clock');
  if (clock) {
    clock.hidden = !(round.options.speedrun || round.options.clock);
    const time = round.options.speedrun ? round.deadline - now : Math.floor((now - round.started) / 1000) * 1000;
    const text = (round.options.speedrun ? 'Restam ' : 'Tempo: ') + formatTime(time);
    if (!clock.hidden && clock.textContent !== text) clock.textContent = text;
  }
  if (round.stage === 'answer' && !questionState.hint && now - round.questionStarted >= 30_000) revealHint();
  if (round.stage === 'feedback' && now >= questionState.advance && !questionState.talking) {
    clearTimeout(bubbleTimer);
    if (next(round, now)) renderQuestion();
    else result();
  }
}

function showMessage(text, kind, {read = true, visual = true} = {}) {
  const state = questionState;
  const id = ++messageId;
  const bubble = $('#bubble');
  clearTimeout(bubbleTimer);
  $('#mascot').dataset.state = kind;
  bubble.textContent = text;
  bubble.hidden = !visual;
  state.last = text;
  state.talking = read && prefs.tts;
  const until = performance.now() + 10_000;
  const spoken = read ? say(text) : Promise.resolve();
  spoken.then(() => {
    if (id !== messageId || state !== questionState || !$('#bubble')) return;
    state.talking = false;
    bubbleTimer = setTimeout(() => {
      bubble.hidden = true;
      $('#mascot').dataset.state = 'idle';
    }, Math.max(0, until - performance.now()));
  });
}

function revealHint() {
  if (round?.stage !== 'answer') return;
  questionState.hint = true;
  const hint = round.questions[round.index].hint;
  $('#text-hint').textContent = hint;
  $('#text-hint').hidden = false;
  showMessage(hint, 'hint');
}

function mascotHelp() {
  if (!round || round.stage !== 'answer' || !$('#bubble').hidden) return;
  if (questionState.hint) revealHint();
  else {
    const text = 'Observe com calma. Você pode pedir uma dica quando quiser.';
    showMessage(text, 'attention');
    announce(text);
  }
}

function answer(value) {
  if (!round || round.stage !== 'answer') return;
  if (performance.now() >= round.deadline) { tick(); return; }
  const outcome = submit(round, value);
  if (!outcome) return;
  const feedback = $('#feedback');
  feedback.dataset.kind = outcome.correct ? 'correct' : 'incorrect';
  if (outcome.retry) {
    feedback.textContent = 'Ainda não. Veja a dica e tente mais uma vez.';
    revealHint();
    if ($('#answer')) { $('#answer').focus(); $('#answer').select(); }
    return;
  }
  const text = outcome.correct ? 'Você acertou! +' + outcome.points + ' pontos.' : 'Vamos para a próxima. Você pode tentar de novo em outra partida.';
  feedback.textContent = text;
  $('#text-hint').hidden = true;
  for (const control of document.querySelectorAll('#answers button, #answer-form input, #answer-form button, [data-hint]')) control.disabled = true;
  questionState.advance = performance.now() + 5000;
  showMessage(text, outcome.correct ? 'correct' : 'incorrect');
}

function stopRound() {
  if ($("#voice-container")) $("#voice-container").style.display = "none";
  if ($("#gesture-container")) $("#gesture-container").style.display = "none";
  voiceController?.stop();
  gestureController?.stop();
  clearInterval(timer);
  clearTimeout(bubbleTimer);
  messageId++;
  stopSpeech();
  stopAudio();
  release = null;
}

function result() {
  stopRound();
  if (modal.open && modalType === 'exit') modal.close();
  const game = round.game;
  const count = round.questions.length;
  const apple = award(round.score, count);
  const errors = round.records.filter(record => !record.correct);
  const color = {Dourada: '#e5a61b', Vermelha: '#d63b46', Verde: '#5fa754'}[apple];
  const entries = round.options.speedrun ? round.records : errors;
  view(`<section class="narrow"><p class="eyebrow">Resultado da partida</p><h1>${game.title}</h1>
    <div class="box stack section"><div class="split"><div><h2>${round.score} de ${count * 10} pontos</h2>
    <p>${count - errors.length} de ${count} questões corretas.</p>
    ${round.options.speedrun || round.options.clock ? '<p>Tempo de partida: ' + formatTime(round.ended - round.started) + '</p>' : ''}</div>
    <div><svg width="52" height="52" viewBox="0 0 52 52" aria-hidden="true"><path fill="${color}" stroke="#433925" stroke-width="2" d="M26 16C8 5 3 20 9 34c4 10 9 15 17 11 8 4 13-1 17-11 6-14 1-29-17-18Z"/><path fill="none" stroke="#433925" stroke-width="3" d="M26 16q-2-8 4-13"/></svg>
    <p><strong>Maçã ${apple.toLowerCase()}</strong></p></div></div>
    <details class="review"><summary>${round.options.speedrun ? 'Revisar suas respostas' : 'Revisar questões a praticar'}</summary>
    ${entries.length ? '<ol id="review"></ol>' : '<p>Você acertou todas as questões.</p>'}</details>
    <div class="actions"><button class="primary" data-replay>🔄 Jogar novamente</button>
    <button data-subject="${game.subject}">Voltar aos jogos de ${subjects[game.subject].title}</button></div></div></section>`, !modal.open);
  for (const record of entries) {
    const item = document.createElement('li');
    const prompt = record.question.spoken?.startsWith('Digite') ? 'Digitação de palavra' : record.question.prompt;
    item.textContent = prompt + ' · ' + (record.answers.length ? 'Sua resposta: ' + record.answers.join(' / ') : 'Sem resposta') +
      ' · ' + (record.correct ? 'Acertou' : 'Para praticar');
    $('#review').append(item);
  }
  if (!modal.open) say('Partida concluída. Você ganhou uma maçã ' + apple.toLowerCase() + '.');
}

function showModal(type, html) {
  if (!modal.open) {
    priorFocus = document.activeElement;
    modalFocusId = priorFocus.id;
  }
  modalType = type;
  modal.dataset.panel = type;
  modal.innerHTML = html;
  if (!modal.open) modal.showModal();
  else modal.querySelector('[autofocus]')?.focus();
}

modal.addEventListener('close', () => {
  if (modal.open) return;
  document.body.classList.remove('print-card');
  qrRequest++;
  if (modalType === 'exit') stopSpeech();
  modalType = null;
  if (priorFocus?.isConnected) priorFocus.focus();
  else if (modalFocusId && document.getElementById(modalFocusId)) document.getElementById(modalFocusId).focus();
  else ($('#question') || $('h1'))?.focus();
});

function showSettings() {
  showModal('settings', settingsTemplate({options, prefs, round}));
  updateSettingsFields();
  const ambient = $('#round-audio');
  if (ambient) {
    ambient.checked = round.options.ambient;
    ambient.addEventListener('change', () => {
      if (!round || round.stage === 'finished') {
        ambient.disabled = true;
        return;
      }
      round.options.ambient = ambient.checked;
      if (ambient.checked) startAudio();
      else stopAudio();
    });
  }
  $('#preferences').addEventListener('change', event => {
    const control = event.target;
    prefs[control.dataset.pref] = control.type === 'checkbox' ? control.checked : control.value;
    updateProfile();
  });
  $('#import-profile').addEventListener('submit', event => {
    event.preventDefault();
    try {
      prefs = decode($('#profile-input').value);
      updateProfile();
      updateSettingsFields();
      $('#profile-status').textContent = 'Preferências carregadas.';
    } catch (error) { $('#profile-status').textContent = error.message; }
  });
}

function updateSettingsFields() {
  for (const control of document.querySelectorAll('[data-pref]')) {
    if (control.type === 'checkbox') control.checked = prefs[control.dataset.pref];
    else control.checked = control.value === prefs[control.dataset.pref];
  }
  $('#profile-code').value = encode(prefs);
}

function updateProfile() {
  qrRequest++;
  savePrefs();
  if ($('#opening-error')) $('#opening-error').hidden = true;
  if ($('#qr-card')) {
    $('#qr-card').remove();
    $('#qr-tools')?.remove();
    document.body.classList.remove('print-card');
  }
  $('#profile-code').value = encode(prefs);
  $('#profile-status').textContent = '';
}

async function copyProfile(codeOnly = false) {
  const value = codeOnly ? encode(prefs) : profileURL(prefs, location.href);
  const status = $('#profile-status');
  try {
    await navigator.clipboard.writeText(value);
    status.textContent = codeOnly ? 'Código copiado.' : 'Link copiado.';
  } catch {
    if (!status.isConnected) return;
    const field = $(codeOnly ? '#profile-code' : '#profile-input');
    if (!codeOnly) field.value = value;
    field.focus();
    field.select();
    status.textContent = 'Use o comando Copiar do dispositivo para copiar o texto selecionado.';
  }
}

async function showQR() {
  const status = $('#profile-status');
  if ($('#qr-card')) { $('#qr-card').scrollIntoView(); return; }
  const url = profileURL(prefs, location.href);
  const request = ++qrRequest;
  try {
    const {default: qrcode} = await import('./vendor/qrcode.mjs');
    if (request !== qrRequest || modalType !== 'settings') return;
    const qr = qrcode(0, 'M');
    qr.addData(url, 'Byte');
    qr.make();
    const card = document.createElement('section');
    card.id = 'qr-card';
    card.className = 'qr';
    card.innerHTML = '<h3>Além de um Clique</h3><p>Escaneie para abrir este perfil.</p>' +
      qr.createSvgTag({cellSize: 5, margin: 20, scalable: true, title: 'QR Code do link do perfil'}) +
      '<p>Código <strong>' + encode(prefs) + '</strong></p><p class="qr-url"></p>';
    card.querySelector('.qr-url').textContent = url;
    const tools = document.createElement('div');
    tools.id = 'qr-tools';
    tools.className = 'section';
    tools.innerHTML = '<button data-print>Imprimir cartão</button>';
    modal.append(card, tools);
    document.body.classList.add('print-card');
    status.textContent = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname) ?
      'Este link local só abre no dispositivo que serve a página. Gere outro cartão no endereço hospedado.' :
      'QR Code pronto. Gere um novo cartão se alterar as preferências.';
    card.scrollIntoView();
  } catch {
    status.textContent = 'Não foi possível gerar o QR Code. Você ainda pode copiar o link.';
  }
}

function askExit(target) {
  if (!round || round.stage === 'finished') { round = null; target(); return; }
  const locked = release && performance.now() < release.until;
  if (locked) {
    showModal('exit', `<h2 id="modal-title">Saída bloqueada</h2><p>O professor pode liberar a saída usando o código.</p>
      <form id="unlock" class="stack"><label class="field">Código do professor<input type="password" required autocomplete="off"></label>
        <p id="unlock-status" role="status"></p>
        <div class="actions"><button type="button" data-close autofocus>Continuar jogando</button><button type="submit">Liberar saída</button></div>
      </form>`);
    $('#unlock').addEventListener('submit', event => {
      event.preventDefault();
      if ($('#unlock input').value !== release.pin && performance.now() < release.until) {
        $('#unlock-status').textContent = 'Código incorreto.';
        return;
      }
      release = null;
      askExit(target);
    });
    say('A saída está bloqueada. O professor pode liberar a saída usando o código.');
    return;
  }
  showModal('exit', `<h2 id="modal-title">Sair da partida?</h2><p>Se você sair agora, as respostas e a pontuação desta partida serão perdidas.</p>
    <div class="actions"><button class="primary" data-close autofocus>Continuar jogando</button><button id="confirm-exit">Sair e perder progresso</button></div>`);
  $('#confirm-exit').onclick = () => {
    stopRound();
    round = null;
    modal.close();
    target();
  };
  say('Se você sair agora, as respostas e a pontuação desta partida serão perdidas.');
}

document.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  const d = button.dataset;
  if (button.id === 'settings' || 'settings' in d) showSettings();
  else if (button.id === 'home' || 'home' in d) askExit(() => home());
  else if (d.subject) askExit(() => subjectPage(d.subject));
  else if (d.prepare) prepare(d.prepare);
  else if ('exit' in d) { const subject = round.game.subject; askExit(() => subjectPage(subject)); }
  else if ('answer' in d) answer(d.answer);
  else if ('colorCheck' in d) {
    const check = $('#color-check');
    check.hidden = false;
    startColorCheck(check, (palette, theme) => {
      prefs.palette = palette;
      prefs.theme = theme;
      updateProfile();
      updateSettingsFields();
      check.hidden = true;
      button.focus();
      announce('Paleta aplicada.');
    });
  }
  else if ('hint' in d) revealHint();
  else if ('mascot' in d) mascotHelp();
  else if ('repeat' in d) {
    const question = round.questions[round.index];
    if (questionState.last) showMessage(questionState.last, $('#mascot').dataset.state);
    else say(question.spoken || question.prompt);
  } else if ('replay' in d) {
    const {id, options: roundOptions} = round;
    start(id, roundOptions);
  } else if ('close' in d) modal.close();
  else if ('copy' in d) copyProfile();
  else if ('copyCode' in d) copyProfile(true);
  else if ('qr' in d) showQR();
  else if ('print' in d) window.print();
});

applyPrefs();
home(false);

const schoolyard = $('.schoolyard');
const systemReducesMotion = matchMedia('(prefers-reduced-motion: reduce)');
addEventListener('pointermove', event => {
  if (event.pointerType !== 'mouse' || prefs.reduce || prefs.focus || prefs.theme === 'contrast' || systemReducesMotion.matches) return;
  schoolyard.style.setProperty('--yard-x', ((event.clientX / innerWidth - .5) * 12).toFixed(1) + 'px');
  schoolyard.style.setProperty('--yard-y', ((event.clientY / innerHeight - .5) * 8).toFixed(1) + 'px');
}, {passive:true});

$('.skip').addEventListener('click', event => {
  event.preventDefault();
  main.focus();
});

addEventListener('hashchange', () => {
  loadURL();
  applyPrefs();
  if ($('.hero') && !modal.open) home(false);
  if (modal.open && modalType === 'settings') {
    $('#qr-card')?.remove();
    $('#qr-tools')?.remove();
    document.body.classList.remove('print-card');
    qrRequest++;
    updateSettingsFields();
    $('#profile-status').textContent = openingError;
  }
});
