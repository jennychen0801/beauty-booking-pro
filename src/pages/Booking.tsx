import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Service, Beautician, TimeSlot } from '../types';
import toast from 'react-hot-toast';
import { User, Clock, Check, Calendar, ChevronRight, ChevronLeft } from 'lucide-react';
import { formatDate } from '../lib/utils';
import { format, parseISO, startOfDay } from 'date-fns';
import { zhTW } from 'date-fns/locale';

const Booking: React.FC = () => {
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get('serviceId');
  const initialBeauticianId = searchParams.get('beauticianId');
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [service, setService] = useState<Service | null>(null);
  const [availableBeauticians, setAvailableBeauticians] = useState<Beautician[]>([]);
  const [selectedBeauticianId, setSelectedBeauticianId] = useState<string>(initialBeauticianId || '');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(''); // YYYY-MM-DD
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  // 1. Fetch Service and Available Beauticians
  useEffect(() => {
    const fetchBaseData = async () => {
      if (!serviceId) {
        setFetchingData(false);
        return;
      }

      const { data: serviceData, error: sError } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .single();

      if (sError || !serviceData) {
        toast.error('無法取得服務資訊');
        setFetchingData(false);
        return;
      }
      setService(serviceData);

      const { data: bsData, error: bError } = await supabase
        .from('beautician_services')
        .select('beauticians(*)')
        .eq('service_id', serviceId);

      if (!bError && bsData) {
        const beauticians = bsData.map(bs => bs.beauticians).filter(Boolean) as unknown as Beautician[];
        setAvailableBeauticians(beauticians);

        if (initialBeauticianId && beauticians.some(b => b.id === initialBeauticianId)) {
          setSelectedBeauticianId(initialBeauticianId);
        } else if (beauticians.length === 1) {
          setSelectedBeauticianId(beauticians[0].id);
        }
      }
      setFetchingData(false);
    };

    fetchBaseData();
  }, [serviceId, initialBeauticianId]);

  // 2. Fetch Time Slots when Beautician is selected
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedBeauticianId) {
        setAvailableSlots([]);
        setSelectedDate('');
        setSelectedSlot('');
        return;
      }

      const { data, error } = await supabase
        .from('time_slots')
        .select('*')
        .eq('beautician_id', selectedBeauticianId)
        .eq('is_booked', false)
        .gt('slot_time', new Date().toISOString())
        .order('slot_time', { ascending: true });

      if (!error && data) {
        setAvailableSlots(data);
        // Default to first available date
        if (data.length > 0) {
          const firstDate = format(parseISO(data[0].slot_time), 'yyyy-MM-dd');
          setSelectedDate(firstDate);
        }
      }
    };

    fetchSlots();
  }, [selectedBeauticianId]);

  // Group slots by date
  const groupedSlots = useMemo(() => {
    const groups: Record<string, TimeSlot[]> = {};
    availableSlots.forEach(slot => {
      const date = format(parseISO(slot.slot_time), 'yyyy-MM-dd');
      if (!groups[date]) groups[date] = [];
      groups[date].push(slot);
    });
    return groups;
  }, [availableSlots]);

  const sortedDates = useMemo(() => Object.keys(groupedSlots).sort(), [groupedSlots]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('請先登入');
      return;
    }

    if (!service) {
      toast.error('請選擇有效的服務項目');
      return;
    }

    if (!selectedBeauticianId) {
      toast.error('請選擇美容師');
      return;
    }

    if (!selectedSlot) {
      toast.error('請選擇預約時間');
      return;
    }

    setLoading(true);

    const { error: rpcError } = await supabase.rpc('create_booking', {
      p_service_id: service.id,
      p_beautician_id: selectedBeauticianId,
      p_customer_name: customerName,
      p_service_name: service.name,
      p_scheduled_at: selectedSlot
    });

    setLoading(false);

    if (rpcError) {
      if (rpcError.message.includes('unique')) {
        toast.error('該時段已被預約，請選擇其他時間');
      } else {
        toast.error('預約失敗: ' + rpcError.message);
      }
      return;
    }

    toast.success('預約成功！');
    navigate('/my-bookings');
  };

  if (fetchingData) {
    return (
      <div className="max-w-md mx-auto mt-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600"></div>
      </div>
    );
  }

  if (!serviceId || !service) {
    return (
      <div className="max-w-md mx-auto mt-12 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl text-center">
        <h2 className="text-xl font-bold text-red-600 mb-4">尚未選擇服務項目</h2>
        <p className="text-gray-500 mb-6">請先從服務列表選擇您感興趣的項目。</p>
        <button 
          onClick={() => navigate('/services')}
          className="py-2 px-4 bg-gold-600 text-white rounded-lg font-bold"
        >
          查看服務列表
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-12 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-px w-12 bg-gold-600" />
          <span className="text-xs font-bold text-gold-600 uppercase tracking-widest">Booking Session</span>
        </div>
        <h1 className="text-5xl font-luxury font-bold text-gray-950 dark:text-white">確認您的預約</h1>
        <p className="text-gray-500 dark:text-gray-400 font-light">您正在預約：<span className="text-gold-600 font-bold">{service.name}</span></p>
      </div>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Column: Customer & Artisan Info */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/10 dark:shadow-none space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">顧客姓名</label>
              <input
                type="text"
                required
                placeholder="您的真實姓名"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-gold-500 outline-none transition-all dark:text-white"
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">選擇美容師</label>
              <div className="space-y-3">
                {availableBeauticians.map((b) => (
                  <div 
                    key={b.id}
                    onClick={() => setSelectedBeauticianId(b.id)}
                    className={`cursor-pointer p-4 rounded-[2rem] border-2 transition-all flex items-center gap-4 ${
                      selectedBeauticianId === b.id 
                      ? 'border-gold-500 bg-gold-50/50 dark:bg-gold-900/10' 
                      : 'border-gray-100 dark:border-gray-800 hover:border-gold-200'
                    }`}
                  >
                    <img src={b.avatar_url} alt={b.full_name} className="w-12 h-12 rounded-full object-cover shadow-md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-950 dark:text-white text-sm truncate">{b.full_name}</p>
                      <p className="text-[10px] text-gray-500 uppercase">{b.experience_years}年資歷</p>
                    </div>
                    {selectedBeauticianId === b.id && <Check className="w-4 h-4 text-gold-600" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Date & Time Picker */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-2xl shadow-gray-200/10 dark:shadow-none space-y-10">
            
            {/* Date Selection (Horizontal Scroll) */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase tracking-widest text-gold-600">Select Date</label>
                <Calendar size={14} className="text-gray-300" />
              </div>
              
              {!selectedBeauticianId ? (
                <div className="py-12 text-center bg-gray-50 dark:bg-gray-950 rounded-[2rem] border border-dashed border-gray-200 dark:border-gray-800">
                  <p className="text-xs text-gray-400 font-luxury italic">請先選擇一位美容師以解鎖排班日期</p>
                </div>
              ) : sortedDates.length === 0 ? (
                <div className="py-12 text-center bg-gray-50 dark:bg-gray-950 rounded-[2rem] border border-dashed border-gray-200 dark:border-gray-800">
                  <p className="text-xs text-gray-400 font-luxury italic">該美容師近期暫無可用排班</p>
                </div>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                  {sortedDates.map((dateStr) => {
                    const dateObj = parseISO(dateStr);
                    const isActive = selectedDate === dateStr;
                    return (
                      <button
                        type="button"
                        key={dateStr}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`flex-shrink-0 w-20 h-24 rounded-[2rem] border-2 flex flex-col items-center justify-center transition-all ${
                          isActive 
                          ? 'border-gold-500 bg-gold-600 text-white shadow-xl shadow-gold-600/20 scale-105' 
                          : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:border-gold-200'
                        }`}
                      >
                        <span className="text-[10px] font-black uppercase tracking-tighter mb-1">
                          {format(dateObj, 'EEE', { locale: zhTW })}
                        </span>
                        <span className="text-2xl font-luxury font-bold">
                          {format(dateObj, 'dd')}
                        </span>
                        <span className="text-[10px] font-medium mt-1">
                          {format(dateObj, 'MMM', { locale: zhTW })}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Time Slots for Selected Date */}
            {selectedDate && groupedSlots[selectedDate] && (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gold-600">Available Times</label>
                  <Clock size={14} className="text-gray-300" />
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {groupedSlots[selectedDate].map((slot) => {
                    const isActive = selectedSlot === slot.slot_time;
                    return (
                      <button
                        type="button"
                        key={slot.id}
                        onClick={() => setSelectedSlot(slot.slot_time)}
                        className={`py-4 rounded-2xl border text-xs font-bold transition-all ${
                          isActive
                          ? 'bg-gray-950 dark:bg-white text-white dark:text-gray-950 border-gray-950 dark:border-white shadow-lg scale-105'
                          : 'bg-gray-50 dark:bg-gray-800/50 border-transparent text-gray-700 dark:text-gray-300 hover:border-gold-200 hover:bg-white dark:hover:bg-gray-800'
                        }`}
                      >
                        {format(parseISO(slot.slot_time), 'HH:mm')}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !selectedSlot}
              className="w-full py-6 bg-gray-950 dark:bg-white text-white dark:text-gray-950 rounded-full font-black uppercase tracking-[0.2em] text-xs hover:bg-gold-600 dark:hover:bg-gold-500 dark:hover:text-white transition-all disabled:opacity-30 shadow-2xl shadow-gray-200 dark:shadow-none mt-4"
            >
              {loading ? '處理預約中...' : '確認即刻預約'}
            </button>
          </div>
          <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest">
            ※ 注意：預約時間前 24 小時內不可進行修改或取消
          </p>
        </div>
      </form>
    </div>
  );
};

export default Booking;
