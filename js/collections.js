/* ========================================================
   LUNARY — Collections Page JavaScript
   Category filter system & API Integration
   ======================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  const filterTabs = document.querySelectorAll('.filter-btn'); // Note: HTML uses .filter-btn
  const grid = document.querySelector('.products-grid');
  const countEl = document.querySelector('.products-count span');
  
  if (!grid) return;

  // 1. Fetch Products from API
  try {
    const res = await fetch('/api/products');
    const products = await res.json();
    
    // 2. Render Products
    grid.innerHTML = '';
    products.forEach(p => {
      grid.innerHTML += `
        <div class="product-card" data-category="${p.category}">
          <div class="product-card__image">
            <img loading="lazy" decoding="async" src="${p.image}" alt="${p.title}" onerror="this.src='/assets/images/hero_1.jpg'">
            <div class="product-card__overlay">
              <a href="/product-detail.html?id=${p.id}" class="btn btn--outline">Detayları Gör</a>
            </div>
          </div>
          <div class="product-card__body">
            <span class="product-card__category" style="text-transform:capitalize;">${p.category}</span>
            <h3 class="product-card__title">${p.title}</h3>
            <p class="product-card__desc">${p.desc}</p>
            <span class="product-card__material">${p.material}</span>
          </div>
        </div>
      `;
    });
  } catch (err) {
    console.error('Ürünler yüklenemedi:', err);
    grid.innerHTML = '<p style="text-align:center; width:100%;">Ürünler yüklenirken bir hata oluştu.</p>';
  }

  const productCards = document.querySelectorAll('.product-card[data-category]');

  // 3. Filter Logic
  function filterProducts(category) {
    let visibleCount = 0;

    productCards.forEach((card, index) => {
      const cardCategory = card.dataset.category;
      const shouldShow = category === 'all' || cardCategory === category;

      if (shouldShow) {
        card.style.display = 'block';
        card.style.animation = `fadeUp 0.6s ease forwards ${visibleCount * 0.1}s`;
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (countEl) {
      countEl.textContent = visibleCount;
    }

    // Update active tab
    if (filterTabs.length) {
      filterTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.filter === category);
      });
    }
  }

  if (filterTabs.length) {
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        filterProducts(tab.dataset.filter);
      });
    });
  }

  // Check hash for initial filter
  const hash = window.location.hash.replace('#', '');
  const categoryMap = {
    'yuzukler': 'yuzuk',
    'kolyeler': 'kolye',
    'bileklikler': 'bileklik',
    'kupeler': 'kupe'
  };

  if (hash && categoryMap[hash]) {
    filterProducts(categoryMap[hash]);
  } else {
    filterProducts('all'); // Initialize count
  }
});
