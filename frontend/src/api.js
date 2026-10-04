import { API_URL, USER_ID } from './config';

async function request(path, options = {}) {
  const { timeout = 60000, ...init } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(`${API_URL}${path}`, { ...init, signal: controller.signal });
    if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
    return await res.json();
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('Request timed out');
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

export const health = () => request('/health', { timeout: 5000 });

// ASSUMED endpoints: adjust here only if your routers differ.
export function lipread(videoUri) {
  const form = new FormData();
  form.append('video', { uri: videoUri, name: 'clip.mp4', type: 'video/mp4' });
  form.append('user_id', String(USER_ID));
  return request('/lipread', { method: 'POST', body: form });
}

export const sendEmergency = (message) =>
  request('/emergency', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: USER_ID, message }),
    timeout: 15000,
  });

export const getHistory = () => request(`/history/${USER_ID}`, { timeout: 15000 });
