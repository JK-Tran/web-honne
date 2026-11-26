import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Star, Heart, Check, Sparkles } from 'lucide-react';
import { Product, ProductSize } from '../../../core/entities/product';
import { formatCurrencyVND } from '../../../shared/utils/currency';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

interface ProductCardProps {
  product: Product;
  compact?: boolean;
  viewMode?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  compact = false,
  viewMode = 'grid'
}) => {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 'M', 1);
    setJustAdded(true);
    // Toast is handled centrally in addItem (CartContext)
    setTimeout(() => setJustAdded(false), 1200);
  };

  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    showToast(
      isLiked ? `Đã bỏ lưu ${product.name}` : `Đã lưu ${product.name} vào mục yêu thích!`,
      'info'
    );
  };

  // Normal products have no tags. Only items flagged by admin show a badge.

  // -------------------------------------------------------------------------
  // 1. LIST VIEW (1 Cột ngang - Tối ưu cực mạnh cho điện thoại)
  // -------------------------------------------------------------------------
  if (viewMode === 'list') {
    return (
      <div className="group bg-white rounded-xl p-2.5 sm:p-4 border border-stone-200/90 hover:border-[#14452F] shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-2.5 sm:gap-3 relative overflow-hidden w-full">
        {/* Left: Square Studio Thumbnail */}
        <Link
          to={`/san-pham/${product.id}`}
          className="relative w-18 h-18 sm:w-24 sm:h-24 bg-[#F5F6F3] rounded-lg shrink-0 flex items-center justify-center p-1.5 overflow-hidden group-hover:bg-[#EDF1EA] transition-colors"
        >
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain drop-shadow-md group-hover:scale-108 transition-transform duration-300"
            loading="lazy"
          />
          {(product.discountBadge || product.isBestSeller) && (
            <span className="absolute top-1 left-1 text-[8px] font-black uppercase bg-[#14452F] text-[#F5C518] px-1 py-0.5 rounded-xs leading-none">
              {product.discountBadge || 'Bán chạy'}
            </span>
          )}
        </Link>

        {/* Center: Details */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-stone-500 mb-0.5">
            <span className="flex items-center text-amber-500 font-bold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />
              {product.rating}
            </span>
            <span>•</span>
            <span className="text-stone-400 truncate">{product.reviewCount} đã bán</span>
          </div>

          <Link
            to={`/san-pham/${product.id}`}
            className="block font-black text-stone-900 group-hover:text-[#14452F] transition-colors text-xs sm:text-base line-clamp-1 leading-snug"
          >
            {product.name}
          </Link>

          <p className="text-[10px] sm:text-xs text-stone-500 mt-0.5 line-clamp-1">
            {product.subtitle}
          </p>

          <div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-1.5">
            <span className="font-black text-[#14452F] text-xs sm:text-base">
              {formatCurrencyVND(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[10px] sm:text-[11px] text-stone-400 line-through">
                {formatCurrencyVND(product.originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-col items-end gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={toggleLike}
            className={`p-1 sm:p-1.5 rounded-md transition ${
              isLiked ? 'text-rose-500' : 'text-stone-300 hover:text-rose-500'
            }`}
            title="Yêu thích"
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLiked ? 'fill-rose-500' : ''}`} />
          </button>

          <button
            onClick={handleQuickAdd}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition shadow-xs cursor-pointer ${
              justAdded
                ? 'bg-[#14452F] text-[#F5C518]'
                : 'bg-[#14452F] hover:bg-[#F5C518] text-white hover:text-[#14452F] active:scale-95'
            }`}
            title="Thêm nhanh vào giỏ"
          >
            {justAdded ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // 2. GRID VIEW (Tỷ lệ vàng 2 cột, Studio Box, Siêu đẹp & Không bị dài lố)
  // -------------------------------------------------------------------------
  return (
    <div className="group bg-white rounded-xl p-2 sm:p-3.5 border border-stone-200/90 hover:border-[#14452F] shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden w-full">
      {/* Studio Stage: Khung trưng bày ảnh Studio thanh lịch */}
      <div className="relative w-full aspect-square bg-[#F5F6F3] rounded-lg overflow-hidden flex items-center justify-center p-2 group-hover:bg-[#EDF1EA] transition-colors">
        {/* Floating Badges: Chỉ hiển thị khi admin gắn tag hoặc đánh dấu Bán chạy */}
        {(product.discountBadge || product.isBestSeller) && (
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
            <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-[#14452F] text-[#F5C518] px-1.5 py-0.5 rounded-xs shadow-2xs">
              <Sparkles className="w-2.5 h-2.5 text-[#F5C518]" />
              {product.discountBadge || 'Bán chạy'}
            </span>
          </div>
        )}

        {/* Favorite Heart Button */}
        <button
          onClick={toggleLike}
          className={`absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/80 backdrop-blur-xs shadow-2xs transition-all duration-200 cursor-pointer ${
            isLiked
              ? 'text-rose-500 scale-105'
              : 'text-stone-300 hover:text-rose-500'
          }`}
          title="Yêu thích món này"
          aria-label="Yêu thích"
        >
          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500' : ''}`} />
        </button>

        {/* Transparent Drink Cup Link */}
        <Link
          to={`/san-pham/${product.id}`}
          className="w-full h-full flex items-center justify-center cursor-pointer"
        >
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain drop-shadow-md group-hover:scale-108 transition-transform duration-300"
            loading="lazy"
          />
        </Link>
      </div>

      {/* Product Details - Compact & Balanced */}
      <div className="flex flex-col flex-1 justify-between pt-2">
        <div>
          {/* Rating Row */}
          <div className="flex items-center gap-1 text-[11px] text-stone-500 mb-0.5">
            <span className="flex items-center text-amber-500 font-bold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />
              {product.rating}
            </span>
            <span className="text-stone-300">•</span>
            <span className="text-stone-400 text-[10px] sm:text-[11px] truncate">
              {product.reviewCount} đã chọn
            </span>
          </div>

          {/* Title */}
          <Link
            to={`/san-pham/${product.id}`}
            className="block font-black text-stone-900 group-hover:text-[#14452F] transition-colors text-xs sm:text-sm md:text-base line-clamp-1 leading-snug"
          >
            {product.name}
          </Link>

          {/* Subtitle - Giấu trên mobile để thẻ luôn gọn gàng tỉ lệ vàng */}
          {!compact && (
            <p className="hidden sm:block text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
              {product.subtitle}
            </p>
          )}
        </div>

        {/* Bottom Row: Price & Action */}
        <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between gap-1.5 sm:gap-2">
          {/* Price */}
          <div className="min-w-0 flex-1">
            <span className="font-black text-[#14452F] text-xs sm:text-base block truncate tracking-tight">
              {formatCurrencyVND(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[9px] sm:text-[11px] text-stone-400 line-through block truncate">
                {formatCurrencyVND(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Sleek Circular Add Button */}
          <button
            onClick={handleQuickAdd}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 transition-all shadow-xs cursor-pointer ${
              justAdded
                ? 'bg-[#14452F] text-[#F5C518] scale-110 shadow-md'
                : 'bg-[#14452F] hover:bg-[#185338] text-white active:scale-90'
            }`}
            title="Thêm vào giỏ"
            aria-label="Thêm vào giỏ"
          >
            {justAdded ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
