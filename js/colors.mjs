const previews = [
  ['default', 'light', 'Bosque', '#e7efd7', '#245841', '#fae6b8', '#192f29'],
  ['blue', 'light', 'Azul e amarelo', '#dbeafa', '#234a83', '#f9e7af', '#192f29'],
  ['purple', 'light', 'Roxo e verde-azulado', '#eee2f5', '#603477', '#dcece8', '#192f29'],
  ['default', 'contrast', 'Alto contraste', '#000000', '#ffec66', '#ffffff', '#ffffff']
];

export function startColorCheck(container, onApply) {
  container.innerHTML = '<h3 tabindex="-1">Qual imagem fica mais clara para você?</h3><div class="palette-grid"></div>';
  const grid = container.querySelector('.palette-grid');
  for (const [palette, theme, label, sky, mountain, sun, outline] of previews) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'palette-preview';
    button.innerHTML = `<svg aria-hidden="true" viewBox="0 0 220 126">
      <rect width="220" height="126" rx="14" fill="${sky}"/>
      <circle cx="157" cy="35" r="19" fill="${sun}" stroke="${outline}" stroke-width="3"/>
      <path d="M10 108 69 37 113 87 142 59 211 108Z" fill="${mountain}" stroke="${outline}" stroke-width="3" stroke-linejoin="round"/>
      <path d="m48 63 21-26 23 26-12-2-11 9-9-8Z" fill="${sun}" stroke="${outline}" stroke-width="2" stroke-linejoin="round"/>
    </svg><span>${label}</span>`;
    button.onclick = () => onApply(palette, theme);
    grid.append(button);
  }
  container.querySelector('h3').focus();
}
