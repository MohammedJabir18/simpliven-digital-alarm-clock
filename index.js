// Helper to cleanly resolve target element from passed parameter (Element or Event) or global fallback
function resolveElement(elementOrEvent) {
  if (!elementOrEvent) {
    return (typeof window !== 'undefined' && window.event) ? (window.event.currentTarget || window.event.target || null) : null;
  }
  if (elementOrEvent instanceof Element || (typeof elementOrEvent === 'object' && elementOrEvent.nodeType === 1)) {
    return elementOrEvent;
  }
  if (typeof elementOrEvent === 'object' && (elementOrEvent.currentTarget || elementOrEvent.target)) {
    return elementOrEvent.currentTarget || elementOrEvent.target;
  }
  return (typeof window !== 'undefined' && window.event) ? (window.event.currentTarget || window.event.target || null) : null;
}

// Theme Switcher Function
function setTheme(themeName, element) {
  document.body.className = '';
  document.body.classList.add('theme-' + themeName);

  document.querySelectorAll('.vibe-btn').forEach(btn => btn.classList.remove('active'));
  const targetEl = resolveElement(element);
  if (targetEl) {
    const btn = targetEl.closest('.vibe-btn') || targetEl;
    btn.classList.add('active');
  }
}

// Display Mode Switcher (Day / Night / Mirror)
function setDisplayMode(mode, element) {
  const targetEl = resolveElement(element);
  document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
  if (targetEl) {
    const btn = targetEl.closest('.mode-btn') || targetEl;
    btn.classList.add('active');
  }

  const frame = document.getElementById('media-frame');
  if (!frame) return;

  if (mode === 'day') {
    frame.style.filter = 'brightness(1) contrast(1)';
    frame.style.opacity = '1';
  } else if (mode === 'night') {
    frame.style.filter = 'brightness(0.55) contrast(1.1)';
    frame.style.opacity = '0.9';
  } else if (mode === 'mirror') {
    frame.style.filter = 'grayscale(0.3) brightness(1.1) contrast(1.2)';
    frame.style.opacity = '1';
  }
}

// Hotspot Info Toast
function showHotspotInfo(feature) {
  if (feature === 'mirror') {
    alert("🪞 HD Vanity Mirror Finish:\nWhen turned off or dimmed, the crystal-clear display doubles as an elegant vanity mirror for makeup and grooming.");
  } else if (feature === 'temp') {
    alert("🌡️ Smart Room Temperature Sensor:\nTracks room ambient temperature in real time (°C / °F), keeping your sleep and work space optimal.");
  } else if (feature === 'dimmer') {
    alert("🌙 Auto Night-Dimmer Mode:\nAutomatically dims brightness by 70% between 18:00 and 06:00 to prevent night eye strain.");
  }
}


// Step 1: Media Switcher for Hero Stage
function switchMedia(type, src, element) {
  const targetEl = resolveElement(element);
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
  const targetEl = resolveElement(element);
  document.querySelectorAll('.color-pill').forEach(el => el.classList.remove('active'));
  if (targetEl) {
    const pillEl = targetEl.closest('.color-pill') || targetEl;
    pillEl.classList.add('active');
  }
  const selectedColorEl = document.getElementById('selected-color');
  if (selectedColorEl) {
    selectedColorEl.innerText = colorName;
  }
}

// Step 3: Bundle Builder
function selectBundle(bundleType, element) {
  const targetEl = resolveElement(element);
  
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
let timerInterval = null;
const DEFAULT_DURATION_MS = (9 * 60 + 42) * 1000 + 180;

function startTimer(durationMs = DEFAULT_DURATION_MS) {
  const timerEl = document.getElementById('timer');
  if (!timerEl) return;

  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  const endTime = Date.now() + durationMs;

  const updateTimer = () => {
    let remainingMs = endTime - Date.now();
    if (remainingMs <= 0) {
      remainingMs = 0;
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
    }

    const mins = Math.floor(remainingMs / 60000);
    const secs = Math.floor((remainingMs % 60000) / 1000);
    const ms = Math.floor((remainingMs % 1000) / 10);

    const formattedMins = String(mins).padStart(2, '0');
    const formattedSecs = String(secs).padStart(2, '0');
    const formattedMs = String(ms).padStart(2, '0');

    timerEl.innerText = `${formattedMins}m : ${formattedSecs}s : ${formattedMs}ms`;
  };

  updateTimer();
  timerInterval = setInterval(updateTimer, 50);
}

// Step 5: Checkout Trigger Function
function triggerCheckout(element) {
  const targetEl = resolveElement(element);
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
