import { h, bar, pct, plural } from './render.js';
import { icon, figure, PIPE_COLORS } from './figures.js';

export function render(ctx) {
  const [topicId] = ctx.route.params;
  return topicId ? topicPage(ctx, topicId) : topicList(ctx);
}

function topicList(ctx) {
  const { data, store } = ctx;
  return h('div', { class: 'stack' },
    h('h1', {}, 'Теория'),
    h('p', { class: 'muted' }, 'Материал конспекта по темам. Цифры и сроки выделены плашками.'),
    h('div', { class: 'topic-list' }, data.topics.map((t) => {
      const p = store.topicProgress(t.id, data.questions, data.sequences);
      const n = ctx.questionsOf(t.id).length;
      return h('a', { class: 'card tappable topic-item', href: `#theory/${t.id}` },
        h('div', { class: 'topic-icon', style: { '--topic': t.color }, html: icon(t.icon) }),
        h('div', {},
          h('div', { class: 'topic-title' }, `${t.n}. ${t.title}`),
          h('div', { class: 'topic-meta' }, bar(p, t.color), h('span', {}, `${n} ${plural(n, 'вопрос', 'вопроса', 'вопросов')}`)),
        ),
        h('div', { class: 'topic-pct', style: { color: t.color } }, `${pct(p)}%`),
      );
    })),
  );
}

function topicPage(ctx, topicId) {
  const { data } = ctx;
  const topic = ctx.topicById(topicId);
  const content = data.theory[topicId];
  if (!topic || !content) return h('div', { class: 'empty' }, h('p', {}, 'Тема не найдена.'), h('a', { class: 'btn', href: '#theory' }, 'К списку тем'));

  const el = h('div', { class: 'stack', style: { '--topic': topic.color } },
    h('a', { class: 'backlink', href: '#theory' }, h('span', { html: icon('back'), style: { width: '18px', height: '18px', display: 'inline-block' } }), 'Все темы'),
    h('div', { class: 'row' },
      h('div', { class: 'topic-icon', style: { '--topic': topic.color }, html: icon(topic.icon) }),
      h('h1', { class: 'grow', style: { margin: 0 } }, topic.title),
    ),
    content.sections.map((s, i) => section(s, i, topic)),
    h('div', { class: 'btn-grid' },
      h('a', { class: 'btn', href: `#cards?topic=${topic.id}` }, 'Карточки'),
      h('a', { class: 'btn primary', href: `#quiz/topic/${topic.id}` }, 'Тест по теме'),
    ),
  );

  const target = ctx.route.query.s;
  if (target) requestAnimationFrame(() => {
    const node = el.querySelector(`#sec-${CSS.escape(target)}`);
    if (node) { node.scrollIntoView({ behavior: 'smooth', block: 'start' }); node.style.outline = `2px solid ${topic.color}`; setTimeout(() => (node.style.outline = ''), 1800); }
  });
  return el;
}

function section(s, i, topic) {
  const parts = [];
  parts.push(h('h2', {}, h('span', { class: 'num' }, String(i + 1).padStart(2, '0')), s.title));
  if (s.intro) parts.push(h('p', {}, s.intro));
  if (s.callouts) parts.push(h('div', { class: 'callouts' }, s.callouts.map((c) => h('div', { class: 'callout' }, h('b', {}, c.value), h('span', {}, c.label)))));
  if (s.list) parts.push(h(s.ordered ? 'ol' : 'ul', { class: s.ordered ? 'list-ol' : 'list-ul' }, s.list.map((x) => h('li', {}, x))));
  if (s.terms) parts.push(h('dl', { class: 'terms' }, s.terms.map((t) => [h('dt', {}, t.term), h('dd', {}, t.def)])));
  if (s.table) parts.push(table(s.table));
  if (s.pipes) parts.push(h('div', { class: 'pipes' }, s.pipes.map((p) =>
    h('div', { class: 'pipe-row' }, h('div', {}, h('b', {}, p.medium), h('div', { class: 'small muted' }, p.label)), h('div', { html: figure('pipe-small', { color: p.color }) })))));
  if (s.figure) {
    const ids = Array.isArray(s.figure) ? s.figure : [s.figure];
    const figs = ids.map((id) => h('div', { class: 'figure', html: figure(id) }));
    parts.push(ids.length > 1 ? h('div', { class: 'figure-row' }, figs) : figs[0]);
  }
  if (s.note) parts.push(h('div', { class: 'note' }, s.note));
  return h('section', { class: 'card section', id: `sec-${s.id}` }, parts);
}

export function table(t) {
  return h('div', { class: 'table-wrap' }, h('table', { class: 'cmp' },
    h('thead', {}, h('tr', {}, t.head.map((x) => h('th', {}, x)))),
    h('tbody', {}, t.rows.map((r) => h('tr', {}, r.map((c) => h('td', {}, c))))),
  ));
}

export { PIPE_COLORS };
