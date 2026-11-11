import {choices} from '../../components/templates.mjs';
export function settingsTemplate({options, prefs, round}) {
  return `<div class="split"><h2 id="modal-title">Configurações</h2><button data-close autofocus>Concluir</button></div>
    <p>As escolhas são aplicadas na hora e ficam no link do perfil.</p>
    <div class="settings-layout section">
    <section class="settings-panel" aria-labelledby="preferences-title">
    <h3 id="preferences-title">Como você quer jogar?</h3>
    <div class="stack" id="preferences">
      ${options.filter(([, , values]) => values).map(([key, title, values]) => choices(key, title, values, prefs[key], true)).join('')}
      <fieldset class="choice-set"><legend>Apoios durante o jogo</legend><div class="choice-grid">
        ${options.filter(([, , values]) => !values).map(([key, title]) =>
          '<label class="choice"><input class="sr-only" type="checkbox" data-pref="' + key + '"><span>' + title + '</span></label>').join('')}
      </div></fieldset>
    </div>
    ${round && round.stage !== 'finished' ?
      '<label class="check"><input type="checkbox" id="round-audio"> Som ambiente nesta partida</label>' : ''}
    </section>
    <section class="settings-panel" aria-labelledby="color-title">
      <h3 id="color-title">Teste de percepção de cores</h3>
      <p>Veja o mesmo cenário com cores diferentes. Escolha a imagem que você enxerga melhor.</p>
      <button type="button" data-color-check>Escolher pelas imagens</button>
      <div id="color-check" class="section" hidden></div>
    </section>
    <section class="settings-panel profile-panel" aria-labelledby="share-title"><h3 id="share-title">Levar minhas configurações</h3>
      <div class="profile-layout">
        <div>
          <div class="actions"><label class="field">Seu código<input id="profile-code" readonly size="5" spellcheck="false"></label>
            <button type="button" data-copy-code>Copiar código</button></div>
          <div class="actions"><button data-copy>Copiar link</button><button data-qr>Mostrar QR Code</button></div>
        </div>
        <form id="import-profile" class="typing"><label class="field">Código ou link de outro perfil<input id="profile-input" required autocomplete="off" spellcheck="false"></label>
          <button type="submit">Aplicar código</button></form>
      </div>
      <p id="profile-status" role="status" class="status"></p>
    </section></div>`;
}
