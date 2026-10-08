import { h, ring, bar, pct, plural } from './render.js';
import { icon } from './figures.js';

export function render(ctx) {
  const { data, store } = ctx;
  const rows = data.topics.map((t) => {
    const qs = ctx.questionsOf(t.id);
    const seqs = data.sequences.filter((s) => s.topic === t.id);
    const seen = qs.filter((q) => store.q(q.id)?.seen).length;
    return { t, p: store.topicProgress(t.id, data.questions, data.sequences), total: qs.length + seqs.length, seen };
  });
  const overall = rows.reduce((s, r) => s + r.p, 0) / rows.length;
  const mastered = rows.filter((r) => r.p >= 0.8).length;
  const streak = store.streak();
  const allStats = Object.values(store.state.q);
  const answered = allStats.reduce((s, x) => s + x.seen, 0);
  const right = allStats.reduce((s, x) => s + x.right, 0);
  const days = store.state.days.length;

  return h('div', { class: 'stack' },
    h('h1', {}, 'Прогресс'),
    h('div', { class: 'card hero pad-lg' },
      h('div', { class: 'row' },
        h('div', { class: 'grow' },
          h('div', { class: 'muted small' }, 'Освоено'),
          h('div', { class: 'result-big' }, `${mastered}/${rows.length}`),
          h('div', { class: 'muted' }, 'тем на 80 % и выше'),
        ),
        ring(overall),
      ),
    ),
    h('div', { class: 'kpi' },
      h('div', { class: 'card' }, h('b', {}, streak), h('span', {}, `${plural(streak, 'день', 'дня', 'дней')} подряд`)),
      h('div', { class: 'card' }, h('b', {}, answered ? `${Math.round((right / answered) * 100)}%` : '—'), h('span', {}, 'верных ответов')),
      h('div', { class: 'card' }, h('b', {}, days), h('span', {}, `${plural(days, 'день', 'дня', 'дней')} занятий`)),
    ),
    h('div', { class: 'card' },
      h('h2', {}, 'По темам'),
      h('div', { class: 'topic-list' }, rows.map((r) =>
        h('a', { class: 'topic-item', href: `#quiz/topic/${r.t.id}`, style: { padding: '6px 0' } },
          h('div', { class: 'topic-icon', style: { '--topic': r.t.color, width: '38px', height: '38px', borderRadius: '11px' }, html: icon(r.t.icon) }),
          h('div', {}, h('div', { class: 'topic-title', style: { fontSize: '15px' } }, r.t.short), h('div', { class: 'topic-meta' }, bar(r.p, r.t.color), `${r.seen}/${r.total}`)),
          h('div', { class: 'topic-pct', style: { color: r.t.color } }, `${pct(r.p)}%`),
        ))),
      h('p', { class: 'muted small', style: { marginTop: '10px' } }, 'Процент — доля вопросов темы, на которые последний ответ был верным. Справа — сколько вопросов уже встречалось.'),
    ),
    h('button', { class: 'btn ghost', type: 'button', onclick: () => {
      if (confirm('Сбросить весь прогресс? Это нельзя отменить.')) { store.reset(); ctx.navigate('#progress'); ctx.toast('Прогресс сброшен'); }
    } }, 'Сбросить прогресс'),
  );
}
