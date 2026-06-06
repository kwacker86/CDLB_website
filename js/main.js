// Nav: become opaque on scroll
const nav = document.getElementById('nav');
const burger = document.querySelector('.burger');
const mobileMenu = document.querySelector('.mobile-menu');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// Burger menu
burger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
mobileMenu.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => mobileMenu.classList.remove('open'))
);

// Hero subtle zoom on load
document.getElementById('hero').classList.add('loaded');

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// ── Gallery Carousel ──────────────────────────────────────────

// Read all image data from the expanded grid (hidden in DOM but queryable)
const galleryItemEls = Array.from(document.querySelectorAll('#gallery .gallery-item'));
const galleryData = galleryItemEls.map(el => ({
  src: el.querySelector('img').getAttribute('src'),
  alt: el.querySelector('img').getAttribute('alt'),
  cat: el.dataset.cat
}));

const HIGHLIGHT_IDS = ['IMG_0902', 'IMG_6981', 'IMG_7925', 'IMG_7460', 'IMG_8115', 'IMG_7696'];

let currentFilter = 'highlights';
let carouselIndex = 0;
let currentFilteredData;

function getItemsPerView() {
  if (window.innerWidth >= 900) return 3;
  if (window.innerWidth >= 600) return 2;
  return 1;
}

function getFilteredData(filter) {
  if (filter === 'highlights') {
    return HIGHLIGHT_IDS
      .map(id => galleryData.find(d => d.src.includes(id)))
      .filter(Boolean);
  }
  if (filter === 'all') return galleryData;
  return galleryData.filter(d => d.cat === filter);
}

function renderCarousel() {
  const perView = getItemsPerView();
  const total = currentFilteredData.length;

  // Clamp index
  carouselIndex = total <= perView
    ? 0
    : Math.max(0, Math.min(carouselIndex, total - perView));

  const track = document.getElementById('carouselTrack');
  track.innerHTML = '';

  const page = currentFilteredData.slice(carouselIndex, carouselIndex + perView);
  page.forEach((item, i) => {
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';
    const img = document.createElement('img');
    img.src = item.src;
    img.alt = item.alt;
    img.loading = 'lazy';
    slide.appendChild(img);
    const absIdx = carouselIndex + i;
    slide.addEventListener('click', () => openLightbox(currentFilteredData, absIdx));
    track.appendChild(slide);
  });

  // Counter
  const counter = document.getElementById('carouselCounter');
  if (total === 0) {
    counter.textContent = '';
  } else {
    const end = Math.min(carouselIndex + perView, total);
    counter.textContent = total === 1
      ? '1 of 1'
      : `${carouselIndex + 1}–${end} of ${total}`;
  }

  // Arrow states
  document.getElementById('carouselPrev').disabled = carouselIndex === 0;
  document.getElementById('carouselNext').disabled = carouselIndex + perView >= total;
}

// ── Show All refs + helpers ──────────────────────────────────
const carouselWrap      = document.querySelector('.gallery-carousel-wrap');
const carouselCounterEl = document.getElementById('carouselCounter');
const showAllBtn        = document.getElementById('showAllBtn');
const galleryExpanded   = document.getElementById('galleryExpanded');
const showAllText       = showAllBtn.querySelector('.show-all-text');

function setCarouselVisible(visible) {
  carouselWrap.style.display      = visible ? '' : 'none';
  carouselCounterEl.style.display = visible ? '' : 'none';
}

function closeShowAll() {
  galleryExpanded.classList.remove('open');
  showAllBtn.classList.remove('active');
  showAllText.textContent = 'Show all';
  setCarouselVisible(true);
}

// Filter buttons — also closes Show All if open
document.querySelectorAll('.filter-btn:not(.show-all-btn)').forEach(btn => {
  btn.addEventListener('click', () => {
    if (galleryExpanded.classList.contains('open')) closeShowAll();
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    currentFilteredData = getFilteredData(currentFilter);
    carouselIndex = 0;
    renderCarousel();
  });
});

// Carousel navigation — one slide at a time
document.getElementById('carouselPrev').addEventListener('click', () => {
  if (carouselIndex > 0) {
    carouselIndex--;
    renderCarousel();
  }
});

document.getElementById('carouselNext').addEventListener('click', () => {
  if (carouselIndex + getItemsPerView() < currentFilteredData.length) {
    carouselIndex++;
    renderCarousel();
  }
});

// Touch swipe on carousel
let carouselTouchX = 0;
const carouselViewport = document.querySelector('.carousel-viewport');
carouselViewport.addEventListener('touchstart', e => {
  carouselTouchX = e.touches[0].clientX;
}, { passive: true });
carouselViewport.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - carouselTouchX;
  if (Math.abs(dx) > 50) {
    if (dx < 0 && carouselIndex + getItemsPerView() < currentFilteredData.length) {
      carouselIndex++;
      renderCarousel();
    } else if (dx > 0 && carouselIndex > 0) {
      carouselIndex--;
      renderCarousel();
    }
  }
});

// Resize: re-render to adjust slides per view
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(renderCarousel, 150);
}, { passive: true });

// Initial render
currentFilteredData = getFilteredData('highlights');
renderCarousel();

// ── Show All toggle ──────────────────────────────────────────
showAllBtn.addEventListener('click', () => {
  const opening = !galleryExpanded.classList.contains('open');

  if (opening) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    showAllBtn.classList.add('active');
    showAllText.textContent = 'Hide all';
    galleryExpanded.classList.add('open');
    setCarouselVisible(false);
  } else {
    closeShowAll();
    document.querySelector('[data-filter="highlights"]').classList.add('active');
    currentFilter = 'highlights';
    currentFilteredData = getFilteredData('highlights');
    carouselIndex = 0;
    renderCarousel();
  }
});

// Expanded grid item clicks → lightbox through all images
galleryItemEls.forEach((el, i) => {
  el.addEventListener('click', () => openLightbox(galleryData, i));
});

// ── Lightbox ────────────────────────────────────────────────
const lightbox = document.getElementById('lightbox');
const lbImg    = document.getElementById('lb-img');
const lbClose  = document.querySelector('.lb-close');
const lbPrev   = document.querySelector('.lb-prev');
const lbNext   = document.querySelector('.lb-next');

let lbItems = [];
let lbIndex = 0;

function openLightbox(items, index) {
  lbItems = items;
  lbIndex = index;
  updateLightboxImage();
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function updateLightboxImage() {
  const item = lbItems[lbIndex];
  lbImg.src = item.src;
  lbImg.alt = item.alt;
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  lbImg.src = '';
}

function showLbNext() {
  lbIndex = (lbIndex + 1) % lbItems.length;
  updateLightboxImage();
}

function showLbPrev() {
  lbIndex = (lbIndex - 1 + lbItems.length) % lbItems.length;
  updateLightboxImage();
}

lbClose.addEventListener('click', closeLightbox);
lbNext.addEventListener('click', showLbNext);
lbPrev.addEventListener('click', showLbPrev);

lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowRight') showLbNext();
  if (e.key === 'ArrowLeft')  showLbPrev();
});

// Touch swipe in lightbox
let touchStartX = 0;
lightbox.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
lightbox.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 50) dx < 0 ? showLbNext() : showLbPrev();
});

// ── Amenities toggle ────────────────────────────────────────
function toggleAmenities() {
  const preview = document.getElementById('amenitiesPreview');
  const full    = document.getElementById('amenitiesFull');
  if (full.classList.contains('show')) {
    full.classList.remove('show');
    preview.classList.remove('hidden');
  } else {
    full.classList.add('show');
    preview.classList.add('hidden');
  }
}
