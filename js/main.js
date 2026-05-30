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

// ── Gallery filter ──────────────────────────────────────────
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.filter;
    galleryItems.forEach(item => {
      if (cat === 'all' || item.dataset.cat === cat) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    });
  });
});

// ── Lightbox ────────────────────────────────────────────────
const lightbox = document.getElementById('lightbox');
const lbImg    = document.getElementById('lb-img');
const lbClose  = document.querySelector('.lb-close');
const lbPrev   = document.querySelector('.lb-prev');
const lbNext   = document.querySelector('.lb-next');

let currentItems = [];
let currentIndex = 0;

function visibleItems() {
  return [...galleryItems].filter(el => !el.classList.contains('hidden'));
}

function openLightbox(index) {
  currentItems = visibleItems();
  currentIndex = index;
  const img = currentItems[currentIndex].querySelector('img');
  lbImg.src = img.src;
  lbImg.alt = img.alt;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  lbImg.src = '';
}

function showNext() {
  currentItems = visibleItems();
  currentIndex = (currentIndex + 1) % currentItems.length;
  const img = currentItems[currentIndex].querySelector('img');
  lbImg.src = img.src;
  lbImg.alt = img.alt;
}

function showPrev() {
  currentItems = visibleItems();
  currentIndex = (currentIndex - 1 + currentItems.length) % currentItems.length;
  const img = currentItems[currentIndex].querySelector('img');
  lbImg.src = img.src;
  lbImg.alt = img.alt;
}

galleryItems.forEach((item, i) => {
  item.addEventListener('click', () => {
    const vis = visibleItems();
    const visIdx = vis.indexOf(item);
    openLightbox(visIdx);
  });
});

lbClose.addEventListener('click', closeLightbox);
lbNext.addEventListener('click', showNext);
lbPrev.addEventListener('click', showPrev);

lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowRight')  showNext();
  if (e.key === 'ArrowLeft')   showPrev();
});

// Touch swipe support for lightbox
let touchStartX = 0;
lightbox.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
lightbox.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 50) dx < 0 ? showNext() : showPrev();
});
