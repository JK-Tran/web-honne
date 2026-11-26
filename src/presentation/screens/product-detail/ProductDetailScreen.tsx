import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Star,
  Plus,
  Minus,
  Check,
  Share2,
  Heart,
  Truck,
  ShieldCheck,
  Clock,
  Sparkles,
  Award,
  ThumbsUp,
  Store
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Product, ProductSize, ProductTopping } from '../../../core/entities/product';
import { productRepository } from '../../../data/repositories/product.repository.impl';
import { formatCurrencyVND } from '../../../shared/utils/currency';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { ProductCard } from '../../components/product/ProductCard';
import { OrderReviewModal } from '../../components/orders/OrderReviewModal';

export const ProductDetailScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { showToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedSize, setSelectedSize] = useState<ProductSize>('M');
  const [selectedSugar, setSelectedSugar] = useState<string>('50%');
  const [selectedIce, setSelectedIce] = useState<string>('Đá thường (100%)');
  const [selectedToppings, setSelectedToppings] = useState<ProductTopping[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Real Database Reviews State
  const [reviewsData, setReviewsData] = useState<{
    total: number;
    averageRating: number;
    starCounts: Record<number, number>;
    starPercentages: Record<number, number>;
    reviews: any[];
  }>({
    total: 0,
    averageRating: 5.0,
    starCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    starPercentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    reviews: []
  });
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);

  const fetchRealReviews = (productId: string) => {
    fetch(`https://api-honne.hanhan02102012.workers.dev/api/products/${productId}/reviews`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setReviewsData({
            total: data.total || 0,
            averageRating: data.averageRating || 5.0,
            starCounts: data.starCounts || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
            starPercentages: data.starPercentages || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
            reviews: data.data || []
          });
        }
      })
      .catch((err) => {
        console.warn('Lỗi khi tải đánh giá thực tế:', err);
      });
  };

  useEffect(() => {
    if (id) {
      setLoading(true);
      fetchRealReviews(id);

      productRepository.getProductById(id)
        .then(async (p) => {
          let targetProduct = p;
          if (!targetProduct) {
            const all = await productRepository.getAllProducts();
            targetProduct = all.find((item) => item.id === id) || all[0] || null;
          }

          if (targetProduct) {
            setProduct(targetProduct);
            const sugars = targetProduct.customizationRules?.allowedSugarLevels || [0, 30, 50, 70, 100];
            const ices = targetProduct.customizationRules?.allowedIceLevels || ['Không đá', '50% đá', '100% đá', 'Đá riêng'];
            if (sugars.length > 0) {
              setSelectedSugar(`${sugars[Math.min(2, sugars.length - 1)]}%`);
            }
            if (ices.length > 0) {
              setSelectedIce(ices[0]);
            }
            setSelectedToppings([]);
          }
        })
        .catch((err) => {
          console.error('Lỗi khi tải chi tiết món:', err);
        })
        .finally(() => {
          setLoading(false);
        });

      // Load related items
      productRepository.getAllProducts().then((all) => {
        setRelatedProducts(all.filter((item) => item.id !== id).slice(0, 4));
      }).catch(() => {});
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBFBF9]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-[#14452F] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-stone-500 font-medium text-sm">Đang tải thức uống...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBFBF9] px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8 text-[#14452F]" />
          </div>
          <h2 className="text-lg font-black text-stone-900">Không tìm thấy món</h2>
          <p className="text-xs text-stone-500">Thức uống bạn tìm kiếm không tồn tại hoặc đã được cập nhật.</p>
          <Link
            to="/san-pham"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#14452F] text-[#F5C518] font-bold text-xs shadow-xs"
          >
            <span>Quay lại Thực đơn</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Calculate dynamic pricing
  const sizeExtra = selectedSize === 'L' ? 6000 : 0;
  const toppingTotal = selectedToppings.reduce((acc, t) => acc + t.price, 0);
  const unitPrice = product.price + sizeExtra + toppingTotal;
  const totalPrice = unitPrice * quantity;

  const toggleTopping = (topping: ProductTopping) => {
    if (selectedToppings.some((t) => t.id === topping.id)) {
      setSelectedToppings(selectedToppings.filter((t) => t.id !== topping.id));
    } else {
      setSelectedToppings([...selectedToppings, topping]);
    }
  };

  const handleAddToCart = () => {
    addItem(product, selectedSize, quantity, selectedToppings);
    // Toast is handled centrally in addItem (CartContext) to avoid duplicate alerts
  };

  const handleBuyNow = () => {
    addItem(product, selectedSize, quantity, selectedToppings);
    navigate('/gio-hang');
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Đã sao chép liên kết món!', 'info');
  };

  const allowedToppings = product.customizationRules?.allowedToppings || [];
  const allowedSugarLevels = product.customizationRules?.allowedSugarLevels || [];
  const allowedIceLevels = product.customizationRules?.allowedIceLevels || [];

  return (
    <div className="min-h-screen bg-[#FBFBF9] py-5 sm:py-8 px-3 sm:px-6 lg:px-8 text-[#1A1A1A] w-full overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-stone-500 mb-4 sm:mb-6 overflow-x-auto no-scrollbar whitespace-nowrap">
          <Link to="/" className="hover:text-[#14452F] transition shrink-0">Trang chủ</Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <Link to="/san-pham" className="hover:text-[#14452F] transition shrink-0">Thực đơn</Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <span className="text-stone-900 font-bold truncate">{product.name}</span>
        </nav>

        {/* Main Product Hero Box */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 lg:p-10 shadow-xs border border-stone-200 mb-8 sm:mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
            
            {/* CỘT TRÁI: Studio Cup Showcase */}
            <div className="lg:col-span-5 flex flex-col items-center w-full">
              <div className="relative w-full aspect-square bg-[#F5F6F3] rounded-2xl overflow-hidden p-4 sm:p-6 flex items-center justify-center border border-stone-200/80 shadow-inner group">
                {/* Badges */}
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex flex-col gap-1 sm:gap-1.5">
                  {product.discountBadge && (
                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-[#14452F] text-[#F5C518] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-sm shadow-xs">
                      <Sparkles className="w-3 h-3 text-[#F5C518]" />
                      {product.discountBadge}
                    </span>
                  )}
                  <span className="text-[10px] sm:text-[11px] font-black bg-white/90 backdrop-blur-xs text-[#14452F] px-2 py-0.5 rounded-sm border border-stone-200 shadow-2xs">
                    100% Pha chế tươi
                  </span>
                </div>

                {/* Floating Actions */}
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 flex flex-col gap-1.5 sm:gap-2">
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className={`p-2 sm:p-2.5 rounded-full transition shadow-xs cursor-pointer ${
                      isLiked ? 'bg-rose-50 text-rose-500' : 'bg-white/90 hover:bg-white text-stone-400'
                    }`}
                    title="Yêu thích"
                  >
                    <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLiked ? 'fill-rose-500' : ''}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 sm:p-2.5 rounded-full bg-white/90 hover:bg-white text-stone-400 hover:text-stone-800 shadow-xs transition cursor-pointer"
                    title="Chia sẻ"
                  >
                    <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>

                {/* Large Transparent PNG Cup */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  className="w-full h-full flex items-center justify-center p-2"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain drop-shadow-2xl"
                  />
                </motion.div>
              </div>

              {/* Guarantees */}
              <div className="mt-3 sm:mt-4 w-full grid grid-cols-3 gap-1.5 sm:gap-2 text-center text-xs text-stone-600">
                <div className="p-2 sm:p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                  <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#14452F] mx-auto mb-0.5 sm:mb-1" />
                  <span className="font-bold text-stone-800 block text-[10px] sm:text-[11px]">Giao 30 phút</span>
                  <span className="text-[9px] sm:text-[10px] text-stone-400">Đá riêng giữ lạnh</span>
                </div>
                <div className="p-2 sm:p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                  <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#14452F] mx-auto mb-0.5 sm:mb-1" />
                  <span className="font-bold text-stone-800 block text-[10px] sm:text-[11px]">Nguyên chất</span>
                  <span className="text-[9px] sm:text-[10px] text-stone-400">0% Hương liệu giả</span>
                </div>
                <div className="p-2 sm:p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                  <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#14452F] mx-auto mb-0.5 sm:mb-1" />
                  <span className="font-bold text-stone-800 block text-[10px] sm:text-[11px]">4 Chi nhánh</span>
                  <span className="text-[9px] sm:text-[10px] text-stone-400">Tân Bình, TP.HCM</span>
                </div>
              </div>
            </div>

            {/* CỘT PHẢI: Tuỳ chọn Món & Đặt Hàng */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1 text-amber-500 font-black text-xs sm:text-sm bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{product.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-xs text-stone-500 font-medium">
                    ({product.reviewCount} đánh giá thực tế từ người mua)
                  </span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight">
                  {product.name}
                </h1>
                <p className="text-stone-600 text-sm sm:text-base mt-1.5 leading-relaxed">
                  {product.subtitle}
                </p>

                {/* Price Display */}
                <div className="mt-4 flex items-baseline gap-3">
                  <motion.span
                    key={unitPrice}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-3xl sm:text-4xl font-black text-[#14452F]"
                  >
                    {formatCurrencyVND(unitPrice)}
                  </motion.span>
                  {product.originalPrice && (
                    <span className="text-stone-400 line-through text-base">
                      {formatCurrencyVND(product.originalPrice + sizeExtra)}
                    </span>
                  )}
                </div>
              </div>

              {/* 1. Chọn Size */}
              {product.availableSizes.length > 1 && (
                <div className="border-t border-stone-100 pt-5">
                  <label className="block text-xs font-black uppercase tracking-wider text-stone-800 mb-2.5">
                    1. Chọn kích cỡ ly:
                  </label>
                  <div className="grid grid-cols-2 gap-3 max-w-sm">
                    {product.availableSizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`p-3 rounded-xl border-2 font-black text-sm flex items-center justify-between transition cursor-pointer ${
                          selectedSize === size
                            ? 'border-[#14452F] bg-[#14452F] text-[#F5C518] shadow-xs'
                            : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                        }`}
                      >
                        <span>Size {size}</span>
                        <span className={`text-xs ${selectedSize === size ? 'text-white' : 'text-stone-500'}`}>
                          {size === 'L' ? '+6.000đ' : 'Chuẩn'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Lượng đường & Lượng đá (Chuẩn logic theo loại đồ uống) */}
              {(allowedSugarLevels.length > 0 || allowedIceLevels.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 border-t border-stone-100 pt-5">
                  {/* Đường */}
                  {allowedSugarLevels.length > 0 && (
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-stone-800 mb-2">
                        2. Lượng đường:
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {allowedSugarLevels.map((sugar) => {
                          const sugarLabel = `${sugar}%`;
                          return (
                            <button
                              key={sugar}
                              type="button"
                              onClick={() => setSelectedSugar(sugarLabel)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                                selectedSugar === sugarLabel
                                  ? 'border-[#14452F] bg-[#14452F] text-[#F5C518]'
                                  : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                              }`}
                            >
                              {sugar === 50 ? '50% (Chuẩn)' : sugar === 0 ? '0% (Không đường)' : `${sugar}%`}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Đá */}
                  {allowedIceLevels.length > 0 && (
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-stone-800 mb-2">
                        3. Lượng đá:
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {allowedIceLevels.map((ice) => (
                          <button
                            key={ice}
                            type="button"
                            onClick={() => setSelectedIce(ice)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer capitalize ${
                              selectedIce === ice
                                ? 'border-[#14452F] bg-[#14452F] text-[#F5C518]'
                                : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                            }`}
                          >
                            {ice}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 3. Topping Hợp Lý Theo Món (Cà phê có topping cà phê, trà sữa có trân châu) */}
              {allowedToppings.length > 0 && (
                <div className="border-t border-stone-100 pt-5">
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-xs font-black uppercase tracking-wider text-stone-800">
                      4. Topping đi kèm phù hợp (Tùy chọn):
                    </label>
                    <span className="text-[11px] text-stone-400">Đã chọn ({selectedToppings.length})</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {allowedToppings.map((topping) => {
                      const isChecked = selectedToppings.some((t) => t.id === topping.id);
                      return (
                        <button
                          key={topping.id}
                          type="button"
                          onClick={() => toggleTopping(topping)}
                          className={`p-3 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                            isChecked
                              ? 'border-[#14452F] bg-[#14452F] text-white shadow-xs'
                              : 'border-stone-200 bg-stone-50 text-stone-800 hover:bg-white hover:border-stone-400'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded flex items-center justify-center border ${
                                isChecked ? 'bg-[#F5C518] border-[#F5C518]' : 'border-stone-400 bg-white'
                              }`}
                            >
                              {isChecked && <Check className="w-3 h-3 text-[#14452F]" />}
                            </div>
                            <span className="text-xs font-bold">{topping.name}</span>
                          </div>
                          <span className={`text-xs font-black ${isChecked ? 'text-[#F5C518]' : 'text-[#14452F]'}`}>
                            +{formatCurrencyVND(topping.price)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Số lượng & Nút Đặt hàng */}
              <div className="border-t border-stone-100 pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-stone-800">Số lượng:</span>
                  <div className="flex items-center border border-stone-300 rounded-lg bg-stone-50 p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded flex items-center justify-center text-stone-600 hover:bg-white hover:shadow-xs transition cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-black text-sm">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 rounded flex items-center justify-center text-stone-600 hover:bg-white hover:shadow-xs transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={handleAddToCart}
                    className="w-full py-3.5 px-4 rounded-xl border-2 border-[#14452F] text-[#14452F] hover:bg-[#14452F] hover:text-[#F5C518] font-black text-sm transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Thêm vào giỏ ({formatCurrencyVND(totalPrice)})
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#F5C518] hover:bg-[#ffd54f] text-[#103B27] font-black text-sm transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Mua ngay
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ĐÁNH GIÁ THỰC TẾ TỪ KHÁCH HÀNG (Dữ liệu thực tế từ Database) */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 lg:p-10 shadow-xs border border-stone-200 mb-10 sm:mb-16 space-y-5 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-3">
            <div>
              <h3 className="text-lg sm:text-2xl font-black text-stone-900 uppercase tracking-tight">
                Đánh giá thực tế từ khách hàng
              </h3>
              <p className="text-xs text-stone-500 mt-0.5 sm:mt-1">
                Phản hồi xác thực từ những người đã thưởng thức tại các chi nhánh HONNE
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-700" /> 100% Khách mua thật
              </div>
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(true)}
                className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[#F5C518] hover:bg-[#ffd54f] active:scale-98 text-[#14452F] font-black text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#14452F]" />
                <span>Viết đánh giá (+50 Xu)</span>
              </button>
            </div>
          </div>

          {/* Rating Summary Box */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 bg-[#FAFBF9] p-4 sm:p-6 rounded-xl border border-stone-200 items-center">
            <div className="md:col-span-4 text-center md:border-r border-stone-200 md:pr-6">
              <span className="text-4xl sm:text-5xl font-black text-[#14452F] block">
                {reviewsData.total > 0 ? reviewsData.averageRating.toFixed(1) : '5.0'}
              </span>
              <div className="flex justify-center text-amber-500 text-sm sm:text-base my-1">
                ★★★★★
              </div>
              <span className="text-xs text-stone-500 font-bold block">
                {reviewsData.total > 0
                  ? `${reviewsData.total} lượt đánh giá xác thực`
                  : 'Món mới • Chưa có đánh giá'}
              </span>
            </div>

            <div className="md:col-span-8 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const pct = reviewsData.starPercentages[star] || 0;
                const count = reviewsData.starCounts[star] || 0;
                return (
                  <div key={star} className="flex items-center gap-2 sm:gap-3 text-xs">
                    <span className="w-10 sm:w-12 font-bold text-stone-700 text-[11px] sm:text-xs">{star} sao</span>
                    <div className="flex-1 h-2 rounded-full bg-stone-200 overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-12 sm:w-14 text-right text-stone-500 font-semibold text-[11px] sm:text-xs">
                      {pct}% ({count})
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4 pt-2">
            {reviewsData.reviews && reviewsData.reviews.length > 0 ? (
              reviewsData.reviews.map((rev: any) => (
                <div key={rev.id} className="p-4 rounded-xl bg-stone-50/80 border border-stone-200 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-stone-900">{rev.author}</span>
                      {rev.verifiedPurchase && (
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-700" /> Đã mua món này
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-stone-400 text-[11px]">
                      <span className="text-emerald-700 font-semibold">Tại {rev.branch}</span>
                      <span>•</span>
                      <span>{rev.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center text-amber-500 text-xs">
                    {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>

                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-10 px-4 bg-stone-50/60 rounded-2xl border border-dashed border-stone-300 space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-black text-stone-800">Chưa có đánh giá nào cho món này</h4>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Hãy là khách hàng đầu tiên thưởng thức và chia sẻ cảm nhận để nhận ngay <strong>+50 Xu tích lũy</strong>!
                </p>
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#14452F] text-[#F5C518] font-bold text-xs shadow-xs hover:bg-[#185338] transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Viết đánh giá đầu tiên</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Review Modal */}
        <OrderReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          items={[{ productId: product.id, productName: product.name }]}
          onReviewSubmitted={() => fetchRealReviews(product.id)}
        />

        {/* Related Products Grid */}
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-stone-900 mb-6 uppercase tracking-tight">
            Thức uống gợi ý kèm theo
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
