/* ========================================================
   LUNARY — Auth & Session Management
   ======================================================== */

const Auth = {
  setToken: (token, user) => {
    localStorage.setItem('lunary_token', token);
    localStorage.setItem('lunary_user', JSON.stringify(user));
  },
  
  getToken: () => localStorage.getItem('lunary_token'),
  
  getUser: () => {
    const u = localStorage.getItem('lunary_user');
    return u ? JSON.parse(u) : null;
  },

  logout: () => {
    localStorage.removeItem('lunary_token');
    localStorage.removeItem('lunary_user');
    window.location.href='/login.html';
  },

  isLoggedIn: () => !!localStorage.getItem('lunary_token'),

  getAuthHeaders: () => {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Auth.getToken()}`
    };
  }
};

// Update Navbar automatically
document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.getElementById('navLinks');
  const mobileMenu = document.getElementById('mobileMenu');
  
  if (!navLinks) return;

  const user = Auth.getUser();
  
  let authLinkHTML = '';
  if (user) {
    authLinkHTML = `
      <div class="user-dropdown" style="position:relative; display:inline-block; margin-left:1rem;">
        <button class="navbar__link" id="userDropdownBtn" style="display:flex; align-items:center; background:none; border:none; cursor:pointer; color:inherit;">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        </button>
        <div id="userDropdownMenu" style="display:none; position:absolute; right:0; top:100%; background:var(--color-bg); border:1px solid rgba(212,175,55,0.3); border-radius:4px; min-width:180px; box-shadow:0 10px 20px rgba(0,0,0,0.5); z-index:100; flex-direction:column; margin-top:0.5rem; overflow:hidden;">
          ${user.role === 'admin' ? `<a href="/indexadmin.html" style="padding:0.8rem 1rem; color:var(--color-accent); font-weight:bold; text-decoration:none; border-bottom:1px solid rgba(255,255,255,0.05); display:block;">Yönetici Paneli</a>` : ''}
          <a href="/account.html" style="padding:0.8rem 1rem; color:var(--color-text); text-decoration:none; border-bottom:1px solid rgba(255,255,255,0.05); display:block;">Hesabım Paneli</a>
          <a href="/account.html?support=1" style="padding:0.8rem 1rem; color:var(--color-text); text-decoration:none; border-bottom:1px solid rgba(255,255,255,0.05); display:block;">Genel Destek & İletişim</a>
          <button onclick="Auth.logout()" style="padding:0.8rem 1rem; color:#ff4d4d; text-align:left; background:none; border:none; cursor:pointer; width:100%; display:block; font-family:inherit;">Çıkış Yap</button>
        </div>
      </div>
    `;
  } else {
    authLinkHTML = `
      <a href="#" onclick="event.preventDefault(); openAuthModal('login')" class="navbar__link" style="margin-left:1rem; border:1px solid var(--color-accent); padding:0.4rem 1rem; border-radius:20px; color:var(--color-accent);">Giriş / Kayıt Ol</a>
    `;
  }

  navLinks.insertAdjacentHTML('beforeend', authLinkHTML);

  // Toggle dropdown
  const dropdownBtn = document.getElementById('userDropdownBtn');
  const dropdownMenu = document.getElementById('userDropdownMenu');
  if (dropdownBtn && dropdownMenu) {
    dropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdownMenu.style.display = dropdownMenu.style.display === 'flex' ? 'none' : 'flex';
    });
    document.addEventListener('click', () => {
      dropdownMenu.style.display = 'none';
    });
  }

  // Show auth banner on homepage if not logged in
  const authBanner = document.getElementById('heroAuthBanner');
  if (authBanner && !user) {
    authBanner.style.display = 'block';
    // Update links in banner
    const bannerLinks = authBanner.querySelectorAll('a[href="/login.html"], a[href="/register.html"]');
    bannerLinks.forEach(link => {
      const type = link.href.includes('register') ? 'register' : 'login';
      link.href = '#';
      link.onclick = (e) => { e.preventDefault(); openAuthModal(type); };
    });
  }

  injectAuthModal();
});

// --- Auth Modal Logic ---
function injectAuthModal() {
  if (document.getElementById('authModalOverlay')) return;

  const modalHTML = `
    <div id="authModalOverlay" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:9999; align-items:center; justify-content:center; backdrop-filter:blur(5px);">
      <div style="background:var(--color-bg); border:1px solid var(--color-accent); border-radius:8px; width:90%; max-width:400px; padding:2rem; box-shadow:0 15px 30px rgba(0,0,0,0.8); position:relative;">
        <button onclick="closeAuthModal()" style="position:absolute; top:1rem; right:1rem; background:none; border:none; color:var(--color-text-muted); cursor:pointer; font-size:1.5rem;">&times;</button>
        
        <!-- Login Form -->
        <div id="authLoginView">
          <h2 style="color:var(--color-accent); text-align:center; font-family:var(--font-brand); margin-bottom:1.5rem;">Giriş Yap</h2>
          <form id="authLoginForm" onsubmit="handleAuthLogin(event)">
            <div class="form-group" style="margin-bottom:1rem;">
              <label class="form-label">E-posta / Kullanıcı Adı</label>
              <input type="text" id="authLoginEmail" class="form-input" required>
            </div>
            <div class="form-group" style="margin-bottom:1.5rem;">
              <label class="form-label">Şifre</label>
              <input type="password" id="authLoginPassword" class="form-input" required>
            </div>
            <div id="authLoginError" style="color:#ff6b6b; font-size:0.85rem; margin-bottom:1rem; text-align:center;"></div>
            <button type="submit" class="btn btn--solid" style="width:100%; margin-bottom:1rem;">Giriş Yap</button>
            <p style="text-align:center; font-size:0.9rem; color:var(--color-text-muted);">
              Hesabınız yok mu? <a href="#" onclick="event.preventDefault(); switchAuthView('register')" style="color:var(--color-accent);">Kayıt Olun</a>
            </p>
          </form>
        </div>

        <!-- Register Form -->
        <div id="authRegisterView" style="display:none;">
          <h2 style="color:var(--color-accent); text-align:center; font-family:var(--font-brand); margin-bottom:1.5rem;">Kayıt Ol</h2>
          <form id="authRegisterForm" onsubmit="handleAuthRegister(event)">
            <div class="form-group" style="margin-bottom:1rem;">
              <label class="form-label">Ad Soyad</label>
              <input type="text" id="authRegName" class="form-input" required>
            </div>
            <div class="form-group" style="margin-bottom:1rem;">
              <label class="form-label">E-posta</label>
              <input type="email" id="authRegEmail" class="form-input" required>
            </div>
            <div class="form-group" style="margin-bottom:1.5rem;">
              <label class="form-label">Şifre</label>
              <input type="password" id="authRegPassword" class="form-input" required minlength="6">
            </div>
            <div id="authRegError" style="color:#ff6b6b; font-size:0.85rem; margin-bottom:1rem; text-align:center;"></div>
            <button type="submit" class="btn btn--solid" style="width:100%; margin-bottom:1rem;">Kayıt Ol</button>
            <p style="text-align:center; font-size:0.9rem; color:var(--color-text-muted);">
              Zaten hesabınız var mı? <a href="#" onclick="event.preventDefault(); switchAuthView('login')" style="color:var(--color-accent);">Giriş Yapın</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

window.openAuthModal = function(view) {
  document.getElementById('authModalOverlay').style.display = 'flex';
  switchAuthView(view || 'login');
};

window.closeAuthModal = function() {
  document.getElementById('authModalOverlay').style.display = 'none';
};

window.switchAuthView = function(view) {
  document.getElementById('authLoginView').style.display = view === 'login' ? 'block' : 'none';
  document.getElementById('authRegisterView').style.display = view === 'register' ? 'block' : 'none';
  document.getElementById('authLoginError').innerText = '';
  document.getElementById('authRegError').innerText = '';
};

window.handleAuthLogin = async function(e) {
  e.preventDefault();
  const email = document.getElementById('authLoginEmail').value;
  const password = document.getElementById('authLoginPassword').value;
  
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if(res.ok) {
      Auth.setToken(data.token, data.user);
      window.location.reload();
    } else {
      document.getElementById('authLoginError').innerText = data.error;
    }
  } catch(err) {
    document.getElementById('authLoginError').innerText = 'Giriş yapılamadı.';
  }
};

window.handleAuthRegister = async function(e) {
  e.preventDefault();
  const name = document.getElementById('authRegName').value;
  const email = document.getElementById('authRegEmail').value;
  const password = document.getElementById('authRegPassword').value;
  
  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if(res.ok) {
      Auth.setToken(data.token, data.user);
      window.location.reload();
    } else {
      document.getElementById('authRegError').innerText = data.error;
    }
  } catch(err) {
    document.getElementById('authRegError').innerText = 'Kayıt başarısız oldu.';
  }
};

window.Auth = Auth;
