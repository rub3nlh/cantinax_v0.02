import { useState, useEffect } from 'react';
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

// Nombre exacto de la función Edge tal como está configurada en Supabase
const EDGE_FUNCTION_NAME = 'tropipay-payment';

export function usePayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { createPaymentOrder, updatePaymentOrder } = usePaymentOrders();
  const [useServerFallback, setUseServerFallback] = useState(false);

  // Verificar si la función Edge está disponible al montar el componente
  useEffect(() => {
    const checkEdgeFunction = async () => {
      try {
        console.log("Verificando disponibilidad de función Edge:", EDGE_FUNCTION_NAME);
        
        // Obtener token de sesión
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          console.warn('No hay sesión de usuario disponible, usando servidor Express');
          setUseServerFallback(true);
          return;
        }

        // Comprobar si la función Edge está disponible
        const { data, error } = await supabase.functions.invoke(EDGE_FUNCTION_NAME, {
          body: { action: 'check' },
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });

        if (error) {
          console.warn(`Función Edge "${EDGE_FUNCTION_NAME}" no disponible:`, error);
          setUseServerFallback(true);
        } else {
          console.log(`Función Edge "${EDGE_FUNCTION_NAME}" disponible:`, data);
        }
      } catch (err) {
        console.warn('Error verificando función Edge, usando servidor Express:', err);
        setUseServerFallback(true);
      }
    };

    checkEdgeFunction();
  }, []);

  const processCardPayment = async (data: CardPaymentData & { orderId: string }) => {
    try {
      setLoading(true);
      setError(null);

      // Create payment order first
      const paymentOrder = await createPaymentOrder({
        order_id: data.orderId,
        payment_method: 'card',
        amount: data.amount,
        currency: 'EUR',
        description: 'Pago con tarjeta'
      });

      try {
        let functionData;

        // Preparar payload
        const payloadData = {
          cardNumber: data.cardNumber,
          expiryDate: data.expiryDate,
          cvv: data.cvv,
          amount: data.amount
        };

        if (useServerFallback) {
          console.log("Procesando pago con tarjeta a través del servidor Express");
          
          // Usar el servidor Express como fallback
          const response = await fetch(`${window.location.origin}/api/payments/process-card`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payloadData)
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error procesando el pago');
          }

          functionData = await response.json();
        } else {
          console.log("Procesando pago con tarjeta a través de función Edge");
          
          // Obtener token de sesión para autenticación
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.access_token) {
            console.warn('No hay sesión de usuario disponible, cambiando a servidor Express');
            setUseServerFallback(true);
            
            // Reintento con Express
            return processCardPayment(data);
          }

          // Usar la función Edge, siguiendo exactamente la guía de Supabase
          const { data: edgeData, error: functionError } = await supabase.functions.invoke(EDGE_FUNCTION_NAME, {
            body: {
              action: 'process-card',
              ...payloadData
            },
            headers: {
              Authorization: `Bearer ${session.access_token}`
            }
          });

          if (functionError) {
            console.error("Error en función Edge:", functionError);
            throw new Error(functionError.message || 'Error procesando el pago');
          }

          functionData = edgeData;
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
        console.error("Error en procesamiento de pago:", err);
        
        // Si el error es de la función Edge, cambiar a servidor Express para próximos intentos
        if (!useServerFallback && err instanceof Error && 
            (err.message.includes('Edge Function') || err.message.includes('Failed to send'))) {
          console.warn('Cambiando a servidor Express para futuros pagos');
          setUseServerFallback(true);
        }
        
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
        let paymentResult;

        // Preparar payload para ambos endpoints (servidor y función Edge)
        const payloadData = {
          reference: data.reference,
          concept: data.concept,
          amount: data.amount,
          currency: data.currency,
          description: data.description,
          urlSuccess: data.urlSuccess,
          urlFailed: data.urlFailed,
          urlNotification: data.urlNotification,
          client: data.client,
          favorite: false
        };

        // Decidir si usar el servidor Express o la función Edge
        if (useServerFallback) {
          console.log("Creando enlace TropiPay a través del servidor Express");
          
          // Usar el servidor Express como fallback
          const response = await fetch(`${window.location.origin}/api/payments/create-payment-link`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payloadData)
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error creando link de pago');
          }

          paymentResult = await response.json();
        } else {
          console.log("Creando enlace TropiPay a través de función Edge");
          
          // Obtener token de sesión para autenticación
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.access_token) {
            console.warn('No hay sesión de usuario disponible, cambiando a servidor Express');
            setUseServerFallback(true);
            
            // Reintento con Express
            return createTropiPayLink(data);
          }

          try {
            // Llamar a la función Edge siguiendo las recomendaciones de Supabase
            const { data: edgeData, error: functionError } = await supabase.functions.invoke(EDGE_FUNCTION_NAME, {
              body: {
                action: 'create-payment-link',
                ...payloadData
              },
              headers: {
                Authorization: `Bearer ${session.access_token}`
              }
            });

            if (functionError) {
              console.error("Error en función Edge:", functionError);
              throw new Error(functionError.message || 'Error creando link de pago');
            }

            paymentResult = edgeData;
          } catch (edgeError) {
            console.warn('Error usando función Edge, cambiando a servidor Express:', edgeError);
            setUseServerFallback(true);
            
            // Reintento con Express como fallback inmediato
            const response = await fetch(`${window.location.origin}/api/payments/create-payment-link`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(payloadData)
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Error creando link de pago');
            }

            paymentResult = await response.json();
          }
        }

        if (!paymentResult) {
          throw new Error('No se recibió respuesta del servidor');
        }

        console.log('Respuesta de TropiPay:', paymentResult);

        // Asegurar que haya una URL corta
        const shortUrl = paymentResult.shortUrl || 
                        (paymentResult.hash ? `https://tppay.me/${paymentResult.hash}` : null);
        
        if (!shortUrl) {
          throw new Error('No se pudo generar la URL de pago');
        }

        // Update payment order with payment link data
        await updatePaymentOrder(paymentOrder.id, {
          reference: paymentResult.id || paymentResult._id,
          short_url: shortUrl
        });

        return {
          ...paymentResult,
          shortUrl
        };
      } catch (err) {
        console.error('Error creating TropiPay link:', err);
        
        // Si el error es de la función Edge, cambiar a servidor Express para próximos intentos
        if (!useServerFallback && err instanceof Error && 
            (err.message.includes('Edge Function') || err.message.includes('Failed to send'))) {
          console.warn('Cambiando a servidor Express para futuros pagos');
          setUseServerFallback(true);
        }
        
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