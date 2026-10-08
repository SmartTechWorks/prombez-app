// Hash-роутер: #name/param1/param2?x=y

export function parseHash(hash = location.hash) {
  const raw = (hash || '#home').replace(/^#\/?/, '');
  const [pathPart, queryPart] = raw.split('?');
  const parts = pathPart.split('/').filter(Boolean).map(decodeURIComponent);
  const query = Object.fromEntries(new URLSearchParams(queryPart || ''));
  return { name: parts[0] || 'home', params: parts.slice(1), query, hash: '#' + raw };
}

export function navigate(hash) {
  if (location.hash === hash) window.dispatchEvent(new HashChangeEvent('hashchange'));
  else location.hash = hash;
}

export function onRoute(handler) {
  const run = () => handler(parseHash());
  window.addEventListener('hashchange', run);
  run();
}
