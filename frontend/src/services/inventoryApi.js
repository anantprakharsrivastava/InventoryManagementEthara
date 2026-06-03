const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    let msg = 'Request failed';
    if (typeof data.detail === 'string') msg = data.detail;
    else if (Array.isArray(data.detail)) msg = data.detail.map((d) => d.msg).join(', ');
    else if (data.message) msg = data.message;
    throw new Error(msg);
  }
  return data;
}

export const api = {
  health: () => request('/health'),
  dashboard: () => request('/dashboard'),
  products: {
    list: () => request('/products'),
    get: (id) => request(`/products/${id}`),
    create: (body) => request('/products', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    remove: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  },
  customers: {
    list: () => request('/customers'),
    get: (id) => request(`/customers/${id}`),
    create: (body) => request('/customers', { method: 'POST', body: JSON.stringify(body) }),
    remove: (id) => request(`/customers/${id}`, { method: 'DELETE' }),
  },
  orders: {
    list: () => request('/orders'),
    get: (id) => request(`/orders/${id}`),
    create: (body) => request('/orders', { method: 'POST', body: JSON.stringify(body) }),
    remove: (id) => request(`/orders/${id}`, { method: 'DELETE' }),
  },
};
