import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Beautician, Service, Review } from '../types';
import { Star, Clock, Award, CheckCircle, ChevronRight, MessageSquare, User } from 'lucide-react';
import { formatDate } from '../lib/utils';
import toast from 'react-hot-toast';

const BeauticianProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [beautician, setBeautician] = useState<Beautician | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBeauticianProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('beauticians')
        .select(`
          *,
          services (*),
          reviews (
            *,
            profiles (full_name)
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching beautician:', error);
        toast.error('找不到此美容師');
        navigate('/services');
      } else {
        setBeautician(data);
      }
      setLoading(false);
    };

    if (id) {
      fetchBeauticianProfile();
    }
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!beautician && !loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 shadow-sm border border-gray-100 dark:border-gray-700 max-w-md mx-auto">
          <User className="w-16 h-16 text-gray-200 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">找不到此美容師</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">該美容師可能已離職或連結已失效。</p>
          <button 
            onClick={() => navigate('/services')}
            className="w-full py-3 px-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
          >
            返回服務列表
          </button>
        </div>
      </div>
    );
  }

  if (!beautician) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Basic Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
            <div className="relative inline-block">
              <img
                src={beautician.avatar_url || 'https://via.placeholder.com/150'}
                alt={beautician.full_name}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-indigo-50 dark:border-indigo-900/30 mx-auto shadow-lg"
              />
              <div className="absolute bottom-1 right-1 bg-green-500 border-4 border-white dark:border-gray-800 w-6 h-6 rounded-full"></div>
            </div>
            
            <h1 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white">{beautician.full_name}</h1>
            
            <div className="mt-2 flex items-center justify-center gap-1 text-yellow-500">
              <Star className="w-5 h-5 fill-current" />
              <span className="font-bold text-lg">{beautician.rating}</span>
              <span className="text-gray-400 text-sm ml-1">({beautician.reviews?.length || 0} 評價)</span>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {beautician.specialties.map((specialty, idx) => (
                <span key={idx} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-full">
                  {specialty}
                </span>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-700 pt-8">
              <div className="text-center">
                <div className="flex justify-center text-indigo-600 mb-1">
                  <Clock className="w-5 h-5" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">年資</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{beautician.experience_years} 年</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center text-indigo-600 mb-1">
                  <Award className="w-5 h-5" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">專業證照</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">已驗證</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">關於我</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
              {beautician.bio}
            </p>
          </div>
        </div>

        {/* Right Column: Services & Reviews */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Services Section */}
          <section>
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  擅長服務
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">預約適合您的專屬護理</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {beautician.services?.map((service) => (
                <div key={service.id} className="group bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 hover:border-indigo-100 dark:hover:border-indigo-900/50">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">{service.name}</h3>
                    <span className="text-lg font-black text-indigo-600">NT$ {service.price}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-6">
                    {service.description}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>{service.duration} 分鐘</span>
                    </div>
                    <button 
                      onClick={() => navigate(`/booking?serviceId=${service.id}&beauticianId=${beautician.id}`)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
                    >
                      立即預約
                    </button>
                  </div>
                </div>
              ))}
              {(!beautician.services || beautician.services.length === 0) && (
                <div className="col-span-full py-12 text-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                  <p className="text-gray-500">目前暫無可預約服務</p>
                </div>
              )}
            </div>
          </section>

          {/* Reviews Section */}
          <section>
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  顧客評價
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">真實的服務回饋</p>
              </div>
            </div>

            <div className="space-y-4">
              {beautician.reviews?.map((review) => (
                <div key={review.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold">
                        {review.customer_name?.[0] || (review.profiles?.full_name?.[0]) || '客'}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">
                          {review.customer_name || review.profiles?.full_name || '匿名顧客'}
                        </p>
                        <p className="text-[10px] text-gray-400">{formatDate(review.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-gray-200 dark:text-gray-700'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed italic">
                    「{review.comment}」
                  </p>
                </div>
              ))}
              {(!beautician.reviews || beautician.reviews.length === 0) && (
                <div className="py-12 text-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                  <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">尚無評價</p>
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default BeauticianProfile;
