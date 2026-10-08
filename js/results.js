import { h, ring, bar, pct } from './render.js';

function phrase(ratio, wrong) {
  if (ratio === 1) return 'Отлично! Ни одной ошибки.';
  if (ratio >= 0.8) return `Отлично! Ещё немного — повторите ${wrong} ${wrong === 1 ? 'вопрос' : wrong < 5 ? 'вопроса' : 'вопросов'}.`;
  if (ratio >= 0.5) return 'Хорошая база. Пройдитесь по ошибкам — и будет уверенно.';
  return 'Нормальное начало. Разберите пояснения в теории и возвращайтесь.';
}

export function renderResults(ctx, s) {
  const total = s.answers.length;
  const right = s.answers.filter((a) => a.ok).length;
  const wrong = total - right;
  const ratio = total ? right / total : 0;

  const byTopic = new Map();
  for (const a of s.answers) {
    const t = byTopic.get(a.q.topic) || { total: 0, right: 0 };
    t.total++; if (a.ok) t.right++;
    byTopic.set(a.q.topic, t);
  }
  const rows = [...byTopic.entries()].map(([id, v]) => ({ topic: ctx.topicById(id), ...v, r: v.right / v.total })).sort((a, b) => a.r - b.r);

  const retryHash = s.mode === 'topic' ? `#quiz/topic/${s.answers[0]?.q.topic}` : `#quiz/${s.mode}`;

  return h('div', { class: 'stack' },
    h('div', { class: 'card hero pad-lg' },
      h('div', { class: 'row' },
        h('div', { class: 'grow' },
          h('div', { class: 'muted small' }, s.title),
          h('div', { class: 'result-big' }, `${right}/${total}`),
          h('div', {}, phrase(ratio, wrong)),
        ),
        ring(ratio),
      ),
    ),
    wrong > 0 ? h('button', { class: 'btn primary', type: 'button', onclick: () => ctx.navigate('#quiz/mistakes') }, `Повторить ошибки · ${wrong}`) : null,
    rows.length > 1 ? h('div', { class: 'card' },
      h('h2', {}, 'По темам'),
      h('div', { class: 'breakdown' }, rows.map((r) =>
        h('div', {},
          h('div', { class: 'row' }, h('span', {}, r.topic?.short || r.topic?.title), h('b', { style: { color: r.r < 0.6 ? 'var(--bad)' : r.r < 0.9 ? 'inherit' : 'var(--ok)' } }, `${r.right}/${r.total}`)),
          bar(r.r, r.topic?.color),
        ))),
      rows[0] && rows[0].r < 0.8 ? h('p', { class: 'muted small', style: { marginTop: '10px' } }, `Хромает: ${rows.filter((r) => r.r < 0.8).map((r) => r.topic?.short).join(', ')}.`) : null,
    ) : null,
    h('div', { class: 'btn-grid' },
      h('button', { class: 'btn', type: 'button', onclick: () => ctx.navigate(retryHash) }, 'Ещё раз'),
      h('a', { class: 'btn', href: '#quiz' }, 'К тестам'),
    ),
    h('div', { class: 'muted small center' }, `Прогресс сохранён · общий ${pct(ctx.data.topics.reduce((sum, t) => sum + ctx.store.topicProgress(t.id, ctx.data.questions, ctx.data.sequences), 0) / ctx.data.topics.length)}%`),
  );
}
