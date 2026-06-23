
// If user already has a session, redirect based on role
const user = JSON.parse(sessionStorage.getItem('user') || 'null');
const urlParams = new URLSearchParams(location.search);
const table = urlParams.get('table');

if (table) { 
  window.location.href = `verify.html?table=${table}`; 
} else if (user) {
  const routes = { 
    customer: 'order-type.html', 
    staff: 'staff.html', 
    kitchen: 'kitchen.html', 
    admin: 'admin/dashboard.html' 
  };
  window.location.href = routes[user.role] || 'login.html';
} else { 
  window.location.href = 'login.html'; 
}
