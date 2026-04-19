const BASE = '/api';

const getToken = () => localStorage.getItem('ls_token');

const headers = (extra = {}) => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
  ...extra,
});

const req = async (method, path, body) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: headers(),
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Request failed');
  return data;
};

export const api = {
  login:          (email, password)     => req('POST', '/auth/login', { email, password }),
  register:       (email, password)     => req('POST', '/auth/register', { email, password }),
  getApps:        ()                    => req('GET',  '/apps'),
  createApp:      (name)                => req('POST', '/apps', { name }),
  getLogs:        (appId, level, limit) => req('GET',  `/logs?app_id=${appId}${level ? `&level=${level}` : ''}&limit=${limit || 50}`),
  getSummary:     (appId, hours)        => req('GET',  `/analysis/summary?app_id=${appId}&hours=${hours || 24}`),
  getTrends:      (appId, hours)        => req('GET',  `/analysis/trends?app_id=${appId}&hours=${hours || 24}`),
  getServices:    (appId, hours)        => req('GET',  `/analysis/services?app_id=${appId}&hours=${hours || 24}`),
  getAlerts:      (appId)               => req('GET',  `/alerts?app_id=${appId}`),
  createAlert:    (body)                => req('POST', '/alerts', body),
  deleteAlert:    (id, appId)           => req('DELETE', `/alerts/${id}?app_id=${appId}`),
  getInsights:    (appId, hours)        => req('GET', `/ai/insights?app_id=${appId}&hours=${hours || 24}`),
};