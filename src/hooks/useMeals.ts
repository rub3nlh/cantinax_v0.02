import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Meal } from '../types';

export interface MealWithStats extends Meal {
  timesOrdered: number;
  active: boolean;
}

export function useMeals(showInactive = false) {
  const [meals, setMeals] = useState<MealWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeals = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('meals')
        .select('*')
        .order('times_ordered', { ascending: false });

      // Only show active meals by default
      if (!showInactive) {
        query = query.eq('active', true);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Transform the data to match our frontend model
      const transformedMeals: MealWithStats[] = data.map(meal => ({
        id: meal.id,
        name: meal.name,
        description: meal.description,
        image: meal.image_url,
        ingredients: meal.ingredients,
        allergens: meal.allergens,
        chefNote: meal.chef_note,
        timesOrdered: meal.times_ordered,
        active: meal.active
      }));

      setMeals(transformedMeals);
    } catch (err) {
      console.error('Error fetching meals:', err);
      setError('No pudimos cargar el menú. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals();

    // Set up real-time subscription for meal updates
    const subscription = supabase
      .channel('meals-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'meals'
      }, () => {
        fetchMeals();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [showInactive]);

  return { meals, loading, error, refetch: fetchMeals };
}