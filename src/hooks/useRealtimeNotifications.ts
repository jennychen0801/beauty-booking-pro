import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

type Booking = {
  id: string;
  customer_name: string;
  service_name: string;
  scheduled_at: string;
  status: string;
  user_id: string;
};

export const useRealtimeNotifications = (role: 'admin' | 'customer', userId?: string) => {
  useEffect(() => {
    if (role === 'admin') {
      const adminChannel = supabase
        .channel('admin-bookings-insert')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'bookings',
          },
          (payload) => {
            const newBooking = payload.new as Booking;
            const date = new Date(newBooking.scheduled_at).toLocaleString();
            toast.success(
              `新預約！${newBooking.customer_name} 預約了 ${newBooking.service_name} - ${date}`,
              { duration: 5000 }
            );
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(adminChannel);
      };
    }

    if (role === 'customer' && userId) {
      const customerChannel = supabase
        .channel(`customer-bookings-update-${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'bookings',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const oldBooking = payload.old as Booking;
            const newBooking = payload.new as Booking;
            
            if (oldBooking.status === 'pending' && newBooking.status === 'confirmed') {
              const date = new Date(newBooking.scheduled_at).toLocaleString();
              toast.success(
                `您的預約已確認！${newBooking.service_name} - ${date}`,
                { duration: 6000 }
              );
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(customerChannel);
      };
    }
  }, [role, userId]);
};
