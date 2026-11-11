import {subjects, games} from '../games/content.mjs';
import {card} from '../components/templates.mjs';

export function createCatalogPages({view, getPrefs, getOpeningError, dino, $}) {
  const home = (focus = true) => {
    const prefs = getPrefs();
    const openingError = getOpeningError();
  view(`<section class="hero"><div><p class="eyebrow">Jogos educativos acessíveis</p>
    <h1>Além de um Clique</h1><p>Uma aventura de palavras e números. Escolha por onde quer começar!</p>
    <button class="primary" data-settings>⚙️ Ajustar meu jeito de aprender</button></div>
    <img src="${dino}" alt="" ${prefs.mascot ? '' : 'hidden'}></section>
    <p id="opening-error" class="status section" role="status" hidden></p>
    <section class="section" aria-labelledby="disciplines"><p class="eyebrow">Um mundo de descobertas</p><h2 id="disciplines">O que vamos explorar hoje? ✨</h2>
    <div class="grid catalog">${Object.entries(subjects).map(([id, subject]) =>
      card(subject, 'Explorar atividades', 'subject', id)).join('')}</div></section>`, focus);
  if (openingError) {
    $('#opening-error').hidden = false;
    $('#opening-error').textContent = openingError + ' Usamos as configurações padrão. Você pode corrigir o código em Configurações.';
  }
  };
  const subjectPage = id => {
  const subject = subjects[id];
  view(`<section class="narrow"><button class="back" data-home>← Voltar às aventuras</button>
    <p class="eyebrow">Escolha um jogo</p><h1>${subject.title}</h1><p>${subject.description}</p>
    <div class="grid catalog section">${Object.entries(games).filter(([, game]) => game.subject === id).map(([key, game]) =>
      card({...subject, icon: game.icon || subject.icon, title: game.title, description: game.instruction}, 'Vamos jogar!', 'prepare', key)).join('')}</div></section>`);
  };
  return {home, subjectPage};
}
