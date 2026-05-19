import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Star, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  beauticianId: string;
  onSuccess: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, bookingId, beauticianId, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('reviews').insert({
      booking_id: bookingId,
      beautician_id: beauticianId,
      rating,
      comment: comment.trim(),
      user_id: (await supabase.auth.getUser()).data.user?.id // RLS will also check this
    });

    if (error) {
      if (error.code === '23505') {
        toast.error('您已經評價過這筆預約了');
      } else {
        toast.error(`評價失敗: ${error.message}`);
      }
    } else {
      toast.success('感謝您的評價！');
      onSuccess();
      onClose();
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">留下您的評價</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* 星星評分 */}
          <div className="text-center space-y-4">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">這次服務滿意嗎？</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform active:scale-90"
                >
                  <Star
                    className={`w-10 h-10 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-200 dark:text-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-2xl font-black text-amber-500">
              {rating === 5 ? '完美！' : rating === 4 ? '很滿意' : rating === 3 ? '還不錯' : rating === 2 ? '普通' : '待改進'}
            </p>
          </div>

          {/* 文字留言 */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">文字留言 (可選)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="分享您的體驗，幫助其他顧客..."
              maxLength={500}
              rows={4}
              className="w-full rounded-2xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
            />
            <p className="text-[10px] text-right text-gray-400">{comment.length}/500</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-indigo-200 dark:hover:shadow-none transition-all disabled:opacity-50"
          >
            {loading ? '正在提交...' : '提交評價'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
