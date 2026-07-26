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

  if (prefix2 === 11) return { province: 'Delhi', province_code: 'DL' };
  if (prefix2 >= 60 && prefix2 <= 64) return { province: 'Tamil Nadu', province_code: 'TN' };
  if (prefix2 >= 67 && prefix2 <= 69) return { province: 'Kerala', province_code: 'KL' };

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
  const fromZip = autoDetectStateFromZip(zipCode);
  if (fromZip) return fromZip;
  return { province: inputState.trim(), province_code: undefined };
}

async function getShopifyAccessToken() {
  const shopifyDomain = process.env.SHOPIFY_STORE_DOMAIN || 'a1vwxm-qr.myshopify.com';
  const clientId = process.env.SHOPIFY_CLIENT_ID;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;

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

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { customerData = {}, orderInfo = {} } = req.body || {};
    const shopifyDomain = process.env.SHOPIFY_STORE_DOMAIN || 'a1vwxm-qr.myshopify.com';
    const shopifyToken = await getShopifyAccessToken();

    if (!shopifyToken) {
      return res.status(200).json({
        success: true,
        message: 'COD order confirmed locally',
        order_id: `cod_${Date.now()}`,
        payment_id: 'COD_DOORSTEP'
      });
    }

    const { fullName = '', firstName = '', lastName = '', phone = '', email = '', address1 = '', city = '', zip = '' } = customerData;
    const rawState = customerData.state || customerData.province || customerData.province_name || '';
    const nameParts = fullName ? fullName.trim().split(' ') : [];
    const fName = firstName || nameParts[0] || 'Customer';
    const lName = lastName || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Customer');
    const formattedPhone = phone ? (phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '').slice(-10)}`) : undefined;
    const stateInfo = normalizeIndianState(rawState, zip);

    const qty = Math.max(1, parseInt(orderInfo.quantity || 1, 10));
    const totalAmount = orderInfo.amountInRupees || 899;
    const unitPrice = parseFloat((totalAmount / qty).toFixed(2));

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
        financial_status: 'pending',
        transactions: [
          {
            kind: 'sale',
            status: 'pending',
            amount: totalAmount,
            gateway: 'Cash on Delivery (COD)'
          }
        ],
        note: `Full Cash on Delivery: Collect ₹${totalAmount} on delivery`,
        tags: 'COD, Cash on Delivery, Single Product Funnel'
      }
    };

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
      return res.status(200).json({
        success: true,
        message: 'Cash on Delivery order confirmed successfully',
        order_id: `cod_${Date.now()}`,
        payment_id: 'COD_DOORSTEP',
        shopify_order: { created: true, orderId: resJson.order.id, orderNumber: resJson.order.order_number }
      });
    } else {
      console.warn('[Shopify Admin Sync Warning]:', resJson.errors);
      return res.status(200).json({
        success: true,
        message: 'Cash on Delivery order confirmed successfully',
        order_id: `cod_${Date.now()}`,
        payment_id: 'COD_DOORSTEP',
        shopify_order: { created: false, reason: typeof resJson.errors === 'string' ? resJson.errors : 'Sync pending' }
      });
    }
  } catch (error) {
    console.error('[COD Order Exception]:', error);
    return res.status(200).json({
      success: true,
      message: 'Cash on Delivery order confirmed successfully',
      order_id: `cod_${Date.now()}`,
      payment_id: 'COD_DOORSTEP',
      shopify_order: { created: false, reason: error.message }
    });
  }
};
