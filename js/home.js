/* ========================================================
   LUNARY — Home Page JavaScript
   Hero Carousel with auto-play and indicators
   ======================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.hero__slide');
  const indicators = document.querySelectorAll('.hero__indicator');
  const progressBar = document.getElementById('heroProgress');
  
  if (!slides.length) return;

  let currentSlide = 0;
  const totalSlides = slides.length;
  const slideDuration = 6000; // 6 seconds per slide
  let autoPlayTimer = null;
  let progressTimer = null;
  let progressStart = 0;

  function goToSlide(index) {
    // Remove active from all
    slides.forEach(s => s.classList.remove('active'));
    indicators.forEach(i => i.classList.remove('active'));
    
    // Set new active
    currentSlide = index;
    slides[currentSlide].classList.add('active');
    indicators[currentSlide].classList.add('active');

    // Reset progress
    startProgress();
  }

  function nextSlide() {
    goToSlide((currentSlide + 1) % totalSlides);
  }

  function startProgress() {
    if (progressBar) {
      progressBar.style.transition = 'none';
      progressBar.style.width = '0%';
      
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          progressBar.style.transition = `width ${slideDuration}ms linear`;
          progressBar.style.width = '100%';
        });
      });
    }
  }

  function startAutoPlay() {
    stopAutoPlay();
    autoPlayTimer = setInterval(nextSlide, slideDuration);
    startProgress();
  }

  function stopAutoPlay() {
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
  }

  // Indicator clicks
  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      goToSlide(index);
      startAutoPlay(); // Reset timer on manual navigation
    });
  });

  // Touch/swipe support
  let touchStartX = 0;
  let touchEndX = 0;
  const heroEl = document.getElementById('hero');

  if (heroEl) {
    heroEl.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    heroEl.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          // Swipe left → next
          goToSlide((currentSlide + 1) % totalSlides);
        } else {
          // Swipe right → prev
          goToSlide((currentSlide - 1 + totalSlides) % totalSlides);
        }
        startAutoPlay();
      }
    }, { passive: true });
  }

  // Pause on hover (desktop)
  if (heroEl) {
    heroEl.addEventListener('mouseenter', stopAutoPlay);
    heroEl.addEventListener('mouseleave', startAutoPlay);
  }

  // Start
  startAutoPlay();
});
