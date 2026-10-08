// Экран выбора раздела. Прогресс каждого тренажёра лежит в своём ключе localStorage:
// билеты — 'prombez.v1' (как в исходном приложении), сосуды — 'prombez.vessels.v1'.
import { icon } from './figures.js';
import { h } from './render.js';
import { registerSw, setupTheme } from './shell.js';

setupTheme();
registerSw();

document.querySelector('#card-tickets .ico').innerHTML = icon('check-list');
document.querySelector('#card-vessels .ico').innerHTML = icon('gauge');

function read(key) {
  try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
}

function showProgress(id, done, total, label) {
  if (!total || !done) return;
  const el = document.getElementById(id);
  el.hidden = false;
  el.append(
    h('span', { class: 'bar' }, h('i', { style: { width: `${Math.round((done / total) * 100)}%` } })),
    h('span', {}, `${label} ${done} из ${total}`),
  );
}

// Билеты: вопрос освоен, если последний ответ верный (store.stat[id].last).
const tickets = read('prombez.v1');
if (tickets && tickets.stat) {
  const done = Object.values(tickets.stat).filter((s) => s && s.last).length;
  showProgress('prog-tickets', done, 90, 'освоено');
}

// Сосуды: доля вопросов с верным последним ответом.
const vessels = read('prombez.vessels.v1');
if (vessels && vessels.q) {
  const done = Object.values(vessels.q).filter((s) => s && s.seen && !s.lastWrong).length;
  fetch('data/questions.json').then((r) => r.json()).then((qs) => showProgress('prog-vessels', done, qs.length, 'освоено')).catch(() => {});
}
