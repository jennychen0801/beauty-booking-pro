import { format, differenceInHours, parseISO } from 'date-fns';
import { zhTW } from 'date-fns/locale';

/**
 * 格式化日期時間，確保以使用者本地時區顯示
 */
export const formatDate = (dateString: string) => {
  if (!dateString) return '';
  
  // 1. 先將字串解析為 Date 物件
  // 如果 dateString 是 "2024-05-18T20:20:00Z"，它會被正確識別為 UTC 時間
  const date = parseISO(dateString);
  
  // 2. 使用 Intl 或是 date-fns 直接 format
  // 在瀏覽器環境中，new Date(ISOString) 會自動轉換為本地時區
  // 例如台北時間 (GMT+8)，20:20Z 就會變成 04:20+1
  // 如果您看到的結果是錯誤的，通常是因為輸入的 ISO 字串不帶 "Z"，被誤認為是本地時間
  
  return format(date, 'yyyy/MM/dd HH:mm', { locale: zhTW });
};

/**
 * 檢查是否在預約前 24 小時內 (時區安全)
 */
export const canModifyBooking = (scheduledAt: string): boolean => {
  if (!scheduledAt) return false;
  const appointmentTime = parseISO(scheduledAt);
  const now = new Date();
  
  const hoursRemaining = differenceInHours(appointmentTime, now);
  return hoursRemaining >= 24;
};
