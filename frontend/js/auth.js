const API = (function() {
  const host = window.location.host;
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    return 'http://' + host + '/api';
  }
  return '/api';
})();
function getRootPath(path) {
  const isAdmin = window.location.pathname.includes('/admin/');
  if (isAdmin) {
    return '../' + path.replace(/^\//, '');
  }
  return path.replace(/^\//, '');
}
const Session = {
  getToken: () => sessionStorage.getItem('token'),
  getUser:  () => JSON.parse(sessionStorage.getItem('user') || 'null'),
  setAuth:  (token, user) => { sessionStorage.setItem('token', token); sessionStorage.setItem('user', JSON.stringify(user)); },
  clear:    () => { sessionStorage.clear(); },
  getTable: () => sessionStorage.getItem('tableNumber'),
  getOrderType: () => sessionStorage.getItem('orderType'),
  getSessionId: () => {
    let sid = sessionStorage.getItem('sessionId');
    if (!sid) { sid = 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8); sessionStorage.setItem('sessionId', sid); }
    return sid;
  },
  getCart: () => JSON.parse(sessionStorage.getItem('cart') || '[]'),
  setCart: (cart) => sessionStorage.setItem('cart', JSON.stringify(cart)),
  getOrderId: () => sessionStorage.getItem('currentOrderId'),
  setOrderId: (id) => sessionStorage.setItem('currentOrderId', id)
};
async function apiFetch(path, options = {}) {
  const token = Session.getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  try {
    const res = await fetch(API + path, { ...options, headers });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) {
      Session.clear();
      window.location.href = getRootPath('login.html');
      throw new Error(data.msg || 'Unauthorized');
    }
    if (!res.ok) throw new Error(data.msg || `HTTP ${res.status}`);
    return data;
  } catch (err) {
    if (err.message === 'Failed to fetch') {
      throw new Error('Unable to connect to server. Please check your connection.');
    }
    throw err;
  }
}
function requireRole(...roles) {
  const user = Session.getUser();
  if (roles.includes('customer') && !user) {
    const guestUser = { name: 'Guest Customer', role: 'customer', isGuest: true };
    sessionStorage.setItem('user', JSON.stringify(guestUser));
    return true;
  }
  if (!user) { window.location.href = getRootPath('login.html'); return false; }
  if (!roles.includes(user.role)) { window.location.href = getRootPath('login.html'); return false; }
  return true;
}
function requireAuth() {
  if (!Session.getToken()) { window.location.href = getRootPath('login.html'); return false; }
  return true;
}
const Cart = {
  get: () => Session.getCart(),
  add: (item) => {
    const cart = Session.getCart();
    const itemKey = `${item._id}-${item.name}`;
    const existing = cart.find(c => `${c._id}-${c.name}` === itemKey);
    if (existing) existing.quantity++;
    else cart.push({ ...item, quantity: 1 });
    Session.setCart(cart);
    Cart.updateBadge();
    return cart;
  },
  remove: (id, name) => {
    let cart = Session.getCart();
    if (name) {
      const itemKey = `${id}-${name}`;
      cart = cart.filter(c => `${c._id}-${c.name}` !== itemKey);
    } else {
      cart = cart.filter(c => c._id !== id);
    }
    Session.setCart(cart);
    Cart.updateBadge();
    return cart;
  },
  updateQty: (id, qty, name) => {
    const cart = Session.getCart();
    let item;
    if (name) {
      const itemKey = `${id}-${name}`;
      item = cart.find(c => `${c._id}-${c.name}` === itemKey);
    } else {
      item = cart.find(c => c._id === id);
    }
    if (item) {
      if (qty <= 0) {
        return Cart.remove(id, name);
      }
      item.quantity = qty;
    }
    Session.setCart(cart);
    Cart.updateBadge();
    return cart;
  },
  clear: () => { Session.setCart([]); Cart.updateBadge(); },
  total: () => Session.getCart().reduce((s, i) => s + i.price * i.quantity, 0),
  count: () => Session.getCart().reduce((s, i) => s + i.quantity, 0),
  has: (id, name) => {
    const cart = Session.getCart();
    if (name) {
      const itemKey = `${id}-${name}`;
      return !!cart.find(c => `${c._id}-${c.name}` === itemKey);
    }
    return !!cart.find(c => c._id === id);
  },
  updateBadge: () => {
    const badge = document.getElementById('cart-badge');
    if (badge) { const n = Cart.count(); badge.textContent = n; badge.style.display = n > 0 ? 'flex' : 'none'; }
  }
};
function showToast(msg, type = 'success', duration = 3000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:8px;';
    document.body.appendChild(container);
  }
  const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
  const colors = { success: '#2E7D4F', error: '#B91C1C', warning: '#B45309', info: '#1E40AF' };
  const toast = document.createElement('div');
  toast.style.cssText = `background:white;border:1px solid #E8DDD4;border-left:4px solid ${colors[type]};border-radius:10px;padding:12px 16px;box-shadow:0 4px 16px rgba(0,0,0,0.12);display:flex;align-items:center;gap:10px;font-family:'DM Sans',sans-serif;font-size:0.88rem;max-width:320px;animation:fadeIn 0.3s ease;`;
  toast.innerHTML = `<span style="color:${colors[type]};font-weight:700;">${icons[type]}</span><span style="color:#1C1008;">${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s'; setTimeout(() => toast.remove(), 300); }, duration);
}
function renderNavUser() {
  const user = Session.getUser();
  if (!user) return;
  const el = document.getElementById('nav-user');
  if (el) {
    el.innerHTML = `<div class="navbar-user">
      <span class="badge badge-primary" style="font-size:0.7rem;opacity:0.8;">${user.role.toUpperCase()}</span>
    </div>`;
  }
}
function logout() {
  Session.clear();
  window.location.href = getRootPath('login.html');
}
function formatCurrency(n) { return '₱' + parseFloat(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
function formatDate(d) { return new Date(d).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
function timeAgo(d) {
  const diff = (Date.now() - new Date(d)) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  return `${Math.floor(diff/3600)}h ago`;
}
function formatTimeAgo(d) {
  return timeAgo(d);
}
function minutesAgo(d) { return Math.floor((Date.now() - new Date(d)) / 60000); }
function statusBadge(status) {
  const dots = { pending: 'dot-pending', preparing: 'dot-preparing', ready: 'dot-ready', served: 'dot-served', cancelled: '' };
  return `<span class="badge badge-${status}"><span class="status-dot ${dots[status]||''}"></span>${status.charAt(0).toUpperCase()+status.slice(1)}</span>`;
}
document.addEventListener('DOMContentLoaded', () => { renderNavUser(); Cart.updateBadge(); startCustomerHeartbeat(); });
let heartbeatInterval = null;
function startCustomerHeartbeat() {
  const path = window.location.pathname.toLowerCase();
  const isCustomerPage = !path.includes('/admin/') && !path.includes('login.html') && !path.includes('staff.html') && !path.includes('kitchen.html');
  if (isCustomerPage) {
    sendHeartbeat();
    heartbeatInterval = setInterval(sendHeartbeat, 10000);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopHeartbeat();
      } else {
        sendHeartbeat();
        if (!heartbeatInterval) {
          heartbeatInterval = setInterval(sendHeartbeat, 10000);
        }
      }
    });
    window.addEventListener('beforeunload', stopHeartbeat);
  }
}
function sendHeartbeat() {
  const sessionId = Session.getSessionId();
  fetch(API + '/customer/heartbeat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
    keepalive: true
  }).catch(() => {});
}
function stopHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}