import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface DeliveryMeal {
  id: string;
  name: string;
  description: string;
  image: string;
  status: 'pending' | 'completed';
  completed_at?: string;
}

export interface OrderDelivery {
  id: string;
  order_id: string;
  scheduled_date: string;
  status: 'pending' | 'in_progress' | 'ready' | 'delivered' | 'failed';
  delivered_at?: string;
  notes?: string;
  created_at: string;
  meals: DeliveryMeal[];
  orders: {
    delivery_address_data: {
      recipient_name: string;
      phone: string;
      address: string;
      province: string;
      municipality: string;
    };
    personal_note?: string;
  };
}

export function useOrderDeliveries() {
  const [deliveries, setDeliveries] = useState<OrderDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      setError(null);

      // First get all deliveries
      const { data: deliveriesData, error: deliveriesError } = await supabase
        .from('order_deliveries')
        .select(`
          *,
          orders (
            delivery_address_data,
            personal_note
          )
        `)
        .order('scheduled_date', { ascending: true });

      if (deliveriesError) throw deliveriesError;

      // For each delivery, get its meals
      const deliveriesWithMeals = await Promise.all(
        (deliveriesData || []).map(async (delivery) => {
          const { data: mealsData, error: mealsError } = await supabase
            .from('delivery_meals')
            .select(`
              id,
              status,
              completed_at,
              meals (
                id,
                name,
                description,
                image_url
              )
            `)
            .eq('delivery_id', delivery.id);

          if (mealsError) throw mealsError;

          // Transform meals data
          const meals = mealsData?.map(meal => ({
            id: meal.meals.id,
            name: meal.meals.name,
            description: meal.meals.description,
            image: meal.meals.image_url,
            status: meal.status,
            completed_at: meal.completed_at
          })) || [];

          return {
            ...delivery,
            meals
          };
        })
      );

      setDeliveries(deliveriesWithMeals);
    } catch (err) {
      console.error('Error fetching deliveries:', err);
      setError('Error al cargar las entregas');
    } finally {
      setLoading(false);
    }
  };

  const updateDeliveryStatus = async (
    deliveryId: string,
    status: OrderDelivery['status'],
    completedMeal?: { id: string }
  ) => {
    try {
      let updateData: any = { status };

      // If marking as delivered, add timestamp
      if (status === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      }

      // Update delivery status
      const { error: updateError } = await supabase
        .from('order_deliveries')
        .update(updateData)
        .eq('id', deliveryId);

      if (updateError) throw updateError;

      // If completing a meal, update its status
      if (completedMeal) {
        const { error: mealError } = await supabase
          .from('delivery_meals')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('delivery_id', deliveryId)
          .eq('meal_id', completedMeal.id);

        if (mealError) throw mealError;

        // Check if all meals are completed to mark delivery as ready
        const { data: mealsData, error: mealsCheckError } = await supabase
          .from('delivery_meals')
          .select('status')
          .eq('delivery_id', deliveryId);

        if (mealsCheckError) throw mealsCheckError;

        const allCompleted = mealsData?.every(meal => meal.status === 'completed');
        if (allCompleted) {
          const { error: readyError } = await supabase
            .from('order_deliveries')
            .update({ status: 'ready' })
            .eq('id', deliveryId);

          if (readyError) throw readyError;
        }
      }

      // Refetch deliveries to update UI
      await fetchDeliveries();

      return true;
    } catch (err) {
      console.error('Error updating delivery status:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchDeliveries();

    // Set up real-time subscription
    const subscription = supabase
      .channel('order-deliveries-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'order_deliveries'
      }, () => {
        fetchDeliveries();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    deliveries,
    loading,
    error,
    updateDeliveryStatus,
    refetch: fetchDeliveries
  };
}