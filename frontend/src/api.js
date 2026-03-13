const API_BASE = '/api';

export async function submitThreat(data) {
  const res = await fetch(`${API_BASE}/threats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Submission failed');
  }
  return res.json();
}

export async function getThreats({ category, status, sort_by, search, limit = 50, offset = 0 } = {}) {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (status) params.set('status', status);
  if (sort_by) params.set('sort_by', sort_by);
  if (search) params.set('search', search);
  params.set('limit', limit);
  params.set('offset', offset);
  const res = await fetch(`${API_BASE}/threats?${params}`);
  if (!res.ok) throw new Error('Failed to fetch threats');
  return res.json();
}

export async function getThreat(threatId) {
  const res = await fetch(`${API_BASE}/threats/${threatId}`);
  if (!res.ok) throw new Error('Threat not found');
  return res.json();
}

export async function getThreatQR(threatId) {
  const res = await fetch(`${API_BASE}/threats/${threatId}/qr`);
  if (!res.ok) throw new Error('Failed to generate QR');
  return res.json();
}

export async function confirmThreat(threatId, reporterId = 'anonymous') {
  const res = await fetch(`${API_BASE}/threats/${threatId}/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reporter_id: reporterId }),
  });
  if (!res.ok) throw new Error('Failed to confirm');
  return res.json();
}

export async function markSafe(threatId, reporterId = 'anonymous') {
  const res = await fetch(`${API_BASE}/threats/${threatId}/mark-safe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reporter_id: reporterId }),
  });
  if (!res.ok) throw new Error('Failed to mark safe');
  return res.json();
}

export async function searchThreats(query) {
  const res = await fetch(`${API_BASE}/threats/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

export async function getStats() {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}
