import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../hooks/useAdmin';
import { supabase } from '../lib/supabase';
import { Booking, Service, Beautician } from '../types';
import { formatDate } from '../lib/utils';
import toast from 'react-hot-toast';
import { User, Plus, Edit2, Trash2, X, Check, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

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
    <div className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] shadow-2xl shadow-gray-200/10 dark:shadow-none border border-gray-100 dark:border-gray-800 mt-12 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gold-600/20" />
      
      <div className="flex items-center justify-between mb-12">
        <div className="space-y-1">
          <h3 className="text-xl font-luxury font-bold text-gray-950 dark:text-white">未來 7 日預約趨勢</h3>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">Booking Forecast • Next 7 Days</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gold-500 rounded-full" />
          <span className="text-[10px] font-bold text-gray-500 uppercase">預約數</span>
        </div>
      </div>

      <div className="flex items-end justify-between h-56 gap-4 md:gap-8 px-2">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-4 group h-full justify-end">
            <div className="w-full relative flex flex-col items-center justify-end h-full">
              {/* Data Label */}
              <span className="text-xs font-black text-gold-600 mb-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-300">
                {d.count}
              </span>
              
              {/* Bar */}
              <div 
                className="w-full bg-gold-500 dark:bg-gold-600 rounded-2xl transition-all duration-700 ease-out hover:bg-gold-400 dark:hover:bg-gold-500 relative shadow-lg shadow-gold-500/10"
                style={{ height: `${(d.count / maxCount) * 80 + 5}%` }}
              >
                <div className="absolute inset-x-0 top-0 h-1/2 bg-white/20 rounded-t-2xl" />
              </div>
            </div>

            {/* Date Label */}
            <div className="text-center space-y-1">
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-tighter">
                {format(new Date(d.date), 'EEE', { locale: zhTW })}
              </p>
              <p className="text-[10px] font-bold text-gray-950 dark:text-white">
                {d.date.slice(8)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Modals ---

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  service?: Service;
}

const ServiceModal: React.FC<ServiceModalProps> = ({ isOpen, onClose, onSave, service }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    duration: 60,
    is_active: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration,
        is_active: service.is_active
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        duration: 60,
        is_active: true
      });
    }
  }, [service, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (service?.id) {
        const { error } = await supabase
          .from('services')
          .update(formData)
          .eq('id', service.id);
        if (error) throw error;
        toast.success('服務已更新');
      } else {
        const { error } = await supabase
          .from('services')
          .insert(formData);
        if (error) throw error;
        toast.success('已新增服務項目');
      }
      onSave();
      onClose();
    } catch (error: any) {
      toast.error('操作失敗: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] w-full max-w-lg border border-gray-100 dark:border-gray-800 shadow-2xl">
        <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
          <h2 className="text-2xl font-luxury font-bold text-gray-950 dark:text-white">
            {service ? '編輯服務項目' : '新增服務項目'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400">服務名稱</label>
            <input
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-gold-500 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">價格 (TWD)</label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: parseInt(e.target.value) })}
                className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-gold-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">時長 (分鐘)</label>
              <input
                type="number"
                required
                value={formData.duration}
                onChange={e => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-gold-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400">服務描述</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-gold-500 outline-none transition-all"
            />
          </div>

          <div className="pt-6 border-t border-gray-50 dark:border-gray-800 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 text-xs font-black uppercase tracking-widest border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 transition-all">取消</button>
            <button type="submit" disabled={loading} className="flex-1 py-4 text-xs font-black uppercase tracking-widest bg-gray-950 dark:bg-white text-white dark:text-gray-900 rounded-full hover:bg-gold-600 transition-all disabled:opacity-50">
              {loading ? '儲存中...' : '確認儲存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface BeauticianModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  beautician?: Beautician & { service_ids?: string[] };
  allServices: Service[];
}

const BeauticianModal: React.FC<BeauticianModalProps> = ({ isOpen, onClose, onSave, beautician, allServices }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    experience_years: 0,
    bio: '',
    avatar_url: '',
    specialties: [] as string[],
    service_ids: [] as string[]
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (beautician) {
      setFormData({
        full_name: beautician.full_name,
        experience_years: beautician.experience_years,
        bio: beautician.bio,
        avatar_url: beautician.avatar_url || '',
        specialties: beautician.specialties,
        service_ids: beautician.service_ids || []
      });
    } else {
      setFormData({
        full_name: '',
        experience_years: 0,
        bio: '',
        avatar_url: '',
        specialties: [],
        service_ids: []
      });
    }
  }, [beautician, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let bId = beautician?.id;

      if (bId) {
        const { error } = await supabase
          .from('beauticians')
          .update({
            full_name: formData.full_name,
            experience_years: formData.experience_years,
            bio: formData.bio,
            avatar_url: formData.avatar_url,
            specialties: formData.specialties
          })
          .eq('id', bId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('beauticians')
          .insert({
            full_name: formData.full_name,
            experience_years: formData.experience_years,
            bio: formData.bio,
            avatar_url: formData.avatar_url,
            specialties: formData.specialties
          })
          .select()
          .single();
        if (error) throw error;
        bId = data.id;
      }

      await supabase.from('beautician_services').delete().eq('beautician_id', bId);
      
      if (formData.service_ids.length > 0) {
        const assignments = formData.service_ids.map(sId => ({
          beautician_id: bId,
          service_id: sId
        }));
        const { error: assignError } = await supabase.from('beautician_services').insert(assignments);
        if (assignError) throw assignError;
      }

      toast.success(beautician ? '美容師資料已更新' : '已新增美容師');
      onSave();
      onClose();
    } catch (error: any) {
      toast.error('操作失敗: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-800 shadow-2xl">
        <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-900 z-10">
          <h2 className="text-2xl font-luxury font-bold text-gray-950 dark:text-white">
            {beautician ? '編輯美容師' : '新增美容師'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">姓名</label>
              <input
                required
                value={formData.full_name}
                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-gold-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">年資</label>
              <input
                type="number"
                required
                value={formData.experience_years}
                onChange={e => setFormData({ ...formData, experience_years: parseInt(e.target.value) })}
                className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-gold-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400">頭像 URL</label>
            <input
              value={formData.avatar_url}
              onChange={e => setFormData({ ...formData, avatar_url: e.target.value })}
              className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-gold-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400">簡介</label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={e => setFormData({ ...formData, bio: e.target.value })}
              className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-gold-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 block">指派服務項目</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {allServices.map(service => (
                <div 
                  key={service.id}
                  onClick={() => {
                    const ids = formData.service_ids.includes(service.id)
                      ? formData.service_ids.filter(id => id !== service.id)
                      : [...formData.service_ids, service.id];
                    setFormData({ ...formData, service_ids: ids });
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    formData.service_ids.includes(service.id)
                    ? 'border-gold-500 bg-gold-50/50 dark:bg-gold-900/10'
                    : 'border-gray-100 dark:border-gray-800 hover:border-gold-200'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{service.name}</p>
                    <p className="text-[10px] text-gray-400 uppercase">NT$ {service.price}</p>
                  </div>
                  {formData.service_ids.includes(service.id) && <Check size={16} className="text-gold-600" />}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-gray-50 dark:border-gray-800 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 text-xs font-black uppercase tracking-widest border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 text-xs font-black uppercase tracking-widest bg-gray-950 dark:bg-white text-white dark:text-gray-950 rounded-full hover:bg-gold-600 transition-all disabled:opacity-50"
            >
              {loading ? '儲存中...' : '確認儲存'}
            </button>
          </div>
        </form>
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
  const [beauticians, setBeauticians] = useState<(Beautician & { service_ids: string[] })[]>([]);
  const [stats, setStats] = useState({
    today: 0,
    week: 0,
    month: 0,
    revenue: 0
  });
  const [trendData, setTrendData] = useState<{ date: string; count: number }[]>([]);
  const [activeTab, setActiveTab] = useState<'bookings' | 'services' | 'beauticians' | 'schedule'>('bookings');
  const [filter, setFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'scheduled_at', direction: 'asc' });

  // Modal states
  const [isBeauticianModalOpen, setIsBeauticianModalOpen] = useState(false);
  const [selectedBeautician, setSelectedBeautician] = useState<any>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | undefined>(undefined);

  // Schedule states
  const [selectedBeauticianId, setSelectedBeauticianId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [daySlots, setDaySlots] = useState<any[]>([]);
  const [bulkStart, setBulkStart] = useState('10:00');
  const [bulkEnd, setBulkEnd] = useState('18:00');
  const [bulkInterval, setBulkInterval] = useState(60);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedBookings = useMemo(() => {
    const filtered = bookings.filter(b => filter === 'all' || b.status === filter);
    return [...filtered].sort((a: any, b: any) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [bookings, filter, sortConfig]);

  const fetchSchedule = useCallback(async () => {
    if (!selectedBeauticianId || !selectedDate) return;
    setScheduleLoading(true);
    const startDate = new Date(`${selectedDate}T00:00:00`).toISOString();
    const endDate = new Date(`${selectedDate}T23:59:59`).toISOString();

    const { data } = await supabase
      .from('time_slots')
      .select('*')
      .eq('beautician_id', selectedBeauticianId)
      .gte('slot_time', startDate)
      .lte('slot_time', endDate)
      .order('slot_time', { ascending: true });

    setDaySlots(data || []);
    setScheduleLoading(false);
  }, [selectedBeauticianId, selectedDate]);

  useEffect(() => {
    if (activeTab === 'schedule' && selectedBeauticianId && selectedDate) {
      fetchSchedule();
    }
  }, [activeTab, selectedBeauticianId, selectedDate, fetchSchedule]);

  const bulkGenerateSlots = async () => {
    if (!selectedBeauticianId || !selectedDate) {
      toast.error('請選擇美容師與日期');
      return;
    }

    setScheduleLoading(true);
    try {
      const slots = [];
      let current = new Date(`${selectedDate}T${bulkStart}:00`);
      const end = new Date(`${selectedDate}T${bulkEnd}:00`);

      while (current < end) {
        slots.push({
          beautician_id: selectedBeauticianId,
          slot_time: current.toISOString(),
          is_booked: false
        });
        current = new Date(current.getTime() + bulkInterval * 60000);
      }

      const { error } = await supabase.from('time_slots').insert(slots);

      if (error) {
        if (error.code === '23505') {
          toast.error('部分時段已存在，僅新增未重複項目');
        } else {
          throw error;
        }
      } else {
        toast.success(`已產生 ${slots.length} 個時段`);
      }
      fetchSchedule();
    } catch (error: any) {
      toast.error('產生失敗: ' + error.message);
    } finally {
      setScheduleLoading(false);
    }
  };

  const deleteSlot = async (id: string) => {
    const { error } = await supabase.from('time_slots').delete().eq('id', id);
    if (error) toast.error('刪除失敗');
    else {
      toast.success('時段已刪除');
      fetchSchedule();
    }
  };

  const calculateStats = useCallback((data: Booking[], servicesData: Service[]) => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysLater = new Date(startOfToday);
    sevenDaysLater.setDate(startOfToday.getDate() + 7);

    const currentMonthStr = format(now, 'yyyy-MM');
    
    // Revenue from confirmed bookings this month
    const monthlyRevenue = data
      .filter(b => b.status === 'confirmed' && b.scheduled_at.startsWith(currentMonthStr))
      .reduce((sum, b) => {
        const service = servicesData.find(s => s.id === b.service_id);
        return sum + (Number(service?.price) || 0);
      }, 0);

    const todayStr = format(now, 'yyyy-MM-dd');

    setStats({
      today: data.filter(b => b.scheduled_at.startsWith(todayStr)).length,
      week: data.filter(b => {
        const d = new Date(b.scheduled_at);
        return d >= startOfToday && d < sevenDaysLater;
      }).length,
      month: data.filter(b => b.scheduled_at.startsWith(currentMonthStr)).length,
      revenue: monthlyRevenue
    });

    // Trend Data (Forecast: Next 7 Days starting from Today)
    const trend = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(now.getDate() + i);
      const dateStr = format(d, 'yyyy-MM-dd');
      trend.push({
        date: dateStr,
        count: data.filter(b => b.scheduled_at.startsWith(dateStr)).length
      });
    }
    setTrendData(trend);
  }, []);

  const fetchData = useCallback(async () => {
    const { data: bookingsData } = await supabase.from('bookings').select('*').order('scheduled_at', { ascending: false });
    const { data: servicesData } = await supabase.from('services').select('*').order('created_at', { ascending: false });
    const { data: bData } = await supabase.from('beauticians').select('*, beautician_services(service_id)').order('created_at', { ascending: false });

    if (bookingsData) setBookings(bookingsData);
    if (servicesData) setServices(servicesData);
    if (bData) {
      setBeauticians(bData.map((b: any) => ({
        ...b,
        service_ids: b.beautician_services?.map((bs: any) => bs.service_id) || []
      })));
    }
    if (bookingsData && servicesData) calculateStats(bookingsData, servicesData);
  }, [calculateStats]);

  useEffect(() => {
    if (!adminLoading && isAdmin === false) {
      toast.error('無管理員權限');
      navigate('/');
    }
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
      const channel = supabase.channel('admin-dashboard').on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => fetchData()).subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [isAdmin, fetchData]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    const { error } = await supabase.from('bookings').update({ status: newStatus }).eq('id', id);
    if (error) toast.error('更新失敗');
    else {
      toast.success('狀態已更新');
      fetchData();
    }
  };

  const toggleServiceActive = async (service: Service) => {
    const { error } = await supabase.from('services').update({ is_active: !service.is_active }).eq('id', service.id);
    if (error) toast.error('更新失敗');
    else {
      toast.success(service.is_active ? '服務已停用' : '服務已啟用');
      fetchData();
    }
  };

  const deleteBeautician = async (id: string) => {
    if (!confirm('確定要刪除這位美容師嗎？')) return;
    const { error } = await supabase.from('beauticians').delete().eq('id', id);
    if (error) toast.error('刪除失敗');
    else {
      toast.success('美容師已刪除');
      fetchData();
    }
  };

  const filteredBookings = bookings.filter(b => filter === 'all' || b.status === filter);

  if (adminLoading || isAdmin === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-px w-12 bg-gold-600" />
            <span className="text-xs font-bold text-gold-600 uppercase tracking-widest">Workspace</span>
          </div>
          <h1 className="text-5xl font-luxury font-bold text-gray-950 dark:text-white">管理控制台</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard title="今日預約" value={stats.today} />
        <StatsCard title="本週預約" value={stats.week} />
        <StatsCard title="本月預約" value={stats.month} />
        <StatsCard title="本月預估營收" value={stats.revenue} unit="TWD" />
      </div>

      <TrendChart data={trendData} />

      <div className="mt-16 mb-10 border-b border-gray-100 dark:border-gray-800 flex gap-12 overflow-x-auto no-scrollbar">
        {[
          { id: 'bookings', label: '預約管理' },
          { id: 'beauticians', label: '美容師管理' },
          { id: 'schedule', label: '排班管理' },
          { id: 'services', label: '服務型錄' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${
              activeTab === tab.id ? 'text-gold-600' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gold-600 animate-in fade-in slide-in-from-left-2 duration-300" />}
          </button>
        ))}
      </div>

      {activeTab === 'bookings' && (
        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl shadow-gray-200/10 dark:shadow-none border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="text-xl font-luxury font-bold text-gray-950 dark:text-white">預約清單紀錄</h3>
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-full px-6 py-2 text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-gold-500 outline-none">
              <option value="all">全部狀態</option>
              <option value="pending">待確認</option>
              <option value="confirmed">已確認</option>
              <option value="cancelled">已取消</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50 dark:border-gray-800">
                  <th className="px-8 py-6 cursor-pointer hover:text-gold-600 transition-colors" onClick={() => handleSort('customer_name')}>
                    <div className="flex items-center gap-2">
                      顧客 {sortConfig.key === 'customer_name' ? (sortConfig.direction === 'asc' ? <ArrowUp size={10} /> : <ArrowDown size={10} />) : <ArrowUpDown size={10} />}
                    </div>
                  </th>
                  <th className="px-8 py-6 cursor-pointer hover:text-gold-600 transition-colors" onClick={() => handleSort('service_name')}>
                    <div className="flex items-center gap-2">
                      服務 {sortConfig.key === 'service_name' ? (sortConfig.direction === 'asc' ? <ArrowUp size={10} /> : <ArrowDown size={10} />) : <ArrowUpDown size={10} />}
                    </div>
                  </th>
                  <th className="px-8 py-6 cursor-pointer hover:text-gold-600 transition-colors" onClick={() => handleSort('scheduled_at')}>
                    <div className="flex items-center gap-2">
                      預約時間 {sortConfig.key === 'scheduled_at' ? (sortConfig.direction === 'asc' ? <ArrowUp size={10} /> : <ArrowDown size={10} />) : <ArrowUpDown size={10} />}
                    </div>
                  </th>
                  <th className="px-8 py-6 cursor-pointer hover:text-gold-600 transition-colors" onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-2">
                      狀態 {sortConfig.key === 'status' ? (sortConfig.direction === 'asc' ? <ArrowUp size={10} /> : <ArrowDown size={10} />) : <ArrowUpDown size={10} />}
                    </div>
                  </th>
                  <th className="px-8 py-6 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {sortedBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group">
                    <td className="px-8 py-6"><p className="font-luxury font-bold text-gray-950 dark:text-white">{b.customer_name}</p></td>
                    <td className="px-8 py-6 text-sm text-gray-500 dark:text-gray-400">{b.service_name}</td>
                    <td className="px-8 py-6 text-sm text-gray-500 dark:text-gray-400">{formatDate(b.scheduled_at)}</td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        b.status === 'confirmed' ? 'bg-green-50 text-green-700 border border-green-100' :
                        b.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-gold-50 text-gold-700 border border-gold-100'
                      }`}>{b.status === 'confirmed' ? '已確認' : b.status === 'cancelled' ? '已取消' : '待確認'}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-3 transition-opacity">
                        {b.status === 'pending' && (
                          <button 
                            onClick={() => handleStatusUpdate(b.id, 'confirmed')} 
                            className="p-2.5 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-full hover:bg-green-600 dark:hover:bg-green-500 hover:text-white transition-all border border-green-100 dark:border-green-500/20"
                            title="確認預約"
                          >
                            <Check size={16} strokeWidth={3} />
                          </button>
                        )}
                        {(b.status === 'pending' || b.status === 'confirmed') && (
                          <button 
                            onClick={() => handleStatusUpdate(b.id, 'cancelled')} 
                            className="p-2.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full hover:bg-rose-600 dark:hover:bg-rose-500 hover:text-white transition-all border border-rose-100 dark:border-rose-500/20"
                            title="取消預約"
                          >
                            <X size={16} strokeWidth={3} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'beauticians' && (
        <div className="space-y-8">
          <div className="flex justify-end">
            <button onClick={() => { setSelectedBeautician(null); setIsBeauticianModalOpen(true); }} className="px-8 py-4 bg-gray-950 dark:bg-white text-white dark:text-gray-950 rounded-full text-xs font-black uppercase tracking-widest hover:bg-gold-600 transition-all flex items-center gap-3 shadow-xl">
              <Plus size={16} />新增美容師
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {beauticians.map((b) => (
              <div key={b.id} className="group bg-white dark:bg-gray-900 rounded-[3rem] p-10 border border-gray-100 dark:border-gray-800 shadow-xl hover:-translate-y-2 transition-all duration-500">
                <div className="flex items-center gap-6 mb-8">
                  <img src={b.avatar_url || 'https://via.placeholder.com/64'} className="w-20 h-20 rounded-full object-cover border-4 border-gray-50 dark:border-gray-800" />
                  <div>
                    <h3 className="text-2xl font-luxury font-bold text-gray-950 dark:text-white">{b.full_name}</h3>
                    <p className="text-[10px] font-black text-gold-600 uppercase tracking-widest">{b.experience_years} Years Experience</p>
                  </div>
                </div>
                <div className="space-y-4 mb-10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Assigned Services</p>
                  <div className="flex flex-wrap gap-2">
                    {b.service_ids.map(sId => {
                      const service = services.find(s => s.id === sId);
                      return service ? <span key={sId} className="px-3 py-1 bg-gray-50 dark:bg-gray-800 text-[10px] text-gray-500 rounded-full border border-gray-100 dark:border-gray-700 font-bold">{service.name}</span> : null;
                    })}
                  </div>
                </div>
                <div className="flex gap-4 pt-8 border-t border-gray-50 dark:border-gray-800">
                  <button onClick={() => { setSelectedBeautician(b); setIsBeauticianModalOpen(true); }} className="flex-1 py-3 bg-gray-50 dark:bg-gray-800 text-gray-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gold-600 hover:text-white transition-all flex items-center justify-center gap-2"><Edit2 size={12} />編輯</button>
                  <button onClick={() => deleteBeautician(b.id)} className="p-3 text-rose-400 hover:text-rose-600 transition-colors"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1 space-y-6">
            <h3 className="text-xl font-luxury font-bold text-gray-950 dark:text-white mb-4">選擇美容師</h3>
            <div className="space-y-3">
              {beauticians.map(b => (
                <button key={b.id} onClick={() => setSelectedBeauticianId(b.id)} className={`w-full p-4 rounded-[2rem] border-2 transition-all flex items-center gap-4 ${selectedBeauticianId === b.id ? 'border-gold-50/50 dark:bg-gold-900/10 border-gold-500' : 'border-gray-100 dark:border-gray-800 hover:border-gold-200'}`}>
                  <img src={b.avatar_url} className="w-10 h-10 rounded-full object-cover" />
                  <span className="font-bold text-sm text-gray-950 dark:text-white">{b.full_name}</span>
                  {selectedBeauticianId === b.id && <Check size={16} className="ml-auto text-gold-600" />}
                </button>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-xl">
              <div className="flex flex-col md:flex-row justify-between gap-6 mb-10 pb-10 border-b border-gray-50 dark:border-gray-800">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">管理日期</label>
                  <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="block bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 text-sm outline-none" />
                </div>
                <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-[2rem] space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gold-600">批量產生時段</p>
                  <div className="flex flex-wrap gap-4 items-end">
                    <div className="space-y-1"><span className="text-[10px] text-gray-400 uppercase">開始</span><input type="time" value={bulkStart} onChange={e => setBulkStart(e.target.value)} className="block bg-white dark:bg-gray-900 rounded-lg p-2 text-xs border border-gray-200" /></div>
                    <div className="space-y-1"><span className="text-[10px] text-gray-400 uppercase">結束</span><input type="time" value={bulkEnd} onChange={e => setBulkEnd(e.target.value)} className="block bg-white dark:bg-gray-900 rounded-lg p-2 text-xs border border-gray-200" /></div>
                    <div className="space-y-1"><span className="text-[10px] text-gray-400 uppercase">間隔</span><select value={bulkInterval} onChange={e => setBulkInterval(parseInt(e.target.value))} className="block bg-white dark:bg-gray-900 rounded-lg p-2 text-xs border border-gray-200"><option value={30}>30</option><option value={60}>60</option></select></div>
                    <button onClick={bulkGenerateSlots} disabled={scheduleLoading || !selectedBeauticianId} className="px-6 py-2 bg-gray-950 dark:bg-white text-white dark:text-gray-900 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-gold-600 transition-all disabled:opacity-50">產生</button>
                  </div>
                </div>
              </div>
              {!selectedBeauticianId ? <div className="py-20 text-center"><User size={48} className="mx-auto text-gray-100 mb-4" /><p className="text-gray-400 italic">請先選擇美容師</p></div> : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {daySlots.map(slot => (
                    <div key={slot.id} className="relative group">
                      <div className={`p-4 rounded-2xl border text-center transition-all ${slot.is_booked ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-gold-200'}`}>
                        <p className={`font-bold text-sm ${slot.is_booked ? 'text-rose-600 dark:text-rose-400' : 'text-gray-900 dark:text-white'}`}>{format(new Date(slot.slot_time), 'HH:mm')}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-tighter">{slot.is_booked ? '已預約' : '可供預約'}</p>
                      </div>

                      {!slot.is_booked && <button onClick={() => deleteSlot(slot.id)} className="absolute -top-2 -right-2 p-1 bg-white dark:bg-gray-800 border rounded-full shadow-lg opacity-0 group-hover:opacity-100 text-rose-500"><X size={12} /></button>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'services' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {services.map((s) => (
            <div key={s.id} className="group bg-white dark:bg-gray-900 p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl hover:-translate-y-2 transition-all duration-500">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-luxury font-bold text-gray-950 dark:text-white group-hover:text-gold-600 transition-colors">{s.name}</h3>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${s.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>{s.is_active ? '營運中' : '已停用'}</span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-xs font-light italic mb-10 h-12 line-clamp-2">「{s.description}」</p>
              <div className="flex justify-between items-center mb-10 pb-10 border-b border-gray-50 dark:border-gray-800">
                <span className="text-3xl font-luxury font-bold text-gray-950 dark:text-white"><span className="text-[10px] text-gold-600 italic">NT$</span>{s.price}</span>
                <span className="text-[10px] font-black uppercase text-gray-400">{s.duration} MIN</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => { setSelectedService(s); setIsServiceModalOpen(true); }} className="py-4 text-[10px] font-black uppercase border border-gray-200 rounded-full hover:bg-gray-50 flex items-center justify-center gap-2"><Edit2 size={12} />編輯</button>
                <button onClick={() => toggleServiceActive(s)} className={`py-4 text-[10px] font-black uppercase rounded-full transition-all ${s.is_active ? 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white' : 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white'}`}>{s.is_active ? '立即停用' : '重新啟用'}</button>
              </div>
            </div>
          ))}
          <button onClick={() => { setSelectedService(undefined); setIsServiceModalOpen(true); }} className="border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[3rem] p-10 flex flex-col items-center justify-center text-gray-400 hover:border-gold-300 hover:text-gold-600 transition-all group">
            <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-4 group-hover:bg-gold-50"><Plus size={32} /></div>
            <span className="text-[10px] font-black uppercase tracking-widest">新增服務項目</span>
          </button>
        </div>
      )}

      <BeauticianModal isOpen={isBeauticianModalOpen} onClose={() => setIsBeauticianModalOpen(false)} onSave={fetchData} beautician={selectedBeautician} allServices={services} />
      <ServiceModal isOpen={isServiceModalOpen} onClose={() => setIsServiceModalOpen(false)} onSave={fetchData} service={selectedService} />
    </div>
  );
};

export default AdminDashboard;
