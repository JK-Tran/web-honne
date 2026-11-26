import React, { useState } from 'react';
import { X, Star, Sparkles, Check, Coffee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { API_BASE_URL, authFetch } from '../../../shared/utils/api-client';

interface ReviewItem {
  productId: string;
  productName: string;
}

interface OrderReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string;
  branchName?: string;
  items: ReviewItem[];
  onReviewSubmitted?: () => void;
}

export const OrderReviewModal: React.FC<OrderReviewModalProps> = ({
  isOpen,
  onClose,
  orderId,
  branchName = '183 Cộng Hòa',
  items,
  onReviewSubmitted
}) => {
  const { user, addCoins, accessToken } = useAuth();
  const { showToast } = useToast();

  const [selectedProductId, setSelectedProductId] = useState<string>(items[0]?.productId || '');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submittedProducts, setSubmittedProducts] = useState<string[]>([]);

  // Update selectedProductId if items change
  React.useEffect(() => {
    if (items.length > 0 && !selectedProductId) {
      setSelectedProductId(items[0].productId);
    }
  }, [items, selectedProductId]);

  if (!isOpen) return null;

  const currentItem = items.find((i) => i.productId === selectedProductId) || items[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      showToast('Vui lòng nhập vài dòng cảm nhận của bạn về thức uống nhé!', 'info');
      return;
    }

    setSubmitting(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: currentItem.productId,
          orderId: orderId || null,
          userId: user?.id || null,
          customerName: user?.name || 'Khách hàng Tân Bình',
          customerPhone: user?.phone || '',
          rating,
          comment: comment.trim(),
          branch: branchName
        })
      });

      const data = await res.json();
      if (data.success) {
        try {
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        } catch {}

        if (data.bonusCoins) {
          addCoins(data.bonusCoins);
        }

        showToast(data.message || 'Gửi đánh giá thành công! Cảm ơn bạn.', 'success');
        setSubmittedProducts([...submittedProducts, currentItem.productId]);
        setComment('');
        setRating(5);

        if (onReviewSubmitted) {
          onReviewSubmitted();
        }

        // If all items reviewed, close modal
        const remaining = items.filter((i) => i.productId !== currentItem.productId && !submittedProducts.includes(i.productId));
        if (remaining.length > 0) {
          setSelectedProductId(remaining[0].productId);
        } else {
          setTimeout(() => {
            onClose();
          }, 1200);
        }
      } else {
        showToast(data.message || 'Không thể gửi đánh giá.', 'error');
      }
    } catch {
      showToast('Lỗi kết nối khi gửi đánh giá.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingLabel = (stars: number) => {
    switch (stars) {
      case 5:
        return 'Tuyệt vời, chuẩn vị HONNE! ⭐⭐⭐⭐⭐';
      case 4:
        return 'Ngon, vừa miệng ⭐⭐⭐⭐';
      case 3:
        return 'Tạm ổn, cần cải thiện ⭐⭐⭐';
      case 2:
        return 'Chưa hợp khẩu vị ⭐⭐';
      default:
        return 'Không hài lòng ⭐';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-[#FCFBF7] rounded-3xl overflow-hidden shadow-2xl border border-stone-200 text-stone-900"
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-[#103824] via-[#14452F] to-[#0A2618] text-white p-5 sm:p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full text-stone-300 hover:text-white bg-white/10 hover:bg-white/20 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-900/80 border border-emerald-400/30 text-[#F5C518] text-[11px] font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#F5C518]" />
              <span>ĐÁNH GIÁ THỰC TẾ & NHẬN XU</span>
            </div>

            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <span>Đánh Giá Món Bạn Đã Thưởng Thức</span>
            </h3>
            <p className="text-xs text-stone-300 mt-1">
              Phản hồi thực tế của bạn giúp quán ngày càng hoàn thiện. Nhận ngay <strong>+50 Xu</strong> vào ví thành viên!
            </p>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
            {/* Items Switcher if multiple items in order */}
            {items.length > 1 && (
              <div>
                <label className="text-xs font-bold text-stone-600 block mb-1.5">
                  Chọn món bạn muốn đánh giá:
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {items.map((item) => {
                    const isSelected = item.productId === currentItem.productId;
                    const isDone = submittedProducts.includes(item.productId);
                    return (
                      <button
                        key={item.productId}
                        type="button"
                        onClick={() => setSelectedProductId(item.productId)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 border cursor-pointer ${
                          isSelected
                            ? 'bg-[#14452F] text-[#F5C518] border-[#14452F] shadow-xs'
                            : isDone
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        {isDone ? <Check className="w-3 h-3 text-emerald-600" /> : <Coffee className="w-3 h-3" />}
                        <span className="truncate max-w-[140px]">{item.productName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Currently Selected Item Card */}
            <div className="p-3 rounded-2xl bg-white border border-stone-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-stone-400 block font-bold uppercase tracking-wider">
                  Món đang đánh giá:
                </span>
                <span className="text-sm font-black text-[#14452F]">
                  {currentItem.productName}
                </span>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                Tại {branchName}
              </span>
            </div>

            {/* Interactive Star Picker */}
            <div className="text-center py-2 space-y-1.5 bg-[#FAF9F5] rounded-2xl border border-stone-200 p-3">
              <span className="text-xs font-bold text-stone-600 block">
                Chất lượng thức uống & độ vừa miệng:
              </span>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 text-2xl sm:text-3xl transition transform hover:scale-115 cursor-pointer focus:outline-hidden"
                      aria-label={`${star} sao`}
                    >
                      <Star
                        className={`w-7 h-7 sm:w-8 sm:h-8 transition ${
                          active
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-stone-300 hover:text-amber-200'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <p className="text-xs font-bold text-amber-700 min-h-[18px]">
                {getRatingLabel(hoverRating || rating)}
              </p>
            </div>

            {/* Comment Feedback Input */}
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Chia sẻ cảm nhận của bạn (Hương vị, đá, đường, cách đóng gói...):
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ví dụ: Cà phê rang mộc thơm đậm đà, kem muối béo mặn sánh mịn rất ngon. Giao hàng nhanh và đóng đá riêng..."
                rows={3}
                maxLength={400}
                className="w-full p-3 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#14452F] focus:border-transparent placeholder-stone-400"
              />
              <div className="flex justify-between items-center text-[10px] text-stone-400 mt-1">
                <span>Đánh giá xác thực hiển thị trực tiếp trên web</span>
                <span>{comment.length}/400</span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-[#F5C518] hover:bg-[#ffd54f] active:scale-98 text-[#14452F] font-black text-xs sm:text-sm tracking-wide transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-[#14452F]" />
                <span>{submitting ? 'Đang gửi...' : 'Gửi Đánh Giá Ngay (+50 Xu Tích Lũy)'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
