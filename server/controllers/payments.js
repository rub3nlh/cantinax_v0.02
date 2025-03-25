import express from 'express';
import tropiPayService from '../services/tropipay.js';

const router = express.Router();

// Mock de datos de tarjetas válidas para pruebas
const VALID_TEST_CARDS = [
  { number: '4242424242424242', expiry: '12/25', cvv: '123' }, // Visa
  { number: '5555555555554444', expiry: '12/25', cvv: '123' }, // Mastercard
];

// Procesar pago con tarjeta
router.post('/process-card', async (req, res) => {
  try {
    const { cardNumber, expiryDate, cvv, amount } = req.body;
    console.log('Processing card payment:', { cardNumber, expiryDate, amount });

    // Simulamos un delay para imitar el procesamiento del pago
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Validación básica
    const isValidCard = VALID_TEST_CARDS.some(
      card => card.number === cardNumber.replace(/\s/g, '')
    );
    if (!isValidCard) {
      console.warn('Invalid card number:', cardNumber);
      return res.status(400).json({
        success: false,
        error: 'Tarjeta inválida o rechazada'
      });
    }

    // Simulamos una respuesta exitosa
    const transactionId = `card_${Math.random().toString(36).substr(2, 9)}`;
    console.log('Payment processed successfully:', { transactionId, amount });

    res.json({
      success: true,
      transactionId,
      amount,
      message: 'Pago procesado correctamente'
    });
  } catch (error) {
    console.error('Error processing card payment:', error);
    res.status(500).json({
      success: false,
      error: 'Error procesando el pago'
    });
  }
});

// Crear link de pago de TropiPay
// router.post('/create-payment-link', async (req, res) => {
//   try {
//     const {
//       reference,
//       concept,
//       amount,
//       currency,
//       description,
//       urlSuccess,
//       urlFailed,
//       urlNotification,
//       client
//     } = req.body;

//     console.log('Creating TropiPay payment link:', {
//       reference,
//       concept,
//       amount,
//       currency
//     });

//     // Validación básica
//     if (!reference || !concept || !amount || !currency) {
//       return res.status(400).json({
//         success: false,
//         error: 'Faltan campos requeridos'
//       });
//     }

//     // Prepare payload according to TropiPay docs
//     const payload = {
//       reference,
//       concept,
//       description,
//       currency,
//       amount: Math.round(amount), // TropiPay expects amount in cents
//       lang: 'es',
//       urlSuccess,
//       urlFailed,
//       urlNotification,
//       client: client ? {
//         name: client.name,
//         lastName: client.lastName,
//         address: client.address,
//         phone: client.phone,
//         email: client.email,
//         countryId: client.countryId || 1, // Default to Spain
//         termsAndConditions: true
//       } : undefined,
//       directPayment: true,
//       favorite:false,
//       singleUse: true,
//       reasonId: 4, // Service payment
//       expirationDays: 1
//     };

//     // Log environment variables for debugging
//     console.log('Environment:', {
//       NODE_ENV: process.env.NODE_ENV,
//       TROPIPAY_CLIENT_ID: process.env.TROPIPAY_CLIENT_ID ? 'Set' : 'Not set',
//       TROPIPAY_CLIENT_SECRET: process.env.TROPIPAY_CLIENT_SECRET ? 'Set' : 'Not set'
//     });

//     // Call TropiPay API
//     const result = await tropiPayService.createPaymentLink(payload);

//     // Send response with Cache-Control headers
//     res.set({
//       'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
//       'Pragma': 'no-cache',
//       'Expires': '0'
//     });

//     res.json(result);
//   } catch (error) {
//     console.error('Error creating TropiPay payment link:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Error creando link de pago'
//     });
//   }
// });

export default router;