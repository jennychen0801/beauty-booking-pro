import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Booking, Beautician, Service } from '../types';
import toast from 'react-hot-toast';
import { formatDate } from '../lib/utils';
import { format, addDays } from 'date-fns';
import { User, Check, Clock } from 'lucide-react';

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

interface BeauticianOption extends Beautician {
  target_service_id: string;
}

const ModifyBookingModal: React.FC<ModifyBookingModalProps> = ({ booking, isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [availableBeauticians, setAvailableBeauticians] = useState<BeauticianOption[]>([]);
  const [selectedBeauticianId, setSelectedBeauticianId] = useState<string>(booking.beautician_id || '');
  const [selectedDate, setSelectedDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [selectedSlot, setSelectedSlot] = useState<string>('');

  // 獲取提供相同服務的其他美容師
  const fetchAlternativeBeauticians = useCallback(async () => {
    const { data, error } = await supabase
      .from('services')
      .select('beautician_id, id, beauticians(*)')
      .eq('name', booking.service_name);

    if (!error && data) {
      const options: BeauticianOption[] = data.map(item => ({
        ...item.beauticians,
        target_service_id: item.id
      }));
      setAvailableBeauticians(options);
    }
  }, [booking.service_name]);

  // 當 Modal 開啟時，重置狀態
  useEffect(() => {
    if (isOpen) {
      setSelectedDate(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
      setSelectedSlot('');
      setSelectedBeauticianId(booking.beautician_id || '');
      fetchAlternativeBeauticians();
    }
  }, [isOpen, booking.id, booking.beautician_id, fetchAlternativeBeauticians]);

  // 當日期或美容師改變時，清空已選擇的時段
  useEffect(() => {
    setSelectedSlot('');
  }, [selectedDate, selectedBeauticianId]);

  const fetchAvailableSlots = useCallback(async () => {
    const currentServiceId = availableBeauticians.find(b => b.id === selectedBeauticianId)?.target_service_id || booking.service_id;
    
    setLoading(true);
    const startDate = new Date(`${selectedDate}T00:00:00`).toISOString();
    const endDate = new Date(`${selectedDate}T23:59:59`).toISOString();

    const { data, error } = await supabase
      .from('time_slots')
      .select('id, slot_time')
      .eq('service_id', currentServiceId)
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
  }, [selectedDate, selectedBeauticianId, availableBeauticians, booking.service_id]);

  useEffect(() => {
    if (isOpen && selectedBeauticianId) {
      fetchAvailableSlots();
    }
  }, [isOpen, selectedBeauticianId, fetchAvailableSlots]);

  const handleReschedule = async () => {
    if (!selectedSlot) {
      toast.error('請選擇新時段');
      return;
    }

    const targetBeautician = availableBeauticians.find(b => b.id === selectedBeauticianId);
    
    setLoading(true);
    // 確保參數名稱與 SQL 定義完全一致
    const { error } = await supabase.rpc('reschedule_booking', {
      p_booking_id: booking.id,
      p_new_time: selectedSlot,
      p_new_beautician_id: selectedBeauticianId || null,
      p_new_service_id: targetBeautician?.target_service_id || null
    });

    if (error) {
      toast.error(`修改失敗: ${error.message}`);
    } else {
      toast.success('預約已成功修改！');
      onSuccess();
      onClose();
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">修改預約內容</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
          {/* 目前資訊摘要 */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-800/30">
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold mb-1 uppercase tracking-wider">目前服務：</p>
            <p className="text-gray-900 dark:text-white font-black text-lg">{booking.service_name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(booking.scheduled_at)}</p>
          </div>

          {/* 挑選美容師 */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">更換美容師 (可選)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableBeauticians.map((b) => (
                <div 
                  key={b.id}
                  onClick={() => setSelectedBeauticianId(b.id)}
                  className={`cursor-pointer p-3 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                    selectedBeauticianId === b.id 
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' 
                    : 'border-gray-100 dark:border-gray-800 hover:border-indigo-200'
                  }`}
                >
                  <img src={b.avatar_url} alt={b.full_name} className="w-10 h-10 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{b.full_name}</p>
                    <p className="text-[10px] text-gray-500">{b.experience_years}年經驗</p>
                  </div>
                  {selectedBeauticianId === b.id && <Check className="w-4 h-4 text-indigo-600" />}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">選擇日期</label>
              <input
                type="date"
                min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">選擇新時段</label>
              {loading && availableSlots.length === 0 ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                </div>
              ) : availableSlots.length === 0 ? (
                <p className="text-xs text-red-500 py-3 bg-red-50 dark:bg-red-900/10 rounded-xl text-center">該日期暫無可用時段</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot.slot_time)}
                      className={`py-2 px-3 text-xs rounded-xl border-2 transition-all font-bold ${
                        selectedSlot === slot.slot_time
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                          : 'bg-white dark:bg-gray-700 border-gray-100 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-indigo-300'
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
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 font-bold transition-colors"
          >
            取消
          </button>
          <button
            disabled={loading || !selectedSlot}
            onClick={handleReschedule}
            className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-lg shadow-indigo-100 dark:shadow-none transition-all"
          >
            {loading ? '處理中...' : '確認修改'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModifyBookingModal;
