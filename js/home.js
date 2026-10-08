import { h, ring, bar, pct, plural } from './render.js';
import { icon } from './figures.js';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 5) return 'Доброй ночи';
  if (hour < 12) return 'Доброе утро';
  if (hour < 18) return 'Добрый день';
  return 'Добрый вечер';
}

export function render(ctx) {
  const { data, store } = ctx;
  const progressByTopic = data.topics.map((t) => ({ t, p: store.topicProgress(t.id, data.questions, data.sequences) }));
  const overall = progressByTopic.reduce((s, x) => s + x.p, 0) / data.topics.length;
  const mastered = progressByTopic.filter((x) => x.p >= 0.8).length;
  const streak = store.streak();
  const mistakes = store.mistakes().length + store.mistakeSequences().length;
  const last = store.state.last;
  const answered = Object.keys(store.state.q).length;

  const weakest = progressByTopic.slice().sort((a, b) => a.p - b.p).slice(0, 3);

  const el = h('div', { class: 'stack' },
    h('div', { class: 'card hero pad-lg' },
      h('div', { class: 'row' },
        h('div', { class: 'grow' },
          h('div', { class: 'muted small' }, greeting()),
          h('h1', {}, 'Сосуды под давлением'),
          h('div', { class: 'muted' }, `${mastered} из ${data.topics.length} тем освоено`),
          streak > 0 ? h('div', { class: 'streak', style: { marginTop: '8px' } }, h('span', { html: icon('fire'), style: { width: '20px', height: '20px', display: 'inline-block', color: '#FBBF24' } }), `${streak} ${plural(streak, 'день', 'дня', 'дней')} подряд`) : h('div', { class: 'muted small', style: { marginTop: '8px' } }, 'Начните серию — позанимайтесь сегодня'),
        ),
        ring(overall),
      ),
    ),

    h('div', { class: 'stack' },
      last && last !== '#home' ? h('button', { class: 'btn secondary', type: 'button', onclick: () => ctx.navigate(last) }, 'Продолжить') : null,
      mistakes > 0
        ? h('button', { class: 'btn primary', type: 'button', onclick: () => ctx.navigate('#quiz/mistakes') }, `Повторить ошибки · ${mistakes}`)
        : null,
      h('button', { class: `btn ${mistakes > 0 ? '' : 'primary'}`, type: 'button', onclick: () => ctx.navigate('#quiz/exam') }, 'Пройти экзамен · 20 вопросов'),
    ),

    h('div', { class: 'kpi' },
      h('div', { class: 'card' }, h('b', {}, answered), h('span', {}, `${plural(answered, 'вопрос', 'вопроса', 'вопросов')} пройдено`)),
      h('div', { class: 'card' }, h('b', {}, `${pct(overall)}%`), h('span', {}, 'общий прогресс')),
      h('div', { class: 'card' }, h('b', {}, data.questions.length), h('span', {}, 'вопросов в базе')),
    ),

    h('div', { class: 'card' },
      h('h2', {}, answered ? 'Стоит подтянуть' : 'С чего начать'),
      h('div', { class: 'topic-list' }, weakest.map(({ t, p }) =>
        h('a', { class: 'topic-item', href: `#theory/${t.id}` },
          h('div', { class: 'topic-icon', style: { '--topic': t.color }, html: icon(t.icon) }),
          h('div', {}, h('div', { class: 'topic-title' }, t.short), h('div', { class: 'topic-meta' }, bar(p, t.color), `${pct(p)}%`)),
          h('span', { class: 'muted', html: '›', style: { fontSize: '22px' } }),
        ))),
    ),

    h('div', { class: 'btn-grid' },
      h('a', { class: 'btn', href: '#cards' }, 'Карточки'),
      h('a', { class: 'btn', href: '#order' }, 'По порядку'),
    ),
  );
  return el;
}
