// Схематичные SVG-иллюстрации в одном стиле. Цвета берутся из CSS-переменных темы.

export const PIPE_COLORS = {
  green: { hex: '#16A34A', name: 'зелёный' },
  red: { hex: '#DC2626', name: 'красный' },
  blue: { hex: '#2563EB', name: 'синий' },
  yellow: { hex: '#FACC15', name: 'жёлтый' },
  orange: { hex: '#F97316', name: 'оранжевый' },
  violet: { hex: '#7C3AED', name: 'фиолетовый' },
  brown: { hex: '#92400E', name: 'коричневый' },
  grey: { hex: '#6B7280', name: 'серый' },
};

const STYLE = `<style>
  .s{stroke:var(--fig-stroke);fill:none;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
  .f{fill:var(--fig-fill)} .m{fill:var(--fig-metal)} .mu{fill:var(--fig-muted)}
  .t{fill:var(--fig-stroke);font:700 12px var(--font)} .ts{fill:var(--fig-muted);font:600 11px var(--font)}
  .acc{stroke:var(--accent)} .accf{fill:var(--accent)} .red{stroke:#DC2626}
</style>`;

const svg = (w, h, body, cls = '') =>
  `<svg class="fig ${cls}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img">${STYLE}${body}</svg>`;

const pipe = (x1, x2, y, r = 12) =>
  `<rect class="m s" x="${x1}" y="${y - r}" width="${x2 - x1}" height="${r * 2}" rx="3"/>`;

const flange = (x, y, h = 40) => `<rect class="f s" x="${x - 5}" y="${y - h / 2}" width="10" height="${h}" rx="2"/>`;

const arrow = (x1, y1, x2, y2) =>
  `<path class="s acc" d="M${x1} ${y1} L${x2} ${y2}"/><path class="s acc" d="M${x2 - 10} ${y2 - 7} L${x2} ${y2} L${x2 - 10} ${y2 + 7}"/>`;

const F = {};

F['gate-valve'] = () => svg(320, 200, `
  ${pipe(20, 300, 130)}${flange(90, 130)}${flange(230, 130)}
  <path class="f s" d="M100 100 L160 125 L220 100 L220 160 L160 135 L100 160 Z"/>
  <rect class="f s" x="150" y="96" width="20" height="56" rx="3"/>
  <rect class="m s" x="156" y="40" width="8" height="60" rx="2"/>
  <ellipse class="f s" cx="160" cy="40" rx="42" ry="10"/>
  <ellipse class="s" cx="160" cy="40" rx="14" ry="4"/>
  ${arrow(30, 170, 80, 170)}
  <text class="ts" x="90" y="190">поток</text>
  <text class="t" x="160" y="24" text-anchor="middle">Задвижка</text>`);

F['globe-valve'] = () => svg(320, 200, `
  ${pipe(20, 300, 130)}${flange(90, 130)}${flange(230, 130)}
  <path class="f s" d="M100 112 L100 148 L150 148 L150 165 L215 165 L215 148 L220 148 L220 112 L170 112 L170 95 L105 95 L105 112 Z"/>
  <path class="s" d="M150 148 L170 148 L170 128 L150 128 Z"/>
  <rect class="m s" x="156" y="40" width="8" height="56" rx="2"/>
  <circle class="f s" cx="160" cy="40" r="22"/>
  <path class="s" d="M160 18 L160 62 M138 40 L182 40"/>
  <rect class="accf" x="146" y="124" width="28" height="6" rx="2"/>
  ${arrow(30, 170, 80, 170)}
  <text class="ts" x="90" y="190">поток</text>
  <text class="t" x="160" y="24" text-anchor="middle" dx="60">Вентиль</text>`);

F['check-valve'] = () => svg(320, 200, `
  ${pipe(20, 300, 120)}${flange(90, 120)}${flange(230, 120)}
  <path class="f s" d="M100 92 L220 92 L220 148 L100 148 Z"/>
  <path class="s" d="M100 92 L220 92 L220 148 L100 148 Z"/>
  <circle class="s" cx="128" cy="98" r="4"/>
  <path class="accf" d="M128 98 L176 134 L170 142 L124 104 Z"/>
  <path class="s" d="M128 98 L176 134"/>
  ${arrow(30, 170, 80, 170)}
  <text class="ts" x="90" y="188">поток только в одну сторону</text>
  <text class="t" x="160" y="76" text-anchor="middle">Обратный клапан</text>`);

F['ppk-spring'] = () => svg(320, 220, `
  ${flange(160, 200, 0)}
  <rect class="m s" x="140" y="180" width="40" height="30" rx="2"/>
  <rect class="f s" x="150" y="190" width="20" height="10"/>
  <path class="f s" d="M118 180 L202 180 L202 130 L240 130 L240 112 L202 112 L202 100 L118 100 Z"/>
  <rect class="m s" x="240" y="106" width="50" height="30" rx="2"/>
  <rect class="accf s" x="138" y="156" width="44" height="10" rx="2"/>
  <rect class="f s" x="134" y="40" width="52" height="60" rx="4"/>
  <path class="s" d="M160 44 L146 50 L174 56 L146 62 L174 68 L146 74 L174 80 L146 86 L174 92 L160 96"/>
  <rect class="m s" x="156" y="26" width="8" height="18"/>
  <rect class="f s" x="146" y="20" width="28" height="8" rx="2"/>
  <path class="s" d="M174 24 L222 12"/>
  <circle class="accf" cx="222" cy="12" r="5"/>
  <text class="ts" x="230" y="26">рычаг подрыва</text>
  <text class="ts" x="196" y="70">пружина</text>
  <text class="ts" x="246" y="156">сброс</text>
  <text class="t" x="20" y="22">Пружинный ППК</text>`);

F['ppk-lever'] = () => svg(320, 220, `
  <rect class="m s" x="110" y="180" width="40" height="30" rx="2"/>
  <path class="f s" d="M88 180 L172 180 L172 140 L210 140 L210 122 L172 122 L172 100 L88 100 Z"/>
  <rect class="m s" x="210" y="116" width="40" height="30" rx="2"/>
  <rect class="accf s" x="108" y="156" width="44" height="10" rx="2"/>
  <rect class="m s" x="126" y="60" width="8" height="42"/>
  <path class="s" d="M104 60 L280 46"/>
  <circle class="f s" cx="104" cy="60" r="6"/>
  <rect class="m s" x="236" y="26" width="34" height="34" rx="3"/>
  <text class="ts" x="236" y="80">груз</text>
  <text class="ts" x="150" y="50">рычаг</text>
  <text class="ts" x="216" y="166">сброс</text>
  <text class="t" x="20" y="22">Рычажно-грузовой ППК</text>`);

F['manometer'] = (o = {}) => {
  const red = o.redLineAt ?? 0.72; // доля шкалы
  const a0 = -225, a1 = 45; // градусы по кругу шкалы
  const ang = (f) => (a0 + (a1 - a0) * f) * Math.PI / 180;
  const cx = 160, cy = 100, R = 72;
  let ticks = '';
  for (let i = 0; i <= 10; i++) {
    const t = ang(i / 10), big = i % 5 === 0;
    const r1 = R - (big ? 14 : 8);
    ticks += `<path class="s" d="M${cx + Math.cos(t) * r1} ${cy + Math.sin(t) * r1} L${cx + Math.cos(t) * (R - 2)} ${cy + Math.sin(t) * (R - 2)}"/>`;
  }
  const rl = ang(red), nd = ang(o.needleAt ?? 0.4);
  return svg(320, 200, `
    <rect class="m s" x="150" y="170" width="20" height="24" rx="2"/>
    <circle class="m s" cx="${cx}" cy="${cy}" r="${R + 10}"/>
    <circle class="f s" cx="${cx}" cy="${cy}" r="${R}"/>
    ${ticks}
    <path class="s red" style="stroke-width:5" d="M${cx + Math.cos(rl) * (R - 18)} ${cy + Math.sin(rl) * (R - 18)} L${cx + Math.cos(rl) * (R - 2)} ${cy + Math.sin(rl) * (R - 2)}"/>
    <path class="s" style="stroke-width:4" d="M${cx} ${cy} L${cx + Math.cos(nd) * (R - 20)} ${cy + Math.sin(nd) * (R - 20)}"/>
    <circle class="accf" cx="${cx}" cy="${cy}" r="6"/>
    <text class="ts" x="${cx + Math.cos(ang(0)) * (R - 26) - 4}" y="${cy + Math.sin(ang(0)) * (R - 26) + 10}">0</text>
    <text class="ts" x="${cx}" y="${cy + 34}" text-anchor="middle">МПа</text>
    <text class="ts" x="236" y="54">красная черта —</text>
    <text class="ts" x="236" y="68">разрешённое</text>
    <text class="ts" x="236" y="82">давление</text>
    <text class="t" x="20" y="22">Манометр</text>`);
};

F['three-way-cock'] = () => svg(320, 220, `
  <rect class="f s" x="20" y="90" width="110" height="110" rx="26"/>
  <text class="ts" x="75" y="150" text-anchor="middle">сосуд</text>
  <rect class="m s" x="130" y="138" width="60" height="14" rx="2"/>
  <circle class="f s" cx="208" cy="145" r="18"/>
  <path class="s" d="M208 127 L208 100 M190 145 L226 145 M208 163 L208 176"/>
  <rect class="m s" x="226" y="138" width="24" height="14" rx="2"/>
  <rect class="m s" x="201" y="90" width="14" height="36" rx="2"/>
  <circle class="m s" cx="208" cy="58" r="34"/>
  <circle class="f s" cx="208" cy="58" r="26"/>
  <path class="s" style="stroke-width:4" d="M208 58 L192 42"/>
  <path class="s red" style="stroke-width:4" d="M224 36 L228 42"/>
  <circle class="accf" cx="208" cy="58" r="4"/>
  <text class="ts" x="258" y="150">трёхходовой</text>
  <text class="ts" x="258" y="164">кран</text>
  <text class="ts" x="252" y="62">манометр</text>
  <text class="t" x="20" y="22">Манометр — трёхходовой кран — сосуд</text>`);

F['plug-with-tail'] = () => svg(320, 200, `
  <ellipse class="m s" cx="80" cy="110" rx="46" ry="60"/>
  <ellipse class="f s" cx="80" cy="110" rx="34" ry="46"/>
  <circle class="mu" cx="80" cy="64" r="4"/><circle class="mu" cx="80" cy="156" r="4"/>
  <circle class="mu" cx="52" cy="80" r="4"/><circle class="mu" cx="108" cy="80" r="4"/>
  <circle class="mu" cx="52" cy="140" r="4"/><circle class="mu" cx="108" cy="140" r="4"/>
  <path class="f s" d="M118 94 L290 88 L296 132 L118 126 Z"/>
  <text class="t" x="140" y="106" style="font-size:11px">№ подразделения</text>
  <text class="t" x="140" y="121" style="font-size:11px">порядковый №  ·  Ду  ·  Ру</text>
  <text class="ts" x="118" y="160">хвостовик с выбитыми данными</text>
  <text class="t" x="20" y="22">Заглушка с хвостовиком</text>`);

F['vessel-tag'] = () => svg(320, 240, `
  <rect class="f s" x="30" y="40" width="260" height="180" rx="8"/>
  <circle class="mu" cx="44" cy="54" r="4"/><circle class="mu" cx="276" cy="54" r="4"/>
  <circle class="mu" cx="44" cy="206" r="4"/><circle class="mu" cx="276" cy="206" r="4"/>
  <text class="t" x="160" y="66" text-anchor="middle" style="font-size:13px">СОСУД</text>
  ${['1. Позиция по схеме', '2. Учётный номер', '3. Заводской номер', '4. Разрешённые P и t°', '5. Дата след. НО / ВО / ГИ', '6. Срок службы до …']
    .map((s, i) => `<text class="t" x="50" y="${90 + i * 21}" style="font-weight:600">${s}</text>`).join('')}
  <path class="s acc" d="M30 232 L290 232"/><text class="ts" x="160" y="238" text-anchor="middle" dy="-8">≥ 200 мм</text>
  <path class="s acc" d="M300 40 L300 220"/><text class="ts" x="306" y="134" transform="rotate(90 306 134)" text-anchor="middle">≥ 150 мм</text>
  <text class="t" x="20" y="24">Табличка на сосуде</text>`);

F['ppk-tag'] = () => svg(320, 250, `
  <rect class="f s" x="30" y="40" width="260" height="196" rx="8"/>
  <circle class="mu" cx="44" cy="54" r="4"/><circle class="mu" cx="276" cy="54" r="4"/>
  <circle class="mu" cx="44" cy="222" r="4"/><circle class="mu" cx="276" cy="222" r="4"/>
  <text class="t" x="160" y="66" text-anchor="middle" style="font-size:13px">ППК</text>
  ${['1. Место установки', '2. Номер позиции', '3. Тип клапана', '4. Рабочее давление', '5. Давление настройки', '6. Дата предыдущей регулировки', '7. Дата следующей регулировки']
    .map((s, i) => `<text class="t" x="50" y="${90 + i * 20}" style="font-weight:600">${s}</text>`).join('')}
  <text class="t" x="20" y="24">Табличка на ППК</text>`);

F['valve-marking'] = () => svg(320, 220, `
  ${pipe(30, 290, 140)}${flange(96, 140)}${flange(224, 140)}
  <path class="f s" d="M106 110 L160 134 L214 110 L214 170 L160 146 L106 170 Z"/>
  <rect class="m s" x="156" y="70" width="8" height="42"/>
  <ellipse class="f s" cx="160" cy="70" rx="34" ry="8"/>
  <text class="t" x="118" y="128" style="font-size:10px">ТМ</text>
  <text class="t" x="188" y="128" style="font-size:10px">Ду·Ру</text>
  <text class="t" x="138" y="166" style="font-size:10px">сталь 20</text>
  ${arrow(120, 196, 200, 196)}
  <text class="ts" x="20" y="48">1 товарный знак · 2 Ду · 3 Ру</text>
  <text class="ts" x="20" y="62">4 направление потока · 5 марка материала</text>
  <text class="t" x="20" y="24">Маркировка арматуры</text>`);

F['pipe'] = (o = {}) => {
  const c = PIPE_COLORS[o.color] || PIPE_COLORS.grey;
  const label = o.label ? `<text class="t" x="160" y="24" text-anchor="middle">${o.label}</text>` : '';
  return svg(320, 110, `${label}
    <rect class="m s" x="10" y="48" width="300" height="34" rx="4"/>
    <rect x="70" y="48" width="180" height="34" fill="${c.hex}"/>
    <rect class="s" x="10" y="48" width="300" height="34" rx="4"/>
    <text class="ts" x="160" y="102" text-anchor="middle">${c.name}</text>`);
};

F['pipe-small'] = (o = {}) => {
  const c = PIPE_COLORS[o.color] || PIPE_COLORS.grey;
  return svg(110, 34, `<rect class="m s" x="2" y="4" width="106" height="26" rx="4"/><rect x="24" y="4" width="62" height="26" fill="${c.hex}"/><rect class="s" x="2" y="4" width="106" height="26" rx="4"/>`);
};

const ringsOn = (y, n, label) => {
  const xs = n === 1 ? [160] : n === 2 ? [140, 180] : [120, 160, 200];
  return `<rect class="m s" x="10" y="${y - 16}" width="300" height="32" rx="4"/>
    ${xs.map((x) => `<rect x="${x - 7}" y="${y - 16}" width="14" height="32" fill="#DC2626"/><rect class="s" x="${x - 7}" y="${y - 16}" width="14" height="32"/>`).join('')}
    <rect class="s" x="10" y="${y - 16}" width="300" height="32" rx="4"/>
    ${label ? `<text class="ts" x="160" y="${y + 36}" text-anchor="middle">${label}</text>` : ''}`;
};

F['rings'] = (o = {}) => svg(320, 90, ringsOn(40, o.count || 1, o.label || ''));

F['rings-all'] = () => svg(320, 250, `
  ${ringsOn(36, 1, 'одно кольцо — низкое давление')}
  ${ringsOn(116, 2, 'два кольца — среднее давление')}
  ${ringsOn(196, 3, 'три кольца — высокое давление')}`);

F['gauge-height'] = () => {
  const gauge = (cx, cy, r, text) => `<circle class="m s" cx="${cx}" cy="${cy}" r="${r + 3}"/><circle class="f s" cx="${cx}" cy="${cy}" r="${r}"/><path class="s" d="M${cx} ${cy} L${cx - r * 0.5} ${cy - r * 0.5}"/><text class="t" x="${cx}" y="${cy + r + 16}" text-anchor="middle" style="font-size:11px">${text}</text>`;
  const level = (y, label) => `<path class="s mu" style="stroke:var(--fig-muted);stroke-dasharray:4 4" d="M50 ${y} L300 ${y}"/><text class="ts" x="48" y="${y - 4}" text-anchor="end">${label}</text>`;
  return svg(320, 300, `
    <path class="s" d="M50 280 L50 30"/>
    ${level(280, '0')}${level(215, '2 м')}${level(150, '3 м')}${level(85, '5 м')}
    ${gauge(90, 250, 10, '≥ 100 мм')}
    ${gauge(160, 183, 15, '≥ 160 мм')}
    ${gauge(240, 116, 22, '≥ 250 мм')}
    <rect class="f s" x="120" y="40" width="150" height="34" rx="6"/>
    <text class="t" x="195" y="61" text-anchor="middle" style="font-size:11px">выше 5 м — дублирующий</text>
    <text class="ts" x="195" y="30" text-anchor="middle">сниженный манометр внизу</text>`);
};

F['signal-colors'] = () => svg(320, 120, `
  <rect x="14" y="24" width="88" height="56" rx="10" fill="#DC2626"/>
  <rect x="116" y="24" width="88" height="56" rx="10" fill="#FACC15"/>
  <rect x="218" y="24" width="88" height="56" rx="10" fill="#16A34A"/>
  <text class="ts" x="58" y="100" text-anchor="middle">огне-/взрывоопасно</text>
  <text class="ts" x="160" y="100" text-anchor="middle">опасность, яд</text>
  <text class="ts" x="262" y="100" text-anchor="middle">безопасно</text>`);

export function figure(id, opts) {
  const fn = F[id];
  return fn ? fn(opts || {}) : '';
}

export function hasFigure(id) { return Boolean(F[id]); }

// ---------- Иконки (24×24, линия) ----------
const I = {
  book: '<path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z"/><path d="M4 19a2 2 0 0 1 2-2h12"/><path d="M8 7h7"/>',
  cards: '<rect x="3" y="6" width="13" height="15" rx="2"/><path d="M8 3h11a2 2 0 0 1 2 2v12"/>',
  quiz: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.5"/><circle cx="12" cy="17" r=".6"/>',
  mistakes: '<path d="M12 3 2.5 20h19z"/><path d="M12 9v5"/><circle cx="12" cy="17" r=".6"/>',
  progress: '<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/>',
  badge: '<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="9" r="2.5"/><path d="M7.5 17a4.5 4.5 0 0 1 9 0"/>',
  'check-list': '<path d="M4 6l2 2 3-3"/><path d="M4 12l2 2 3-3"/><path d="M4 18l2 2 3-3"/><path d="M12 6h8M12 12h8M12 18h8"/>',
  scale: '<path d="M12 3v18"/><path d="M5 7h14"/><path d="M5 7 2 14h6zM19 7l-3 7h6z"/><path d="M8 21h8"/>',
  'person-star': '<circle cx="10" cy="8" r="3.5"/><path d="M3 20a7 7 0 0 1 12-4"/><path d="m18 13 1.2 2.4 2.6.4-1.9 1.8.5 2.6-2.4-1.3-2.4 1.3.5-2.6-1.9-1.8 2.6-.4z"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
  tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  gauge: '<path d="M4 15a8 8 0 1 1 16 0"/><path d="M12 15 8.5 9.5"/><circle cx="12" cy="15" r="1.5"/><path d="M4 19h16"/>',
  registry: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
  magnifier: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m20 20-4.8-4.8"/>',
  play: '<path d="M7 4v16l13-8z"/>',
  stop: '<rect x="5" y="5" width="14" height="14" rx="2"/>',
  valve: '<path d="M4 9 12 13 4 17zM20 9l-8 4 8 4z"/><path d="M12 13V6"/><path d="M8 6h8"/>',
  alert: '<circle cx="12" cy="12" r="9"/><path d="M12 7v6"/><circle cx="12" cy="16.5" r=".6"/>',
  palette: '<path d="M12 3a9 9 0 1 0 0 18h1.5a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h5a4 4 0 0 0 4-4 6 6 0 0 0-9-6z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7" r="1"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
  back: '<path d="m15 5-7 7 7 7"/>',
  fire: '<path d="M12 3c1 3 4 4 4 8a4 4 0 0 1-8 0c0-1.5.5-2.5 1-3 .3 1 1 1.5 1.5 1.5C10 7 11 5 12 3z"/>',
  order: '<path d="M4 7h10M4 12h16M4 17h7"/><path d="m18 5 3 3-3 3"/>',
};

export function icon(name) {
  const body = I[name] || I.book;
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}
