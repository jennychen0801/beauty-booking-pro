import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Service, Beautician } from '../types';
import { supabase } from '../lib/supabase';
import { User, Check } from 'lucide-react';

interface ServiceWithBeautician extends Service {
  beauticians?: {
    full_name: string;
    id: string;
  };
}

interface ServiceGroup {
  name: string;
  description: string;
  price: number;
  duration: number;
  beauticians: {
    id: string;
    full_name: string;
    avatar_url?: string;
    service_id: string;
  }[];
}

const Services: React.FC = () => {
  const [serviceGroups, setServiceGroups] = useState<ServiceGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*, beauticians(id, full_name, avatar_url)')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching services:', error);
      } else if (data) {
        // Group services by name
        const groups: { [key: string]: ServiceGroup } = {};
        data.forEach((item: any) => {
          if (!groups[item.name]) {
            groups[item.name] = {
              name: item.name,
              description: item.description,
              price: item.price,
              duration: item.duration,
              beauticians: []
            };
          }
          if (item.beauticians) {
            groups[item.name].beauticians.push({
              id: item.beauticians.id,
              full_name: item.beauticians.full_name,
              avatar_url: item.beauticians.avatar_url,
              service_id: item.id
            });
          }
        });
        setServiceGroups(Object.values(groups));
      }
      setLoading(false);
    };

    fetchServices();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-px w-12 bg-gold-600" />
            <span className="text-xs font-bold text-gold-600 uppercase tracking-widest">Our Selection</span>
          </div>
          <h2 className="text-6xl font-luxury font-bold text-gray-950 dark:text-white">極致美容清單</h2>
        </div>
        <p className="text-gray-500 dark:text-gray-400 max-w-xs text-sm font-light leading-relaxed">
          精選頂級奢華護理，針對您的肌膚需求，提供最精準的美學方案。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {serviceGroups.length === 0 ? (
          <div className="col-span-full text-center py-32 bg-gray-50 dark:bg-gray-900/50 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-800">
            <p className="text-gray-400 font-luxury italic text-xl">目前尚無服務項目，敬請期待。</p>
          </div>
        ) : (
          serviceGroups.map((group) => (
            <div
              key={group.name}
              className="group bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl shadow-gray-200/10 dark:shadow-none overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row"
            >
              <div className="p-10 flex-1 space-y-8">
                <div className="space-y-4">
                  <h3 className="text-3xl font-luxury font-bold text-gray-900 dark:text-white">
                    {group.name}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-light leading-relaxed">
                    {group.description}
                  </p>
                </div>
                
                <div className="flex justify-between items-center py-6 border-y border-gray-50 dark:border-gray-800">
                  <span className="text-3xl font-luxury font-bold text-gray-950 dark:text-white">
                    <span className="text-sm font-sans mr-1 text-gold-600 font-black italic">NT$</span>
                    {group.price}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    {group.duration} Minutes
                  </span>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gold-600">Available Artisans</p>
                  <div className="flex flex-wrap gap-3">
                    {group.beauticians.map((b) => (
                      <Link 
                        key={b.id}
                        to={`/beautician/${b.id}`}
                        className="group/avatar relative"
                        title={b.full_name}
                      >
                        <img 
                          src={b.avatar_url || 'https://via.placeholder.com/40'} 
                          alt={b.full_name}
                          className="w-12 h-12 rounded-full border-2 border-white dark:border-gray-800 shadow-lg group-hover/avatar:border-gold-500 transition-all"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-gold-500 text-white p-0.5 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                          <Check size={8} />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 p-10 w-full md:w-64 flex flex-col justify-center gap-4 border-l border-gray-100 dark:border-gray-800">
                <p className="text-[10px] font-black uppercase tracking-widest text-center text-gray-400 mb-2">Select Artisan to Book</p>
                {group.beauticians.map((b) => (
                  <Link
                    key={b.id}
                    to={`/booking?serviceId=${b.service_id}&beauticianId=${b.id}`}
                    className="block w-full text-center py-3 px-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-950 dark:hover:bg-white hover:text-white dark:hover:text-gray-950 transition-all font-bold text-[10px] uppercase tracking-widest"
                  >
                    {b.full_name}
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};


export default Services;
