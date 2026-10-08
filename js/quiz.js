import { h, clear, shuffle, sample, bar, pct, plural } from './render.js';
import { icon, figure } from './figures.js';
import { renderResults } from './results.js';

const LETTERS = ['А', 'Б', 'В', 'Г'];
const EXAM_SIZE = 20;

export function render(ctx) {
  const [mode, arg] = ctx.route.params;
  if (!mode) return menu(ctx);
  const session = buildSession(ctx, mode, arg);
  if (!session) return h('div', { class: 'empty' }, h('div', { class: 'big' }, '🎉'), h('p', {}, 'Ошибок нет — повторять нечего.'), h('a', { class: 'btn', href: '#quiz' }, 'К тестам'));
  return runSession(ctx, session);
}

function menu(ctx) {
  const { data, store } = ctx;
  return h('div', { class: 'stack' },
    h('h1', {}, 'Тесты'),
    h('div', { class: 'card hero pad-lg tappable', onclick: () => ctx.navigate('#quiz/exam') },
      h('h2', {}, 'Экзамен'),
      h('p', { class: 'muted' }, `${EXAM_SIZE} случайных вопросов по всем темам, без подсказок. Результат — в конце.`),
      h('button', { class: 'btn primary', type: 'button' }, 'Начать экзамен'),
    ),
    h('div', { class: 'btn-grid' },
      h('a', { class: 'btn', href: '#quiz/all' }, 'Все темы подряд'),
      h('a', { class: 'btn', href: '#order' }, h('span', { html: icon('order'), style: { width: '20px', height: '20px', display: 'inline-block' } }), 'По порядку'),
    ),
    h('h2', { style: { marginTop: '8px' } }, 'По теме'),
    h('div', { class: 'topic-list' }, data.topics.map((t) => {
      const n = ctx.questionsOf(t.id).length;
      const p = store.topicProgress(t.id, data.questions, data.sequences);
      return h('a', { class: 'card tappable topic-item', href: `#quiz/topic/${t.id}` },
        h('div', { class: 'topic-icon', style: { '--topic': t.color }, html: icon(t.icon) }),
        h('div', {}, h('div', { class: 'topic-title' }, t.short), h('div', { class: 'topic-meta' }, bar(p, t.color), `${n} ${plural(n, 'вопрос', 'вопроса', 'вопросов')}`)),
        h('div', { class: 'topic-pct', style: { color: t.color } }, `${pct(p)}%`),
      );
    })),
  );
}

function buildSession(ctx, mode, arg) {
  const { data, store } = ctx;
  let questions, title, exam = false;
  if (mode === 'exam') { questions = sample(data.questions, EXAM_SIZE); title = 'Экзамен'; exam = true; }
  else if (mode === 'all') { questions = shuffle(data.questions); title = 'Все темы'; }
  else if (mode === 'mistakes') {
    const ids = new Set(store.mistakes());
    questions = shuffle(data.questions.filter((q) => ids.has(q.id)));
    if (!questions.length) return null;
    title = 'Работа над ошибками';
  } else {
    const topic = ctx.topicById(arg);
    questions = shuffle(ctx.questionsOf(arg));
    title = topic ? topic.short : 'Тест';
  }
  return { mode, title, exam, questions, index: 0, answers: [] };
}

function runSession(ctx, s) {
  const { store } = ctx;
  const head = h('div', { class: 'quiz-head' });
  const progress = h('div', { class: 'bar' }, h('i', {}));
  const body = h('div', { class: 'card pad-lg' });
  const foot = h('div', { class: 'actions-bottom' });
  const el = h('div', { class: 'stack' },
    h('div', { class: 'row' }, h('a', { class: 'backlink', href: '#quiz', style: { margin: 0 } }, h('span', { html: icon('back'), style: { width: '18px', height: '18px', display: 'inline-block' } }), 'Тесты'), h('span', { class: 'grow' }), h('b', {}, s.title)),
    head, progress, body, foot,
  );

  function show() {
    const q = s.questions[s.index];
    if (!q) { finish(); return; }
    const right = s.answers.filter((a) => a.ok).length;
    clear(head);
    head.append(h('span', {}, `Вопрос ${s.index + 1} из ${s.questions.length}`), h('span', { class: 'score' }, s.exam ? `отвечено ${s.answers.length}` : [h('span', { class: 'ok' }, `${right} верно`), ` · ${s.answers.length - right} неверно`]));
    progress.firstChild.style.width = `${(s.index / s.questions.length) * 100}%`;

    const topic = ctx.topicById(q.topic);
    const order = shuffle(q.options.map((text, i) => ({ text, i })));
    clear(body); clear(foot);
    body.append(h('div', { class: 'small', style: { color: topic?.color, fontWeight: 800 } }, topic?.short || ''));
    if (q.image) body.append(h('div', { class: 'figure' }, h('img', { src: q.image, alt: '', style: { maxWidth: '100%', borderRadius: '12px' } })));
    else if (q.figure) body.append(h('div', { class: 'figure', html: figure(q.figure, q.figureOpts) }));
    body.append(h('div', { class: 'question' }, q.q));

    const opts = h('div', { class: 'options' });
    const buttons = order.map((o, k) => {
      const b = h('button', { class: 'opt', type: 'button', onclick: () => choose(o.i, b) }, h('span', { class: 'letter' }, LETTERS[k]), h('span', {}, o.text));
      b.dataset.index = o.i;
      return b;
    });
    opts.append(...buttons);
    body.append(opts);

    function choose(i, btn) {
      const ok = i === q.correct;
      buttons.forEach((b) => (b.disabled = true));
      store.recordAnswer(q.id, ok);
      s.answers.push({ q, ok, chosen: i });
      if (s.exam) {
        btn.classList.add('selected');
        setTimeout(() => { s.index++; show(); }, 220);
        return;
      }
      buttons.forEach((b) => {
        const idx = Number(b.dataset.index);
        if (idx === q.correct) b.classList.add('correct');
        else if (idx === i) b.classList.add('wrong');
      });
      const [t, sec] = (q.ref || '').split('#');
      body.append(h('div', { class: 'explain' },
        h('b', {}, ok ? 'Верно!' : 'Неверно'),
        q.explain,
        ' ',
        t ? h('a', { href: `#theory/${t}${sec ? `?s=${sec}` : ''}` }, 'Открыть в теории →') : null,
      ));
      foot.append(h('button', { class: 'btn primary', type: 'button', onclick: () => { s.index++; show(); } }, s.index + 1 < s.questions.length ? 'Дальше' : 'К результатам'));
      foot.querySelector('button').focus({ preventScroll: true });
    }

    if (!s.exam && s.mode === 'all') foot.append(h('button', { class: 'btn ghost sm', type: 'button', onclick: finish }, 'Завершить сейчас'));
  }

  function finish() {
    clear(el);
    el.append(renderResults(ctx, s));
  }

  show();
  return el;
}
