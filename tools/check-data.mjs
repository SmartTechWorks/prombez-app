// Проверка данных: node tools/check-data.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const load = (n) => JSON.parse(readFileSync(join(root, 'data', `${n}.json`), 'utf8'));

const topics = load('topics');
const theory = load('theory');
const cards = load('cards');
const questions = load('questions');
const sequences = load('sequences');

const figuresSrc = readFileSync(join(root, 'js', 'figures.js'), 'utf8');
const figureIds = new Set([...figuresSrc.matchAll(/F\['([a-z0-9-]+)'\]/g)].map((m) => m[1]));

const topicIds = new Set(topics.map((t) => t.id));
const sectionIds = new Set();
for (const [tid, t] of Object.entries(theory)) {
  if (!topicIds.has(tid)) fail(`theory: неизвестная тема ${tid}`);
  for (const s of t.sections) {
    sectionIds.add(`${tid}#${s.id}`);
    for (const f of [].concat(s.figure || [])) if (!figureIds.has(f)) fail(`theory ${tid}#${s.id}: нет фигуры ${f}`);
  }
}
for (const t of topics) if (!theory[t.id]) fail(`нет теории для темы ${t.id}`);

let errors = 0;
function fail(msg) { errors++; console.error('✗', msg); }

const seen = new Set();
for (const q of questions) {
  if (seen.has(q.id)) fail(`дубль id ${q.id}`); seen.add(q.id);
  if (!topicIds.has(q.topic)) fail(`${q.id}: неизвестная тема ${q.topic}`);
  if (!Array.isArray(q.options) || q.options.length !== 4) fail(`${q.id}: должно быть 4 варианта`);
  else if (new Set(q.options.map((o) => o.trim().toLowerCase())).size !== 4) fail(`${q.id}: варианты повторяются`);
  if (!(Number.isInteger(q.correct) && q.correct >= 0 && q.correct < 4)) fail(`${q.id}: correct вне диапазона`);
  if (!q.explain) fail(`${q.id}: нет пояснения`);
  if (!q.ref || !sectionIds.has(q.ref)) fail(`${q.id}: ref "${q.ref}" не найден в теории`);
  if (q.figure && !figureIds.has(q.figure)) fail(`${q.id}: нет фигуры ${q.figure}`);
  if (!q.q) fail(`${q.id}: пустой вопрос`);
}
for (const c of cards) {
  if (seen.has(c.id)) fail(`дубль id ${c.id}`); seen.add(c.id);
  if (!topicIds.has(c.topic)) fail(`card ${c.id}: неизвестная тема`);
  if (!c.q || !c.a) fail(`card ${c.id}: пустая сторона`);
}
for (const s of sequences) {
  if (!topicIds.has(s.topic)) fail(`seq ${s.id}: неизвестная тема`);
  if (!s.ref || !sectionIds.has(s.ref)) fail(`seq ${s.id}: ref не найден`);
  if (!Array.isArray(s.steps) || s.steps.length < 2) fail(`seq ${s.id}: мало шагов`);
}

console.log('Тема'.padEnd(22), 'вопр.', 'карт.', 'посл.');
for (const t of topics) {
  const nq = questions.filter((q) => q.topic === t.id).length;
  const nc = cards.filter((c) => c.topic === t.id).length;
  const ns = sequences.filter((s) => s.topic === t.id).length;
  if (nq < 10) fail(`${t.id}: только ${nq} вопросов (нужно ≥ 10)`);
  console.log(t.id.padEnd(22), String(nq).padStart(5), String(nc).padStart(5), String(ns).padStart(5));
}
console.log(`Итого: ${questions.length} вопросов, ${cards.length} карточек, ${sequences.length} последовательностей`);
console.log(errors ? `Ошибок: ${errors}` : 'Данные в порядке.');
process.exit(errors ? 1 : 0);
