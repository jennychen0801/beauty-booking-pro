import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications';
import { supabase } from '../lib/supabase';
import { Booking } from '../types';
import { formatDate } from '../lib/utils';

const MyBookings: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  
  useRealtimeNotifications('customer', user?.id);

  useEffect(() => {
    if (user) {
      const fetchBookings = async () => {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('user_id', user.id)
          .order('scheduled_at', { ascending: false });
        
        if (!error && data) {
          setBookings(data);
        }
        setLoading(false);
      };

      fetchBookings();
    }
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">我的預約</h1>
      
      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow">
          <p className="text-gray-500 dark:text-gray-400">尚無預約紀錄。</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700 flex justify-between items-center"
            >
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{booking.service_name}</h3>
                <p className="text-gray-500 dark:text-gray-400">{formatDate(booking.scheduled_at)}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-4 py-1 rounded-full text-sm font-semibold ${
                  booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                  booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {booking.status === 'confirmed' ? '已確認' :
                   booking.status === 'cancelled' ? '已取消' : '待確認'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
