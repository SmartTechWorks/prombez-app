// Общее для хаба и тренажёра сосудов: тема и service worker.
import { icon } from './figures.js';

const THEME_KEY = 'prombez.theme';

function systemTheme() { return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }

export function currentTheme() {
  try { return localStorage.getItem(THEME_KEY) || systemTheme(); } catch { return systemTheme(); }
}

export function applyTheme() {
  const t = currentTheme();
  document.documentElement.dataset.theme = t;
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.innerHTML = icon(t === 'dark' ? 'sun' : 'moon');
}

export function setupTheme() {
  applyTheme();
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    try { localStorage.setItem(THEME_KEY, currentTheme() === 'dark' ? 'light' : 'dark'); } catch {}
    applyTheme();
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
}

export function registerSw(onUpdate) {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('sw.js').then((reg) => {
    reg.addEventListener('updatefound', () => {
      const w = reg.installing;
      if (!w) return;
      w.addEventListener('statechange', () => {
        if (w.state === 'installed' && navigator.serviceWorker.controller) {
          if (onUpdate) onUpdate(() => w.postMessage('skipWaiting'));
          else w.postMessage('skipWaiting');
        }
      });
    });
  }).catch(() => {});
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return; reloading = true; location.reload();
  });
}
