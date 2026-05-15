import { useAuth } from './useAuth';

export const useAdmin = () => {
  const { user, loading: authLoading } = useAuth();
  
  // 如果還在加載或沒有 role，先不判斷為 false，避免太快被踢出頁面
  const isAdmin = user?.role === 'admin';
  const loading = authLoading || (!!user && !user.role); 

  return { isAdmin, loading };
};
