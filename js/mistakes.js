import { h, plural } from './render.js';
import { icon } from './figures.js';

export function render(ctx) {
  const { data, store } = ctx;
  const ids = new Set(store.mistakes());
  const qs = data.questions.filter((q) => ids.has(q.id));
  const seqIds = new Set(store.mistakeSequences());
  const seqs = data.sequences.filter((s) => seqIds.has(s.id));

  if (!qs.length && !seqs.length) {
    return h('div', { class: 'stack' },
      h('h1', {}, 'Работа над ошибками'),
      h('div', { class: 'empty' }, h('div', { class: 'big' }, '✨'), h('p', {}, 'Ошибок нет. Так держать!'), h('a', { class: 'btn primary', href: '#quiz/exam', style: { width: 'auto' } }, 'Проверить себя экзаменом')),
    );
  }

  const groups = new Map();
  for (const q of qs) { if (!groups.has(q.topic)) groups.set(q.topic, []); groups.get(q.topic).push(q); }

  return h('div', { class: 'stack' },
    h('h1', {}, 'Работа над ошибками'),
    h('p', { class: 'muted' }, `${qs.length} ${plural(qs.length, 'вопрос', 'вопроса', 'вопросов')} ждут верного ответа. Ответите правильно — вопрос исчезнет отсюда.`),
    qs.length ? h('button', { class: 'btn primary', type: 'button', onclick: () => ctx.navigate('#quiz/mistakes') }, 'Повторить ошибки') : null,
    [...groups.entries()].map(([topicId, list]) => {
      const t = ctx.topicById(topicId);
      return h('div', { class: 'card', style: { '--topic': t?.color } },
        h('div', { class: 'row', style: { marginBottom: '8px' } },
          h('div', { class: 'topic-icon', style: { '--topic': t?.color, width: '34px', height: '34px', borderRadius: '10px' }, html: icon(t?.icon) }),
          h('b', {}, t?.short), h('span', { class: 'grow' }),
          h('a', { class: 'small', href: `#theory/${topicId}`, style: { fontWeight: 700, color: t?.color } }, 'теория →'),
        ),
        h('ul', { class: 'list-ul' }, list.map((q) => {
          const [tt, sec] = (q.ref || '').split('#');
          return h('li', {}, h('a', { href: `#theory/${tt}?s=${sec}` }, q.q), h('div', { class: 'small muted' }, `Верно: ${q.options[q.correct]}`));
        })),
      );
    }),
    seqs.length ? h('div', { class: 'card' },
      h('h2', {}, 'Последовательности'),
      h('ul', { class: 'list-ul' }, seqs.map((s) => h('li', {}, h('a', { href: `#order/${s.id}`, style: { fontWeight: 700 } }, s.title), h('div', { class: 'small muted' }, 'Попробовать ещё раз →')))),
    ) : null,
  );
}
