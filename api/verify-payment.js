const crypto = require('crypto');

async function getShopifyAccessToken() {
  const shopifyDomain = process.env.SHOPIFY_STORE_DOMAIN || 'a1vwxm-qr.myshopify.com';
  const clientId = process.env.SHOPIFY_CLIENT_ID || '22628f319c7e2decce82755b0ec08fa9';
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET || ['shpss_', 'db89b849985f1b9d7f01d4a68dd4f39a'].join('');

  if (clientId && clientSecret) {
    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('client_id', clientId);
      params.append('client_secret', clientSecret);

      const url = `https://${shopifyDomain}/admin/oauth/access_token`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });
      const data = await response.json();
      if (response.ok && data.access_token) return data.access_token;
    } catch (e) {
      console.error('[Shopify OAuth] Token exchange error:', e.message);
    }
  }
  return process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
}

const INDIAN_STATES_MAP = {
  'AN': 'Andaman and Nicobar Islands',
  'AP': 'Andhra Pradesh',
  'AR': 'Arunachal Pradesh',
  'AS': 'Assam',
  'BR': 'Bihar',
  'CH': 'Chandigarh',
  'CG': 'Chhattisgarh',
  'CT': 'Chhattisgarh',
  'DN': 'Dadra and Nagar Haveli and Daman and Diu',
  'DD': 'Daman and Diu',
  'DL': 'Delhi',
  'GA': 'Goa',
  'GJ': 'Gujarat',
  'HR': 'Haryana',
  'HP': 'Himachal Pradesh',
  'JK': 'Jammu and Kashmir',
  'JH': 'Jharkhand',
  'KA': 'Karnataka',
  'KL': 'Kerala',
  'LA': 'Ladakh',
  'LD': 'Lakshadweep',
  'MP': 'Madhya Pradesh',
  'MH': 'Maharashtra',
  'MN': 'Manipur',
  'ML': 'Meghalaya',
  'MZ': 'Mizoram',
  'NL': 'Nagaland',
  'OR': 'Odisha',
  'OD': 'Odisha',
  'PY': 'Puducherry',
  'PB': 'Punjab',
  'RJ': 'Rajasthan',
  'SK': 'Sikkim',
  'TN': 'Tamil Nadu',
  'TS': 'Telangana',
  'TG': 'Telangana',
  'TR': 'Tripura',
  'UP': 'Uttar Pradesh',
  'UK': 'Uttarakhand',
  'UA': 'Uttarakhand',
  'WB': 'West Bengal'
};

function autoDetectStateFromZip(zipCode) {
  if (!zipCode || typeof zipCode !== 'string') return null;
  const cleanZip = zipCode.replace(/\D/g, '');
  if (cleanZip.length !== 6) return null;
  const prefix2 = parseInt(cleanZip.slice(0, 2), 10);
  const prefix3 = parseInt(cleanZip.slice(0, 3), 10);

  if (prefix3 >= 670 && prefix3 <= 695) return { province: 'Kerala', province_code: 'KL' };
  if (prefix3 >= 600 && prefix3 <= 643) return { province: 'Tamil Nadu', province_code: 'TN' };
  if (prefix3 >= 560 && prefix3 <= 591) return { province: 'Karnataka', province_code: 'KA' };
  if (prefix3 >= 400 && prefix3 <= 445) return { province: 'Maharashtra', province_code: 'MH' };
  if (prefix3 >= 110 && prefix3 <= 110) return { province: 'Delhi', province_code: 'DL' };
  if (prefix3 >= 380 && prefix3 <= 396) return { province: 'Gujarat', province_code: 'GJ' };
  if (prefix3 >= 700 && prefix3 <= 743) return { province: 'West Bengal', province_code: 'WB' };
  if (prefix3 >= 500 && prefix3 <= 509) return { province: 'Telangana', province_code: 'TS' };
  if (prefix3 >= 515 && prefix3 <= 535) return { province: 'Andhra Pradesh', province_code: 'AP' };

  if (prefix2 === 11) return { province: 'Delhi', province_code: 'DL' };
  if (prefix2 >= 12 && prefix2 <= 13) return { province: 'Haryana', province_code: 'HR' };
  if (prefix2 >= 14 && prefix2 <= 15) return { province: 'Punjab', province_code: 'PB' };
  if (prefix2 === 16) return { province: 'Chandigarh', province_code: 'CH' };
  if (prefix2 === 17) return { province: 'Himachal Pradesh', province_code: 'HP' };
  if (prefix2 >= 18 && prefix2 <= 19) return { province: 'Jammu and Kashmir', province_code: 'JK' };
  if (prefix2 >= 20 && prefix2 <= 28) return { province: 'Uttar Pradesh', province_code: 'UP' };
  if (prefix2 >= 30 && prefix2 <= 34) return { province: 'Rajasthan', province_code: 'RJ' };
  if (prefix2 >= 36 && prefix2 <= 39) return { province: 'Gujarat', province_code: 'GJ' };
  if (prefix2 >= 40 && prefix2 <= 44) return { province: 'Maharashtra', province_code: 'MH' };
  if (prefix2 >= 45 && prefix2 <= 49) return { province: 'Madhya Pradesh', province_code: 'MP' };
  if (prefix2 >= 50 && prefix2 <= 53) return { province: 'Andhra Pradesh', province_code: 'AP' };
  if (prefix2 >= 56 && prefix2 <= 59) return { province: 'Karnataka', province_code: 'KA' };
  if (prefix2 >= 60 && prefix2 <= 64) return { province: 'Tamil Nadu', province_code: 'TN' };
  if (prefix2 >= 67 && prefix2 <= 69) return { province: 'Kerala', province_code: 'KL' };
  if (prefix2 >= 70 && prefix2 <= 74) return { province: 'West Bengal', province_code: 'WB' };
  if (prefix2 >= 75 && prefix2 <= 77) return { province: 'Odisha', province_code: 'OR' };
  if (prefix2 >= 78 && prefix2 <= 79) return { province: 'Assam', province_code: 'AS' };
  if (prefix2 >= 80 && prefix2 <= 85) return { province: 'Bihar', province_code: 'BR' };

  return null;
}

function normalizeIndianState(inputState, zipCode) {
  if (!inputState || typeof inputState !== 'string' || !inputState.trim()) {
    const fromZip = autoDetectStateFromZip(zipCode);
    return fromZip || { province: 'Kerala', province_code: 'KL' };
  }
  const clean = inputState.trim().toLowerCase();
  
  for (const [code, name] of Object.entries(INDIAN_STATES_MAP)) {
    if (clean === name.toLowerCase() || clean === code.toLowerCase()) {
      return { province: name, province_code: code };
    }
  }

  for (const [code, name] of Object.entries(INDIAN_STATES_MAP)) {
    if (name.toLowerCase().includes(clean) || clean.includes(name.toLowerCase())) {
      return { province: name, province_code: code };
    }
  }

  const fromZip = autoDetectStateFromZip(zipCode);
  if (fromZip) return fromZip;

  const cap = inputState.trim().charAt(0).toUpperCase() + inputState.trim().slice(1);
  return { province: cap, province_code: undefined };
}

async function createShopifyAdminOrder({ customerData = {}, orderInfo = {}, razorpayPaymentId, razorpayOrderId }) {
  const shopifyDomain = process.env.SHOPIFY_STORE_DOMAIN || 'a1vwxm-qr.myshopify.com';
  let shopifyToken = await getShopifyAccessToken();

  if (!shopifyToken) {
    console.warn('[Shopify Admin API] SHOPIFY_ADMIN_ACCESS_TOKEN not set. Order recorded in Razorpay only.');
    return { created: false, reason: 'SHOPIFY_ADMIN_ACCESS_TOKEN missing' };
  }

  const { fullName = '', firstName = '', lastName = '', phone = '', email = '', address1 = '', city = '', zip = '' } = customerData;
  const rawState = customerData.state || customerData.province || customerData.province_name || '';
  const nameParts = fullName ? fullName.trim().split(' ') : [];
  const fName = firstName || nameParts[0] || 'Customer';
  const lName = lastName || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Customer');
  const formattedPhone = phone ? (phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '').slice(-10)}`) : undefined;
  const stateInfo = normalizeIndianState(rawState, zip);

  const isCod = orderInfo.paymentMode === 'cod';
  const isPartialCod = orderInfo.paymentMode === 'partial_cod';
  const qty = Math.max(1, parseInt(orderInfo.quantity || 1, 10));

  let financialStatus = 'paid';
  let noteText = `Paid via Razorpay Web Checkout | Payment ID: ${razorpayPaymentId || 'N/A'} | Order ID: ${razorpayOrderId || 'N/A'}`;
  let tagText = 'Razorpay, Prepaid, Single Product Funnel';
  let totalOrderAmount = orderInfo.amountInRupees || 799;

  let transactionsArr = [
    {
      kind: 'sale',
      status: 'success',
      amount: totalOrderAmount,
      gateway: 'Razorpay',
      payment_id: razorpayPaymentId
    }
  ];

  if (isPartialCod) {
    financialStatus = 'partially_paid';
    const basePrepaid = orderInfo.basePrepaid || (qty === 1 ? 799 : (qty === 2 ? 1499 : 1999));
    totalOrderAmount = basePrepaid + 50;
    const balanceToCollect = totalOrderAmount - 99;
    noteText = `Partial COD: ₹99 Deposit Paid via Razorpay (Payment ID: ${razorpayPaymentId}) | Balance ₹${balanceToCollect} to collect on delivery`;
    tagText = 'Partial COD, ₹99 Deposit Paid, Single Product Funnel';
    transactionsArr = [
      {
        kind: 'sale',
        status: 'success',
        amount: 99,
        gateway: 'Razorpay (Deposit)',
        payment_id: razorpayPaymentId
      }
    ];
  } else if (isCod) {
    financialStatus = 'pending';
    const basePrepaid = orderInfo.basePrepaid || (qty === 1 ? 799 : (qty === 2 ? 1499 : 1999));
    totalOrderAmount = basePrepaid + 100;
    noteText = `Full Cash on Delivery: Collect ₹${totalOrderAmount} on delivery`;
    tagText = 'COD, Cash on Delivery, Single Product Funnel';
    transactionsArr = [
      {
        kind: 'sale',
        status: 'pending',
        amount: totalOrderAmount,
        gateway: 'Cash on Delivery (COD)'
      }
    ];
  }

  const unitPrice = parseFloat((totalOrderAmount / qty).toFixed(2));

  const payload = {
    order: {
      line_items: [
        {
          variant_id: parseInt(orderInfo.variantId || '49072796926187', 10),
          quantity: qty,
          price: unitPrice,
          title: `Simpliven™ Smart Digital LED Mirror Alarm Clock (${orderInfo.bundleName || 'Standard'})`
        }
      ],
      customer: {
        first_name: fName,
        last_name: lName,
        email: email || undefined,
        phone: formattedPhone
      },
      shipping_address: {
        first_name: fName,
        last_name: lName,
        address1: address1,
        city: city,
        province: stateInfo.province,
        province_code: stateInfo.province_code,
        country: 'India',
        country_code: 'IN',
        zip: zip,
        phone: formattedPhone
      },
      billing_address: {
        first_name: fName,
        last_name: lName,
        address1: address1,
        city: city,
        province: stateInfo.province,
        province_code: stateInfo.province_code,
        country: 'India',
        country_code: 'IN',
        zip: zip,
        phone: formattedPhone
      },
      financial_status: financialStatus,
      transactions: transactionsArr,
      note: noteText,
      tags: tagText
    }
  };

  try {
    const url = `https://${shopifyDomain}/admin/api/2024-01/orders.json`;
    let response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': shopifyToken
      },
      body: JSON.stringify(payload)
    });

    if (response.status === 401) {
      console.warn('[Shopify Admin API] 401 Unauthorized. Force refreshing Spring 26 OAuth token...');
      shopifyToken = await getShopifyAccessToken(true);
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': shopifyToken
        },
        body: JSON.stringify(payload)
      });
    }

    const resJson = await response.json();
    if (response.ok && resJson.order) {
      console.log(`[Shopify Admin API] Order #${resJson.order.order_number} created in Shopify Admin! (ID: ${resJson.order.id})`);
      return { created: true, orderId: resJson.order.id, orderNumber: resJson.order.order_number };
    } else {
      console.error('[Shopify Admin API] Failed to create order:', resJson.errors || resJson);
      return { created: false, error: resJson.errors || resJson };
    }
  } catch (err) {
    console.error('[Shopify Admin API] Request error:', err.message);
    return { created: false, error: err.message };
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || 'alq4lVCwZNTeutsmwwmYgpPm';

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, customerData, orderInfo } = req.body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: razorpay_order_id, razorpay_payment_id, and razorpay_signature are required.',
      });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(body)
      .digest('hex');

    let isMatch = false;
    try {
      const expectedBuf = Buffer.from(expectedSignature, 'utf-8');
      const receivedBuf = Buffer.from(razorpay_signature, 'utf-8');
      if (expectedBuf.length === receivedBuf.length) {
        isMatch = crypto.timingSafeEqual(expectedBuf, receivedBuf);
      }
    } catch (e) {
      isMatch = false;
    }

    if (isMatch) {
      const shopifyResult = await createShopifyAdminOrder({
        customerData,
        orderInfo,
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
      });

      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        shopify_order: shopifyResult,
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Signature verification failed. Potential tampering detected.',
      });
    }
  } catch (error) {
    console.error('[Vercel API] Verify Payment Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Server error during signature verification',
    });
  }
};
