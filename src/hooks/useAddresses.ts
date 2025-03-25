import { useState, useEffect } from 'react';
import { DeliveryAddress } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

const STORAGE_KEY = 'lacantinax_addresses';
const USER_INFO_KEY = 'lacantinax_user_info';

export interface UserInfo {
  name: string;
  email: string;
}

export function useAddresses() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(() => {
    const savedUserInfo = localStorage.getItem(USER_INFO_KEY);
    return savedUserInfo ? JSON.parse(savedUserInfo) : null;
  });

  // Load addresses based on authentication state
  useEffect(() => {
    if (user) {
      // Load addresses from Supabase for authenticated users
      loadAddressesFromSupabase();
    } else {
      // Load addresses from localStorage for guests
      const savedAddresses = localStorage.getItem(STORAGE_KEY);
      setAddresses(savedAddresses ? JSON.parse(savedAddresses) : []);
    }
  }, [user]);

  // Save addresses to localStorage for guests
  useEffect(() => {
    if (!user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
    }
  }, [addresses, user]);

  // Save user info to localStorage (only for guests)
  useEffect(() => {
    if (userInfo) {
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
    }
  }, [userInfo]);

  const loadAddressesFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our frontend model
      const transformedAddresses = data.map(addr => ({
        id: addr.id,
        recipientName: addr.recipient_name,
        phone: addr.phone,
        address: addr.address,
        province: addr.province,
        municipality: addr.municipality
      }));

      setAddresses(transformedAddresses);
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const addAddress = async (address: DeliveryAddress) => {
    if (user) {
      // Add address to Supabase for authenticated users
      try {
        const { error } = await supabase
          .from('addresses')
          .insert([{
            id: address.id,
            user_id: user.id,
            recipient_name: address.recipientName,
            phone: address.phone,
            address: address.address,
            province: address.province,
            municipality: address.municipality
          }]);

        if (error) throw error;
        await loadAddressesFromSupabase();
      } catch (error) {
        console.error('Error adding address:', error);
        throw error;
      }
    } else {
      // Add address to localStorage for guests
      setAddresses(prev => [address, ...prev]);
    }
  };

  const removeAddress = async (addressId: string) => {
    if (user) {
      // Remove address from Supabase for authenticated users
      try {
        const { error } = await supabase
          .from('addresses')
          .delete()
          .eq('id', addressId)
          .eq('user_id', user.id);

        if (error) throw error;
        await loadAddressesFromSupabase();
      } catch (error) {
        console.error('Error removing address:', error);
        throw error;
      }
    } else {
      // Remove address from localStorage for guests
      setAddresses(prev => prev.filter(addr => addr.id !== addressId));
    }
  };

  const saveUserInfo = (info: UserInfo) => {
    setUserInfo(info);
  };

  return {
    addresses,
    addAddress,
    removeAddress,
    userInfo,
    saveUserInfo,
    isLoading: false
  };
}