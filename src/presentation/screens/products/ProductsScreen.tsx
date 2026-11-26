import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  ArrowRight,
  Coffee,
  LayoutGrid,
  List,
  Sparkles,
  Flame,
  CupSoda,
  Leaf,
  Package
} from 'lucide-react';
import { ProductCategory } from '../../../core/entities/product';
import { useProducts } from '../../hooks/useProducts';
import { ProductCard } from '../../components/product/ProductCard';
import { ComboMenuSection } from '../../components/product/ComboMenuSection';

interface CategoryOption {
  key: string;
  label: string;
  shortLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  tag?: string;
}

const CATEGORIES: CategoryOption[] = [
  { key: 'all', label: 'Tất cả', shortLabel: 'Tất cả', icon: Sparkles },
  { key: 'combo', label: 'Combo', shortLabel: 'Combo', icon: Flame },
  { key: 'coffee', label: 'Cà phê', shortLabel: 'Cà phê', icon: Coffee },
  { key: 'tea', label: 'Trà trái cây', shortLabel: 'Trà trái cây', icon: CupSoda },
  { key: 'cacao', label: 'Cacao', shortLabel: 'Cacao', icon: Package },
  { key: 'matcha', label: 'Matcha', shortLabel: 'Matcha', icon: Leaf }
];

export const ProductsScreen: React.FC = () => {
  const [searchParams] = useSearchParams();
  const searchParam = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || '';
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const {
    products,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    loading
  } = useProducts('all');

  useEffect(() => {
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParam, setSearchQuery]);

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam as any);
    }
  }, [categoryParam, setSelectedCategory]);

  const coffeeProducts = products.filter((p) => p.category === 'coffee');
  const teaProducts = products.filter((p) => p.category === 'tea');
  const matchaProducts = products.filter((p) => p.category === 'matcha');
  const cacaoProducts = products.filter((p) => p.category === 'cacao');

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-20 text-[#1A1A1A] w-full overflow-hidden">
      {/* 1. Header Banner */}
      <section className="bg-gradient-to-r from-[#14452F] via-[#185338] to-[#113B26] text-white py-6 sm:py-10 px-3 sm:px-6 lg:px-8 border-b border-[#206645] relative overflow-hidden w-full">
        <div className="absolute top-0 right-10 w-72 h-72 bg-[#F5C518]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[#F5C518] text-[10px] sm:text-xs font-black uppercase tracking-widest mb-1">
              🌿 HONNE DRINK SELECTION
            </div>
            <h1 className="text-xl sm:text-4xl font-black tracking-tight">Thực Đơn Đồ Uống HONNE</h1>
            <p className="text-emerald-100 text-xs sm:text-sm mt-0.5 sm:mt-1 font-normal">
              100% thức uống pha chế tươi từ cà phê rang mộc Tây Nguyên, búp trà mộc ủ lạnh, matcha & cacao
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 p-2.5 sm:p-3 rounded-2xl shadow-sm self-stretch sm:self-auto">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center p-1 shrink-0">
              <img
                src="/images/assets/drink_coffee_milk.png"
                alt="HONNE Coffee"
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
              />
            </div>
            <div>
              <span className="block text-[10px] sm:text-[11px] text-emerald-100">100% Pha chế tươi</span>
              <span className="text-xs sm:text-sm font-black text-[#F5C518]">Hơn 20+ món signature & combo</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Enhanced Category Filter Tabs & View Mode Switcher */}
      <section className="sticky top-16 sm:top-20 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80 py-2 px-3 sm:px-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] w-full">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
          {/* Categories Horizontal Scroll */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5 min-w-0">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.key && !searchQuery;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory(cat.key as any);
                  }}
                  className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold shrink-0 transition-all cursor-pointer select-none ${
                    isSelected
                      ? 'bg-[#14452F] text-[#F5C518] shadow-md ring-2 ring-[#14452F]/20'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-700 hover:text-stone-900 border border-stone-200 hover:border-emerald-700/40'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isSelected ? 'text-[#F5C518]' : 'text-stone-500'}`} />
                  <span>{cat.label}</span>
                  {cat.tag && (
                    <span className={`text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wider ${
                      isSelected ? 'bg-[#F5C518] text-[#14452F]' : 'bg-red-500 text-white'
                    }`}>
                      {cat.tag}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-stone-100/90 p-1 rounded-xl shrink-0 border border-stone-200">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#14452F] text-[#F5C518] shadow-xs'
                  : 'text-stone-400 hover:text-stone-700'
              }`}
              title="Dạng lưới thẻ"
              aria-label="Lưới thẻ"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#14452F] text-[#F5C518] shadow-xs'
                  : 'text-stone-400 hover:text-stone-700'
              }`}
              title="Dạng danh sách"
              aria-label="Danh sách"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Search status notification */}
      {searchQuery && (
        <div className="max-w-7xl mx-auto px-3 sm:px-6 mt-4 flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3 sm:p-4 rounded-xl text-xs sm:text-sm">
          <span>Kết quả tìm kiếm cho: &ldquo;<strong>{searchQuery}</strong>&rdquo;</span>
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-emerald-800 font-bold hover:underline"
          >
            Xóa tìm kiếm
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-6 sm:mt-8 space-y-8 sm:space-y-12">
        {loading ? (
          <div className="text-center py-20 text-stone-400">Đang tải thức uống...</div>
        ) : selectedCategory === 'combo' ? (
          /* Pure Combo View */
          <ComboMenuSection />
        ) : selectedCategory !== 'all' || searchQuery ? (
          /* Filtered or Searched View */
          <div>
            <h2 className="text-lg sm:text-xl font-black text-stone-900 mb-6 flex items-center gap-2 uppercase tracking-wide">
              <Coffee className="w-5 h-5 text-[#14452F]" />
              {searchQuery
                ? `Kết quả tìm kiếm (${products.length} món)`
                : CATEGORIES.find((c) => c.key === selectedCategory)?.label}
            </h2>
            {products.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-stone-200">
                <p className="text-stone-500">Không tìm thấy món phù hợp.</p>
              </div>
            ) : viewMode === 'list' ? (
              <div className="space-y-3">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} viewMode="list" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} viewMode="grid" />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Default Grouped Catalog View */
          <>
            {/* 0. Combo Tiết Kiệm (Top of Menu) */}
            <div>
              <ComboMenuSection />
            </div>

            {/* 1. Cà phê section */}
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-200">
                <h2 className="text-base sm:text-xl font-black text-stone-900 tracking-wide uppercase">
                  Cà phê
                </h2>
                <button
                  onClick={() => setSelectedCategory('coffee')}
                  className="text-xs sm:text-sm font-bold text-[#14452F] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {viewMode === 'list' ? (
                <div className="space-y-2.5 sm:space-y-3">
                  {coffeeProducts.map((p) => (
                    <ProductCard key={p.id} product={p} viewMode="list" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-6">
                  {coffeeProducts.map((p) => (
                    <ProductCard key={p.id} product={p} viewMode="grid" />
                  ))}
                </div>
              )}
            </div>

            {/* 2. Trà section */}
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-200">
                <h2 className="text-base sm:text-xl font-black text-stone-900 tracking-wide uppercase">
                  Trà trái cây
                </h2>
                <button
                  onClick={() => setSelectedCategory('tea')}
                  className="text-xs sm:text-sm font-bold text-[#14452F] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {viewMode === 'list' ? (
                <div className="space-y-2.5 sm:space-y-3">
                  {teaProducts.map((p) => (
                    <ProductCard key={p.id} product={p} viewMode="list" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-6">
                  {teaProducts.map((p) => (
                    <ProductCard key={p.id} product={p} viewMode="grid" />
                  ))}
                </div>
              )}
            </div>

            {/* 3. Matcha section */}
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-200">
                <h2 className="text-base sm:text-xl font-black text-stone-900 tracking-wide uppercase">
                  Matcha
                </h2>
                <button
                  onClick={() => setSelectedCategory('matcha')}
                  className="text-xs sm:text-sm font-bold text-[#14452F] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {viewMode === 'list' ? (
                <div className="space-y-2.5 sm:space-y-3">
                  {matchaProducts.map((p) => (
                    <ProductCard key={p.id} product={p} viewMode="list" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-6">
                  {matchaProducts.map((p) => (
                    <ProductCard key={p.id} product={p} viewMode="grid" />
                  ))}
                </div>
              )}
            </div>

            {/* 4. Cacao section */}
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-200">
                <h2 className="text-base sm:text-xl font-black text-stone-900 tracking-wide uppercase">
                  Cacao
                </h2>
                <button
                  onClick={() => setSelectedCategory('cacao')}
                  className="text-xs sm:text-sm font-bold text-[#14452F] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {viewMode === 'list' ? (
                <div className="space-y-2.5 sm:space-y-3">
                  {cacaoProducts.map((p) => (
                    <ProductCard key={p.id} product={p} viewMode="list" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-6">
                  {cacaoProducts.map((p) => (
                    <ProductCard key={p.id} product={p} viewMode="grid" />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
