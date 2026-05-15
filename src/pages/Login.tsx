import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Login: React.FC = () => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading && session) {
      navigate('/'); // 只要登入成功就先回首頁，避免迴圈
    }
  }, [session, loading, navigate]);

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">登入 / 註冊</h2>
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        theme="light"
        providers={[]}
        localization={{
          variables: {
            sign_in: {
              email_label: '電子郵件',
              password_label: '密碼',
              button_label: '登入',
            },
            sign_up: {
              email_label: '電子郵件',
              password_label: '密碼',
              button_label: '註冊',
            },
          },
        }}
      />
    </div>
  );
};

export default Login;
