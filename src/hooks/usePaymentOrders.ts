import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { PaymentMethod } from '../types';

interface PaymentOrder {
  id: string;
  order_id: string;
  payment_method: PaymentMethod;
  amount: number;
  currency: string;
  description?: string;
  reference?: string;
  short_url?: string;
  status: 'pending' | 'completed' | 'failed';
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

export function usePaymentOrders() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPaymentOrder = async (data: Omit<PaymentOrder, 'id' | 'created_at' | 'status'>) => {
    try {
      setLoading(true);
      setError(null);

      // First, insert the payment order
      const { data: insertedOrder, error: insertError } = await supabase
        .from('payment_orders')
        .insert([{
          order_id: data.order_id,
          payment_method: data.payment_method,
          amount: data.amount,
          currency: data.currency,
          description: data.description,
          reference: data.reference,
          short_url: data.short_url
        }])
        .select();

      if (insertError) throw insertError;
      if (!insertedOrder || insertedOrder.length === 0) {
        throw new Error('No se pudo crear la orden de pago');
      }

      // Return the first inserted order
      return insertedOrder[0];
    } catch (err) {
      console.error('Error creating payment order:', err);
      setError(err instanceof Error ? err.message : 'Error al crear la orden de pago');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentOrder = async (id: string, data: Partial<PaymentOrder>) => {
    try {
      setLoading(true);
      setError(null);

      // First, update the payment order
      const { data: updatedOrders, error: updateError } = await supabase
        .from('payment_orders')
        .update(data)
        .eq('id', id)
        .select();

      if (updateError) throw updateError;
      if (!updatedOrders || updatedOrders.length === 0) {
        throw new Error('No se pudo actualizar la orden de pago');
      }

      // Return the first updated order
      return updatedOrders[0];
    } catch (err) {
      console.error('Error updating payment order:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar la orden de pago');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getPaymentOrder = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data: paymentOrders, error: fetchError } = await supabase
        .from('payment_orders')
        .select('*')
        .eq('id', id)
        .limit(1);

      if (fetchError) throw fetchError;
      if (!paymentOrders || paymentOrders.length === 0) {
        throw new Error('Orden de pago no encontrada');
      }

      return paymentOrders[0];
    } catch (err) {
      console.error('Error fetching payment order:', err);
      setError(err instanceof Error ? err.message : 'Error al obtener la orden de pago');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getOrderPayments = async (orderId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data: payments, error: fetchError } = await supabase
        .from('payment_orders')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      return payments || [];
    } catch (err) {
      console.error('Error fetching order payments:', err);
      setError(err instanceof Error ? err.message : 'Error al obtener los pagos de la orden');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createPaymentOrder,
    updatePaymentOrder,
    getPaymentOrder,
    getOrderPayments,
    loading,
    error
  };
}