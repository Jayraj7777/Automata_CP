/**
 * REST API client for interacting with the Flask backend.
 * Provides resilient network handling, timeout, and consistent error payloads.
 */

const API_BASE = 'http://localhost:5000/api';

async function fetchJSON(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  checkHealth: () => fetchJSON('/health'),
  getKeywords: () => fetchJSON('/keywords'),
  getFormalDFA: () => fetchJSON('/dfa/formal'),
  getPrefixes: () => fetchJSON('/dfa/prefixes'),
  getFullGraph: () => fetchJSON('/dfa/graph'),
  getSamples: () => fetchJSON('/samples'),

  detectToken: (token) =>
    fetchJSON('/detect', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),

  simulateToken: (token) =>
    fetchJSON('/simulate', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),

  analyzeCode: (code) =>
    fetchJSON('/analyze', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),
};
