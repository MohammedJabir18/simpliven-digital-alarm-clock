/**
 * Simpliven™ Smart Digital LED Mirror Alarm Clock
 * Core Application JavaScript (assets/js/app.js)
 * Minimalist Redesign Interactive State Logic & 3-Tier Payment Strategy
 */

document.addEventListener('DOMContentLoaded', () => {
  initInteractiveHotspots();
  initExpressCheckoutModal();
  initPinCodeChecker();
  initFaqAccordion();
  initStickyMobileBar();
  initUrgencyTimer();
});

/* ==========================================================================
   1. Day / Night Mode Light Simulator (Deprecated / Safely Handled Stub)
   ========================================================================== */
function initDayNightSimulator() {
  // Unused in simplified hero design; safely handled.
}

/* ==========================================================================
   2. Minimalist Hotspots & Bento Cards
   ========================================================================== */
function initInteractiveHotspots() {
  const hotspotNodes = document.querySelectorAll('.hotspot-node');
  const featureCards = document.querySelectorAll('.feature-card, .hotspot-card, .bento-card');

  if (!hotspotNodes.length) return;

  function highlightHotspot(targetIdx) {
    hotspotNodes.forEach((node, idx) => {
      if (idx === targetIdx) {
        node.classList.add('active');
        node.style.borderColor = '#111111';
        node.style.transform = 'scale(1.08)';
      } else {
        node.classList.remove('active');
        node.style.borderColor = '';
        node.style.transform = '';
      }
    });

    featureCards.forEach((card, idx) => {
      if (idx === targetIdx) {
        card.classList.add('active', 'highlight');
        card.style.borderColor = '#111111';
        card.style.transform = 'scale(1.01)';
        card.style.transition = 'border-color 0.2s ease, transform 0.2s ease';
      } else {
        card.classList.remove('active', 'highlight');
        card.style.borderColor = '';
        card.style.transform = '';
      }
    });
  }

  hotspotNodes.forEach((node, index) => {
    ['mouseenter', 'click'].forEach(eventType => {
      node.addEventListener(eventType, (e) => {
        if (eventType === 'click') e.stopPropagation();
        highlightHotspot(index);
      });
    });
  });

  featureCards.forEach((card, index) => {
    ['mouseenter', 'click'].forEach(eventType => {
      card.addEventListener(eventType, () => {
        highlightHotspot(index);
      });
    });
  });
}

/* ==========================================================================
   3. Express Checkout Modal & 3-Tier Dynamic Payment Pricing
   ========================================================================== */
function initExpressCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  const closeModalBtn = document.getElementById('close-modal') || document.querySelector('.close-modal-btn');
  const buyTriggers = document.querySelectorAll('.header-cta, #hero-buy-btn, #open-checkout-mobile, .btn-primary:not([type="submit"]):not(.checkout-submit-btn)');
  const orderForm = document.getElementById('order-form');
  const paymentRadios = document.querySelectorAll('input[name="payment-method"], input[name="payment-mode"]');
  const submitBtn = orderForm ? orderForm.querySelector('button[type="submit"], .checkout-submit-btn') : null;
  const priceReadoutEl = document.getElementById('modal-price-readout') || document.querySelector('.modal-price-readout, .price-readout-text, #payment-price-readout');

  window.openCheckoutModal = function(e) {
    if (e) e.preventDefault();
    if (modal) {
      modal.classList.add('active');
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeCheckoutModal = function() {
    if (modal) {
      modal.classList.remove('active');
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  };

  buyTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (btn.tagName === 'BUTTON' && btn.type === 'submit') return;
      window.openCheckoutModal(e);
    });
  });

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.closeCheckoutModal();
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        window.closeCheckoutModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && (modal.classList.contains('active') || modal.style.display === 'flex')) {
      window.closeCheckoutModal();
    }
  });

  // Dynamic 3-Tier Payment Pricing Updater
  function updatePaymentPricing() {
    const selectedRadio = document.querySelector('input[name="payment-method"]:checked, input[name="payment-mode"]:checked');
    const paymentVal = selectedRadio ? selectedRadio.value : 'prepaid';
    
    let btnHtml = '';
    let priceText = '';

    switch (paymentVal) {
      case 'prepaid':
        btnHtml = '🚀 PLACE ORDER NOW — ₹799 (FREE SHIPPING)';
        priceText = '⚡ Full Prepaid UPI/Card Selected — Total: ₹799 (Save Extra ₹160 vs Full COD)';
        break;
      case 'partial':
        btnHtml = '🛡️ PAY ₹199 ADVANCE NOW (Pay ₹630 on Delivery)';
        priceText = '🛡️ Partial Payment Selected — Pay ₹199 Advance Now + Pay ₹630 on Delivery (Total ₹829)';
        break;
      case 'cod':
        btnHtml = '💵 CONFIRM FULL COD ORDER — ₹959';
        priceText = '💵 Full Cash on Delivery Selected — Total: ₹959 at Doorstep';
        break;
      default:
        btnHtml = '🚀 PLACE ORDER NOW — ₹799 (FREE SHIPPING)';
        priceText = '⚡ Full Prepaid UPI/Card Selected — Total: ₹799 (Save Extra ₹160 vs Full COD)';
        break;
    }

    if (submitBtn) {
      submitBtn.innerHTML = btnHtml;
    }

    if (priceReadoutEl) {
      priceReadoutEl.textContent = priceText;
    }
  }

  paymentRadios.forEach(radio => {
    radio.addEventListener('change', updatePaymentPricing);
  });

  // Initial pricing state calculation
  updatePaymentPricing();

  // Form Submit Handler
  if (orderForm) {
    window.handleFormSubmit = function(e) {
      if (e) e.preventDefault();

      if (!orderForm.checkValidity()) {
        orderForm.reportValidity();
        return;
      }

      const nameInput = document.getElementById('customer-name');
      const customerName = nameInput ? nameInput.value.trim() : '';
      const selectedRadio = document.querySelector('input[name="payment-method"]:checked, input[name="payment-mode"]:checked');
      const paymentMode = selectedRadio ? selectedRadio.value : 'prepaid';

      let confirmationDetails = '';
      if (paymentMode === 'prepaid') {
        confirmationDetails = 'Prepaid ₹799 Selected';
      } else if (paymentMode === 'partial') {
        confirmationDetails = 'Partial ₹199 Advance Selected (Pay ₹630 on Delivery)';
      } else if (paymentMode === 'cod') {
        confirmationDetails = 'Full COD ₹959 Selected';
      } else {
        confirmationDetails = 'Prepaid ₹799 Selected';
      }

      const toastMessage = `Order Confirmed${customerName ? ' for ' + customerName : ''}! ${confirmationDetails}. Redirecting to checkout...`;

      window.closeCheckoutModal();
      showToastNotification(toastMessage);

      if (typeof window.redirectShopifyCheckout === 'function') {
        window.redirectShopifyCheckout(paymentMode);
      }
    };

    orderForm.addEventListener('submit', window.handleFormSubmit);
  }
}

function showToastNotification(message) {
  const existingToast = document.querySelector('.minimalist-toast');
  if (existingToast) existingToast.remove();

  const toast = document.createElement('div');
  toast.className = 'minimalist-toast';
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: #111111;
    color: #ffffff;
    padding: 16px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 10px 25px rgba(0,0,0,0.25);
    z-index: 10000;
    max-width: 380px;
    transition: opacity 0.3s ease, transform 0.3s ease;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/* ==========================================================================
   4. Indian PIN Code Estimator
   ========================================================================== */
function initPinCodeChecker() {
  const pinBtn = document.getElementById('pin-check-btn');
  const pinInput = document.getElementById('pin-check-input');
  const pinResult = document.getElementById('pin-result');

  if (!pinBtn || !pinInput) return;

  function validatePin() {
    const val = pinInput.value.trim();
    if (/^\d{6}$/.test(val)) {
      if (pinResult) {
        pinResult.style.color = '#10b981';
        pinResult.style.marginTop = '8px';
        pinResult.style.fontSize = '14px';
        pinResult.textContent = `✓ Delivery Available to ${val}! Guaranteed Delivery in 3-4 Days. Cash on Delivery Available.`;
      }
    } else {
      if (pinResult) {
        pinResult.style.color = '#ef4444';
        pinResult.style.marginTop = '8px';
        pinResult.style.fontSize = '14px';
        pinResult.textContent = `✕ Invalid PIN Code. Please enter a valid 6-digit Indian PIN code.`;
      }
    }
  }

  pinBtn.addEventListener('click', validatePin);
  pinInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      validatePin();
    }
  });
}

/* ==========================================================================
   5. Minimalist FAQ Accordion
   ========================================================================== */
function initFaqAccordion() {
  const faqHeaders = document.querySelectorAll('.faq-question, .accordion-header');

  faqHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.faq-item, .accordion-item');
      if (!item) return;

      const isActive = item.classList.contains('active');

      document.querySelectorAll('.faq-item, .accordion-item').forEach(el => {
        el.classList.remove('active');
        const icon = el.querySelector('.faq-icon, .accordion-icon, .toggle-icon');
        if (icon) icon.textContent = '+';
      });

      if (!isActive) {
        item.classList.add('active');
        const icon = item.querySelector('.faq-icon, .accordion-icon, .toggle-icon');
        if (icon) icon.textContent = '−';
      }
    });
  });
}

/* ==========================================================================
   6. Mobile Sticky Bar Scroll Trigger
   ========================================================================== */
function initStickyMobileBar() {
  const mobileBar = document.getElementById('mobile-bar') || document.querySelector('.mobile-sticky-bar');

  if (!mobileBar) return;

  function handleScroll() {
    const isMobile = window.innerWidth <= 768;
    const scrollY = window.scrollY || window.pageYOffset;

    if (isMobile && scrollY > 400) {
      mobileBar.style.display = 'flex';
      mobileBar.classList.add('active', 'visible', 'show');
    } else {
      mobileBar.style.display = 'none';
      mobileBar.classList.remove('active', 'visible', 'show');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', handleScroll, { passive: true });
  handleScroll();
}

/* ==========================================================================
   7. Urgency Countdown Timer
   ========================================================================== */
function initUrgencyTimer() {
  let timerElement = document.getElementById('urgency-timer');
  if (!timerElement) return;

  let totalSeconds = 15 * 60;
  const savedEndTime = localStorage.getItem('simpliven_timer_end');
  const now = Math.floor(Date.now() / 1000);

  if (savedEndTime && parseInt(savedEndTime, 10) > now) {
    totalSeconds = parseInt(savedEndTime, 10) - now;
  } else {
    localStorage.setItem('simpliven_timer_end', (now + totalSeconds).toString());
  }

  function updateTimerDisplay() {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    timerElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    if (totalSeconds > 0) {
      totalSeconds--;
    } else {
      totalSeconds = 15 * 60;
      localStorage.setItem('simpliven_timer_end', (Math.floor(Date.now() / 1000) + totalSeconds).toString());
    }
  }

  updateTimerDisplay();
  setInterval(updateTimerDisplay, 1000);
}
