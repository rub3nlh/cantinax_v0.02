import dotenv from 'dotenv';
import { Tropipay } from '@yosle/tropipayjs';

// Cargar variables de entorno
dotenv.config();

class TropiPayService {
  static instance;
  tropipaySDK;

  constructor() {
    if (TropiPayService.instance) {
      return TropiPayService.instance;
    }

    if (!process.env.TROPIPAY_CLIENT_ID || !process.env.TROPIPAY_CLIENT_SECRET) {
      console.error('Faltan credenciales de TropiPay en las variables de entorno');
      throw new Error('Faltan credenciales de TropiPay');
    }

    this.tropipaySDK = new Tropipay({
      //clientId: '921f756b0e0b2f223ce9eaa784398c94', //process.env.TROPIPAY_CLIENT_ID,
      //clientSecret: '6ef0063ea113a6c33765b93a43a23e41', //process.env.TROPIPAY_CLIENT_SECRET,
      clientId: process.env.TROPIPAY_CLIENT_ID, //process.env.TROPIPAY_CLIENT_ID,
      clientSecret: process.env.TROPIPAY_CLIENT_SECRET, //process.env.TROPIPAY_CLIENT_SECRET,
      serverMode: process.env.NODE_ENV === 'production' ? 'Production' : 'Development'
    });

    console.log('TropiPay Service inicializado en:', process.env.NODE_ENV);

    // Guardamos la instancia en la clase para asegurar el singleton
    TropiPayService.instance = this;
  }

  async createPaymentLink(paymentData) {
    try {
      const payload = {
        reference: paymentData.reference,
        concept: paymentData.concept,
        description: paymentData.description,
        currency: paymentData.currency || 'USD',
        amount: Math.round(paymentData.amount),
        lang: 'es',
        urlSuccess: paymentData.urlSuccess,
        urlFailed: paymentData.urlFailed,
        urlNotification: paymentData.urlNotification,
        client: paymentData.client,
        directPayment: true,
        favorite: false,
        singleUse: true,
        reasonId: 4, // Pago de servicio
        expirationDays: 1,
        serviceDate: new Date().toISOString()
      };

      console.log('Payload de pago enviado a TropiPay:', JSON.stringify(payload, null, 2));

      const paymentcard = await this.tropipaySDK.paymentCards.create(payload);

      console.log('Respuesta de TropiPay:', paymentcard);
      return paymentcard;
    } catch (error) {
      console.error('Error al crear el pago en TropiPay:', error);
      throw error;
    }
  }
}

// Exportamos solo UNA instancia del servicio
export default new TropiPayService();
