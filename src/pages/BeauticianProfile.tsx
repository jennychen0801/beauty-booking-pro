import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Beautician, Service, Review } from '../types';
import { Star, Clock4, Award, CheckCircle, ChevronRight, MessageSquare, User, Sparkles, Quote } from 'lucide-react';
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
          beautician_services (
            services (*)
          ),
          reviews (
            *
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600"></div>
      </div>
    );
  }

  if (!beautician && !loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-12 shadow-2xl border border-gray-100 dark:border-gray-800 max-w-md mx-auto">
          <User className="w-16 h-16 text-gray-200 dark:text-gray-800 mx-auto mb-6" />
          <h1 className="text-2xl font-luxury font-bold text-gray-950 dark:text-white mb-2">找不到此美容師</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8 font-light">該美容師可能已離職或連結已失效。</p>
          <button 
            onClick={() => navigate('/services')}
            className="w-full py-4 bg-gray-950 dark:bg-white text-white dark:text-gray-950 rounded-full font-black uppercase tracking-widest text-xs hover:bg-gold-600 transition-colors"
          >
            返回服務列表
          </button>
        </div>
      </div>
    );
  }

  if (!beautician) return null;

  const services = beautician.beautician_services?.map(bs => bs.services) || [];

  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        
        {/* Left Column: Basic Info */}
        <div className="lg:col-span-1 space-y-10">
          <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-10 shadow-2xl shadow-gray-200/20 dark:shadow-none border border-gray-100 dark:border-gray-800 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gold-50 dark:bg-gold-900/10 -z-0" />
            <div className="relative z-10">
              <div className="relative inline-block mb-8">
                <img
                  src={beautician.avatar_url || 'https://via.placeholder.com/150'}
                  alt={beautician.full_name}
                  className="w-40 h-40 rounded-full object-cover border-8 border-white dark:border-gray-900 shadow-2xl mx-auto"
                />
                <div className="absolute bottom-2 right-2 bg-green-500 border-4 border-white dark:border-gray-950 w-7 h-7 rounded-full shadow-lg"></div>
              </div>
              
              <h1 className="text-4xl font-luxury font-bold text-gray-950 dark:text-white mb-2">{beautician.full_name}</h1>
              
              <div className="flex items-center justify-center gap-2 text-gold-600 mb-8">
                <Star className="w-5 h-5 fill-current" />
                <span className="font-bold text-xl">{beautician.rating}</span>
                <span className="text-gray-400 text-sm font-light">({beautician.review_count || 0} Reviews)</span>
              </div>

              <div className="flex flex-wrap justify-center gap-2 mb-10">
                {beautician.specialties.map((specialty, idx) => (
                  <span key={idx} className="px-4 py-1.5 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-gray-100 dark:border-gray-700">
                    {specialty}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-8 pt-10 border-t border-gray-50 dark:border-gray-800">
                <div className="text-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Experience</p>
                  <p className="text-2xl font-luxury font-bold text-gray-950 dark:text-white">{beautician.experience_years} Years</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                  <p className="text-2xl font-luxury font-bold text-gold-600">Verified</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-10 shadow-xl shadow-gray-200/10 dark:shadow-none border border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-luxury font-bold text-gray-950 dark:text-white mb-6 flex items-center gap-3">
              <Sparkles size={20} className="text-gold-600" />
              品牌理念
            </h2>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-light italic text-sm">
              「{beautician.bio}」
            </p>
          </div>
        </div>

        {/* Right Column: Services & Reviews */}
        <div className="lg:col-span-2 space-y-16">
          
          {/* Services Section */}
          <section>
            <div className="flex items-center gap-4 mb-10">
              <h2 className="text-4xl font-luxury font-bold text-gray-950 dark:text-white">擅長療程</h2>
              <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map((service) => (
                <div key={service.id} className="group bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/10 dark:shadow-none hover:-translate-y-1 transition-all duration-300 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-luxury font-bold text-gray-950 dark:text-white group-hover:text-gold-600 transition-colors">{service.name}</h3>
                    <span className="text-xl font-luxury font-bold text-gold-600">NT$ {service.price}</span>
                  </div>
                  <p className="text-xs text-gray-400 font-light line-clamp-2 mb-8">
                    {service.description}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                      <Clock4 size={14} className="text-gold-600" />
                      <span>{service.duration} Min</span>
                    </div>
                    <button 
                      onClick={() => navigate(`/booking?serviceId=${service.id}&beauticianId=${beautician.id}`)}
                      className="px-6 py-2.5 bg-gray-950 dark:bg-white text-white dark:text-gray-950 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-gold-600 dark:hover:bg-gold-500 dark:hover:text-white transition-all"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
              {services.length === 0 && (
                <div className="col-span-full py-20 text-center bg-gray-50 dark:bg-gray-900/30 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-gray-800">
                  <p className="text-gray-400 font-luxury italic">目前暫無可預約服務</p>
                </div>
              )}
            </div>
          </section>

          {/* Reviews Section */}
          <section>
            <div className="flex items-center gap-4 mb-10">
              <h2 className="text-4xl font-luxury font-bold text-gray-950 dark:text-white">顧客回饋</h2>
              <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
            </div>

            <div className="space-y-6">
              {beautician.reviews?.map((review) => (
                <div key={review.id} className="bg-gray-50 dark:bg-gray-900/50 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-8">
                  <div className="flex-shrink-0 text-center">
                    <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 shadow-xl flex items-center justify-center text-2xl font-luxury font-bold text-gold-600 mx-auto mb-4 border border-gray-50 dark:border-gray-700">
                      {review.customer_name?.[0] || 'G'}
                    </div>
                    <div className="flex items-center justify-center gap-0.5 text-gold-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={10} className={i < review.rating ? 'fill-current' : 'text-gray-200 dark:text-gray-700'} />
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="font-luxury font-bold text-xl text-gray-950 dark:text-white">
                        {review.customer_name || 'Premium Guest'}
                      </p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formatDate(review.created_at)}</p>
                    </div>
                    <Quote size={20} className="text-gold-600 opacity-20" />
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-light italic">
                      {review.comment}
                    </p>
                  </div>
                </div>
              ))}
              {(!beautician.reviews || beautician.reviews.length === 0) && (
                <div className="py-20 text-center bg-gray-50 dark:bg-gray-900/30 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-gray-800">
                  <MessageSquare className="w-12 h-12 text-gray-200 dark:text-gray-800 mx-auto mb-4" />
                  <p className="text-gray-400 font-luxury italic">尚無評價</p>
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
