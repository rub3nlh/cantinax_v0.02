import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAvatar() {
  const [isEdgeFunctionAvailable, setIsEdgeFunctionAvailable] = useState<boolean | null>(null);

  // Check if the Edge Function is available on mount
  useEffect(() => {
    const checkEdgeFunction = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;

        const { error } = await supabase.functions.invoke('generate-user-avatar', {
          body: { firstName: 'test' },
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });

        setIsEdgeFunctionAvailable(!error);
      } catch (err) {
        console.warn('Edge Function not available:', err);
        setIsEdgeFunctionAvailable(false);
      }
    };

    checkEdgeFunction();
  }, []);

  const generateAvatar = async (firstName: string) => {
    try {
      // If we know the Edge Function is not available, use fallback immediately
      if (isEdgeFunctionAvailable === false) {
        return getFallbackAvatar(firstName);
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        return getFallbackAvatar(firstName);
      }

      const { data, error } = await supabase.functions.invoke('generate-user-avatar', {
        body: { firstName },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.warn('Error calling Edge Function:', error);
        setIsEdgeFunctionAvailable(false);
        return getFallbackAvatar(firstName);
      }

      if (!data?.avatarUrl) {
        return getFallbackAvatar(firstName);
      }

      return data.avatarUrl;
    } catch (err) {
      console.error('Error generating avatar:', err);
      return getFallbackAvatar(firstName);
    }
  };

  const getFallbackAvatar = (name: string) => {
    // Use DiceBear's initials avatar as fallback
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=red`;
  };

  return { generateAvatar };
}