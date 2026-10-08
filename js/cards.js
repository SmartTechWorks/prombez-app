import { h, clear } from './render.js';

let lastId = null;

function pickNext(cards, store) {
  const pool = cards.filter((c) => c.id !== lastId);
  const list = pool.length ? pool : cards;
  const weight = (c) => ({ repeat: 3, know: 1 }[store.card(c.id)] ?? 2);
  const total = list.reduce((s, c) => s + weight(c), 0);
  let r = Math.random() * total;
  for (const c of list) { r -= weight(c); if (r <= 0) return c; }
  return list[list.length - 1];
}

export function render(ctx) {
  const { data, store } = ctx;
  let topicFilter = ctx.route.query.topic || 'all';

  const chips = h('div', { class: 'chips' });
  const stage = h('div', { class: 'flash-wrap' });
  const counter = h('div', { class: 'muted small center' });
  const el = h('div', { class: 'stack' },
    h('h1', {}, 'Карточки'),
    chips,
    stage,
    counter,
    h('div', { class: 'btn-grid' },
      h('button', { class: 'btn bad', type: 'button', onclick: () => answer('repeat') }, 'Повторить'),
      h('button', { class: 'btn ok', type: 'button', onclick: () => answer('know') }, 'Знаю'),
    ),
    h('p', { class: 'muted small center' }, 'Тап — перевернуть, свайп — следующая. «Повторить» показывает карточку чаще.'),
  );

  let current = null;
  let cardEl = null;
  let busy = false;

  function pool() { return topicFilter === 'all' ? data.cards : data.cards.filter((c) => c.topic === topicFilter); }

  function renderChips() {
    clear(chips);
    const mk = (id, label) => h('button', { class: `chip ${topicFilter === id ? 'active' : ''}`, type: 'button', onclick: () => { topicFilter = id; lastId = null; renderChips(); next(); } }, label);
    chips.append(mk('all', 'Все темы'));
    for (const t of data.topics) chips.append(mk(t.id, t.short));
    requestAnimationFrame(() => chips.querySelector('.chip.active')?.scrollIntoView({ inline: 'center', block: 'nearest' }));
  }

  function stats() {
    const list = pool();
    const known = list.filter((c) => store.card(c.id) === 'know').length;
    const rep = list.filter((c) => store.card(c.id) === 'repeat').length;
    counter.textContent = `${list.length} карточек · знаю ${known} · повторить ${rep}`;
  }

  function next(direction) {
    const list = pool();
    stats();
    if (!list.length) { clear(stage); stage.append(h('div', { class: 'empty' }, 'В этой теме карточек нет.')); return; }
    const go = () => {
      current = pickNext(list, store);
      lastId = current.id;
      clear(stage);
      cardEl = makeCard(current);
      stage.append(cardEl);
      busy = false;
    };
    if (cardEl && direction) {
      busy = true;
      cardEl.classList.add(direction === 'left' ? 'swipe-left' : 'swipe-right');
      setTimeout(go, 230);
    } else go();
  }

  function answer(value) {
    if (!current || busy) return;
    store.setCard(current.id, value);
    next(value === 'know' ? 'right' : 'left');
  }

  function makeCard(c) {
    const topic = ctx.topicById(c.topic);
    const state = store.card(c.id);
    const stateEl = state ? h('span', { class: `state ${state}` }, state === 'know' ? 'знаю' : 'повторить') : null;
    const card = h('div', { class: 'flash', role: 'button', tabindex: 0, 'aria-label': 'Карточка, нажмите чтобы перевернуть' },
      h('div', { class: 'face front' }, h('span', { class: 'tag', style: { color: topic?.color } }, topic?.short || ''), stateEl?.cloneNode(true), h('div', {}, c.q), h('div', { class: 'hint' }, 'нажмите, чтобы увидеть ответ')),
      h('div', { class: 'face back' }, h('span', { class: 'tag', style: { color: topic?.color } }, 'ответ'), h('div', {}, c.a)),
    );

    // Тап — флип; горизонтальный свайп — следующая карточка.
    let sx = 0, sy = 0, moved = false, pid = null;
    card.addEventListener('pointerdown', (e) => { pid = e.pointerId; sx = e.clientX; sy = e.clientY; moved = false; card.style.transition = 'none'; });
    card.addEventListener('pointermove', (e) => {
      if (pid !== e.pointerId || busy) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
        moved = true;
        card.style.transform = `${card.classList.contains('flipped') ? 'rotateY(180deg) ' : ''}translateX(${dx}px) rotate(${dx / 30}deg)`;
      }
    });
    const end = (e) => {
      if (pid !== e.pointerId) return;
      pid = null;
      card.style.transition = '';
      const dx = e.clientX - sx;
      if (moved && Math.abs(dx) > 80) { card.style.transform = ''; next(dx < 0 ? 'left' : 'right'); return; }
      card.style.transform = '';
      if (!moved) card.classList.toggle('flipped');
    };
    card.addEventListener('pointerup', end);
    card.addEventListener('pointercancel', (e) => { pid = null; card.style.transition = ''; card.style.transform = ''; });
    card.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); card.classList.toggle('flipped'); } });
    return card;
  }

  renderChips();
  next();
  return el;
}
