/* ========================================================
   LUNARY — Contact Page JavaScript
   Form validation and submit feedback
   ======================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  const successMessage = document.querySelector('.contact-form__success');
  
  if (!form) return;

  function showError(input, message) {
    input.classList.add('error');
    const errorEl = input.parentElement.querySelector('.form-error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('visible');
    }
  }

  function clearError(input) {
    input.classList.remove('error');
    const errorEl = input.parentElement.querySelector('.form-error');
    if (errorEl) {
      errorEl.classList.remove('visible');
    }
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Clear errors on input
  form.querySelectorAll('.form-input, .form-textarea').forEach(input => {
    input.addEventListener('input', () => clearError(input));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    // Validate name
    const name = form.querySelector('#contactName');
    if (name && name.value.trim().length < 2) {
      showError(name, 'Lütfen adınızı girin.');
      isValid = false;
    }

    // Validate email
    const email = form.querySelector('#contactEmail');
    if (email && !validateEmail(email.value)) {
      showError(email, 'Geçerli bir e-posta adresi girin.');
      isValid = false;
    }

    // Validate subject
    const subject = form.querySelector('#contactSubject');
    if (subject && subject.value.trim().length < 3) {
      showError(subject, 'Lütfen bir konu girin.');
      isValid = false;
    }

    // Validate message
    const message = form.querySelector('#contactMessage');
    if (message && message.value.trim().length < 10) {
      showError(message, 'Mesajınız en az 10 karakter olmalıdır.');
      isValid = false;
    }

    if (isValid) {
      // Hide form, show success
      form.style.display = 'none';
      if (successMessage) {
        successMessage.classList.add('visible');
      }
    }
  });
});
