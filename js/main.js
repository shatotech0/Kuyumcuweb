/* ========================================================
   LUNARY — Main JavaScript
   Navbar, scroll reveal, mobile menu, scroll-to-top
   ======================================================== */

// --- Navbar Scroll Effect ---
const navbar = document.getElementById('navbar');
const scrollTop = document.getElementById('scrollTop');

let isScrolling = false;

function handleNavbarScroll() {
  if (!isScrolling) {
    window.requestAnimationFrame(() => {
      if (navbar) {
        if (window.scrollY > 60) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      }

      // Scroll to top button
      if (scrollTop) {
        if (window.scrollY > 400) {
          scrollTop.classList.add('visible');
        } else {
          scrollTop.classList.remove('visible');
        }
      }
      isScrolling = false;
    });
    isScrolling = true;
  }
}

window.addEventListener('scroll', handleNavbarScroll, { passive: true });
handleNavbarScroll();

// Scroll to top
if (scrollTop) {
  scrollTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// --- Mobile Menu ---
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
  });

  // Close on link click
  mobileMenu.querySelectorAll('.navbar__link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

// --- Scroll Reveal (IntersectionObserver) ---
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal, .reveal-fade, .reveal-left, .reveal-right, .reveal-scale, .stagger');
  
  if (!revealElements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}

// Init on load
document.addEventListener('DOMContentLoaded', initScrollReveal);

// --- Active Nav Link ---
function setActiveNavLink() {
  const currentPath = window.location.pathname;
  document.querySelectorAll('.navbar__link').forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    if (href === currentPath || 
        (currentPath === '/' && href === '/') ||
        (currentPath.includes(href) && href !== '/')) {
      link.classList.add('active');
    }
  });
}

setActiveNavLink();

// --- Smooth Anchor Scroll ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// --- VIP WhatsApp Button ---
function createWhatsAppButton() {
  const btn = document.createElement('a');
  btn.href = 'https://wa.me/905000000000?text=Merhaba,%20Lunary%20tasarımları%20hakkında%20bilgi%20almak%20istiyorum.';
  btn.target = '_blank';
  btn.className = 'vip-whatsapp';
  btn.innerHTML = `
    <span class="vip-whatsapp-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg></span>
    <span>VIP Danışman</span>
  `;
  document.body.appendChild(btn);
}

document.addEventListener('DOMContentLoaded', () => {
  createWhatsAppButton();
});
