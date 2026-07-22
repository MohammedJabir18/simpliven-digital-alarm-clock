// Theme Switcher Function
function setTheme(themeName) {
  document.body.className = '';
  document.body.classList.add('theme-' + themeName);

  document.querySelectorAll('.vibe-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
}

// Media Switcher for Hero Stage
function switchMedia(type, src) {
  const container = document.querySelector('.main-media-frame');
  document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
  event.currentTarget.classList.add('active');

  if (type === 'video') {
    container.innerHTML = `
      <video autoplay loop muted playsinline poster="assets/images/hero.png">
        <source src="${src}" type="video/mp4">
      </video>
      <div class="badge-live-views"><span class="dot-live"></span> <span>248 people viewing this now</span></div>
      <div class="badge-discount">-60% OFF TODAY</div>
    `;
  } else {
    container.innerHTML = `
      <img src="${src}" alt="Product image">
      <div class="badge-live-views"><span class="dot-live"></span> <span>248 people viewing this now</span></div>
      <div class="badge-discount">-60% OFF TODAY</div>
    `;
  }
}

// Color finish selection
function selectColor(colorName, element) {
  document.querySelectorAll('.color-pill').forEach(el => el.classList.remove('active'));
  element.classList.add('active');
  document.getElementById('selected-color').innerText = colorName;
}

// Bundle selection
function selectBundle(bundleType, element) {
  document.querySelectorAll('.bundle-card').forEach(card => {
    card.classList.remove('active');
    card.querySelector('input[type="radio"]').checked = false;
  });
  element.classList.add('active');
  element.querySelector('input[type="radio"]').checked = true;
}

// Countdown timer simulation
let totalMs = (9 * 60 + 42) * 1000;
setInterval(() => {
  if (totalMs > 0) totalMs -= 100;
  let mins = Math.floor(totalMs / 60000);
  let secs = Math.floor((totalMs % 60000) / 1000);
  let ms = Math.floor((totalMs % 1000) / 10);

  document.getElementById('timer').innerText = 
    `${mins < 10 ? '0' + mins : mins}m : ${secs < 10 ? '0' + secs : secs}s : ${ms < 10 ? '0' + ms : ms}ms`;
}, 100);

// Checkout Action trigger
function triggerCheckout() {
  alert("🛒 Redirecting to Fast One-Tap Checkout with Cash on Delivery options...");
}
