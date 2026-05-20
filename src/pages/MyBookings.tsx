import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications';
import { supabase } from '../lib/supabase';
import { Booking, Beautician } from '../types';
import { formatDate, canModifyBooking } from '../lib/utils';
import ModifyBookingModal from '../components/ModifyBookingModal';
import ReviewModal from '../components/ReviewModal';
import toast from 'react-hot-toast';
import { User, Calendar, MapPin, Star, Check } from 'lucide-react';

interface BookingWithReview extends Booking {
  reviews?: { id: string }[];
  beauticians?: Beautician;
}

const MyBookings: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingWithReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<BookingWithReview | null>(null);
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  
  useRealtimeNotifications('customer', user?.id);

  const fetchBookings = useCallback(async () => {
    if (!user) {
      return;
    }
    
    setLoading(true);
    
    const { data, error } = await supabase
      .from('bookings')
      .select('*, reviews(id), beauticians(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching bookings:', error);
      toast.error('無法取得預約紀錄: ' + error.message);
    } else if (data) {
      setBookings(data);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleOpenModifyModal = (booking: BookingWithReview) => {
    setSelectedBooking(booking);
    setIsModifyModalOpen(true);
  };

  const handleOpenReviewModal = (booking: BookingWithReview) => {
    setSelectedBooking(booking);
    setIsReviewModalOpen(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <div className="space-y-4 mb-12">
        <div className="flex items-center gap-3">
          <div className="h-px w-12 bg-gold-600" />
          <span className="text-xs font-bold text-gold-600 uppercase tracking-widest">My Appointments</span>
        </div>
        <h1 className="text-5xl font-luxury font-bold text-gray-950 dark:text-white">我的預約紀錄</h1>
      </div>
      
      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-50 dark:bg-gray-900 rounded-[2rem] animate-pulse border border-gray-100 dark:border-gray-800"></div>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-800">
          <Calendar className="w-12 h-12 text-gray-200 dark:text-gray-800 mx-auto mb-4" />
          <p className="text-gray-400 font-luxury italic text-xl">目前尚無預約紀錄。</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking) => {
            const modifiable = (booking.status === 'pending' || booking.status === 'confirmed') && canModifyBooking(booking.scheduled_at);
            const isCompleted = booking.status === 'confirmed' && new Date(booking.scheduled_at) < new Date();
            const hasReviewed = (booking.reviews?.length || 0) > 0;
            const b = booking.beauticians;
            
            return (
              <div
                key={booking.id}
                className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/10 dark:shadow-none border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center gap-8 group hover:border-gold-200 dark:hover:border-gold-900/50 transition-all duration-500"
              >
                {/* Beautician Avatar */}
                <div className="flex-shrink-0 relative">
                  <img 
                    src={b?.avatar_url || 'https://via.placeholder.com/80'} 
                    alt={b?.full_name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-gray-50 dark:border-gray-800 shadow-lg group-hover:border-gold-500 transition-all"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md">
                    <Check className="w-3 h-3 text-gold-600" />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      booking.status === 'confirmed' ? 'bg-green-50 text-green-700 border border-green-100' :
                      booking.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                      'bg-gold-50 text-gold-700 border border-gold-100'
                    }`}>
                      {booking.status === 'confirmed' ? (isCompleted ? '服務已完成' : '已確認預約') :
                       booking.status === 'cancelled' ? '預約已取消' : '等待確認中'}
                    </span>
                    {isCompleted && hasReviewed && (
                      <div className="flex items-center gap-1 text-gold-600">
                        <Star size={10} className="fill-current" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">已評價</span>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-2xl font-luxury font-bold text-gray-950 dark:text-white">
                    {booking.service_name}
                  </h3>
                  
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500 dark:text-gray-400 font-light">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-gold-600" />
                      <span className="font-medium text-gray-700 dark:text-gray-200">{b?.full_name || '專業美容師'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gold-600" />
                      <span>{formatDate(booking.scheduled_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 min-w-[140px]">
                  {modifiable && (
                    <button
                      onClick={() => handleOpenModifyModal(booking)}
                      className="w-full py-3 px-6 bg-gray-950 dark:bg-white text-white dark:text-gray-950 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-gold-600 dark:hover:bg-gold-500 dark:hover:text-white transition-all shadow-lg"
                    >
                      修改預約
                    </button>
                  )}

                  {isCompleted && !hasReviewed && (
                    <button
                      onClick={() => handleOpenReviewModal(booking)}
                      className="w-full py-3 px-6 bg-gold-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-gray-950 transition-all shadow-lg"
                    >
                      留下評價
                    </button>
                  )}
                  
                  {!modifiable && !isCompleted && (booking.status === 'pending' || booking.status === 'confirmed') && (
                    <div className="text-center md:text-right">
                      <p className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">不可修改</p>
                      <p className="text-[9px] text-gray-300 mt-0.5">預約前 24 小時內</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedBooking && isModifyModalOpen && (
        <ModifyBookingModal
          booking={selectedBooking}
          isOpen={isModifyModalOpen}
          onClose={() => setIsModifyModalOpen(false)}
          onSuccess={fetchBookings}
        />
      )}

      {selectedBooking && isReviewModalOpen && selectedBooking.beautician_id && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          bookingId={selectedBooking.id}
          beauticianId={selectedBooking.beautician_id}
          onSuccess={fetchBookings}
        />
      )}
    </div>
  );
};

export default MyBookings;
