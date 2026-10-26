const request = async (path, options = {}) => {
  const token = localStorage.getItem('taskToken');
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) },
    ...options,
  });

  const data = await response.json().catch(() => ({}));
  if (response.status === 401) {
    localStorage.removeItem('taskToken');
    window.dispatchEvent(new Event('auth-expired'));
  }
  if (!response.ok) {
    throw new Error(data.error || 'The request could not be completed.');
  }
  return data;
};

export const getTasks = () => request('/tasks');
export const createTask = (task) => request('/tasks', { method: 'POST', body: JSON.stringify(task) });
export const updateTask = (id, task) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(task) });
export const deleteTask = (id) => request(`/tasks/${id}`, { method: 'DELETE' });
export const register = (credentials) => request('/auth/register', { method: 'POST', body: JSON.stringify(credentials) });
export const login = (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
export const getCurrentUser = () => request('/auth/me');
export const getCacheStats = () => request('/cache/stats');
export const clearCache = () => request('/cache/clear', { method: 'POST' });