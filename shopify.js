/**
 * Simpliven™ Shopify Storefront API Client
 * File: shopify.js
 * Version: 2.0.0
 *
 * ⚠️  SECURITY NOTE:
 * Only the STOREFRONT access token belongs here.
 * Never put your Admin API secret in this file.
 * The Storefront token is intentionally public-safe (read-only).
 */

// ─── Configuration ───────────────────────────────────────────────────────────

const SHOPIFY_CONFIG = {
  storeDomain:            'a1vwxm-qr.myshopify.com',
  storefrontApiVersion:   '2024-01',
  // Token is loaded from shopify.config.local.js (gitignored) at runtime.
  // To set it: open shopify.config.local.js and paste your Storefront API token.
  storefrontAccessToken:  (typeof window !== 'undefined' && window.__SHOPIFY_STOREFRONT_TOKEN__)
                            || 'YOUR_STOREFRONT_ACCESS_TOKEN',
  productHandle:          'simpliven™-smart-led-mirror-alarm-clock-large-digital-display-temperature-display-usb-powered-modern-bedside-table-clock-for-bedroom-office-study',
  defaultVariantId:       'gid://shopify/ProductVariant/49072796926187',
  discountCode:           'PREPAID60',
};


// ─── GraphQL Endpoint ─────────────────────────────────────────────────────────

const STOREFRONT_ENDPOINT = `https://${SHOPIFY_CONFIG.storeDomain}/api/${SHOPIFY_CONFIG.storefrontApiVersion}/graphql.json`;

// ─── Storefront GraphQL Helper ────────────────────────────────────────────────

async function storefrontQuery(query, variables) {
  try {
    const response = await fetch(STOREFRONT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_CONFIG.storefrontAccessToken,
      },
      body: JSON.stringify({ query, variables }),
    });
    if (!response.ok) {
      throw new Error(`Storefront API HTTP ${response.status}`);
    }
    const json = await response.json();
    if (json.errors && json.errors.length) {
      console.error('[Simpliven] Storefront API errors:', json.errors);
    }
    return json.data;
  } catch (err) {
    console.error('[Simpliven] Storefront API request failed:', err);
    return null;
  }
}

// ─── Fetch Live Product Data ──────────────────────────────────────────────────

const PRODUCT_QUERY = `
  query GetProduct($handle: String!) {
    productByHandle(handle: $handle) {
      id
      title
      availableForSale
      totalInventory
      variants(first: 10) {
        edges {
          node {
            id
            title
            availableForSale
            quantityAvailable
            priceV2 {
              amount
              currencyCode
            }
            compareAtPriceV2 {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

async function fetchProductData() {
  const data = await storefrontQuery(PRODUCT_QUERY, {
    handle: SHOPIFY_CONFIG.productHandle,
  });
  if (!data || !data.productByHandle) return null;

  const product = data.productByHandle;
  const variants = product.variants.edges.map(e => e.node);

  return {
    id:               product.id,
    title:            product.title,
    availableForSale: product.availableForSale,
    totalInventory:   product.totalInventory,
    variants,
    // Convenience: first variant price as a number
    price: variants.length
      ? Math.round(parseFloat(variants[0].priceV2.amount))
      : 799,
    compareAtPrice: variants.length && variants[0].compareAtPriceV2
      ? Math.round(parseFloat(variants[0].compareAtPriceV2.amount))
      : 1999,
  };
}

// ─── Create Cart & Get Checkout URL ──────────────────────────────────────────

const CART_CREATE_MUTATION = `
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Create a Shopify cart for the given variant/quantity and return the checkout URL.
 * @param {string} variantGid  - Shopify variant GID  e.g. "gid://shopify/ProductVariant/49072796926187"
 * @param {number} quantity    - Item quantity
 * @param {string} discountCode- Discount code to apply (optional)
 * @returns {Promise<string|null>} Shopify-generated checkout URL
 */
async function createCartAndGetCheckoutUrl(variantGid, quantity, discountCode) {
  const input = {
    lines: [{ merchandiseId: variantGid, quantity }],
  };
  if (discountCode) {
    input.discountCodes = [discountCode];
  }

  const data = await storefrontQuery(CART_CREATE_MUTATION, { input });
  if (!data || !data.cartCreate) return null;

  const { cart, userErrors } = data.cartCreate;
  if (userErrors && userErrors.length) {
    console.error('[Simpliven] Cart errors:', userErrors);
  }
  return cart ? cart.checkoutUrl : null;
}

// ─── Checkout Permalink Fallback ──────────────────────────────────────────────
// Used if the Storefront API token is not yet configured or a request fails.

function buildFallbackCheckoutUrl(variantNumericId, quantity, discount) {
  const qty = quantity > 0 ? quantity : 1;
  const disc = discount || SHOPIFY_CONFIG.discountCode;
  return `https://${SHOPIFY_CONFIG.storeDomain}/cart/${variantNumericId}:${qty}?discount=${disc}`;
}

// ─── Main Checkout Trigger ────────────────────────────────────────────────────

/**
 * The single entry-point called by app.js when any "Order Now" button is clicked.
 *
 * @param {number} quantity    - Number of units (maps to bundle: 1, 2, or 3)
 * @param {string} paymentMode - 'prepaid' | 'partial_cod' | 'full_cod'
 */
async function triggerShopifyCheckout(quantity, paymentMode) {
  const qty = quantity > 0 ? quantity : 1;

  // Decide which discount code to apply based on payment mode
  const discountCode = paymentMode === 'prepaid'
    ? 'PREPAID60'
    : paymentMode === 'partial_cod'
      ? 'PARTIALCOD'
      : 'FULLCOD';

  // If the Storefront token is not yet configured, fall back to permalink
  if (SHOPIFY_CONFIG.storefrontAccessToken === 'YOUR_STOREFRONT_ACCESS_TOKEN') {
    console.warn('[Simpliven] Storefront token not configured — using permalink fallback.');
    window.location.href = buildFallbackCheckoutUrl(
      '49072796926187', qty, discountCode
    );
    return;
  }

  // Attempt to create a real Shopify cart
  const checkoutUrl = await createCartAndGetCheckoutUrl(
    SHOPIFY_CONFIG.defaultVariantId,
    qty,
    discountCode
  );

  if (checkoutUrl) {
    window.location.href = checkoutUrl;
  } else {
    // API failed — graceful fallback to permalink
    console.warn('[Simpliven] Cart creation failed — using permalink fallback.');
    window.location.href = buildFallbackCheckoutUrl(
      '49072796926187', qty, discountCode
    );
  }
}

// ─── Expose Public API ────────────────────────────────────────────────────────

if (typeof window !== 'undefined') {
  window.ShopifyClient = {
    config:                      SHOPIFY_CONFIG,
    fetchProductData,
    createCartAndGetCheckoutUrl,
    triggerShopifyCheckout,
    buildFallbackCheckoutUrl,
  };

  // Legacy compatibility — app.js calls window.redirectShopifyCheckout
  window.redirectShopifyCheckout = function(paymentMode, _variantId, quantity) {
    triggerShopifyCheckout(quantity || 1, paymentMode || 'prepaid');
  };
}

// CommonJS (Node/testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SHOPIFY_CONFIG,
    fetchProductData,
    createCartAndGetCheckoutUrl,
    triggerShopifyCheckout,
    buildFallbackCheckoutUrl,
  };
}
