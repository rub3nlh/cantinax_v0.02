import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAdminCounts() {
  const [counts, setCounts] = useState({
    pendingOrders: 0,
    pendingDeliveries: 0,
    loading: true,
    error: null as string | null
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Get count of pending orders
        const { count: pendingOrders, error: ordersError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        if (ordersError) throw ordersError;

        // Get count of pending deliveries
        const { count: pendingDeliveries, error: deliveriesError } = await supabase
          .from('order_deliveries')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        if (deliveriesError) throw deliveriesError;

        setCounts({
          pendingOrders: pendingOrders || 0,
          pendingDeliveries: pendingDeliveries || 0,
          loading: false,
          error: null
        });
      } catch (err) {
        console.error('Error fetching admin counts:', err);
        setCounts(prev => ({
          ...prev,
          loading: false,
          error: 'Error al cargar los contadores'
        }));
      }
    };

    fetchCounts();

    // Set up real-time subscriptions
    const ordersSubscription = supabase
      .channel('orders-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders'
      }, () => {
        fetchCounts();
      })
      .subscribe();

    const deliveriesSubscription = supabase
      .channel('deliveries-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'order_deliveries'
      }, () => {
        fetchCounts();
      })
      .subscribe();

    return () => {
      ordersSubscription.unsubscribe();
      deliveriesSubscription.unsubscribe();
    };
  }, []);

  return counts;
}