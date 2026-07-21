/**
 * Simpliven™ Smart Digital LED Mirror Alarm Clock - Interactive Storefront Script
 * File: index.js
 */

document.addEventListener('DOMContentLoaded', () => {
  // Ensure window.ShopifyStorefront namespace exists with fallback handlers
  if (typeof window !== 'undefined' && !window.ShopifyStorefront) {
    window.ShopifyStorefront = {
      getPricingDetails: window.getPricingDetails || function(mode) {
        var config = {
          prepaid: { price: 799, formattedPrice: "₹799.00", subtotal: 1999, formattedSubtotal: "₹1,999.00", savings: 1200, formattedSavings: "₹1,200.00" },
          partial_cod: { price: 829, formattedPrice: "₹829.00", subtotal: 1999, formattedSubtotal: "₹1,999.00", savings: 1170, formattedSavings: "₹1,170.00" },
          full_cod: { price: 959, formattedPrice: "₹959.00", subtotal: 1999, formattedSubtotal: "₹1,999.00", savings: 1040, formattedSavings: "₹1,040.00" }
        };
        return config[mode] || config.prepaid;
      },
      redirectShopifyCheckout: window.redirectShopifyCheckout || function(mode) {
        if (typeof window.redirectShopifyCheckout === 'function') {
          return window.redirectShopifyCheckout(mode);
        }
        var domain = window.SHOPIFY_STORE_DOMAIN || "simpliven.myshopify.com";
        var variantId = window.DEFAULT_VARIANT_ID || "45678901234567";
        var checkoutUrl = "https://" + domain + "/cart/" + variantId + ":1?discount=PREPAID60&checkout[payment_mode]=" + mode;
        window.location.href = checkoutUrl;
        return checkoutUrl;
      }
    };
  }

  /* ==========================================================================
     1. Gallery Thumbnail Switcher
     ========================================================================== */
  const mainProductImg = document.getElementById('main-product-img');
  const thumbnailImages = document.querySelectorAll('.thumbnail-strip img');

  if (mainProductImg && thumbnailImages.length > 0) {
    thumbnailImages.forEach(thumb => {
      thumb.addEventListener('click', () => {
        const newSrc = thumb.getAttribute('data-src') || thumb.getAttribute('src');
        if (newSrc) {
          mainProductImg.src = newSrc;
        }
        thumbnailImages.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      });
    });
  }

  /* ==========================================================================
     2. Video Modal Overlay Launcher
     ========================================================================== */
  const videoModal = document.getElementById('video-modal');
  const modalVideoPlayer = document.getElementById('modal-video-player');
  const closeVideoBtn = document.getElementById('close-video-btn');
  const heroVideoTrigger = document.getElementById('hero-video-trigger');
  const videoCards = document.querySelectorAll('.video-card');

  function openVideoModal(videoSrc) {
    if (!videoModal || !modalVideoPlayer || !videoSrc) return;
    modalVideoPlayer.src = videoSrc;
    videoModal.classList.add('active');
    modalVideoPlayer.play().catch(err => {
      console.log('Video autoplay prevented:', err);
    });
  }

  function closeVideoModal() {
    if (!videoModal || !modalVideoPlayer) return;
    modalVideoPlayer.pause();
    modalVideoPlayer.removeAttribute('src');
    modalVideoPlayer.load();
    videoModal.classList.remove('active');
  }

  if (heroVideoTrigger) {
    heroVideoTrigger.addEventListener('click', () => {
      const defaultVideo = "Product Videos/minimalist_mirror_LED_digital__1784613410913_HD.mp4";
      openVideoModal(defaultVideo);
    });
  }

  if (videoCards.length > 0) {
    videoCards.forEach(card => {
      card.addEventListener('click', () => {
        const videoSrc = card.getAttribute('data-video');
        if (videoSrc) {
          openVideoModal(videoSrc);
        }
      });
    });
  }

  if (closeVideoBtn) {
    closeVideoBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeVideoModal();
    });
  }

  if (videoModal) {
    videoModal.addEventListener('click', (e) => {
      if (e.target === videoModal) {
        closeVideoModal();
      }
    });
  }

  /* ==========================================================================
     3. Interactive Live LED Clock Simulator
     ========================================================================== */
  const ledTimeDigits = document.getElementById('led-time-digits');
  const ledAmPm = document.getElementById('led-am-pm');
  const ledTempDigits = document.getElementById('led-temp-digits');
  const clockDisplayFrame = document.getElementById('clock-display-frame');

  const simBtn12h = document.getElementById('sim-btn-12h');
  const simBtn24h = document.getElementById('sim-btn-24h');
  const simBtnCelsius = document.getElementById('sim-btn-celsius');
  const simBtnFahrenheit = document.getElementById('sim-btn-fahrenheit');
  const simBtnBright = document.getElementById('sim-btn-bright');
  const simBtnMedium = document.getElementById('sim-btn-medium');
  const simBtnNight = document.getElementById('sim-btn-night');

  let is12Hour = true;
  let isCelsius = true;

  function updateClockDisplay() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');

    if (is12Hour) {
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const formattedHours = String(hours).padStart(2, '0');
      if (ledTimeDigits) ledTimeDigits.textContent = `${formattedHours}:${minutes}`;
      if (ledAmPm) {
        ledAmPm.textContent = ampm;
        ledAmPm.style.display = 'inline';
      }
    } else {
      const formattedHours = String(hours).padStart(2, '0');
      if (ledTimeDigits) ledTimeDigits.textContent = `${formattedHours}:${minutes}`;
      if (ledAmPm) {
        ledAmPm.textContent = '';
        ledAmPm.style.display = 'none';
      }
    }

    if (ledTempDigits) {
      if (isCelsius) {
        ledTempDigits.textContent = '24°C';
      } else {
        ledTempDigits.textContent = '75°F';
      }
    }
  }

  updateClockDisplay();
  setInterval(updateClockDisplay, 1000);

  if (simBtn12h && simBtn24h) {
    simBtn12h.addEventListener('click', () => {
      is12Hour = true;
      simBtn12h.classList.add('active');
      simBtn24h.classList.remove('active');
      updateClockDisplay();
    });

    simBtn24h.addEventListener('click', () => {
      is12Hour = false;
      simBtn24h.classList.add('active');
      simBtn12h.classList.remove('active');
      updateClockDisplay();
    });
  }

  if (simBtnCelsius && simBtnFahrenheit) {
    simBtnCelsius.addEventListener('click', () => {
      isCelsius = true;
      simBtnCelsius.classList.add('active');
      simBtnFahrenheit.classList.remove('active');
      updateClockDisplay();
    });

    simBtnFahrenheit.addEventListener('click', () => {
      isCelsius = false;
      simBtnFahrenheit.classList.add('active');
      simBtnCelsius.classList.remove('active');
      updateClockDisplay();
    });
  }

  if (clockDisplayFrame) {
    if (simBtnBright) {
      simBtnBright.addEventListener('click', () => {
        simBtnBright.classList.add('active');
        if (simBtnMedium) simBtnMedium.classList.remove('active');
        if (simBtnNight) simBtnNight.classList.remove('active');
        clockDisplayFrame.style.opacity = '1';
        clockDisplayFrame.style.boxShadow = 'inset 0 0 30px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 242, 254, 0.35)';
      });
    }

    if (simBtnMedium) {
      simBtnMedium.addEventListener('click', () => {
        simBtnMedium.classList.add('active');
        if (simBtnBright) simBtnBright.classList.remove('active');
        if (simBtnNight) simBtnNight.classList.remove('active');
        clockDisplayFrame.style.opacity = '0.75';
        clockDisplayFrame.style.boxShadow = 'inset 0 0 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 242, 254, 0.2)';
      });
    }

    if (simBtnNight) {
      simBtnNight.addEventListener('click', () => {
        simBtnNight.classList.add('active');
        if (simBtnBright) simBtnBright.classList.remove('active');
        if (simBtnMedium) simBtnMedium.classList.remove('active');
        clockDisplayFrame.style.opacity = '0.45';
        clockDisplayFrame.style.boxShadow = 'inset 0 0 30px rgba(0, 0, 0, 0.9), 0 0 10px rgba(0, 242, 254, 0.1)';
      });
    }
  }

  /* ==========================================================================
     4. Cart Drawer & 3-Tier Payment Switcher
     ========================================================================== */
  const cartDrawer = document.getElementById('cart-drawer');
  const cartBackdrop = document.getElementById('cart-backdrop');
  const openCartBtn = document.getElementById('open-cart-btn');
  const heroBuyNowBtn = document.getElementById('hero-buy-now-btn');
  const heroCodBtn = document.getElementById('hero-cod-btn');
  const stickyBuyBtn = document.getElementById('sticky-buy-btn');
  const closeCartBtn = document.getElementById('close-cart-btn');

  const paymentRadios = document.querySelectorAll('input[name="payment_mode"]');
  const cartItemPrice = document.getElementById('cart-item-price');
  const summarySubtotal = document.getElementById('summary-subtotal');
  const summaryDiscount = document.getElementById('summary-discount');
  const summaryFinalTotal = document.getElementById('summary-final-total');
  const shopifyCheckoutBtn = document.getElementById('shopify-checkout-btn');

  function openCart(presetMode) {
    if (cartDrawer && cartBackdrop) {
      cartDrawer.classList.add('active');
      cartBackdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    if (presetMode) {
      const targetRadio = document.querySelector(`input[name="payment_mode"][value="${presetMode}"]`);
      if (targetRadio) {
        targetRadio.checked = true;
        updatePaymentTier(presetMode);
      }
    }
  }

  function closeCart() {
    if (cartDrawer && cartBackdrop) {
      cartDrawer.classList.remove('active');
      cartBackdrop.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (openCartBtn) openCartBtn.addEventListener('click', () => openCart());
  if (heroBuyNowBtn) heroBuyNowBtn.addEventListener('click', () => openCart('prepaid'));
  if (heroCodBtn) heroCodBtn.addEventListener('click', () => openCart('partial_cod'));
  if (stickyBuyBtn) stickyBuyBtn.addEventListener('click', () => openCart('prepaid'));

  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
  if (cartBackdrop) cartBackdrop.addEventListener('click', closeCart);

  function updatePaymentTier(selectedMode) {
    paymentRadios.forEach(radio => {
      const tierOption = radio.closest('.tier-option');
      if (tierOption) {
        if (radio.value === selectedMode) {
          tierOption.classList.add('active');
        } else {
          tierOption.classList.remove('active');
        }
      }
    });

    const pricing = window.ShopifyStorefront.getPricingDetails(selectedMode);

    if (pricing) {
      if (cartItemPrice) cartItemPrice.textContent = pricing.formattedPrice;
      if (summarySubtotal) summarySubtotal.textContent = pricing.formattedSubtotal;
      if (summaryDiscount) {
        summaryDiscount.textContent = `-₹${pricing.savings.toLocaleString('en-IN')}.00`;
      }
      if (summaryFinalTotal) summaryFinalTotal.textContent = pricing.formattedPrice;
    }
  }

  paymentRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      updatePaymentTier(e.target.value);
    });
  });

  if (shopifyCheckoutBtn) {
    shopifyCheckoutBtn.addEventListener('click', () => {
      const selectedRadio = document.querySelector('input[name="payment_mode"]:checked');
      const selectedMode = selectedRadio ? selectedRadio.value : 'prepaid';
      window.ShopifyStorefront.redirectShopifyCheckout(selectedMode);
    });
  }

  /* ==========================================================================
     5. FAQ Accordion
     ========================================================================== */
  const faqQuestions = document.querySelectorAll('.faq-question');

  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const faqItem = question.closest('.faq-item');
      if (faqItem) {
        const isActive = faqItem.classList.contains('active');
        document.querySelectorAll('.faq-item').forEach(item => {
          if (item !== faqItem) item.classList.remove('active');
        });
        if (isActive) {
          faqItem.classList.remove('active');
        } else {
          faqItem.classList.add('active');
        }
      }
    });
  });

  /* ==========================================================================
     6. Sticky Buy Bar
     ========================================================================== */
  const stickyBuyBar = document.getElementById('sticky-buy-bar');
  const heroSection = document.querySelector('.hero-section');

  if (stickyBuyBar && heroSection) {
    if ('IntersectionObserver' in window) {
      const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) {
            stickyBuyBar.style.display = 'block';
          } else {
            stickyBuyBar.style.display = 'none';
          }
        });
      }, {
        threshold: 0.1
      });
      heroObserver.observe(heroSection);
    } else {
      window.addEventListener('scroll', () => {
        const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
        if (window.scrollY > heroBottom - 100) {
          stickyBuyBar.style.display = 'block';
        } else {
          stickyBuyBar.style.display = 'none';
        }
      });
    }
  }
});
