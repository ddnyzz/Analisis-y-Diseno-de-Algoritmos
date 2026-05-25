const headers = { 'Content-Type': 'application/json' };

async function request(url, options = {}) {
  const response = await fetch(url, options);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.ok === false) {
    throw new Error(payload.message || 'No fue posible completar la operación.');
  }

  return payload.data ?? payload;
}

export const api = {
  getGraph: () => request('/api/graph'),
  importGraph: (graph) => request('/api/graph/import', {
    method: 'POST',
    headers,
    body: JSON.stringify(graph)
  }),
  runAlgorithm: (payload) => request('/api/algorithms/run', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  }),
  getHistory: () => request('/api/history?limit=12'),
  clearHistory: () => request('/api/history', { method: 'DELETE' })
};
