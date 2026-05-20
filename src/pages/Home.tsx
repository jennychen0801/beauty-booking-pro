import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Beautician } from '../types';
import { Star, ArrowRight, CheckCircle2, Quote, Sparkles, ShieldCheck, Clock4 } from 'lucide-react';

const ServiceCard = ({ title, price, duration, image, delay }: { title: string; price: string; duration: string; image: string; delay: number }) => (
  <div className="group relative overflow-hidden rounded-[2rem] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/20 dark:shadow-none hover:-translate-y-2 transition-all duration-500 animate-in fade-in slide-in-from-bottom-8 fill-mode-both" style={{ animationDelay: `${delay}ms` }}>
    <div className="aspect-[4/5] overflow-hidden">
      <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
    </div>
    <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
      <div className="flex items-center gap-2 mb-3">
        <span className="px-3 py-1 rounded-full bg-gold-500/20 backdrop-blur-md border border-gold-500/30 text-gold-400 text-[10px] font-bold uppercase tracking-widest">
          Premium Care
        </span>
      </div>
      <h3 className="text-2xl font-luxury font-bold mb-2 group-hover:text-gold-400 transition-colors">{title}</h3>
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-4 text-xs text-gray-300 font-medium">
          <span className="flex items-center gap-1.5"><Clock4 size={14} className="text-gold-500" /> {duration} min</span>
          <span className="text-lg font-luxury text-white">NT$ {price}</span>
        </div>
        <Link to="/services" className="p-3 rounded-full bg-white text-gray-900 hover:bg-gold-500 hover:text-white transition-all">
          <ArrowRight size={20} />
        </Link>
      </div>
    </div>
  </div>
);

const BeauticianCard = ({ beautician }: { beautician: Beautician }) => (
  <Link to={`/beautician/${beautician.id}`} className="group block">
    <div className="relative p-1 rounded-[2.5rem] bg-gradient-to-b from-gray-100 to-transparent dark:from-gray-800 dark:to-transparent group-hover:from-gold-500/50 transition-all duration-500">
      <div className="bg-white dark:bg-gray-950 rounded-[2.4rem] p-6 text-center transition-colors">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 rounded-full bg-gold-500/20 blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
          <img
            src={beautician.avatar_url || 'https://via.placeholder.com/150'}
            alt={beautician.full_name}
            className="relative w-28 h-28 rounded-full object-cover border-4 border-white dark:border-gray-900 shadow-xl group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute bottom-0 right-0 bg-gold-500 text-white p-1.5 rounded-full shadow-lg border-2 border-white dark:border-gray-950">
            <Star className="w-3.5 h-3.5 fill-current" />
          </div>
        </div>
        <h3 className="text-xl font-luxury font-bold text-gray-900 dark:text-white mb-1 group-hover:text-gold-600 dark:group-hover:text-gold-500 transition-colors">
          {beautician.full_name}
        </h3>
        <p className="text-[10px] text-gold-600 font-bold uppercase tracking-widest mb-4">
          Senior Specialist • {beautician.experience_years}Y
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {beautician.specialties.slice(0, 2).map((s, idx) => (
            <span key={idx} className="text-[9px] px-3 py-1 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 rounded-full font-bold uppercase tracking-tighter border border-gray-100 dark:border-gray-800">
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  </Link>
);

const Home: React.FC = () => {
  const [beauticians, setBeauticians] = useState<Beautician[]>([]);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fetchBeauticians = async () => {
      const { data } = await supabase.from('beauticians').select('*').limit(4);
      if (data) setBeauticians(data);
    };
    fetchBeauticians();

    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="w-full bg-white dark:bg-gray-950 selection:bg-gold-200 dark:selection:bg-gold-500/30 transition-colors duration-500">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-2/3 h-full bg-gold-50 dark:bg-gold-950/10 rounded-l-[200px] -z-10 transition-colors duration-700" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-gold-200/30 dark:bg-gold-900/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t from-white dark:from-gray-950 to-transparent -z-10" />

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center min-h-[85vh]">
          <div className="relative z-20 space-y-10 animate-in fade-in slide-in-from-left-12 duration-1000">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-px w-12 bg-gold-600" />
                <span className="text-xs font-bold text-gold-600 uppercase tracking-[0.3em]">Exquisite Experience</span>
              </div>
              <h1 className="text-7xl md:text-8xl font-luxury font-bold text-gray-950 dark:text-white leading-[0.9]">
                璀璨<span className="text-gold-600 block mt-2">美學</span>
              </h1>
            </div>
            
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md leading-relaxed font-light">
              在靜謐奢華的空間中，我們以極致工藝與尖端科技，為您打造尊榮定製療程。喚醒肌膚深層光采，重塑優雅靈魂。
            </p>

            <div className="flex flex-wrap gap-6 pt-4">
              <Link to="/services" className="px-10 py-5 bg-gray-950 dark:bg-white text-white dark:text-gray-950 rounded-full text-xs font-black uppercase tracking-[0.2em] hover:bg-gold-600 dark:hover:bg-gold-500 dark:hover:text-white transition-all shadow-2xl shadow-gray-950/20 dark:shadow-none hover:-translate-y-1">
                立即預約探索
              </Link>
              <Link to="/my-bookings" className="px-10 py-5 border border-gray-200 dark:border-gray-800 text-gray-950 dark:text-white rounded-full text-xs font-black uppercase tracking-[0.2em] hover:bg-gray-50 dark:hover:bg-gray-900 transition-all hover:-translate-y-1">
                管理我的預約
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-10 border-t border-gray-100 dark:border-gray-900">
              <div>
                <p className="text-3xl font-luxury font-bold text-gray-950 dark:text-white">15+</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Years Expert</p>
              </div>
              <div>
                <p className="text-3xl font-luxury font-bold text-gray-950 dark:text-white">4.9</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Avg Rating</p>
              </div>
              <div>
                <p className="text-3xl font-luxury font-bold text-gray-950 dark:text-white">12k</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Happy Clients</p>
              </div>
            </div>
          </div>
          
          <div className="relative group animate-in fade-in zoom-in duration-1000 delay-300 z-10 lg:mt-0 mt-12">
            <div className="absolute inset-0 bg-gold-600/10 rounded-[4rem] rotate-3 scale-105 -z-10 group-hover:rotate-0 transition-transform duration-700" />
            <div className="relative aspect-[4/5] rounded-[3.5rem] overflow-hidden shadow-2xl shadow-gold-900/20">
              <img 
                src="https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&q=80&w=1600" 
                alt="Luxury Spa Treatment" 
                className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </div>
            
            {/* Floating Badges */}
            <div className="absolute -top-6 -right-6 w-28 h-28 bg-white dark:bg-gray-900 rounded-full shadow-2xl flex flex-col items-center justify-center border border-gray-50 dark:border-gray-800 animate-bounce-slow z-20">
              <Sparkles className="text-gold-600 mb-0.5" size={20} />
              <p className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-tighter">Premium</p>
              <p className="text-[8px] text-gold-600 font-bold uppercase">Certified</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar - Enhanced Visibility */}
      <section className="py-24 bg-gray-50/50 dark:bg-gray-950 border-y border-gray-100 dark:border-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 items-center">
            {[
              { name: 'VOGUE', sub: 'Beauty Choice' },
              { name: 'ELLE', sub: 'Luxury Award' },
              { name: 'BAZAAR', sub: 'Best Esthetics' },
              { name: 'L\'OFFICIEL', sub: 'Elite Spa' }
            ].map((brand, i) => (
              <div key={i} className="flex flex-col items-center group cursor-default">
                <span className="text-2xl md:text-3xl font-luxury font-bold tracking-[0.2em] text-gray-300 dark:text-gray-700 group-hover:text-gold-600 transition-colors duration-500">
                  {brand.name}
                </span>
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-gray-600 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-2 group-hover:translate-y-0">
                  {brand.sub}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-px w-12 bg-gold-600" />
                <span className="text-xs font-bold text-gold-600 uppercase tracking-widest">Our Specialties</span>
              </div>
              <h2 className="text-5xl font-luxury font-bold text-gray-950 dark:text-white">探索尊榮療程</h2>
            </div>
            <Link to="/services" className="group flex items-center gap-4 text-xs font-black uppercase tracking-widest text-gray-950 dark:text-white hover:text-gold-600 transition-colors">
              查看完整服務項目 <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            <ServiceCard 
              title="韓式水光肌深度管理" 
              price="3,200" 
              duration="90" 
              image="https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=800"
              delay={0}
            />
            <ServiceCard 
              title="極致全背精油放鬆" 
              price="2,800" 
              duration="75" 
              image="https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=80&w=800"
              delay={200}
            />
            <ServiceCard 
              title="奢華熱石經絡按摩" 
              price="3,800" 
              duration="100" 
              image="https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=800"
              delay={400}
            />
          </div>
        </div>
      </section>

      {/* Beautician Section */}
      <section className="py-32 bg-gray-50 dark:bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-8 bg-gold-600" />
              <span className="text-xs font-bold text-gold-600 uppercase tracking-widest">Master Artisans</span>
              <div className="h-px w-8 bg-gold-600" />
            </div>
            <h2 className="text-5xl font-luxury font-bold text-gray-950 dark:text-white">專業美療師團隊</h2>
            <p className="text-gray-500 dark:text-gray-400 font-light">
              每一位美療師均經過嚴格篩選與國際認證，結合精湛技藝與溫潤之心，為您提供無與倫比的感官體驗。
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {beauticians.map(b => (
              <BeauticianCard key={b.id} beautician={b} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 bg-gray-950 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-600/10 rounded-full blur-[120px]" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <Quote className="text-gold-600 mx-auto mb-10 opacity-30" size={60} />
          <h2 className="text-4xl font-luxury font-bold mb-20 italic">"在 Beauty Glow 的每一刻，<br className="hidden md:block" /> 都像是一場身臨其境的時空旅程。"</h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { name: '王品涵', role: 'Fashion Editor', content: '這裡的環境與氛圍完全不輸巴黎的頂級 SPA，水光管理的成效令人驚艷，皮膚真的在發亮。' },
              { name: '李瑞嘉', role: 'Business Executive', content: '身為高壓工作者，全背精油放鬆是我每週的救贖。美療師的手法精準且富有節奏感。' },
              { name: '張曼玲', role: 'Lifestyle Blogger', content: '從線上預約到現場服務，流程極致順暢。隱私性極佳，是我目前最信賴的美容美學品牌。' }
            ].map((t, i) => (
              <div key={i} className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-left group">
                <div className="flex gap-1 mb-6">
                  {[1,2,3,4,5].map(star => <Star key={star} size={14} className="fill-gold-500 text-gold-500" />)}
                </div>
                <p className="text-gray-400 font-light leading-relaxed mb-8 italic">「{t.content}」</p>
                <div>
                  <p className="font-luxury font-bold text-lg group-hover:text-gold-400 transition-colors">{t.name}</p>
                  <p className="text-[10px] text-gold-600 font-black uppercase tracking-widest mt-1">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-gold-100 to-amber-50 dark:from-gray-900 dark:to-gray-950 rounded-[4rem] -rotate-1 scale-105 group-hover:rotate-0 transition-transform duration-700" />
          <div className="relative bg-white dark:bg-gray-900 rounded-[3.5rem] p-16 md:p-24 text-center border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden">
            {/* Background Texture */}
            <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
            
            <div className="relative z-10 max-w-2xl mx-auto space-y-10">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-gold-500/10 text-gold-600">
                  <Sparkles size={32} />
                </div>
              </div>
              <h2 className="text-5xl md:text-6xl font-luxury font-bold text-gray-950 dark:text-white leading-tight">準備好開始您的<br />蛻變之旅了嗎？</h2>
              <p className="text-lg text-gray-500 dark:text-gray-400 font-light">
                僅需 30 秒即可完成預約。我們誠摯邀請您，親身體驗純粹的美學力量。
              </p>
              <div className="pt-6">
                <Link to="/services" className="inline-block px-12 py-6 bg-gray-950 dark:bg-white text-white dark:text-gray-950 rounded-full text-sm font-black uppercase tracking-[0.3em] hover:bg-gold-600 dark:hover:bg-gold-500 dark:hover:text-white transition-all shadow-xl hover:-translate-y-1">
                  挑選服務項目
                </Link>
              </div>
              <div className="flex justify-center gap-8 text-[10px] text-gray-400 font-bold uppercase tracking-widest pt-8 border-t border-gray-100 dark:border-gray-800">
                <span>Free Consultation</span>
                <span>Elite Staff</span>
                <span>Immediate Confirmation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-gray-100 dark:border-gray-900 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-8">
          <Link to="/" className="text-3xl font-luxury font-bold tracking-tighter text-gray-900 dark:text-white">
            BEAUTY<span className="text-gold-600">GLOW</span>
          </Link>
          <div className="flex justify-center gap-10">
            {['About', 'Services', 'Artisans', 'Privacy'].map(item => (
              <a key={item} href="#" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-gold-600 transition-colors">{item}</a>
            ))}
          </div>
          <div className="h-px w-20 bg-gray-100 dark:bg-gray-900 mx-auto" />
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">© 2024 BEAUTY GLOW ARTISTRY. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
