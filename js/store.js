import { todayKey } from './render.js';

const KEY = 'prombez.v1';

const empty = () => ({
  q: {},        // id -> { seen, right, wrong, lastWrong }
  seq: {},      // id -> { seen, right, lastWrong }
  cards: {},    // id -> 'know' | 'repeat'
  days: [],     // 'YYYY-MM-DD' с активностью
  last: null,   // последний открытый маршрут
  theme: null,  // 'light' | 'dark' | null (системная)
  onboarded: false,
});

let state = load();
let onError = () => {};

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...empty(), ...JSON.parse(raw) } : empty();
  } catch { return empty(); }
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); }
  catch { onError(); }
}

export const store = {
  get state() { return state; },
  setErrorHandler(fn) { onError = fn; },

  touchDay() {
    const t = todayKey();
    if (!state.days.includes(t)) { state.days.push(t); state.days.sort(); save(); }
  },

  streak() {
    const days = new Set(state.days);
    let n = 0;
    const d = new Date();
    // Серия не рвётся, если сегодня ещё не занимались: считаем от вчера.
    if (!days.has(todayKey())) d.setDate(d.getDate() - 1);
    for (;;) {
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!days.has(k)) break;
      n++; d.setDate(d.getDate() - 1);
    }
    return n;
  },

  recordAnswer(id, ok) {
    const s = state.q[id] || { seen: 0, right: 0, wrong: 0, lastWrong: false };
    s.seen++; ok ? s.right++ : s.wrong++; s.lastWrong = !ok;
    state.q[id] = s; this.touchDay(); save();
  },

  recordSequence(id, ok) {
    const s = state.seq[id] || { seen: 0, right: 0, lastWrong: false };
    s.seen++; if (ok) s.right++; s.lastWrong = !ok;
    state.seq[id] = s; this.touchDay(); save();
  },

  q(id) { return state.q[id]; },
  seq(id) { return state.seq[id]; },

  mistakes() { return Object.keys(state.q).filter((id) => state.q[id].lastWrong); },
  mistakeSequences() { return Object.keys(state.seq).filter((id) => state.seq[id].lastWrong); },

  setCard(id, value) { state.cards[id] = value; this.touchDay(); save(); },
  card(id) { return state.cards[id]; },

  setLast(route) { state.last = route; save(); },
  setTheme(theme) { state.theme = theme; save(); },
  setOnboarded() { state.onboarded = true; save(); },

  /** Доля вопросов и последовательностей темы, на которые последний ответ верный. */
  topicProgress(topicId, questions, sequences) {
    const qs = questions.filter((q) => q.topic === topicId);
    const ss = (sequences || []).filter((s) => s.topic === topicId);
    const total = qs.length + ss.length;
    if (!total) return 0;
    let ok = 0;
    for (const q of qs) { const s = state.q[q.id]; if (s && s.seen && !s.lastWrong) ok++; }
    for (const s of ss) { const r = state.seq[s.id]; if (r && r.seen && !r.lastWrong) ok++; }
    return ok / total;
  },

  reset() { state = { ...empty(), theme: state.theme, onboarded: true }; save(); },
};
