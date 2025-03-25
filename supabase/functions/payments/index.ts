import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

// Mock test cards for development
const VALID_TEST_CARDS = [
  { number: '4242424242424242', expiry: '12/25', cvv: '123' }, // Visa
  { number: '5555555555554444', expiry: '12/25', cvv: '123' }, // Mastercard
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, ...data } = await req.json();

    if (!action) {
      throw new Error('Action is required');
    }

    let result;

    switch (action) {
      case 'process-card':
        result = await processCardPayment(data);
        break;
      case 'create-payment-link':
        result = await createPaymentLink(data);
        break;
      default:
        throw new Error('Invalid action');
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Edge function error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal Server Error'
      }),
      {
        status: error instanceof Error && error.message.includes('required') ? 400 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function processCardPayment(data: any) {
  const { cardNumber, expiryDate, cvv, amount } = data;

  if (!cardNumber || !expiryDate || !cvv || amount === undefined) {
    throw new Error('Missing required card payment fields');
  }

  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Basic validation
  const isValidCard = VALID_TEST_CARDS.some(
    card => card.number === cardNumber.replace(/\s/g, '')
  );

  if (!isValidCard) {
    throw new Error('Tarjeta inválida o rechazada');
  }

  // Simulate successful response
  const transactionId = `card_${crypto.randomUUID().split('-')[0]}`;

  return {
    success: true,
    transactionId,
    amount,
    message: 'Pago procesado correctamente'
  };
}

async function createPaymentLink(data: any) {
  const {
    reference,
    concept,
    amount,
    currency,
    description,
    urlSuccess,
    urlFailed,
    urlNotification,
    client
  } = data;

  // Basic validation
  if (!reference || !concept || !amount || !currency) {
    throw new Error('Faltan campos requeridos');
  }

  // Get TropiPay credentials from environment
  const clientId = Deno.env.get('TROPIPAY_CLIENT_ID');
  const clientSecret = Deno.env.get('TROPIPAY_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    throw new Error('Missing TropiPay credentials');
  }

  // Get access token
  const tokenResponse = await fetch('https://tropipay-dev.herokuapp.com/api/v2/access/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret
    })
  });

  if (!tokenResponse.ok) {
    const tokenError = await tokenResponse.json();
    throw new Error(tokenError.error || 'Failed to get TropiPay access token');
  }

  const { access_token } = await tokenResponse.json();

  // Create payment link
  const payload = {
    reference,
    concept,
    description,
    currency,
    amount: Math.round(amount), // TropiPay expects amount in cents
    lang: 'es',
    urlSuccess,
    urlFailed,
    urlNotification,
    client: client ? {
      name: client.name,
      lastName: client.lastName,
      address: client.address,
      phone: client.phone,
      email: client.email,
      countryId: client.countryId || 1,
      termsAndConditions: true
    } : undefined,
    directPayment: true,
    favorite: false,
    singleUse: true,
    reasonId: 4,
    expirationDays: 1
  };

  const paymentResponse = await fetch('https://tropipay-dev.herokuapp.com/api/v2/paymentcard', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${access_token}`
    },
    body: JSON.stringify(payload)
  });

  if (!paymentResponse.ok) {
    const paymentError = await paymentResponse.json();
    throw new Error(paymentError.error || 'Failed to create TropiPay payment link');
  }

  const paymentData = await paymentResponse.json();

  return {
    ...paymentData,
    shortUrl: `https://tppay.me/${paymentData.hash}`
  };
}