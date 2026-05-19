import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Beautician } from '../types';
import { Star, User } from 'lucide-react';

interface ServiceCardProps {
  title: string;
  price: string;
  duration: string;
  image: string;
}

const ServiceCard = ({ title, price, duration, image }: ServiceCardProps) => (
  <div className="glass-card rounded-3xl overflow-hidden group hover:scale-[1.02] transition-all duration-300">
    <div className="h-48 overflow-hidden relative">
      <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
      <div className="absolute inset-0 bg-gradient-to-t from-rose-50/80 to-transparent" />
    </div>
    <div className="p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
        <span>{duration} 分鐘</span>
        <span className="text-rose-500 font-bold">${price}</span>
      </div>
      <Link to="/services" className="text-amber-700 font-medium hover:underline inline-flex items-center gap-1">
        了解更多 <span className="text-lg">→</span>
      </Link>
    </div>
  </div>
);

const BeauticianCard = ({ beautician }: { beautician: Beautician }) => (
  <Link to={`/beautician/${beautician.id}`} className="block group">
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 text-center">
      <div className="relative inline-block mb-4">
        <img
          src={beautician.avatar_url || 'https://via.placeholder.com/150'}
          alt={beautician.full_name}
          className="w-24 h-24 rounded-full object-cover border-4 border-rose-50 dark:border-indigo-900/30 group-hover:scale-105 transition-transform"
        />
        <div className="absolute -bottom-1 -right-1 bg-amber-400 text-white p-1 rounded-full shadow-lg">
          <Star className="w-3 h-3 fill-current" />
        </div>
      </div>
      <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-rose-500 transition-colors">{beautician.full_name}</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{beautician.experience_years}年經驗</p>
      <div className="mt-3 flex flex-wrap justify-center gap-1">
        {beautician.specialties.slice(0, 2).map((s, idx) => (
          <span key={idx} className="text-[10px] px-2 py-0.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-full font-medium">
            {s}
          </span>
        ))}
      </div>
    </div>
  </Link>
);

interface TestimonialCardProps {
  name: string;
  content: string;
  avatar: string;
}

const TestimonialCard = ({ name, content, avatar }: TestimonialCardProps) => (
  <div className="glass-card p-6 rounded-2xl relative">
    <div className="absolute -top-4 left-6 w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center text-amber-800 text-xl font-serif">"</div>
    <p className="text-gray-600 italic mb-4 leading-relaxed">{content}</p>
    <div className="flex items-center gap-3">
      <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover border-2 border-rose-100" />
      <span className="font-bold text-gray-800 text-sm">{name}</span>
    </div>
  </div>
);

const Home: React.FC = () => {
  const [beauticians, setBeauticians] = useState<Beautician[]>([]);

  useEffect(() => {
    const fetchBeauticians = async () => {
      const { data } = await supabase.from('beauticians').select('*').limit(4);
      if (data) setBeauticians(data);
    };
    fetchBeauticians();
  }, []);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-16 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-rose-50 rounded-l-[100px] -z-10" />
        <div className="absolute top-20 right-20 w-64 h-64 bg-amber-100/50 rounded-full blur-3xl animate-pulse" />
        
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-in fade-in slide-in-from-left duration-1000">
            <span className="inline-block px-4 py-1 rounded-full bg-rose-100 text-rose-600 text-sm font-bold mb-6 tracking-widest uppercase">
              ✨ 優雅預約 • 璀璨體驗
            </span>
            <h1 className="text-6xl md:text-7xl font-bold text-gray-900 leading-tight mb-8">
              喚醒肌膚的<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-rose-400">璀璨光采</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-lg leading-relaxed">
              在 Beauty Glow，我們結合尖端科技與溫潤手法，為您打造量身訂製的美容療程，讓身心靈在寧靜中重獲新生。
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/services" className="btn-gold">
                立即預約
              </Link>
              <Link to="/my-bookings" className="px-8 py-3 rounded-full border border-rose-200 text-gray-600 hover:bg-rose-50 transition-colors">
                查看預約
              </Link>
            </div>
          </div>
          
          <div className="relative animate-float">
            <div className="w-full aspect-square rounded-[60px] overflow-hidden shadow-2xl shadow-rose-200/50">
              <img 
                src="https://images.unsplash.com/photo-1540555700478-4be289fbece8?q=80&w=1000&auto=format&fit=crop" 
                alt="Spa" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-10 -left-10 glass-card p-6 rounded-3xl animate-in zoom-in delay-500 duration-700">
              <div className="flex gap-1 mb-2">
                {[1,2,3,4,5].map(i => <span key={i} className="text-amber-400 text-sm">★</span>)}
              </div>
              <p className="text-sm font-bold text-gray-800">10,000+ 客戶好評</p>
              <p className="text-xs text-gray-500">專業美容管理的首選</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 text-glow">奢華服務項目</h2>
          <p className="text-gray-500 mb-16 max-w-2xl mx-auto">從基礎護理到深層修復，我們提供全方位的美容方案，呵護每一吋肌膚。</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <ServiceCard 
              title="韓式水光肌管理" 
              price="2500" 
              duration="90" 
              image="https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=800&auto=format&fit=crop"
            />
            <ServiceCard 
              title="深層毛孔潔淨" 
              price="1200" 
              duration="60" 
              image="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=800&auto=format&fit=crop"
            />
            <ServiceCard 
              title="全背精油紓壓" 
              price="1800" 
              duration="75" 
              image="https://images.unsplash.com/photo-1544161515-436ce9d40ffc?q=80&w=800&auto=format&fit=crop"
            />
          </div>
          
          <Link to="/services" className="mt-12 inline-block text-rose-500 font-bold hover:text-rose-600 transition-colors">
            查看所有服務表單 →
          </Link>
        </div>
      </section>

      {/* Beautician Section */}
      <section className="py-24 bg-rose-50/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">專業美容師團隊</h2>
            <p className="text-gray-500">專業背景與豐富經驗，為您的美麗把關。</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {beauticians.map(b => (
              <BeauticianCard key={b.id} beautician={b} />
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-24 bg-rose-50/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">效果見證</h2>
              <p className="text-gray-500">真實案例紀錄，見證肌膚轉變的瞬間。</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="glass-card rounded-[40px] overflow-hidden p-4">
              <div className="flex gap-4">
                <div className="flex-1 space-y-4">
                  <div className="relative">
                    <img src="https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=500" alt="Before" className="rounded-2xl h-64 w-full object-cover" />
                    <span className="absolute top-4 left-4 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">Before</span>
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="relative">
                    <img src="https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=501" alt="After" className="rounded-2xl h-64 w-full object-cover brightness-110 contrast-110" />
                    <span className="absolute top-4 left-4 bg-rose-500 text-white text-xs px-2 py-1 rounded-full">After</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-4">
                <h4 className="font-bold text-gray-800">毛孔細緻療程 - 3 次體驗後</h4>
                <p className="text-sm text-gray-500 mt-1">針對粉刺與毛孔粗大問題，顯著提升膚質平滑度。</p>
              </div>
            </div>
            
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="aspect-square rounded-2xl overflow-hidden">
                    <img src={`https://images.unsplash.com/photo-1596755389378-c31d21fd1273?q=80&w=300&sig=${i}`} alt="Gallery" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
                  </div>
                ))}
              </div>
              <div className="bg-amber-100/30 p-8 rounded-[30px] border border-amber-200/50">
                <p className="text-amber-800 font-medium leading-relaxed">
                  "我們的美療師均受過 500 小時以上專業訓練，致力於提供最精準的護理服務。"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">顧客心聲</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard 
              name="林小姐" 
              content="環境真的非常舒服，每次來預約做水光管理都覺得肌膚變得很亮，服務態度也很好！" 
              avatar="https://i.pravatar.cc/100?u=1"
            />
            <TestimonialCard 
              name="王先生" 
              content="作為男生原本會有點害羞，但這裡的隱私性做得很好，毛孔潔淨服務真的很專業。" 
              avatar="https://i.pravatar.cc/100?u=2"
            />
            <TestimonialCard 
              name="張小姐" 
              content="手機預約超級方便，可以在空檔時間直接看哪時候有位，改期也很彈性，大推！" 
              avatar="https://i.pravatar.cc/100?u=3"
            />
          </div>
        </div>
      </section>

      {/* Booking Preview CTA */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-rose-100 to-amber-50 rounded-[50px] overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
          <div className="relative z-10 p-12 text-center md:p-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">準備好體驗<br />專屬於您的璀璨時刻？</h2>
            <p className="text-lg text-gray-600 mb-10 max-w-xl mx-auto">
              僅需 30 秒，即可完成線上預約。我們會根據您的膚況，提供最專業的分析建議。
            </p>
            <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
              <Link to="/services" className="btn-gold scale-125">
                立即挑選服務項目
              </Link>
            </div>
            <p className="mt-12 text-sm text-amber-800 font-medium">
              ✓ 無隱藏消費 &nbsp;&nbsp; ✓ 專業一對一諮詢 &nbsp;&nbsp; ✓ 即時確認回覆
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-rose-400 font-bold mb-4 tracking-widest uppercase">Beauty Glow</p>
          <p className="text-gray-400 text-sm">© 2024 璀璨美學 Beauty Glow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
