// Theme Switcher Function
function setTheme(themeName, element) {
  document.body.className = '';
  document.body.classList.add('theme-' + themeName);

  document.querySelectorAll('.vibe-btn').forEach(btn => btn.classList.remove('active'));
  const targetEl = element || (typeof event !== 'undefined' ? (event.currentTarget || event.target) : null);
  if (targetEl) {
    targetEl.classList.add('active');
  }
}

// Step 1: Media Switcher for Hero Stage
function switchMedia(type, src, element) {
  const targetEl = element || (typeof event !== 'undefined' ? (event.currentTarget || event.target) : null);
  if (targetEl) {
    const thumbContainer = targetEl.closest('.thumb') || targetEl;
    document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
    thumbContainer.classList.add('active');
  }

  const container = document.querySelector('.main-media-frame');
  if (!container) return;

  if (type === 'video') {
    container.innerHTML = `
      <video autoplay loop muted playsinline poster="assets/images/hero.png">
        <source src="${src}" type="video/mp4">
      </video>
      <div class="badge-live-views"><span class="dot-live"></span> <span>248 people viewing this now</span></div>
      <div class="badge-discount">-63% OFF TODAY</div>
    `;
  } else {
    container.innerHTML = `
      <img src="${src}" alt="Product image">
      <div class="badge-live-views"><span class="dot-live"></span> <span>248 people viewing this now</span></div>
      <div class="badge-discount">-63% OFF TODAY</div>
    `;
  }
}

// Step 2: Color Finish Selector
function selectColor(colorName, element) {
  const targetEl = element || (typeof event !== 'undefined' ? (event.currentTarget || event.target) : null);
  document.querySelectorAll('.color-pill').forEach(el => el.classList.remove('active'));
  if (targetEl) {
    targetEl.classList.add('active');
  }
  const selectedColorEl = document.getElementById('selected-color');
  if (selectedColorEl) {
    selectedColorEl.innerText = colorName;
  }
}

// Step 3: Bundle Builder
function selectBundle(bundleType, element) {
  const targetEl = element || (typeof event !== 'undefined' ? (event.currentTarget || event.target) : null);
  
  document.querySelectorAll('.bundle-card').forEach(card => {
    card.classList.remove('active');
    const radio = card.querySelector('input[type="radio"]');
    if (radio) radio.checked = false;
  });

  if (targetEl) {
    const cardEl = targetEl.closest('.bundle-card') || targetEl;
    cardEl.classList.add('active');
    const radio = cardEl.querySelector('input[type="radio"]');
    if (radio) radio.checked = true;
  }

  // Price Display Updates
  const heroPriceCurrent = document.querySelector('.price-current');
  const heroPriceOriginal = document.querySelector('.price-original');
  const heroPriceSave = document.querySelector('.price-save');
  const stickyPrice = document.querySelector('.s-price');

  if (bundleType === 'single') {
    if (heroPriceCurrent) heroPriceCurrent.innerText = 'Rs 220';
    if (heroPriceOriginal) heroPriceOriginal.innerText = 'Rs 599';
    if (heroPriceSave) heroPriceSave.innerText = 'Save 63% (Rs 379 OFF)';
    if (stickyPrice) stickyPrice.innerHTML = 'Rs 220 <del>Rs 599</del>';
  } else if (bundleType === 'double' || bundleType === 'pack3' || bundleType === 'triple') {
    if (heroPriceCurrent) heroPriceCurrent.innerText = 'Rs 399';
    if (heroPriceOriginal) heroPriceOriginal.innerText = 'Rs 1,198';
    if (heroPriceSave) heroPriceSave.innerText = 'Save 67% (Rs 799 OFF)';
    if (stickyPrice) stickyPrice.innerHTML = 'Rs 399 <del>Rs 1,198</del>';
  }
}

// Step 4: Live Millisecond Countdown Timer
let totalMs = (9 * 60 + 42) * 1000 + 180;
function startTimer() {
  const timerEl = document.getElementById('timer');
  if (!timerEl) return;

  setInterval(() => {
    if (totalMs > 0) {
      totalMs -= 10;
    }
    if (totalMs < 0) totalMs = 0;

    const mins = Math.floor(totalMs / 60000);
    const secs = Math.floor((totalMs % 60000) / 1000);
    const ms = Math.floor((totalMs % 1000) / 10);

    const formattedMins = String(mins).padStart(2, '0');
    const formattedSecs = String(secs).padStart(2, '0');
    const formattedMs = String(ms).padStart(2, '0');

    timerEl.innerText = `${formattedMins}m : ${formattedSecs}s : ${formattedMs}ms`;
  }, 10);
}

// Step 5: Checkout Trigger Function
function triggerCheckout(element) {
  const targetEl = element || (typeof event !== 'undefined' ? (event.currentTarget || event.target) : null);
  const isSticky = targetEl && (targetEl.classList.contains('sticky-buy-btn') || targetEl.closest('.mobile-sticky-bar'));

  if (isSticky) {
    const buySection = document.getElementById('buy-now');
    if (buySection) {
      buySection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  alert("🛒 Redirecting to Fast One-Tap Checkout with Cash on Delivery options...");
}

// Step 6 & Accessibility Enhancements on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  // Start Countdown Timer
  startTimer();

  // Make interactive elements focusable for accessibility
  const interactiveSelectors = ['.thumb', '.color-pill', '.bundle-card', '.vibe-btn'];
  interactiveSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      if (!el.hasAttribute('tabindex')) {
        el.setAttribute('tabindex', '0');
      }
      if (!el.hasAttribute('role')) {
        el.setAttribute('role', 'button');
      }
    });
  });

  // Step 6: Keyboard navigation listeners (keydown Enter/Space)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.code === 'Space') {
      const activeEl = document.activeElement;
      if (activeEl && (
        activeEl.classList.contains('thumb') ||
        activeEl.classList.contains('color-pill') ||
        activeEl.classList.contains('bundle-card') ||
        activeEl.classList.contains('vibe-btn')
      )) {
        e.preventDefault();
        activeEl.click();
      }
    }
  });

  // FAQ Accordion Icon Toggle Logic
  document.querySelectorAll('.faq-item').forEach(details => {
    details.addEventListener('toggle', () => {
      const icon = details.querySelector('.faq-icon');
      if (icon) {
        icon.textContent = details.open ? '−' : '+';
      }
    });
    const icon = details.querySelector('.faq-icon');
    if (icon) {
      icon.textContent = details.open ? '−' : '+';
    }
  });
});
