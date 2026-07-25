/**
 * Simpliven™ Razorpay Standard Checkout Frontend Engine
 * File: razorpay.js
 */

(function () {
  /**
   * Dynamically loads Razorpay checkout script if not present
   */
  function loadRazorpayScript() {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) {
        return resolve(true);
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error('Failed to load Razorpay SDK script'));
      document.head.appendChild(script);
    });
  }

  /**
   * Resolves backend API URL (supports local standalone server, Live Server, and Vercel)
   */
  function getApiEndpoint(endpoint) {
    if (typeof window === 'undefined') return endpoint;
    const isLocalhostDev = window.location.protocol === 'file:' || 
                           (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && 
                           window.location.port !== '3000' && window.location.port !== '';
    const baseUrl = isLocalhostDev ? 'http://localhost:3000' : '';
    return `${baseUrl}${endpoint}`;
  }

  /**
   * Main Razorpay Checkout Trigger
   * @param {Object} params
   */
  async function startRazorpayCheckout(params) {
    const {
      amountInRupees,
      customerData = {},
      bundleName = 'Simpliven LED Mirror Clock',
      paymentMode = 'prepaid',
      onSuccess,
      onError,
      onDismiss,
    } = params;

    try {
      // 1. Ensure Razorpay checkout.js script is loaded
      await loadRazorpayScript();

      // Convert rupees to paise (min 100 paise)
      const amountInPaise = Math.max(100, Math.round(amountInRupees * 100));

      // 2. Call backend /api/create-order
      const createOrderUrl = getApiEndpoint('/api/create-order');
      let orderResponse;
      try {
        orderResponse = await fetch(createOrderUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: amountInPaise,
            currency: 'INR',
            receipt: `rcpt_${Date.now()}`,
            notes: {
              bundle: bundleName,
              paymentMode: paymentMode,
              customerName: customerData.fullName || '',
              phone: customerData.phone || '',
            },
          }),
        });
      } catch (fetchErr) {
        throw new Error(`Server connection failed. Please ensure your backend server (node server.js) is running on http://localhost:3000`);
      }

      if (!orderResponse.ok) {
        const errJson = await orderResponse.json().catch(() => ({}));
        throw new Error(errJson.error || `Server returned status ${orderResponse.status}`);
      }

      const orderData = await orderResponse.json();
      const { order_id, amount, currency, key_id } = orderData;

      // Track checkout completion & error state to prevent modal race conditions
      let isPaymentCompleted = false;
      let lastPaymentErrorMsg = null;

      // 3. Configure Razorpay Standard Modal options
      const options = {
        key: key_id || 'rzp_test_THfpFSuoIQ9PLN',
        amount: amount,
        currency: currency || 'INR',
        name: 'Simpliven™ Store',
        description: `${bundleName} - Fast Prepaid Checkout`,
        order_id: order_id,
        prefill: {
          name: customerData.fullName || '',
          email: customerData.email || '',
          contact: customerData.phone ? customerData.phone.replace(/\D/g, '').slice(-10) : '',
        },
        notes: {
          address: `${customerData.address1 || ''}, ${customerData.city || ''}, ${customerData.state || ''} - ${customerData.zip || ''}`,
        },
        theme: {
          color: '#74121D', // Simpliven Wine Burgundy
        },
        handler: async function (response) {
          // STEP 3: Send verification payload & customer order details to backend
          try {
            const verifyUrl = getApiEndpoint('/api/verify-payment');
            const verifyResponse = await fetch(verifyUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                customerData: customerData,
                orderInfo: {
                  amountInRupees: amountInRupees,
                  bundleName: bundleName,
                  paymentMode: paymentMode,
                  quantity: params.quantity || 1,
                  variantId: '49072796926187',
                },
              }),
            });

            const verifyResult = await verifyResponse.json();

            if (verifyResult.success) {
              isPaymentCompleted = true; // Mark as verified success!
              if (typeof onSuccess === 'function') {
                onSuccess(verifyResult, response);
              } else {
                alert(`✅ Payment Successful!\nPayment ID: ${response.razorpay_payment_id}`);
              }
            } else {
              lastPaymentErrorMsg = verifyResult.error || 'Payment signature verification failed.';
              if (typeof onError === 'function') {
                onError(lastPaymentErrorMsg);
              } else {
                alert(`❌ Verification Error: ${verifyResult.error}`);
              }
            }
          } catch (err) {
            console.error('[Razorpay] Verification request error:', err);
            lastPaymentErrorMsg = err.message || 'Payment verification request failed.';
            if (typeof onError === 'function') {
              onError(lastPaymentErrorMsg);
            }
          }
        },
        modal: {
          ondismiss: function () {
            console.log('[Razorpay] Payment modal dismissed. isPaymentCompleted:', isPaymentCompleted);
            if (isPaymentCompleted) {
              // Payment already verified successfully — DO NOT trigger failure modal!
              return;
            }
            if (typeof onDismiss === 'function') {
              onDismiss(lastPaymentErrorMsg);
            }
          },
        },
      };

      const rzp = new window.Razorpay(options);

      // Handle payment failure event (record last error, but defer modal display until window closes)
      rzp.on('payment.failed', function (failureData) {
        console.warn('[Razorpay] Payment Failed Event:', failureData.error);
        if (failureData && failureData.error) {
          lastPaymentErrorMsg = failureData.error.description || failureData.error.reason || 'Payment failed or was declined by bank.';
        }
      });

      rzp.open();
    } catch (error) {
      console.error('[Razorpay] Checkout Error:', error);
      if (typeof onError === 'function') {
        onError(error.message || 'Could not initiate Razorpay checkout');
      } else {
        alert(`❌ Checkout Error: ${error.message}`);
      }
    }
  }

  // Expose global object
  window.SimplivenRazorpay = {
    startRazorpayCheckout,
  };
})();
