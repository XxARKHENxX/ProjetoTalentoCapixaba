import {VoiceController} from './voice.mjs';
import {GestureController} from './gestures.mjs';

/** Rebinds voice and gesture controls for the current question.
 * getRound prevents stale callbacks from writing to a previous question.
 * Returns updated controllers for cleanup by the application.
 */
export function setupInputControls({$, getRound, voiceController, gestureController}) {
  const round = getRound();
  const btnVoice = $('#toggle-voice');
  const btnGesture = $('#toggle-gesture');
  let voiceContainer = $('#voice-container');
  if (!voiceContainer) {
    voiceContainer = document.createElement('div');
    voiceContainer.id = 'voice-container';
    voiceContainer.style.cssText = 'display: none; position: fixed; bottom: 20px; left: 20px; z-index: 10000; background: var(--panel, #ffffff); color: var(--ink, #192f29); padding: 12px 16px; border-radius: 12px; border: 2px solid var(--line, #c8d0be); box-shadow: 0 4px 16px rgba(0,0,0,0.25); max-width: 280px; text-align: left;';
    voiceContainer.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
        <span style="width: 10px; height: 10px; background-color: #22c55e; border-radius: 50%; display: inline-block;"></span>
        <strong style="font-size: 14px;">Reconhecimento de Voz</strong>
      </div>
      <div id="voice-status" style="font-size: 13px; color: var(--muted, #445952); font-style: italic;">Escutando... Fale o número da resposta.</div>
      <div id="voice-transcript" style="margin-top: 6px; font-weight: bold; font-size: 14px; color: var(--action, #245841); overflow-wrap: anywhere;"></div>
    `;
    document.body.appendChild(voiceContainer);
  }

  let gestureContainer = $('#gesture-container');
  if (!gestureContainer) {
    gestureContainer = document.createElement('div');
    gestureContainer.id = 'gesture-container';
    gestureContainer.style.cssText = 'display: none; position: fixed; bottom: 20px; right: 20px; z-index: 10000; background: var(--panel, #ffffff); color: var(--ink, #192f29); padding: 12px; border-radius: 12px; border: 2px solid var(--line, #c8d0be); box-shadow: 0 4px 16px rgba(0,0,0,0.25); text-align: center; max-width: 230px;';
    gestureContainer.innerHTML = `
      <strong style="font-size: 14px; display: block; margin-bottom: 6px;">Câmera & Gestos</strong>
      <div style="position:relative;width:180px;height:135px;margin:auto"><video id="gesture-video" width="180" height="135" autoplay playsinline muted style="transform:scaleX(-1);border-radius:8px;background:#000;display:block;position:absolute;inset:0"></video><canvas id="gesture-overlay" width="180" height="135" style="position:absolute;inset:0;width:180px;height:135px;transform:scaleX(-1);pointer-events:none"></canvas></div>
      <div style="font-size:11px;margin-top:6px">Mantenha o gesto por 1,5 s</div>
      <progress id="gesture-progress" max="100" value="0" style="width:100%"></progress>
      <div id="gesture-letters-tools" hidden style="margin-top:8px"><small>Reconhecimento geométrico experimental. Confira cada letra antes de confirmar.</small><div style="margin-top:6px;display:flex;gap:5px"><button type="button" id="gesture-backspace">⌫ Apagar</button><button type="button" id="gesture-space">Espaço</button></div></div>
      <div id="gesture-status" style="font-size: 12px; font-weight: bold; margin-top: 8px; color: var(--action, #245841);">Iniciando câmera...</div>
    `;
    document.body.appendChild(gestureContainer);
  }

  // Compatibilidade com versões antigas do index.html que já possuem o painel.
  // Nelas, o painel existia sem a barra e os botões de escrita.
  if (!$('#gesture-progress')) {
    const progress = document.createElement('progress');
    progress.id = 'gesture-progress';
    progress.max = 100;
    progress.value = 0;
    progress.style.width = '100%';
    gestureContainer.appendChild(progress);
  }
  if (!$('#gesture-letters-tools')) {
    const tools = document.createElement('div');
    tools.id = 'gesture-letters-tools';
    tools.hidden = true;
    tools.style.marginTop = '8px';
    tools.innerHTML = '<small>Reconhecimento geométrico experimental — confira a letra antes de confirmar.</small><div style="display:flex;gap:5px;margin-top:6px"><button type="button" id="gesture-backspace">⌫ Apagar</button><button type="button" id="gesture-space">Espaço</button></div>';
    gestureContainer.appendChild(tools);
  }

  // A confirmação temporal acontece no rastreador;
  // não existe segundo temporizador.
  const gestureMode = round.game.typing ? 'letters' : 'choices';

  // Exibir ferramentas somente nos jogos de digitação.
  const lettersTools = $('#gesture-letters-tools');

  if (lettersTools) {
    lettersTools.hidden = gestureMode !== 'letters';
  }

  // Botão para apagar a última letra.
  const backspaceButton = $('#gesture-backspace');

  if (backspaceButton) {
    backspaceButton.onclick = () => {
      const input = $('#answer');

      if (input) {
        input.value = input.value.slice(0, -1);
        input.dispatchEvent(
          new Event('input', { bubbles: true })
        );
      }
    };
  }

  // Botão para inserir espaço.
  const spaceButton = $('#gesture-space');

  if (spaceButton) {
    spaceButton.onclick = () => {
      const input = $('#answer');

      if (
        input &&
        (input.maxLength < 0 ||
         input.value.length < input.maxLength)
      ) {
        input.value += ' ';
        input.dispatchEvent(
          new Event('input', { bubbles: true })
        );
      }
    };
  }
  if (btnVoice) {
    btnVoice.onclick = () => {
      const active = btnVoice.dataset.toggleVoice === 'true';
      if (active) {
        btnVoice.dataset.toggleVoice = 'false';
        btnVoice.textContent = '🎤 Ativar Voz';
        voiceContainer.style.display = 'none';
        voiceController?.stop();
      } else {
        btnVoice.dataset.toggleVoice = 'true';
        btnVoice.textContent = '🎤 Desativar Voz';
        voiceContainer.style.display = 'block';
        if (!voiceController) {
          voiceController = new VoiceController(
            (val) => {
              if (val === 'submit') {
                const submitBtn = $('#answer-form button[type="submit"]');
                if (submitBtn) submitBtn.click();
              } else if (typeof val === 'number') {
                const opts = document.querySelectorAll('#answers button');
                if (opts[val]) opts[val].click();
              }
            },
            (status, transcript) => {
              const vStatus = $('#voice-status');
              const vTrans = $('#voice-transcript');
              if (vStatus) vStatus.textContent = status;
              if (vTrans) vTrans.textContent = transcript || '';
            }
          );
        }
        voiceController.start();
      }
    };
  }

  if (btnGesture) {
    btnGesture.onclick = () => {
      const active = btnGesture.dataset.toggleGesture === 'true';
      const gestureVideo = $('#gesture-video');
      const gestureStatus = $('#gesture-status');

      if (active) {
        btnGesture.dataset.toggleGesture = 'false';
        btnGesture.textContent = '✋ Ativar Gestos';
        gestureContainer.style.display = 'none';
        gestureController?.stop();
        if ($('#gesture-progress')) $('#gesture-progress').value = 0;
      } else {
        btnGesture.dataset.toggleGesture = 'true';
        btnGesture.textContent = '✋ Desativar Gestos';
        gestureContainer.style.display = 'block';

        // Recria o controlador para associar o vídeo e os callbacks da questão atual.
        gestureController?.stop();
        gestureController = new GestureController(
          gestureVideo,
          $('#gesture-overlay'),
          (gesture) => {
            if (!getRound() || getRound().stage !== 'answer') return;
            if (gestureMode === 'letters') {
              const input = $('#answer');
              if (input && (input.maxLength < 0 || input.value.length < input.maxLength)) {
                input.value += gesture.toLocaleLowerCase('pt-BR');
                input.dispatchEvent(new Event('input',{bubbles:true}));
              }
            } else {
              const opts = document.querySelectorAll('#answers button');
              const button = opts[gesture - 1];
              if (button && !button.disabled) button.click();
            }
          },
          status => { if (gestureStatus) gestureStatus.textContent = status; },
          (gesture, progress, locked) => {
            const gestureProgress = $('#gesture-progress');
            if (gestureProgress) gestureProgress.value = Math.round(progress * 100);
            if (gestureStatus && gesture !== null) gestureStatus.textContent =
              `${gestureMode === 'letters' ? 'Letra' : 'Opção'}: ${gesture} — ${locked ? 'confirmado; mude o gesto' : Math.round(progress*100) + '%'}`;
          }
        );
        gestureController.setMode(gestureMode);
        gestureController.start().catch(() => {
          btnGesture.dataset.toggleGesture = 'false';
          btnGesture.textContent = '✋ Ativar Gestos';
        });
      }
    };
  }


  return {voiceController, gestureController};
}
