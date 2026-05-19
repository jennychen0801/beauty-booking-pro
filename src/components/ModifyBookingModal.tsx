import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Booking } from '../types';
import toast from 'react-hot-toast';
import { formatDate } from '../lib/utils';
import { format, addDays } from 'date-fns';

interface ModifyBookingModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface TimeSlot {
  id: string;
  slot_time: string;
}

const ModifyBookingModal: React.FC<ModifyBookingModalProps> = ({ booking, isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [selectedSlot, setSelectedSlot] = useState<string>('');

  // 當 Modal 開啟時，重置為預設日期並清空選擇的時段
  useEffect(() => {
    if (isOpen) {
      setSelectedDate(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
      setSelectedSlot('');
    }
  }, [isOpen, booking.id]);

  // 當日期改變時，清空已選擇的時段
  useEffect(() => {
    setSelectedSlot('');
  }, [selectedDate]);

  const fetchAvailableSlots = useCallback(async () => {
    setLoading(true);
    // 修正時區問題：確保查詢範圍涵蓋當地的整天
    const startDate = new Date(`${selectedDate}T00:00:00`).toISOString();
    const endDate = new Date(`${selectedDate}T23:59:59`).toISOString();

    const { data, error } = await supabase
      .from('time_slots')
      .select('id, slot_time')
      .eq('service_id', booking.service_id)
      .eq('is_booked', false)
      .gte('slot_time', startDate)
      .lte('slot_time', endDate)
      .order('slot_time', { ascending: true });

    if (error) {
      toast.error('無法取得可用時段');
    } else {
      setAvailableSlots(data || []);
    }
    setLoading(false);
  }, [selectedDate, booking.service_id]);

  useEffect(() => {
    if (isOpen && booking.service_id) {
      fetchAvailableSlots();
    }
  }, [isOpen, booking.service_id, fetchAvailableSlots]);

  const handleReschedule = async () => {
    if (!selectedSlot) {
      toast.error('請選擇新時段');
      return;
    }

    setLoading(true);
    const { error } = await supabase.rpc('reschedule_booking', {
      p_booking_id: booking.id,
      p_new_time: selectedSlot
    });

    if (error) {
      toast.error(`修改失敗: ${error.message}`);
    } else {
      toast.success('預約時間已成功修改！');
      onSuccess();
      onClose();
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">修改預約時間</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
            <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-1">目前預約：</p>
            <p className="text-gray-900 dark:text-white font-bold">{booking.service_name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(booking.scheduled_at)}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">選擇日期</label>
              <input
                type="date"
                min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">選擇新時段</label>
              {loading && availableSlots.length === 0 ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                </div>
              ) : availableSlots.length === 0 ? (
                <p className="text-sm text-red-500 py-2">該日期暫無可用時段</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot.slot_time)}
                      className={`py-2 px-3 text-sm rounded-lg border transition-all ${
                        selectedSlot === slot.slot_time
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                          : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      {format(new Date(slot.slot_time), 'HH:mm')}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 font-medium"
          >
            取消
          </button>
          <button
            disabled={loading || !selectedSlot}
            onClick={handleReschedule}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md shadow-indigo-200 dark:shadow-none"
          >
            {loading ? '處理中...' : '確認修改'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModifyBookingModal;
