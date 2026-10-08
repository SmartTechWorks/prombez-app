import { h, clear, shuffle } from './render.js';
import { icon } from './figures.js';

export function render(ctx) {
  const [id] = ctx.route.params;
  return id ? play(ctx, id) : list(ctx);
}

function list(ctx) {
  const { data, store } = ctx;
  return h('div', { class: 'stack' },
    h('h1', {}, 'Расставь по порядку'),
    h('p', { class: 'muted' }, 'Процедуры из конспекта, где важна последовательность шагов. Двигайте строки стрелками или тапните две строки, чтобы поменять их местами.'),
    h('div', { class: 'topic-list' }, data.sequences.map((s) => {
      const topic = ctx.topicById(s.topic);
      const r = store.seq(s.id);
      const status = !r ? 'не пройдено' : r.lastWrong ? 'есть ошибка' : 'верно';
      return h('a', { class: 'card tappable topic-item', href: `#order/${s.id}` },
        h('div', { class: 'topic-icon', style: { '--topic': topic?.color }, html: icon('order') }),
        h('div', {}, h('div', { class: 'topic-title' }, s.title), h('div', { class: 'topic-meta' }, `${s.steps.length} шагов · ${topic?.short}`)),
        h('div', { class: 'small', style: { fontWeight: 800, color: !r ? 'var(--muted)' : r.lastWrong ? 'var(--bad)' : 'var(--ok)' } }, status),
      );
    })),
  );
}

function shuffledOrder(n) {
  const base = [...Array(n).keys()];
  if (n < 2) return base;
  let order;
  do { order = shuffle(base); } while (order.every((v, i) => v === i));
  return order;
}

function play(ctx, id) {
  const { data, store } = ctx;
  const seq = data.sequences.find((s) => s.id === id);
  if (!seq) return h('div', { class: 'empty' }, 'Не найдено.');
  const topic = ctx.topicById(seq.topic);

  let order = shuffledOrder(seq.steps.length); // order[pos] = индекс исходного шага
  let checked = false;
  let selected = null;

  const listEl = h('ol', { class: 'order-list' });
  const foot = h('div', { class: 'actions-bottom stack' });
  const el = h('div', { class: 'stack' },
    h('a', { class: 'backlink', href: '#order' }, h('span', { html: icon('back'), style: { width: '18px', height: '18px', display: 'inline-block' } }), 'Все последовательности'),
    h('div', { class: 'small', style: { color: topic?.color, fontWeight: 800 } }, topic?.short),
    h('h1', {}, seq.title),
    h('p', { class: 'muted' }, seq.prompt),
    listEl, foot,
  );

  function move(pos, dir) {
    const to = pos + dir;
    if (to < 0 || to >= order.length) return;
    [order[pos], order[to]] = [order[to], order[pos]];
    draw();
  }

  function draw() {
    clear(listEl);
    order.forEach((stepIdx, pos) => {
      const cls = checked ? (stepIdx === pos ? 'right' : 'wrong') : (selected === pos ? 'selected' : '');
      const item = h('li', { class: `order-item ${cls}`, style: selected === pos && !checked ? { borderColor: 'var(--primary)' } : null },
        h('span', { class: 'idx' }, String(pos + 1)),
        h('span', { onclick: () => tap(pos) }, seq.steps[stepIdx]),
        checked ? h('span', { class: 'small', style: { fontWeight: 800 } }, stepIdx === pos ? '✓' : `→ ${stepIdx + 1}`) :
          h('span', { class: 'mv' },
            h('button', { type: 'button', 'aria-label': 'Выше', disabled: pos === 0, onclick: () => move(pos, -1) }, '▲'),
            h('button', { type: 'button', 'aria-label': 'Ниже', disabled: pos === order.length - 1, onclick: () => move(pos, 1) }, '▼'),
          ),
      );
      listEl.append(item);
    });
    clear(foot);
    if (!checked) foot.append(h('button', { class: 'btn primary', type: 'button', onclick: check }, 'Проверить'));
    else {
      const ok = order.every((v, i) => v === i);
      const [t, sec] = (seq.ref || '').split('#');
      foot.append(
        h('div', { class: 'explain' }, h('b', {}, ok ? 'Верно! Порядок правильный.' : 'Не всё на месте'), ok ? '' : 'Справа у строки — её правильный номер. ', t ? h('a', { href: `#theory/${t}?s=${sec}` }, 'Открыть в теории →') : null),
        h('div', { class: 'btn-grid' },
          h('button', { class: 'btn', type: 'button', onclick: () => { order = shuffledOrder(seq.steps.length); checked = false; selected = null; draw(); } }, 'Ещё раз'),
          h('a', { class: 'btn primary', href: '#order' }, 'К списку'),
        ),
      );
    }
  }

  function tap(pos) {
    if (checked) return;
    if (selected === null) { selected = pos; draw(); return; }
    if (selected !== pos) [order[pos], order[selected]] = [order[selected], order[pos]];
    selected = null; draw();
  }

  function check() {
    checked = true;
    store.recordSequence(seq.id, order.every((v, i) => v === i));
    draw();
  }

  draw();
  return el;
}
