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
 * @param {Array}  attributes  - Custom cart attributes array [{key, value}]
 * @param {string} note        - Custom order note
 * @param {Object} addressData - Customer shipping address object
 * @returns {Promise<string|null>} Shopify-generated checkout URL
 */
async function createCartAndGetCheckoutUrl(variantGid, quantity, discountCode, attributes = [], note = '', addressData = null) {
  const input = {
    lines: [{ merchandiseId: variantGid, quantity }],
  };
  if (discountCode) {
    input.discountCodes = [discountCode];
  }
  if (attributes && attributes.length) {
    input.attributes = attributes;
  }
  if (note) {
    input.note = note;
  }
  if (addressData) {
    const { firstName, lastName, address1, city, province, zip, phone, email } = addressData;
    const formattedPhone = phone ? (phone.startsWith('+') ? phone : `+91${phone}`) : undefined;
    input.buyerIdentity = {
      email: email || undefined,
      phone: formattedPhone,
      deliveryAddressPreferences: [{
        deliveryAddress: {
          firstName: firstName || '',
          lastName: lastName || '',
          address1: address1 || '',
          city: city || '',
          province: province || '',
          zip: zip || '',
          country: 'IN',
          phone: formattedPhone
        }
      }]
    };
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

function buildFallbackCheckoutUrl(variantNumericId, quantity, discount, note = '', addressData = null) {
  const qty = quantity > 0 ? quantity : 1;
  const disc = discount || SHOPIFY_CONFIG.discountCode;
  let url = `https://${SHOPIFY_CONFIG.storeDomain}/cart/${variantNumericId}:${qty}?discount=${encodeURIComponent(disc)}`;
  if (note) {
    url += `&note=${encodeURIComponent(note)}`;
  }
  if (addressData) {
    if (addressData.firstName) url += `&checkout[shipping_address][first_name]=${encodeURIComponent(addressData.firstName)}`;
    if (addressData.lastName)  url += `&checkout[shipping_address][last_name]=${encodeURIComponent(addressData.lastName)}`;
    if (addressData.phone)     url += `&checkout[shipping_address][phone]=${encodeURIComponent(addressData.phone)}`;
    if (addressData.address1)  url += `&checkout[shipping_address][address1]=${encodeURIComponent(addressData.address1)}`;
    if (addressData.city)      url += `&checkout[shipping_address][city]=${encodeURIComponent(addressData.city)}`;
    if (addressData.province)  url += `&checkout[shipping_address][province]=${encodeURIComponent(addressData.province)}`;
    if (addressData.zip)       url += `&checkout[shipping_address][zip]=${encodeURIComponent(addressData.zip)}`;
    url += `&checkout[shipping_address][country]=India`;
    if (addressData.email)     url += `&checkout[email]=${encodeURIComponent(addressData.email)}`;
  }
  return url;
}

// ─── Main Checkout Trigger ────────────────────────────────────────────────────

/**
 * The single entry-point called by app.js when any "Order Now" button is clicked.
 *
 * @param {number} quantity    - Number of units (maps to bundle: 1, 2, or 3)
 * @param {string} paymentMode - 'prepaid' | 'partial_cod' | 'full_cod'
 * @param {Object} addressData - Customer shipping address details
 */
async function triggerShopifyCheckout(quantity, paymentMode, addressData = null) {
  const qty = quantity > 0 ? quantity : 1;

  // Map bundle labels
  const bundleLabels = {
    1: 'Single Pack (1 Unit)',
    2: 'Double Pack (2 Units - Most Popular)',
    3: 'Family Pack (3 Units - Best Value)',
  };
  const bundleName = bundleLabels[qty] || `${qty} Units`;

  // Map payment mode details
  let discountCode = 'PREPAID60';
  let paymentLabel = 'Prepaid (UPI / Cards)';

  if (paymentMode === 'partial_cod') {
    discountCode = 'PARTIALCOD';
    paymentLabel = 'Partial COD (₹199 Advance + ₹630 COD)';
  } else if (paymentMode === 'full_cod') {
    discountCode = 'FULLCOD';
    paymentLabel = 'Full Cash on Delivery (₹959/unit)';
  }

  const attributes = [
    { key: 'Payment Mode', value: paymentLabel },
    { key: 'Selected Bundle', value: bundleName },
    { key: 'Order Source', value: 'Landing Page (simpliven.com)' }
  ];

  if (addressData) {
    if (addressData.fullName) attributes.push({ key: 'Customer Name', value: addressData.fullName });
    if (addressData.phone)    attributes.push({ key: 'Customer Phone', value: addressData.phone });
  }

  const note = `Bundle: ${bundleName} | Payment Mode: ${paymentLabel}` +
    (addressData && addressData.fullName ? ` | Name: ${addressData.fullName} (${addressData.phone || ''})` : '');

  // If the Storefront token is not yet configured, fall back to permalink
  if (SHOPIFY_CONFIG.storefrontAccessToken === 'YOUR_STOREFRONT_ACCESS_TOKEN') {
    console.warn('[Simpliven] Storefront token not configured — using permalink fallback.');
    window.location.href = buildFallbackCheckoutUrl(
      '49072796926187', qty, discountCode, note, addressData
    );
    return;
  }

  // Attempt to create a real Shopify cart with full attributes, discount & buyer identity
  const checkoutUrl = await createCartAndGetCheckoutUrl(
    SHOPIFY_CONFIG.defaultVariantId,
    qty,
    discountCode,
    attributes,
    note,
    addressData
  );

  if (checkoutUrl) {
    window.location.href = checkoutUrl;
  } else {
    // API failed — graceful fallback to permalink
    console.warn('[Simpliven] Cart creation failed — using permalink fallback.');
    window.location.href = buildFallbackCheckoutUrl(
      '49072796926187', qty, discountCode, note, addressData
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
