/**
 * Simpliven™ Master Interactive Application & Motion Engine — Skincare Aesthetic layout
 * File: app.js
 * Version: 6.0.0
 *
 * Shopify Storefront API connection: live price + inventory fetched via ShopifyClient (shopify.js)
 */

document.addEventListener('DOMContentLoaded', () => {
    initDragSlider();
    initBundleSelector();
    initStickyDrawer();
    initMediaTheater();
    initFAQAccordion();
    initFinalCTA();
    initNavScroll();
    initLazyMedia();
    initOptionSync();
    initShopifyLiveData(); // 🔴 Live Shopify price + stock — runs async in background
});

// App Global State
const appState = {
    selectedBundle: 1, // Default: 1x Single Setup
    selectedColor: 'emerald', // Default LED color
    paymentMode: 'prepaid', // 'prepaid' | 'full_cod'
    prices: {
        1: { base: 799, name: "Single Setup" },
        2: { base: 1499, name: "Dual Bedroom Pack" },
        3: { base: 1999, name: "Home Syndicate Kit" }
    }
};

// ─── Shopify Live Data Bootstrap ─────────────────────────────────────────────
// Fetches real-time price and inventory from Shopify Storefront API on page load.
// Falls back silently to the hardcoded appState values if the API is unavailable.
async function initShopifyLiveData() {
    if (!window.ShopifyClient || typeof window.ShopifyClient.fetchProductData !== 'function') {
        console.warn('[Simpliven] ShopifyClient not available — using hardcoded prices.');
        return;
    }

    try {
        const product = await window.ShopifyClient.fetchProductData();
        if (!product) return;

        // ── Update base price from Shopify (single unit price = bundle index 1) ──
        const livePrice = product.price; // e.g. 799
        if (livePrice && livePrice > 0) {
            // Scale bundle prices relative to live single-unit price
            appState.prices[1].base = livePrice;
            appState.prices[2].base = Math.round(livePrice * 1.875); // ~2x with slight discount
            appState.prices[3].base = Math.round(livePrice * 2.5);   // ~3x with bigger discount
            updateStorefrontPrices(); // Re-render all price displays with live data
        }

        // ── Update stock counter with real Shopify inventory ──
        const liveStock = product.totalInventory;
        if (typeof liveStock === 'number' && liveStock > 0) {
            const stockEl = document.getElementById('stock-counter');
            if (stockEl) {
                const displayStock = Math.min(liveStock, 14); // Cap display at 14 for scarcity
                stockEl.innerText = `${displayStock} UNITS LEFT`;
            }
        }

        // ── Show out-of-stock state if unavailable ──
        if (!product.availableForSale) {
            const btns = [
                document.getElementById('hero-checkout-trigger'),
                document.getElementById('final-checkout-btn'),
                document.getElementById('sticky-checkout-btn'),
            ];
            btns.forEach(btn => {
                if (btn) {
                    btn.disabled = true;
                    btn.innerText = 'Out of Stock';
                    btn.style.opacity = '0.5';
                }
            });
        }

        console.log('[Simpliven] Live Shopify data loaded:', {
            price: product.price,
            inventory: product.totalInventory,
            available: product.availableForSale,
        });
    } catch (err) {
        // Silent fallback — hardcoded prices remain active
        console.warn('[Simpliven] Could not fetch live Shopify data:', err.message);
    }
}

function calculatePrice() {
    const bundle = appState.prices[appState.selectedBundle];
    let finalPrice = bundle.base;

    if (appState.paymentMode === 'prepaid') {
        finalPrice = finalPrice - 50; // Prepaid discount ₹50
    } else {
        finalPrice = finalPrice + 49; // COD fee ₹49
    }
    return finalPrice;
}

function updateStorefrontPrices() {
    const price = calculatePrice();
    const formattedPrice = `₹${price.toLocaleString('en-IN')}`;
    
    // Update Hero CTA Button
    const heroCheckoutBtn = document.getElementById('hero-checkout-trigger');
    if (heroCheckoutBtn) {
        heroCheckoutBtn.innerHTML = `<span>Order Now — ${formattedPrice}</span><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>`;
    }

    // Update Price display in Hero Details
    const activePriceText = document.getElementById('price-active-val');
    const originalPriceText = document.getElementById('price-original-val');
    if (activePriceText) {
        const bundle = appState.prices[appState.selectedBundle];
        activePriceText.innerText = `₹${bundle.base.toLocaleString('en-IN')}.00`;
    }
    if (originalPriceText) {
        const bundle = appState.prices[appState.selectedBundle];
        const originalPrice = bundle.base === 799 ? 1999 : (bundle.base === 1499 ? 2999 : 3999);
        originalPriceText.innerText = `₹${originalPrice.toLocaleString('en-IN')}.00`;
    }

    // Update Final CTA Button
    const finalCheckoutBtn = document.getElementById('final-checkout-btn');
    if (finalCheckoutBtn) {
        finalCheckoutBtn.innerText = `SECURE CHECKOUT • ${formattedPrice}`;
    }

    // Update Sticky Drawer Info
    const stickyTitle = document.getElementById('sticky-title-display');
    const stickyPrice = document.getElementById('sticky-price-display');
    const stickyBtn = document.getElementById('sticky-checkout-btn');
    
    if (stickyTitle) {
        const bundle = appState.prices[appState.selectedBundle];
        stickyTitle.innerText = `Simpliven™ ${bundle.name}`;
    }
    if (stickyPrice) {
        stickyPrice.innerText = formattedPrice;
    }
    if (stickyBtn) {
        stickyBtn.setAttribute('data-active-bundle', appState.selectedBundle);
    }
}

function initOptionSync() {
    const optionTabs = Array.from(document.querySelectorAll('.option-tab'));
    const swatches = Array.from(document.querySelectorAll('.option-swatch'));
    if (!optionTabs.length && !swatches.length) return;

    const colorLabel = document.getElementById('selected-color-tab-text');

    const colorNames = {
        emerald: "Emerald Green",
        blue: "Sapphire Blue",
        white: "Crystal White"
    };

    const colorIndices = {
        emerald: 0,
        blue: 1,
        white: 2
    };

    const syncColor = (color) => {
        appState.selectedColor = color;
        
        // Update Option Tabs active state
        optionTabs.forEach(tab => {
            if (tab.getAttribute('data-color') === color) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Update Swatches active state
        swatches.forEach(swatch => {
            if (swatch.getAttribute('data-color') === color) {
                swatch.classList.add('active');
            } else {
                swatch.classList.remove('active');
            }
        });

        // Update label text
        if (colorLabel) {
            colorLabel.innerText = colorNames[color];
        }

        // Auto-scroll media theater gallery to matching image index
        const matchIdx = colorIndices[color];
        const updateGalleryFn = window.updateGalleryShowcase;
        if (typeof updateGalleryFn === 'function') {
            updateGalleryFn(matchIdx);
        }

        triggerHaptic();
    };

    optionTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const color = tab.getAttribute('data-color');
            syncColor(color);
        });
    });

    swatches.forEach(swatch => {
        swatch.addEventListener('click', () => {
            const color = swatch.getAttribute('data-color');
            syncColor(color);
        });
    });
}

function initDragSlider() {
    const slider = document.getElementById('before-after-slider');
    const beforeImg = document.getElementById('before-image');
    const handle = document.getElementById('slider-handle');

    if (!slider || !beforeImg || !handle) return;

    let rect = null;
    let currentPercent = 50;
    let ticking = false;

    const updateSlider = (percent) => {
        percent = Math.max(0, Math.min(100, percent));
        currentPercent = percent;
        
        beforeImg.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
        handle.style.left = `${percent}%`;
        
        slider.setAttribute('aria-valuenow', Math.round(percent));
    };

    const onDrag = (clientX) => {
        if (!rect) {
            rect = slider.getBoundingClientRect();
        }
        const x = clientX - rect.left;
        const percent = (x / rect.width) * 100;
        updateSlider(percent);
    };

    const dragMove = (e) => {
        if (e.cancelable) {
            e.preventDefault();
        }
        
        if (!ticking) {
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            window.requestAnimationFrame(() => {
                onDrag(clientX);
                ticking = false;
            });
            ticking = true;
        }
    };

    const stopDragging = () => {
        slider.classList.remove('is-dragging');
        window.removeEventListener('mousemove', dragMove);
        window.removeEventListener('mouseup', stopDragging);
        window.removeEventListener('touchmove', dragMove);
        window.removeEventListener('touchend', stopDragging);
        rect = null;
    };

    const startDragging = (e) => {
        if (e.type === 'mousedown' && e.button !== 0) return;
        
        slider.classList.add('is-dragging');
        rect = slider.getBoundingClientRect();
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        onDrag(clientX);

        window.addEventListener('mousemove', dragMove);
        window.addEventListener('mouseup', stopDragging);
        window.addEventListener('touchmove', dragMove, { passive: false });
        window.addEventListener('touchend', stopDragging);
        
        if (e.cancelable) {
            e.preventDefault();
        }
    };

    slider.addEventListener('mousedown', startDragging);
    slider.addEventListener('touchstart', startDragging, { passive: false });

    slider.addEventListener('keydown', (e) => {
        let step = 0;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            step = -5;
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            step = 5;
        } else if (e.key === 'Home') {
            step = -currentPercent;
        } else if (e.key === 'End') {
            step = 100 - currentPercent;
        }

        if (step !== 0) {
            e.preventDefault();
            updateSlider(currentPercent + step);
        }
    });
}

function initBundleSelector() {
    const cards = Array.from(document.querySelectorAll('.radio-card-item'));
    const heroCheckoutBtn = document.getElementById('hero-checkout-trigger');

    if (!cards.length || !heroCheckoutBtn) return;

    const selectCard = (card) => {
        cards.forEach(c => {
            c.classList.remove('active');
            c.setAttribute('aria-checked', 'false');
            c.setAttribute('tabindex', '-1');
        });
        
        card.classList.add('active');
        card.setAttribute('aria-checked', 'true');
        card.setAttribute('tabindex', '0');
        
        appState.selectedBundle = Number(card.getAttribute('data-bundle'));
        updateStorefrontPrices();
        triggerHaptic();
    };

    cards.forEach((card, index) => {
        card.addEventListener('click', () => {
            selectCard(card);
        });

        card.addEventListener('keydown', (e) => {
            let nextIndex = index;
            let shouldSelect = false;

            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                nextIndex = (index + 1) % cards.length;
                shouldSelect = true;
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                nextIndex = (index - 1 + cards.length) % cards.length;
                shouldSelect = true;
            } else if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                shouldSelect = true;
            }

            if (shouldSelect) {
                const targetCard = cards[nextIndex];
                selectCard(targetCard);
                targetCard.focus();
            }
        });
    });

    // Handle Hero payment mode selections
    const paymentModeRadios = document.querySelectorAll('input[name="hero_payment_mode"]');
    paymentModeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            appState.paymentMode = e.target.value;
            updateStorefrontPrices();
            triggerHaptic();
        });
    });

    heroCheckoutBtn.addEventListener('click', () => {
        triggerSecureCheckout();
    });
}

function triggerSecureCheckout() {
    const qty = appState.selectedBundle; // 1, 2, or 3 units

    // ── Animate all CTA buttons to loading state ──
    const heroBtn  = document.getElementById('hero-checkout-trigger');
    const finalBtn = document.getElementById('final-checkout-btn');
    const stickyBtn = document.getElementById('sticky-checkout-btn');

    [heroBtn, finalBtn, stickyBtn].forEach(btn => {
        if (btn) {
            btn.innerHTML = `<span>Securing Your Order...</span>`;
            btn.disabled = true;
        }
    });

    // ── Delegate entirely to ShopifyClient (shopify.js) ──
    // ShopifyClient.triggerShopifyCheckout handles:
    //   1. Creating a real Shopify Cart via Storefront API → getting a real checkoutUrl
    //   2. Graceful permalink fallback if API is unavailable or token not yet configured
    if (window.ShopifyClient && typeof window.ShopifyClient.triggerShopifyCheckout === 'function') {
        window.ShopifyClient.triggerShopifyCheckout(qty, appState.paymentMode);
    } else {
        // Hard fallback: direct Shopify permalink (never points to simpliven.com)
        const variantId = '49072796926187';
        const domain    = 'a1vwxm-qr.myshopify.com';
        const discount  = appState.paymentMode === 'prepaid' ? 'PREPAID60' : 'FULLCOD';
        window.location.href = `https://${domain}/cart/${variantId}:${qty}?discount=${discount}`;
    }
}

function initStickyDrawer() {
    const drawer = document.getElementById('sticky-checkout-drawer');
    const checkoutBtn = document.getElementById('sticky-checkout-btn');

    if (!drawer || !checkoutBtn) return;

    let isShown = false;
    let ticking = false;

    const checkScroll = () => {
        const shouldShow = window.scrollY > 350;
        if (shouldShow !== isShown) {
            isShown = shouldShow;
            if (isShown) {
                drawer.classList.add('show');
            } else {
                drawer.classList.remove('show');
            }
        }
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(checkScroll);
            ticking = true;
        }
    }, { passive: true });

    checkoutBtn.addEventListener('click', () => {
        triggerSecureCheckout();
    });

    // Initialize initial values
    updateStorefrontPrices();
}

function initMediaTheater() {
    const theater = document.getElementById('valo-media-theater');
    const slides = Array.from(document.querySelectorAll('.theater-slide'));
    const tabs = Array.from(document.querySelectorAll('.control-tab'));
    const video = document.getElementById('ugc-video');
    
    if (!theater || !slides.length || !tabs.length) return;

    let activeIndex = 0;

    const playVideo = () => {
        if (video) {
            video.currentTime = 0;
            video.play().catch(err => console.log('Autoplay blocked:', err));
        }
    };

    const pauseVideo = () => {
        if (video) {
            video.pause();
        }
    };

    const updateActiveSlide = (index) => {
        slides[activeIndex].classList.remove('active');
        tabs[activeIndex].classList.remove('active');
        tabs[activeIndex].setAttribute('aria-selected', 'false');

        if (activeIndex === 1) {
            pauseVideo();
        }

        activeIndex = index;

        slides[activeIndex].classList.add('active');
        tabs[activeIndex].classList.add('active');
        tabs[activeIndex].setAttribute('aria-selected', 'true');

        if (activeIndex === 1) {
            playVideo();
        }
        triggerHaptic();
    };

    tabs.forEach((tab, i) => {
        tab.addEventListener('click', () => {
            if (activeIndex === i) return;
            updateActiveSlide(i);
        });
    });

    // Gallery Showcase Images controller inside Slide 1
    const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
    const thumbs = Array.from(document.querySelectorAll('.gallery-thumb'));
    const mainCanvas = document.querySelector('.gallery-main-canvas');
    let galleryIndex = 0;

    if (galleryItems.length) {
        const updateGallery = (idx) => {
            if (galleryItems[galleryIndex]) {
                galleryItems[galleryIndex].classList.remove('active');
                galleryItems[galleryIndex].style.transform = 'scale(1)';
                galleryItems[galleryIndex].style.transformOrigin = 'center center';
            }
            if (thumbs[galleryIndex]) thumbs[galleryIndex].classList.remove('active');

            galleryIndex = (idx + galleryItems.length) % galleryItems.length;

            if (galleryItems[galleryIndex]) {
                galleryItems[galleryIndex].classList.add('active');
            }
            if (thumbs[galleryIndex]) {
                thumbs[galleryIndex].classList.add('active');
            }
        };

        // Expose function globally
        window.updateGalleryShowcase = updateGallery;

        // Hover & Click preview switching on thumbnails
        thumbs.forEach((thumb, i) => {
            const handleThumbSelect = () => {
                if (galleryIndex !== i) {
                    updateGallery(i);
                }
            };
            thumb.addEventListener('mouseenter', handleThumbSelect);
            thumb.addEventListener('click', handleThumbSelect);
        });

        // Circular Magnifying Glass Lens Controller
        const circularLens = document.getElementById('circular-magnifier-lens');

        if (mainCanvas && circularLens) {
            const zoomRatio = 1.2;

            const handleMouseEnter = () => {
                const activeItem = mainCanvas.querySelector('.gallery-item.active');
                if (!activeItem) return;

                const bgStyle = activeItem.style.backgroundImage || window.getComputedStyle(activeItem).backgroundImage;
                circularLens.style.backgroundImage = bgStyle;

                const rect = mainCanvas.getBoundingClientRect();
                circularLens.style.backgroundSize = `${rect.width * zoomRatio}px ${rect.height * zoomRatio}px`;
                circularLens.style.display = 'block';
            };

            const handleMouseMove = (e) => {
                const activeItem = mainCanvas.querySelector('.gallery-item.active');
                if (!activeItem) return;

                const bgStyle = activeItem.style.backgroundImage || window.getComputedStyle(activeItem).backgroundImage;
                if (circularLens.style.backgroundImage !== bgStyle) {
                    circularLens.style.backgroundImage = bgStyle;
                }

                const rect = mainCanvas.getBoundingClientRect();
                const lensWidth = circularLens.offsetWidth || 180;
                const lensHeight = circularLens.offsetHeight || 180;
                const lensRadiusX = lensWidth / 2;
                const lensRadiusY = lensHeight / 2;

                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;

                // Clamp lens position inside canvas boundaries so circle is never clipped at edges
                let lensX = mouseX - lensRadiusX;
                let lensY = mouseY - lensRadiusY;
                const maxLensX = rect.width - lensWidth;
                const maxLensY = rect.height - lensHeight;

                if (lensX < 0) lensX = 0;
                if (lensY < 0) lensY = 0;
                if (lensX > maxLensX) lensX = maxLensX;
                if (lensY > maxLensY) lensY = maxLensY;

                circularLens.style.left = `${lensX}px`;
                circularLens.style.top = `${lensY}px`;

                // Set scaled background size & pixel-exact background offset
                const bgWidth = rect.width * zoomRatio;
                const bgHeight = rect.height * zoomRatio;
                circularLens.style.backgroundSize = `${bgWidth}px ${bgHeight}px`;

                const bgPosX = -(mouseX * zoomRatio - (mouseX - lensX));
                const bgPosY = -(mouseY * zoomRatio - (mouseY - lensY));

                circularLens.style.backgroundPosition = `${bgPosX}px ${bgPosY}px`;
            };

            const handleMouseLeave = () => {
                circularLens.style.display = 'none';
            };

            mainCanvas.addEventListener('mouseenter', handleMouseEnter);
            mainCanvas.addEventListener('mousemove', handleMouseMove);
            mainCanvas.addEventListener('mouseleave', handleMouseLeave);
        }
    }
}

function initFAQAccordion() {
    const faqItems = Array.from(document.querySelectorAll('.faq-item'));
    if (!faqItems.length) return;

    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-trigger');
        const answer = item.querySelector('.faq-content');

        if (!questionBtn || !answer) return;

        questionBtn.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    const otherBtn = otherItem.querySelector('.faq-trigger');
                    const otherAnswer = otherItem.querySelector('.faq-content');

                    if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
                    if (otherAnswer) {
                        otherAnswer.setAttribute('aria-hidden', 'true');
                        otherAnswer.style.maxHeight = null;
                    }
                }
            });

            if (isActive) {
                item.classList.remove('active');
                questionBtn.setAttribute('aria-expanded', 'false');
                answer.setAttribute('aria-hidden', 'true');
                answer.style.maxHeight = null;
            } else {
                item.classList.add('active');
                questionBtn.setAttribute('aria-expanded', 'true');
                answer.setAttribute('aria-hidden', 'false');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
            triggerHaptic();
        });
    });
}

function initFinalCTA() {
    const finalBtn = document.getElementById('final-checkout-btn');
    if (!finalBtn) return;

    finalBtn.addEventListener('click', () => {
        triggerSecureCheckout();
    });

    initStockCounter();
}

function initStockCounter() {
    const stockEl = document.getElementById('stock-counter');
    if (!stockEl) return;

    // Live inventory is loaded by initShopifyLiveData() and written to stockEl.
    // This function runs a visual countdown animation from whatever value is already displayed.
    let stockUnits = parseInt(stockEl.innerText, 10) || 14;

    const interval = setInterval(() => {
        if (Math.random() > 0.7) {
            stockUnits -= 1;
            if (stockUnits < 4) {
                stockUnits = 4;
                clearInterval(interval);
            }
            stockEl.innerText = `${stockUnits} UNITS LEFT`;
            stockEl.style.color = '#e11d48';
            setTimeout(() => {
                stockEl.style.color = '';
            }, 300);
        }
    }, 20000);
}

function initNavScroll() {
    const buyBtn = document.getElementById('nav-buy-trigger');
    const links = Array.from(document.querySelectorAll('.nav-link'));

    if (buyBtn) {
        buyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.getElementById('hero-checkout-trigger') || document.getElementById('bundle-selector');
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                const trigger = document.getElementById('hero-checkout-trigger');
                if (trigger) trigger.focus({ preventScroll: true });
            }
        });
    }

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            const target = document.querySelector(href);
            
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

function initLazyMedia() {
    const imgs = document.querySelectorAll('img.lazy-blur');
    imgs.forEach(img => {
        const onImgLoad = () => {
            img.classList.remove('lazy-blur');
            const parent = img.closest('.loading-active');
            if (parent) {
                parent.classList.remove('loading-active');
            }
        };

        if (img.complete) {
            onImgLoad();
        } else {
            img.addEventListener('load', onImgLoad, { once: true });
            img.addEventListener('error', onImgLoad, { once: true });
        }
    });

    const galleryItems = document.querySelectorAll('.gallery-item.lazy-blur');
    galleryItems.forEach(item => {
        const bgImgStyle = item.style.backgroundImage || window.getComputedStyle(item).backgroundImage;
        if (bgImgStyle && bgImgStyle !== 'none') {
            const urlMatch = bgImgStyle.match(/url\\(['\"]?([^'\"]+)['\"]?\\)/) || bgImgStyle.match(/url\(([^)]+)\)/);
            if (urlMatch && urlMatch[1]) {
                const src = urlMatch[1].replace(/['\"]/g, "");
                const img = new Image();
                const onBgLoad = () => {
                    item.classList.remove('lazy-blur');
                };
                img.onload = onBgLoad;
                img.onerror = onBgLoad;
                img.src = src;
                if (img.complete) {
                    onBgLoad();
                }
            } else {
                item.classList.remove('lazy-blur');
            }
        } else {
            item.classList.remove('lazy-blur');
        }
    });

    const videos = document.querySelectorAll('video.lazy-blur');
    videos.forEach(video => {
        const onVideoLoad = () => {
            video.classList.remove('lazy-blur');
            const parent = video.closest('.loading-active');
            if (parent) {
                parent.classList.remove('loading-active');
            }
        };

        if (video.readyState >= 2) {
            onVideoLoad();
        } else {
            video.addEventListener('loadeddata', onVideoLoad, { once: true });
            video.addEventListener('canplay', onVideoLoad, { once: true });
            video.addEventListener('error', onVideoLoad, { once: true });
        }
    });
}

function triggerHaptic() {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(10);
    }
}
