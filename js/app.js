import { h, clear } from './render.js';
import { store } from './store.js';
import { onRoute, navigate } from './router.js';
import { icon } from './figures.js';
import * as home from './home.js';
import * as theory from './theory.js';
import * as cards from './cards.js';
import * as quiz from './quiz.js';
import * as sequence from './sequence.js';
import * as mistakes from './mistakes.js';
import * as progress from './progress.js';

const screens = { home, theory, cards, quiz, order: sequence, mistakes, progress };
const tabOf = { theory: 'theory', cards: 'cards', quiz: 'quiz', order: 'quiz', mistakes: 'mistakes', progress: 'progress' };

const root = document.getElementById('screen');
const toastEl = document.getElementById('toast');
let toastTimer = null;

function toast(text, action) {
  clearTimeout(toastTimer);
  clear(toastEl);
  toastEl.append(h('span', {}, text));
  if (action) toastEl.append(h('button', { type: 'button', onclick: () => { action.onClick(); toastEl.hidden = true; } }, action.label));
  toastEl.hidden = false;
  if (!action) toastTimer = setTimeout(() => { toastEl.hidden = true; }, 2600);
}

// ---------- Тема ----------
function systemTheme() { return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
function applyTheme() {
  const t = store.state.theme || systemTheme();
  document.documentElement.dataset.theme = t;
  document.getElementById('theme-toggle').innerHTML = icon(t === 'dark' ? 'sun' : 'moon');
}
document.getElementById('theme-toggle').addEventListener('click', () => {
  const current = store.state.theme || systemTheme();
  store.setTheme(current === 'dark' ? 'light' : 'dark');
  applyTheme();
});
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
applyTheme();

// ---------- Данные ----------
async function loadJson(name) {
  const res = await fetch(`data/${name}.json`, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`${name}.json: HTTP ${res.status}`);
  return res.json();
}

async function loadData() {
  const [topics, theoryData, cardsData, questions, sequences] = await Promise.all(
    ['topics', 'theory', 'cards', 'questions', 'sequences'].map(loadJson)
  );
  return { topics, theory: theoryData, cards: cardsData, questions, sequences };
}

// ---------- Нижнее меню ----------
for (const icoEl of document.querySelectorAll('.tab-icon')) icoEl.innerHTML = icon(icoEl.dataset.icon);

function updateTabs(routeName) {
  const tab = tabOf[routeName];
  for (const a of document.querySelectorAll('.tabbar a')) a.classList.toggle('active', a.dataset.tab === tab);
  const badge = document.getElementById('mistakes-badge');
  const n = store.mistakes().length + store.mistakeSequences().length;
  badge.hidden = n === 0;
  badge.textContent = n > 99 ? '99+' : String(n);
}

// ---------- Онбординг ----------
function showOnboarding() {
  const overlay = h('div', { class: 'overlay' });
  const close = () => { overlay.remove(); store.setOnboarded(); };
  overlay.append(h('div', { class: 'sheet' },
    h('h2', {}, 'Как заниматься'),
    h('div', { class: 'step' }, h('i', {}, '1'), h('div', {}, h('b', {}, 'Карточки.'), ' Тап переворачивает карточку, свайп или кнопки — следующая. Нажали «Повторить» — карточка будет попадаться чаще.')),
    h('div', { class: 'step' }, h('i', {}, '2'), h('div', {}, h('b', {}, 'Тесты.'), ' После ответа сразу видно правильный вариант и пояснение со ссылкой на теорию. В экзамене подсказок нет — результат в конце.')),
    h('div', { class: 'step' }, h('i', {}, '3'), h('div', {}, h('b', {}, 'Ошибки.'), ' Всё, что ответили неверно, копится в разделе «Ошибки», пока не ответите правильно.')),
    h('button', { class: 'btn primary', type: 'button', onclick: close }, 'Понятно, поехали'),
  ));
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.body.append(overlay);
}

// ---------- Service worker ----------
function registerSw() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('sw.js').then((reg) => {
    reg.addEventListener('updatefound', () => {
      const w = reg.installing;
      if (!w) return;
      w.addEventListener('statechange', () => {
        if (w.state === 'installed' && navigator.serviceWorker.controller) {
          toast('Доступно обновление', { label: 'Обновить', onClick: () => w.postMessage('skipWaiting') });
        }
      });
    });
  }).catch(() => {});
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return; reloading = true; location.reload();
  });
}

// ---------- Старт ----------
async function main() {
  let data;
  try { data = await loadData(); }
  catch (e) {
    root.append(h('div', { class: 'empty' }, h('div', { class: 'big' }, '⚠️'), h('p', {}, 'Не удалось загрузить данные.'), h('p', { class: 'small' }, String(e.message))));
    return;
  }

  const ctx = {
    data,
    store,
    navigate,
    toast,
    topicById: (id) => data.topics.find((t) => t.id === id),
    questionsOf: (id) => data.questions.filter((q) => q.topic === id),
    route: null,
  };
  store.setErrorHandler(() => toast('Не удалось сохранить прогресс: нет места в хранилище'));

  onRoute((route) => {
    ctx.route = route;
    const mod = screens[route.name] || home;
    clear(root);
    try { root.append(mod.render(ctx)); }
    catch (e) { console.error(e); root.append(h('div', { class: 'empty' }, h('p', {}, 'Что-то пошло не так на этом экране.'), h('p', { class: 'small' }, String(e.message)))); }
    updateTabs(route.name);
    if (['theory', 'cards', 'quiz', 'order'].includes(route.name)) store.setLast(route.hash);
    window.scrollTo({ top: 0 });
    root.focus({ preventScroll: true });
  });

  if (!store.state.onboarded) showOnboarding();
  registerSw();
}

main();
