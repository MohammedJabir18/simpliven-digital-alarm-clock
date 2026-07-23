/**
 * Simpliven™ Shopify Storefront API Permalinks & Pricing Helper
 * File: shopify.js
 */

// Storefront Configuration
const SHOPIFY_CONFIG = {
  storeDomain: "a1vwxm-qr.myshopify.com", // Always use Shopify store domain — never derive from current hostname
  productId: "9823593169131",
  defaultVariantId: "49072796926187",
  productHandle: "simpliven™-smart-led-mirror-alarm-clock-large-digital-display-temperature-display-usb-powered-modern-bedside-table-clock-for-bedroom-office-study",
  discountCode: "SIMPLIVEN60"
};

var SHOPIFY_STORE_DOMAIN = SHOPIFY_CONFIG.storeDomain;
var DEFAULT_VARIANT_ID = SHOPIFY_CONFIG.defaultVariantId;

var PRICING_CONFIG = {
  prepaid: {
    price: 799,
    formattedPrice: "₹799.00",
    subtotal: 1999,
    formattedSubtotal: "₹1,999.00",
    savings: 1200,
    formattedSavings: "₹1,200.00",
    tag: "Instant UPI Discount (60% OFF)",
    discountCode: "PREPAID60"
  },
  partial_cod: {
    price: 799,
    formattedPrice: "₹799.00",
    subtotal: 1999,
    formattedSubtotal: "₹1,999.00",
    savings: 1200,
    formattedSavings: "₹1,200.00",
    tag: "Partial COD (₹199 Deposit + ₹600 COD)",
    advance: 199,
    formattedAdvance: "₹199.00",
    codBalance: 600,
    formattedCodBalance: "₹600.00",
    discountCode: "PARTIALCOD"
  },
  full_cod: {
    price: 799,
    formattedPrice: "₹799.00",
    subtotal: 1999,
    formattedSubtotal: "₹1,999.00",
    savings: 1200,
    formattedSavings: "₹1,200.00",
    tag: "Full Cash on Delivery",
    discountCode: "FULLCOD"
  }
};

/**
 * Generate full Shopify checkout permalink URL
 * @param {string} variantId - Shopify Variant ID (defaults to DEFAULT_VARIANT_ID)
 * @param {number} quantity - Quantity of product (defaults to 1)
 * @param {string} paymentMode - Selected payment tier ('prepaid', 'partial_cod', or 'full_cod')
 * @returns {string} Permalink URL
 */
function generateShopifyCheckoutUrl(variantId, quantity, paymentMode) {
  var vId = variantId || DEFAULT_VARIANT_ID;
  var qty = (typeof quantity === 'number' && quantity > 0) ? quantity : 1;
  var mode = paymentMode || 'prepaid';
  // Always use the hardcoded Shopify config domain — never window.SHOPIFY_STORE_DOMAIN
  // which could incorrectly resolve to the Netlify/CDN hostname.
  var domain = SHOPIFY_CONFIG.storeDomain;
  
  return `https://${domain}/cart/${vId}:${qty}?discount=PREPAID60&checkout[payment_mode]=${mode}`;
}

/**
 * Get pricing details for a selected payment tier
 * @param {string} paymentMode - Selected payment tier ('prepaid', 'partial_cod', or 'full_cod')
 * @returns {object} Pricing details object
 */
function getPricingDetails(paymentMode) {
  var mode = paymentMode || 'prepaid';
  return PRICING_CONFIG[mode] || PRICING_CONFIG.prepaid;
}

/**
 * Redirect browser to Shopify checkout permalink for specified payment mode
 * @param {string} paymentMode - Selected payment tier ('prepaid', 'partial_cod', or 'full_cod')
 * @param {string} variantId - Optional Shopify Variant ID
 * @param {number} quantity - Optional quantity
 * @returns {string} The checkout URL constructed
 */
function redirectShopifyCheckout(paymentMode, variantId, quantity) {
  var checkoutUrl = generateShopifyCheckoutUrl(variantId, quantity, paymentMode);
  if (typeof window !== 'undefined' && window.location) {
    window.location.href = checkoutUrl;
  }
  return checkoutUrl;
}

// Global window object exposure for browser scripts
if (typeof window !== 'undefined') {
  window.SHOPIFY_STORE_DOMAIN = SHOPIFY_STORE_DOMAIN;
  window.DEFAULT_VARIANT_ID = DEFAULT_VARIANT_ID;
  window.PRICING_CONFIG = PRICING_CONFIG;
  window.generateShopifyCheckoutUrl = generateShopifyCheckoutUrl;
  window.getPricingDetails = getPricingDetails;
  window.redirectShopifyCheckout = redirectShopifyCheckout;
}

// CommonJS module export for testing or Node environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SHOPIFY_STORE_DOMAIN: SHOPIFY_STORE_DOMAIN,
    DEFAULT_VARIANT_ID: DEFAULT_VARIANT_ID,
    PRICING_CONFIG: PRICING_CONFIG,
    generateShopifyCheckoutUrl: generateShopifyCheckoutUrl,
    getPricingDetails: getPricingDetails,
    redirectShopifyCheckout: redirectShopifyCheckout
  };
}
