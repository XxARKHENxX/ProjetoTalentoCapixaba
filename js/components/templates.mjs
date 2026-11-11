export function card(item, label, action, id) {
  return '<button type="button" class="card ' + item.style + '" data-' + action + '="' + id +
    '"><span class="icon" aria-hidden="true">' + item.icon + '</span><strong>' + item.title +
    '</strong><span class="card-description">' + item.description +
    '</span><span class="card-action">' + label + ' <span aria-hidden="true">→</span></span></button>';
}

export function choices(name, title, items, selected, pref = false) {
  return '<fieldset class="choice-set"><legend>' + title + '</legend><div class="choice-grid">' +
    items.map(([value, label]) => '<label class="choice"><input class="sr-only" type="radio" name="' + name +
      '" value="' + value + '"' + (pref ? ' data-pref="' + name + '"' : '') +
      (value === selected ? ' checked' : '') + '><span>' + label + '</span></label>').join('') + '</div></fieldset>';
}

