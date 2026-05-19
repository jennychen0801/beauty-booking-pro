import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Service, Beautician } from '../types';
import toast from 'react-hot-toast';
import { User, Clock, Check } from 'lucide-react';

const Booking: React.FC = () => {
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get('serviceId');
  const initialBeauticianId = searchParams.get('beauticianId');
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [service, setService] = useState<Service | null>(null);
  const [availableBeauticians, setAvailableBeauticians] = useState<Beautician[]>([]);
  const [selectedBeauticianId, setSelectedBeauticianId] = useState<string>(initialBeauticianId || '');
  const [customerName, setCustomerName] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!serviceId) {
        setFetchingData(false);
        return;
      }

      // 1. 獲取當前選擇的服務資訊
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

      // 2. 獲取所有提供「同名服務」的美容師
      const { data: sData, error: bError } = await supabase
        .from('services')
        .select('beautician_id, beauticians(*)')
        .eq('name', serviceData.name);

      if (!bError && sData) {
        // 提取美容師資訊並去重 (雖然理論上一個美容師只會提供一個同名服務，但保險起見)
        const beauticians: Beautician[] = sData
          .filter(item => item.beauticians)
          .map(item => (Array.isArray(item.beauticians) ? item.beauticians[0] : item.beauticians));

        setAvailableBeauticians(beauticians);

        // 如果 URL 有指定 ID，且該 ID 在可用名單中，則預選
        if (initialBeauticianId && beauticians.some(b => b.id === initialBeauticianId)) {
          setSelectedBeauticianId(initialBeauticianId);
        } else if (beauticians.length === 1) {
          // 如果只有一位，自動選中
          setSelectedBeauticianId(beauticians[0].id);
        } else if (!initialBeauticianId && serviceData.beautician_id) {
          // 預設選中該服務原本關聯的美容師
          setSelectedBeauticianId(serviceData.beautician_id);
        }
      }

      setFetchingData(false);
    };

    fetchData();
  }, [serviceId, initialBeauticianId]);


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

    setLoading(true);
    const isoScheduledAt = new Date(scheduledAt).toISOString();

    const { error } = await supabase.from('bookings').insert({
      customer_name: customerName,
      service_name: service.name,
      service_id: service.id,
      beautician_id: selectedBeauticianId,
      scheduled_at: isoScheduledAt,
      user_id: user.id,
      status: 'pending'
    });

    setLoading(false);
    if (error) {
      toast.error('預約失敗: ' + error.message);
    } else {
      toast.success('預約成功！');
      navigate('/my-bookings');
    }
  };

  if (fetchingData) {
    return (
      <div className="max-w-md mx-auto mt-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
          className="py-2 px-4 bg-indigo-600 text-white rounded-lg font-bold"
        >
          查看服務列表
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-12 p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">確認您的預約</h2>
        <p className="text-indigo-600 font-medium mt-1">服務：{service.name}</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 顧客姓名 */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">顧客姓名</label>
          <input
            type="text"
            required
            placeholder="請輸入您的真實姓名"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
          />
        </div>

        {/* 美容師挑選 */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">選擇美容師</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availableBeauticians.map((b) => (
              <div 
                key={b.id}
                onClick={() => setSelectedBeauticianId(b.id)}
                className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                  selectedBeauticianId === b.id 
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' 
                  : 'border-gray-100 dark:border-gray-800 hover:border-indigo-200'
                }`}
              >
                <img src={b.avatar_url} alt={b.full_name} className="w-12 h-12 rounded-full object-cover shadow-sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 dark:text-white truncate">{b.full_name}</p>
                  <p className="text-[10px] text-gray-500">{b.experience_years}年資歷</p>
                </div>
                {selectedBeauticianId === b.id && <Check className="w-5 h-5 text-indigo-600" />}
              </div>
            ))}
          </div>
        </div>

        {/* 預約時間 */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">預約時間</label>
          <div className="relative">
            <input
              type="datetime-local"
              required
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
            />
          </div>
          <p className="text-[10px] text-gray-400">※ 預約時間前 24 小時內不可修改</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 px-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-100 dark:shadow-none"
        >
          {loading ? '提交中...' : '確認預約'}
        </button>
      </form>
    </div>
  );
};

export default Booking;
