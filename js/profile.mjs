export const defaults = Object.freeze({
  theme: 'light', palette: 'default', font: 'normal', upper: false,
  tts: false, reduce: false, mascot: true, spacing: false, focus: false
});

// V1 uses bits 0–9. V2 adds two accessibility preferences.
const fields = [
  ['theme', 0, 2, ['light', 'dark', 'contrast']],
  ['palette', 2, 2, ['default', 'blue', 'purple']],
  ['font', 4, 2, ['normal', 'large', 'extra']],
  ['upper', 6, 1, [false, true]],
  ['tts', 7, 1, [false, true]],
  ['reduce', 8, 1, [false, true]],
  ['mascot', 9, 1, [true, false]],
  ['spacing', 10, 1, [false, true]],
  ['focus', 11, 1, [false, true]]
];

export function encode(settings) {
  return fields.reduce((bits, [key, shift, , values]) => {
    const value = values.indexOf(settings[key]);
    return bits | (Math.max(0, value) << shift);
  }, 0).toString(16).toUpperCase().padStart(4, '0');
}

export function decode(input) {
  const value = input.trim();
  const fragment = value.includes('#') ? value.slice(value.indexOf('#') + 1) : value;
  const params = fragment.includes('=') ? new URLSearchParams(fragment) : null;
  const version = params?.get('v');
  if (params && (params.getAll('v').length !== 1 || !['1', '2'].includes(version) || params.getAll('p').length !== 1)) {
    throw new Error('A versão do perfil não é válida ou não é compatível.');
  }
  const code = params ? params.get('p') : fragment;
  if (!/^[0-9a-f]{4}$/i.test(code)) throw new Error('Informe um código de quatro caracteres hexadecimais ou um link de perfil.');
  const bits = Number.parseInt(code, 16);
  if (bits >>> (version === '1' ? 10 : 12)) throw new Error('O código usa opções que esta versão não reconhece.');
  return Object.fromEntries(fields.map(([key, shift, width, values]) => {
    const option = values[(bits >>> shift) & ((1 << width) - 1)];
    if (option === undefined) throw new Error('O código contém uma opção inválida.');
    return [key, option];
  }));
}

export function profileURL(settings, address) {
  const url = new URL(address);
  url.search = '';
  const version = settings.spacing || settings.focus ? 2 : 1;
  url.hash = 'v=' + version + '&p=' + encode(settings);
  return url.href;
}
