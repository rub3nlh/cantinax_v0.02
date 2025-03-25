import { useState } from 'react';
import { PaymentMethod } from '../types';
import { usePaymentOrders } from './usePaymentOrders';
import { supabase } from '../lib/supabase';

interface CardPaymentData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  amount: number;
}

interface TropiPayData {
  reference: string;
  concept: string;
  amount: number;
  currency: string;
  description: string;
  urlSuccess: string;
  urlFailed: string;
  urlNotification?: string;
  client?: {
    name: string;
    lastName: string;
    address: string;
    phone: string;
    email: string;
    countryId: number;
  };
  orderId: string;
}

export function usePayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { createPaymentOrder, updatePaymentOrder } = usePaymentOrders();

  const processCardPayment = async (data: CardPaymentData & { orderId: string }) => {
    try {
      setLoading(true);
      setError(null);

      // Create payment order first
      const paymentOrder = await createPaymentOrder({
        order_id: data.orderId,
        payment_method: 'card',
        amount: data.amount,
        currency: data.currency || 'USD',
        description: 'Pago con tarjeta'
      });

      try {
         // Use Express backend for card processing
        const response = await fetch(`${window.location.origin}/api/payments/process-card`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cardNumber: data.cardNumber,
            expiryDate: data.expiryDate,
            cvv: data.cvv,
            amount: data.amount
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error procesando el pago');
        }

        const functionData = await response.json();

        if (functionError) {
          throw new Error(functionError.message || 'Error procesando el pago');
        }

        if (!functionData) {
          throw new Error('No se recibió respuesta del servidor');
        }

        // Update payment order with success status
        await updatePaymentOrder(paymentOrder.id, {
          status: 'completed',
          reference: functionData.transactionId,
          completed_at: new Date().toISOString()
        });

        return functionData;
      } catch (err) {
        // Update payment order with error status
        await updatePaymentOrder(paymentOrder.id, {
          status: 'failed',
          error_message: err instanceof Error ? err.message : 'Error procesando el pago'
        });
        throw err;
      }
    } catch (err) {
      console.error('Error en el pago con tarjeta:', err);
      setError(err instanceof Error ? err.message : 'Error procesando el pago');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createTropiPayLink = async (data: TropiPayData) => {
    try {
      setLoading(true);
      setError(null);

      // Create payment order first
      const paymentOrder = await createPaymentOrder({
        order_id: data.orderId,
        payment_method: 'tropipay',
        amount: data.amount,
        currency: data.currency,
        description: data.description
      });

      try {
        const response = await fetch(`${window.location.origin}/api/payments/create-payment-link`, {
        //const response = await fetch(`https://lacantinax-3c315bb3e12b.herokuapp.com/api/payments/create-payment-link`, {
          
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reference: data.reference,
            concept: data.concept,
            amount: data.amount,
            currency: data.currency,
            description: data.description,
            urlSuccess: data.urlSuccess,
            urlFailed: data.urlFailed,
            urlNotification: data.urlNotification,
            client: data.client
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error creando link de pago');
        }

        const paymentResult = await response.json();

         // Log successful creation for debugging
        console.log('TropiPay link created successfully:', paymentResult);

        // Update payment order with payment link data
        await updatePaymentOrder(paymentOrder.id, {
          reference: paymentResult.id || paymentResult._id,
          short_url: paymentResult.shortUrl || `https://tppay.me/${paymentResult.hash}`
        });

        return {
          ...paymentResult,
          // Ensure shortUrl is available
          shortUrl: paymentResult.shortUrl || `https://tppay.me/${paymentResult.hash}`
        };
        
      } catch (err) {
        // Update payment order with error status
        await updatePaymentOrder(paymentOrder.id, {
          status: 'failed',
          error_message: err instanceof Error ? err.message : 'Error creando link de pago'
        });
        throw err;
      }
    } catch (err) {
      console.error('Error creando link de TropiPay:', err);
      setError(err instanceof Error ? err.message : 'Error creando link de pago');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async (method: PaymentMethod, data: any) => {
    switch (method) {
      case 'card':
        return processCardPayment(data);
      case 'tropipay':
        return createTropiPayLink(data);
      default:
        throw new Error('Método de pago no soportado');
    }
  };

  return {
    processPayment,
    loading,
    error
  };
}