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

const galleryItemEls = Array.from(document.querySelectorAll('#gallery .gallery-item'));
const galleryData = galleryItemEls.map(el => ({
  src: el.querySelector('img').getAttribute('src'),
  alt: el.querySelector('img').getAttribute('alt'),
  cat: el.dataset.cat
}));

let currentFilter = 'highlights';
let carouselIndex = 0;
let currentFilteredData = getFilteredData('highlights');

// Dataset used by the Show All lightbox (deduplicated when Show All opens)
let showAllData = galleryData;

function getItemsPerView() {
  if (window.innerWidth >= 900) return 3;
  if (window.innerWidth >= 600) return 2;
  return 1;
}

function getFilteredData(filter) {
  if (filter === 'all') return galleryData;
  return galleryData.filter(d => d.cat === filter);
}

// Strip category prefix and optional leading "N_" to get the base photo filename
function getBaseName(src) {
  const filename = src.split('/').pop();
  const withoutCat = filename.replace(/^(highlights|outdoors|interiors|bedrooms|winecellar)_/, '');
  return withoutCat.replace(/^\d+_/, '');
}

function updateMobileArrows() {
  carouselMobilePrev.disabled = carouselIndex === 0;
  carouselMobileNext.disabled = carouselIndex >= currentFilteredData.length - 1;
}

function renderCarousel() {
  const perView = getItemsPerView();
  const total = currentFilteredData.length;
  const isMobile = window.innerWidth <= 600;

  carouselIndex = total <= perView
    ? 0
    : Math.max(0, Math.min(carouselIndex, total - perView));

  const track = document.getElementById('carouselTrack');
  track.innerHTML = '';

  if (isMobile) {
    // All slides rendered at once — scroll-snap handles navigation natively
    currentFilteredData.forEach((item, i) => {
      const slide = document.createElement('div');
      slide.className = 'carousel-slide';
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = item.alt;
      img.loading = 'lazy';
      slide.appendChild(img);
      slide.addEventListener('click', () => openLightbox(currentFilteredData, i));
      track.appendChild(slide);
    });
    carouselViewport.scrollLeft = 0;
    carouselIndex = 0;
    updateMobileArrows();
  } else {
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
  }

  // Counter
  const counter = document.getElementById('carouselCounter');
  if (total === 0) {
    counter.textContent = '';
  } else {
    const end = Math.min(carouselIndex + perView, total);
    counter.textContent = isMobile
      ? `1 of ${total}`
      : `${carouselIndex + 1}–${end} of ${total}`;
  }

  // Arrow states (desktop only — arrows hidden on mobile)
  document.getElementById('carouselPrev').disabled = carouselIndex === 0;
  document.getElementById('carouselNext').disabled = carouselIndex + perView >= total;
}

// ── Show All refs + helpers ──────────────────────────────────
const carouselWrap        = document.querySelector('.gallery-carousel-wrap');
const carouselCounterEl   = document.getElementById('carouselCounter');
const carouselMobileNavEl = document.getElementById('carouselMobileNav');
const carouselMobilePrev  = document.getElementById('carouselMobilePrev');
const carouselMobileNext  = document.getElementById('carouselMobileNext');
const showAllBtn          = document.getElementById('showAllBtn');
const galleryExpanded     = document.getElementById('galleryExpanded');
const showAllText         = showAllBtn.querySelector('.show-all-text');

function setCarouselVisible(visible) {
  carouselWrap.style.display        = visible ? '' : 'none';
  carouselCounterEl.style.display   = visible ? '' : 'none';
  carouselMobileNavEl.style.display = visible ? '' : 'none';
}

function closeShowAll() {
  // Restore all gallery items (undo deduplication)
  galleryItemEls.forEach(el => { el.style.display = ''; });
  showAllData = galleryData;
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

// Carousel navigation — one slide at a time (desktop only)
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

// Touch swipe on carousel — desktop only; mobile uses native scroll-snap
let carouselTouchX = 0;
const carouselViewport = document.querySelector('.carousel-viewport');
carouselViewport.addEventListener('touchstart', e => {
  carouselTouchX = e.touches[0].clientX;
}, { passive: true });
carouselViewport.addEventListener('touchend', e => {
  if (window.innerWidth <= 600) return; // scroll-snap handles mobile
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

// Mobile arrows below carousel — scroll one slide at a time
carouselMobilePrev.addEventListener('click', () => {
  const slide = carouselViewport.querySelector('.carousel-slide');
  if (slide) carouselViewport.scrollBy({ left: -(slide.offsetWidth + 12), behavior: 'smooth' });
});
carouselMobileNext.addEventListener('click', () => {
  const slide = carouselViewport.querySelector('.carousel-slide');
  if (slide) carouselViewport.scrollBy({ left: slide.offsetWidth + 12, behavior: 'smooth' });
});

// Mobile: update counter and arrow states as user scrolls between snapped slides
carouselViewport.addEventListener('scroll', () => {
  if (window.innerWidth > 600) return;
  const slide = carouselViewport.querySelector('.carousel-slide');
  if (!slide) return;
  const slideWidth = slide.offsetWidth + 12;
  const idx = Math.round(carouselViewport.scrollLeft / slideWidth);
  const total = currentFilteredData.length;
  if (idx !== carouselIndex && idx >= 0 && idx < total) {
    carouselIndex = idx;
    document.getElementById('carouselCounter').textContent = `${idx + 1} of ${total}`;
    updateMobileArrows();
  }
}, { passive: true });

// Resize: re-render to adjust slides per view
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(renderCarousel, 150);
}, { passive: true });

// Initial render
renderCarousel();

// ── Show All toggle ──────────────────────────────────────────
showAllBtn.addEventListener('click', () => {
  const opening = !galleryExpanded.classList.contains('open');

  if (opening) {
    // Deduplicate gallery items by base photo filename
    const seen = new Set();
    const unique = [];
    galleryItemEls.forEach((el, i) => {
      const src = el.querySelector('img').getAttribute('src');
      const base = getBaseName(src);
      if (seen.has(base)) {
        el.style.display = 'none';
      } else {
        seen.add(base);
        el.style.display = '';
        unique.push(galleryData[i]);
      }
    });
    showAllData = unique;

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

// Expanded grid item clicks → lightbox (uses deduplicated showAllData when Show All is open)
galleryItemEls.forEach(el => {
  el.addEventListener('click', () => {
    const src = el.querySelector('img').getAttribute('src');
    const idx = showAllData.findIndex(d => d.src === src);
    if (idx >= 0) openLightbox(showAllData, idx);
  });
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
document.querySelectorAll('.amenity-toggle').forEach(btn =>
  btn.addEventListener('click', toggleAmenities)
);

// ── Booking form ────────────────────────────────────────────
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDisplayDate(date) {
  return `${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

function formatBookingDateRange(checkinISO, checkoutISO) {
  const ci = new Date(`${checkinISO}T00:00:00`);
  const co = new Date(`${checkoutISO}T00:00:00`);
  const sameYear = ci.getFullYear() === co.getFullYear();
  const ciLabel = `${ci.getDate()} ${MONTH_NAMES[ci.getMonth()]}` + (sameYear ? '' : ` ${ci.getFullYear()}`);
  const coLabel = `${co.getDate()} ${MONTH_NAMES[co.getMonth()]} ${co.getFullYear()}`;
  return `${ciLabel} – ${coLabel}`;
}

const checkinHidden      = document.getElementById('checkinDate');
const checkoutHidden     = document.getElementById('checkoutDate');
const bookingForm        = document.getElementById('bookingForm');
const bookingConfirm     = document.getElementById('bookingConfirmation');
const bookingConfirmText = document.getElementById('bookingConfirmationText');

const dateBoxCheckin   = document.getElementById('dateBoxCheckin');
const dateBoxCheckout  = document.getElementById('dateBoxCheckout');
const checkinDisplay   = document.getElementById('checkinDisplay');
const checkoutDisplay  = document.getElementById('checkoutDisplay');
const clearCheckin     = document.getElementById('clearCheckin');
const clearCheckout    = document.getElementById('clearCheckout');

function setActiveBox(box) {
  dateBoxCheckin.classList.toggle('date-box--active', box === 'checkin');
  dateBoxCheckout.classList.toggle('date-box--active', box === 'checkout');
}

function clearActiveBox() {
  dateBoxCheckin.classList.remove('date-box--active');
  dateBoxCheckout.classList.remove('date-box--active');
}

function updateCheckinUI(date) {
  if (date) {
    checkinDisplay.textContent = formatDisplayDate(date);
    checkinDisplay.classList.add('date-box__value--set');
    clearCheckin.hidden = false;
    checkinHidden.value = toISODate(date);
  } else {
    checkinDisplay.textContent = 'Add date';
    checkinDisplay.classList.remove('date-box__value--set');
    clearCheckin.hidden = true;
    checkinHidden.value = '';
  }
  dateBoxCheckin.classList.remove('date-box--error');
}

function updateCheckoutUI(date) {
  if (date) {
    checkoutDisplay.textContent = formatDisplayDate(date);
    checkoutDisplay.classList.add('date-box__value--set');
    clearCheckout.hidden = false;
    checkoutHidden.value = toISODate(date);
  } else {
    checkoutDisplay.textContent = 'Add date';
    checkoutDisplay.classList.remove('date-box__value--set');
    clearCheckout.hidden = true;
    checkoutHidden.value = '';
  }
  dateBoxCheckout.classList.remove('date-box--error');
}

const SHOW_MONTHS = window.innerWidth >= 768 ? 2 : 1;

let rangePicker;

function blockNonSaturdays(fp) {
  fp.calendarContainer.querySelectorAll('.flatpickr-day').forEach(dayElem => {
    if (!dayElem.dateObj || dayElem.dateObj.getDay() === 6) return;
    dayElem.classList.add('not-saturday');
    if (!dayElem._satBlocked) {
      dayElem._satBlocked = true;
      dayElem.addEventListener('click', e => e.stopPropagation());
    }
  });
}

rangePicker = flatpickr('#rangeFlatpickr', {
  mode: 'range',
  dateFormat: 'Y-m-d',
  minDate: 'today',
  showMonths: SHOW_MONTHS,
  positionElement: document.getElementById('datePickerRow'),
  disableMobile: true,
  onOpen(_sd, _ds, fp) { blockNonSaturdays(fp); },
  onMonthChange(_sd, _ds, fp) { blockNonSaturdays(fp); },
  onYearChange(_sd, _ds, fp) { blockNonSaturdays(fp); },
  onChange(selectedDates) {
    if (selectedDates.length === 0) {
      updateCheckinUI(null);
      updateCheckoutUI(null);
    } else if (selectedDates.length === 1) {
      if (selectedDates[0].getDay() !== 6) { rangePicker.clear(); return; }
      updateCheckinUI(selectedDates[0]);
      updateCheckoutUI(null);
      setActiveBox('checkout');
      setTimeout(() => blockNonSaturdays(rangePicker), 0);
    } else {
      const [ci, co] = selectedDates;
      const weeks = Math.round((co - ci) / (7 * 24 * 3600 * 1000));
      if (weeks < 1 || weeks > 4) {
        rangePicker.setDate([ci], false);
        updateCheckinUI(ci);
        updateCheckoutUI(null);
        setActiveBox('checkout');
        return;
      }
      updateCheckinUI(ci);
      updateCheckoutUI(co);
      clearActiveBox();
      rangePicker.close();
    }
  },
  onClose() { clearActiveBox(); }
});

// CHECK-IN box click — clears everything and restarts
dateBoxCheckin.addEventListener('click', e => {
  if (clearCheckin.contains(e.target)) return;
  rangePicker.clear();
  setActiveBox('checkin');
  rangePicker.open();
});

// CHECKOUT box click — opens calendar; starts from check-in step if none set yet
dateBoxCheckout.addEventListener('click', e => {
  if (clearCheckout.contains(e.target)) return;
  setActiveBox(checkinHidden.value ? 'checkout' : 'checkin');
  rangePicker.open();
});

// Clear check-in: wipe both dates
clearCheckin.addEventListener('click', e => {
  e.stopPropagation();
  rangePicker.clear();
});

// Clear checkout: keep check-in, re-open for new checkout
clearCheckout.addEventListener('click', e => {
  e.stopPropagation();
  if (rangePicker.selectedDates.length >= 1) {
    const ci = rangePicker.selectedDates[0];
    rangePicker.setDate([ci], false);
    updateCheckoutUI(null);
    setActiveBox('checkout');
    rangePicker.open();
  } else {
    rangePicker.clear();
  }
});

// Keyboard support for the date boxes
[dateBoxCheckin, dateBoxCheckout].forEach(box => {
  box.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); box.click(); }
  });
});

bookingForm.addEventListener('submit', e => {
  e.preventDefault();

  const checkinISO  = checkinHidden.value;
  const checkoutISO = checkoutHidden.value;

  if (!checkinISO) {
    dateBoxCheckin.classList.add('date-box--error');
    setActiveBox('checkin');
    rangePicker.open();
    dateBoxCheckin.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  if (!checkoutISO) {
    dateBoxCheckout.classList.add('date-box--error');
    setActiveBox('checkout');
    rangePicker.open();
    dateBoxCheckout.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  if (!bookingForm.reportValidity()) return;

  const submitBtn = bookingForm.querySelector('.btn-submit');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending…';

  fetch(bookingForm.action, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(Object.fromEntries(new FormData(bookingForm)))
  })
    .then(res => {
      if (!res.ok) throw new Error('Request failed');
      bookingConfirmText.textContent =
        `Thank you for your request. We have received your inquiry for: ${formatBookingDateRange(checkinISO, checkoutISO)}. We will review availability and get back to you shortly.`;
      bookingForm.hidden = true;
      bookingConfirm.hidden = false;
      bookingConfirm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    })
    .catch(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Request Booking';
      alert('Something went wrong sending your request. Please try again, or email us directly at info@casadellupinobianco.com.');
    });
});
