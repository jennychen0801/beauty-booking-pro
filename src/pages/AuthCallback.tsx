import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        toast.error(`登入失敗: ${error.message}`);
        navigate('/login');
        return;
      }

      if (data?.session) {
        toast.success('登入成功！');
        navigate('/');
      } else {
        // 如果沒有 session，可能是還在處理中，或者是無效的回調
        // 這裡可以選擇等待或是導向登入頁
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session) {
            toast.success('登入成功！');
            navigate('/');
            subscription.unsubscribe();
          }
        });
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">正在處理登入資訊，請稍候...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
