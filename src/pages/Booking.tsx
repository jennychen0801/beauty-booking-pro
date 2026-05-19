import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Service } from '../types';
import toast from 'react-hot-toast';

const Booking: React.FC = () => {
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get('serviceId');
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [service, setService] = useState<Service | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingService, setFetchingService] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      if (!serviceId) {
        setFetchingService(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .single();

      if (error) {
        console.error('Error fetching service:', error);
        toast.error('無法取得服務資訊');
      } else if (data) {
        setService(data);
      }
      setFetchingService(false);
    };

    fetchService();
  }, [serviceId]);

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

    setLoading(true);
    
    // 關鍵修正：確保寫入資料庫的時間字串帶有時區資訊 (Z)
    // HTML datetime-local 的 value 是 "YYYY-MM-DDTHH:mm"，不帶時區。
    // 直接 new Date(value).toISOString() 會將該本地時間轉換為正確的 UTC 格式並加上 "Z"。
    const isoScheduledAt = new Date(scheduledAt).toISOString();

    const { error } = await supabase.from('bookings').insert({
      customer_name: customerName,
      service_name: service.name,
      service_id: service.id, // 確保關聯 ID
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

  if (fetchingService) {
    return (
      <div className="max-w-md mx-auto mt-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!serviceId || !service) {
    return (
      <div className="max-w-md mx-auto mt-12 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl text-center">
        <h2 className="text-xl font-bold text-red-600 mb-4">服務項目無效</h2>
        <button 
          onClick={() => navigate('/services')}
          className="py-2 px-4 bg-indigo-600 text-white rounded-lg"
        >
          返回服務列表
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-12 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
      <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">確認預約</h2>
      <p className="text-indigo-600 font-medium mb-6">{service.name}</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">顧客姓名</label>
          <input
            type="text"
            required
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700 p-2 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">預約時間</label>
          <input
            type="datetime-local"
            required
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700 p-2 text-gray-900 dark:text-white"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {loading ? '提交中...' : '確認預約'}
        </button>
      </form>
    </div>
  );
};

export default Booking;
