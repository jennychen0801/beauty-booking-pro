import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../hooks/useAdmin';
import { supabase } from '../lib/supabase';
import { Booking, Service } from '../types';
import { formatDate } from '../lib/utils';
import toast from 'react-hot-toast';

// --- Sub-components ---

const StatsCard = ({ title, value, unit = '' }: { title: string; value: number | string; unit?: string }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{title}</h3>
    <p className="text-3xl font-bold text-gray-900 dark:text-white">
      {value} <span className="text-sm font-normal text-gray-500">{unit}</span>
    </p>
  </div>
);

const TrendChart = ({ data }: { data: { date: string; count: number }[] }) => {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mt-8">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">近 7 天預約趨勢</h3>
      <div className="flex items-end justify-between h-48 gap-2">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
            <div 
              className="w-full bg-indigo-500 rounded-t-lg transition-all hover:bg-indigo-600 relative"
              style={{ height: `${(d.count / maxCount) * 100}%` }}
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                {d.count}
              </div>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 rotate-45 md:rotate-0 origin-center">
              {d.date.slice(5)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main Dashboard Component ---

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdmin();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [stats, setStats] = useState({
    today: 0,
    week: 0,
    month: 0,
    revenue: 0
  });
  const [trendData, setTrendData] = useState<{ date: string; count: number }[]>([]);
  const [activeTab, setActiveTab] = useState<'bookings' | 'services'>('bookings');
  const [filter, setFilter] = useState('all');

  const calculateStats = useCallback((data: Booking[]) => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    // Revenue from completed bookings
    const monthlyRevenue = data
      .filter(b => b.status === 'confirmed' && b.scheduled_at.startsWith(todayStr.slice(0, 7)))
      .length * 1500; // Simplified for demo, should sum actual prices

    setStats({
      today: data.filter(b => b.scheduled_at.startsWith(todayStr)).length,
      week: data.filter(b => {
        const d = new Date(b.scheduled_at);
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return d >= weekAgo;
      }).length,
      month: data.filter(b => b.scheduled_at.startsWith(todayStr.slice(0, 7))).length,
      revenue: monthlyRevenue
    });

    // Trend Data (Last 7 Days)
    const trend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      trend.push({
        date: dateStr,
        count: data.filter(b => b.scheduled_at.startsWith(dateStr)).length
      });
    }
    setTrendData(trend);
  }, []);

  const fetchData = useCallback(async () => {
    // Fetch all bookings for management and stats
    const { data: bookingsData } = await supabase
      .from('bookings')
      .select('*')
      .order('scheduled_at', { ascending: false });

    // Fetch services
    const { data: servicesData } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: false });

    if (bookingsData) setBookings(bookingsData);
    if (servicesData) setServices(servicesData);
    
    if (bookingsData) {
      calculateStats(bookingsData);
    }
  }, [calculateStats]);

  // Authorization check
  useEffect(() => {
    if (!adminLoading && isAdmin === false) {
      toast.error('無管理員權限');
      navigate('/');
    }
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();

      // Real-time subscription
      const channel = supabase
        .channel('admin-dashboard')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
          fetchData();
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [isAdmin, fetchData]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) toast.error('更新失敗');
    else toast.success('狀態已更新');
  };

  const toggleServiceActive = async (service: Service) => {
    const { error } = await supabase
      .from('services')
      .update({ is_active: !service.is_active })
      .eq('id', service.id);

    if (error) toast.error('更新失敗');
    else {
      toast.success(service.is_active ? '服務已停用' : '服務已啟用');
      fetchData();
    }
  };

  const filteredBookings = bookings.filter(b => filter === 'all' || b.status === filter);

  if (adminLoading || isAdmin === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">管理控制台</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard title="今日預約" value={stats.today} />
        <StatsCard title="本週預約" value={stats.week} />
        <StatsCard title="本月預約" value={stats.month} />
        <StatsCard title="本月預估營收" value={stats.revenue} unit="TWD" />
      </div>

      <TrendChart data={trendData} />

      {/* Tabs */}
      <div className="mt-12 mb-6 border-b border-gray-200 dark:border-gray-700 flex gap-8">
        <button 
          onClick={() => setActiveTab('bookings')}
          className={`pb-4 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'bookings' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          預約管理
        </button>
        <button 
          onClick={() => setActiveTab('services')}
          className={`pb-4 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'services' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          服務項目
        </button>
      </div>

      {activeTab === 'bookings' ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 dark:text-white">預約列表</h3>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">全部狀態</option>
              <option value="pending">待確認</option>
              <option value="confirmed">已確認</option>
              <option value="cancelled">已取消</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-4">顧客</th>
                  <th className="px-6 py-4">服務</th>
                  <th className="px-6 py-4">預約時間</th>
                  <th className="px-6 py-4">狀態</th>
                  <th className="px-6 py-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{b.customer_name}</td>
                    <td className="px-6 py-4">{b.service_name}</td>
                    <td className="px-6 py-4">{formatDate(b.scheduled_at)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        b.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        b.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {b.status === 'confirmed' ? '已確認' : b.status === 'cancelled' ? '已取消' : '待確認'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {b.status === 'pending' && (
                        <button 
                          onClick={() => handleStatusUpdate(b.id, 'confirmed')}
                          className="text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          確認
                        </button>
                      )}
                      {b.status !== 'cancelled' && (
                        <button 
                          onClick={() => handleStatusUpdate(b.id, 'cancelled')}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          取消
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <div key={s.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{s.name}</h3>
                <span className={`px-2 py-1 rounded text-xs ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {s.is_active ? '營運中' : '已停用'}
                </span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 h-10 overflow-hidden">{s.description}</p>
              <div className="flex justify-between items-center mb-6">
                <span className="text-xl font-bold text-indigo-600">${s.price}</span>
                <span className="text-sm text-gray-500">{s.duration} 分鐘</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => toast.success('編輯功能將於下版本開放')}
                  className="py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  編輯
                </button>
                <button 
                  onClick={() => toggleServiceActive(s)}
                  className={`py-2 text-sm rounded-lg ${
                    s.is_active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'
                  }`}
                >
                  {s.is_active ? '停用' : '啟用'}
                </button>
              </div>
            </div>
          ))}
          <button 
            onClick={() => toast.success('新增功能將於下版本開放')}
            className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-500 hover:border-indigo-300 hover:text-indigo-500 transition-all"
          >
            <span className="text-3xl mb-2">+</span>
            <span>新增服務</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
