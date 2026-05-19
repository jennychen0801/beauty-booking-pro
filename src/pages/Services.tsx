import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Service, Beautician } from '../types';
import { supabase } from '../lib/supabase';
import { User } from 'lucide-react';

interface ServiceWithBeautician extends Service {
  beauticians?: {
    full_name: string;
    id: string;
  };
}

const Services: React.FC = () => {
  const [services, setServices] = useState<ServiceWithBeautician[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*, beauticians(id, full_name)')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching services:', error);
      } else if (data) {
        setServices(data);
      }
      setLoading(false);
    };

    fetchServices();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        我們的服務
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow">
            <p className="text-gray-500 dark:text-gray-400">目前尚無服務項目。</p>
          </div>
        ) : (
          services.map((service) => (
            <div
              key={service.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow flex flex-col"
            >
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {service.name}
                  </h3>
                </div>
                
                {service.beauticians && (
                  <Link 
                    to={`/beautician/${service.beauticians.id}`}
                    className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-3 hover:underline"
                  >
                    <User className="w-3 h-3" />
                    美容師：{service.beauticians.full_name}
                  </Link>
                )}

                <p className="text-gray-600 dark:text-gray-400 mb-4 h-12 overflow-hidden text-sm">
                  {service.description}
                </p>
                
                <div className="mt-auto">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-2xl font-bold text-indigo-600">
                      ${service.price}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {service.duration} 分鐘
                    </span>
                  </div>
                  <Link
                    to={`/booking?serviceId=${service.id}${service.beauticians ? `&beauticianId=${service.beauticians.id}` : ''}`}
                    className="block w-full text-center py-2.5 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                  >
                    立即預約
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Services;
