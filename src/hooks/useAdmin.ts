import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';

export function useAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      // Browser console logs
      console.log('🔍 Starting admin status check...');
      console.log('Current user:', user ? { id: user.id, email: user.email } : 'No user');
      
      if (!user) {
        console.log('❌ No user found, setting isAdmin to false');
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Log the query we're about to make
        const query = supabase
          .from('staff_members')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        // Log the generated SQL (this will show in the Supabase dashboard)
        await supabase.rpc('http_request_log', {
          message: `Checking admin status for user ${user.id}`,
          method: 'GET',
          path: '/staff_members'
        });
        
        const { data, error } = await query;

        // Log the result in Supabase
        await supabase.rpc('http_request_log', {
          message: `Admin check result: ${JSON.stringify({ data, error })}`,
          method: 'GET',
          path: '/staff_members/result'
        });

        if (error) {
          console.error('❌ Error in staff member query:', error);
          throw error;
        }
        
        const hasAdminRole = !!data && data.role === 'admin';
        
        setIsAdmin(hasAdminRole);
        
        // Log the final status
        await supabase.rpc('http_request_log', {
          message: `Admin status set to: ${hasAdminRole} for user ${user.id}`,
          method: 'GET',
          path: '/staff_members/status'
        });
      } catch (err) {
        console.error('❌ Error checking admin status:', err);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  return { isAdmin, loading };
}