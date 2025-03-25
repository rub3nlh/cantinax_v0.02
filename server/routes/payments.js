import express from 'express';
const router = express.Router();
import TropiPayService from '../services/tropipay.js';


// Crear link de pago de TropiPay
router.post('/create-payment-link', async (req, res) => {
    try {
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
        } = req.body;

        console.log('Creating TropiPay payment link:', {
            reference,
            concept,
            amount,
            currency
        });

        // Validación básica
        if (!reference || !concept || !amount || !currency) {
            return res.status(400).json({
                success: false,
                error: 'Faltan campos requeridos'
            });
        }

        // Prepare payload according to TropiPay docs
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
                countryId: client.countryId || 1, // Default to Spain
                termsAndConditions: true
            } : undefined,
            directPayment: true,
            favorite: false,
            singleUse: true,
            reasonId: 4, // Service payment
            expirationDays: 1
        };



        // Call TropiPay API
        const result = await TropiPayService.createPaymentLink(payload);

        // Send response with Cache-Control headers
        res.set({
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });

        res.json(result);
    } catch (error) {
        console.error('Error creating TropiPay payment link:', error);
        res.status(500).json({
            success: false,
            error: 'Error creando link de pago'
        });
    }
});

export default router;