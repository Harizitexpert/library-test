const DEMO = { username: 'admin', password: '1234' };
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');

loginForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const u = document.getElementById('username').value.trim();
  const p = document.getElementById('password').value.trim();
  if (u !== DEMO.username) return showError('Invalid username');
  if (p !== DEMO.password) return showError('Wrong password');
  localStorage.setItem('loggedUser', u);
  window.location.href = 'app.html';
});

function showError(msg){ loginError.style.display='block'; loginError.textContent = msg; }


