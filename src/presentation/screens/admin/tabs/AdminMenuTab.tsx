import React, { useState } from 'react';
import {
  Coffee,
  Plus,
  Trash2,
  Edit2,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Upload,
  Sparkles,
  Flame,
  Tag,
  DollarSign,
  X,
  Eye,
  EyeOff,
  Image as ImageIcon
} from 'lucide-react';
import { formatCurrencyVND } from '../../../../shared/utils/currency';
import { useToast } from '../../../context/ToastContext';
import { ConfirmDeleteModal } from '../../../components/common/ConfirmDeleteModal';
import { authFetch, API_BASE_URL } from '../../../../shared/utils/api-client';

export interface ProductItem {
  id: string;
  name: string;
  subtitle?: string;
  description?: string;
  price: number;
  category: string;
  image: string;
  isAvailable?: boolean | number;
  isBestSeller?: boolean | number;
  isFeatured?: boolean | number;
  notes?: string;
}

interface AdminMenuTabProps {
  products: ProductItem[];
  onCreateProduct: (prod: any) => Promise<void>;
  onDeleteProduct: (id: string, name: string) => Promise<void>;
  onToggleAvailability: (id: string) => Promise<void>;
  onUpdateProduct: (id: string, updatedFields: Partial<ProductItem>) => Promise<void>;
}

// 5 Official HONNE Categories
const CATEGORIES = [
  { id: 'all', label: 'Tất Cả Món', icon: Sparkles },
  { id: 'coffee', label: 'Cà Phê Rang Mộc', icon: Coffee },
  { id: 'tea', label: 'Trà Trái Cây Tươi', icon: Flame },
  { id: 'matcha', label: 'Matcha Nhật Bản', icon: Sparkles },
  { id: 'cacao', label: 'Cacao Đắk Lắk', icon: Tag },
  { id: 'combo', label: 'Combo Tiết Kiệm', icon: Flame }
];

export const AdminMenuTab: React.FC<AdminMenuTabProps> = ({
  products,
  onCreateProduct,
  onDeleteProduct,
  onToggleAvailability,
  onUpdateProduct
}) => {
  const { showToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add product modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('coffee');
  const [newProdPrice, setNewProdPrice] = useState(35000);
  const [newProdSubtitle, setNewProdSubtitle] = useState('');
  const [newProdDescription, setNewProdDescription] = useState('');
  const [newProdImage, setNewProdImage] = useState('/images/3d_drinks/drink_coffee_muoi.png');
  const [isUploading, setIsUploading] = useState(false);

  // Full Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('coffee');
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editIsAvailable, setEditIsAvailable] = useState<boolean>(true);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete Confirmation Modal State
  const [deletingProduct, setDeletingProduct] = useState<ProductItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter products by category and search
  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'all') {
      const cat = (p.category || '').toLowerCase();
      if (selectedCategory === 'coffee' && !cat.includes('coffee') && !cat.includes('cà phê') && !cat.includes('ca-phe')) return false;
      if (selectedCategory === 'tea' && !cat.includes('tea') && !cat.includes('tra') && !cat.includes('trà')) return false;
      if (selectedCategory === 'matcha' && !cat.includes('matcha')) return false;
      if (selectedCategory === 'cacao' && !cat.includes('cacao')) return false;
      if (selectedCategory === 'combo' && !cat.includes('combo')) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = (p.name || '').toLowerCase().includes(q);
      const matchSub = (p.subtitle || '').toLowerCase().includes(q);
      return matchName || matchSub;
    }

    return true;
  });

  const getCategoryCount = (catId: string) => {
    if (catId === 'all') return products.length;
    return products.filter((p) => {
      const cat = (p.category || '').toLowerCase();
      if (catId === 'coffee') return cat.includes('coffee') || cat.includes('cà phê') || cat.includes('ca-phe');
      if (catId === 'tea') return cat.includes('tea') || cat.includes('tra') || cat.includes('trà');
      if (catId === 'matcha') return cat.includes('matcha');
      if (catId === 'cacao') return cat.includes('cacao');
      if (catId === 'combo') return cat.includes('combo');
      return false;
    }).length;
  };

  // Upload image to Cloudflare R2
  const handleUploadImage = async (file: File, isEdit: boolean = false) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await authFetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success && data.url) {
        if (isEdit) {
          setEditImage(data.url);
        } else {
          setNewProdImage(data.url);
        }
        showToast('Tải ảnh đại diện món lên Cloudflare R2 thành công!', 'success');
      } else {
        showToast(data.message || 'Lỗi tải ảnh lên R2', 'error');
      }
    } catch {
      showToast('Không thể kết nối đến máy chủ upload ảnh', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Open Edit Modal with full data populated
  const handleOpenEdit = (prod: ProductItem) => {
    setEditingProduct(prod);
    setEditName(prod.name);
    setEditCategory(prod.category || 'coffee');
    setEditPrice(prod.price);
    setEditSubtitle(prod.subtitle || '');
    setEditDescription(prod.description || '');
    setEditImage(prod.image || '/images/3d_drinks/drink_coffee_muoi.png');
    setEditIsAvailable(prod.isAvailable === 1 || prod.isAvailable === true || prod.isAvailable === undefined);
  };

  // Handle Save Full Edit
  const handleSaveEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editName.trim()) {
      showToast('Vui lòng nhập tên món!', 'error');
      return;
    }

    setIsSavingEdit(true);
    try {
      await onUpdateProduct(editingProduct.id, {
        name: editName.trim(),
        category: editCategory,
        price: Number(editPrice),
        subtitle: editSubtitle.trim(),
        description: editDescription.trim(),
        image: editImage,
        isAvailable: editIsAvailable
      });
      setEditingProduct(null);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Handle Add Product Submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) {
      showToast('Vui lòng nhập tên món!', 'error');
      return;
    }

    await onCreateProduct({
      id: 'PRD_' + Date.now().toString().slice(-6),
      name: newProdName.trim(),
      subtitle: newProdSubtitle.trim() || 'Hương vị thơm ngon đậm đà đặc trưng HONNE',
      description: newProdDescription.trim(),
      price: Number(newProdPrice),
      category: newProdCategory,
      image: newProdImage,
      isAvailable: true,
      isBestSeller: true
    });

    setShowAddModal(false);
    setNewProdName('');
    setNewProdSubtitle('');
    setNewProdDescription('');
  };

  // Handle Delete Confirmation
  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);
    try {
      await onDeleteProduct(deletingProduct.id, deletingProduct.name);
      setDeletingProduct(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & ACTION */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <Coffee className="w-5 h-5 text-[#14452F]" />
            <span>Quản Lý Thực Đơn & Nhóm Đồ Uống</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Dữ liệu thời gian thực đồng bộ trực tiếp Cloudflare D1 • Chỉnh sửa đầy đủ thông tin, giá, ảnh & ghi chú
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-[#0B281A] hover:bg-[#14452F] text-amber-300 font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Thêm Món Mới Vào Thực Đơn</span>
        </button>
      </div>

      {/* 2. CATEGORY PILL SELECTORS */}
      <div className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const count = getCategoryCount(cat.id);
            const isSelected = selectedCategory === cat.id;
            const Icon = cat.icon;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-[#14452F] text-amber-300 shadow-sm font-black'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-300' : 'text-stone-400'}`} />
                <span>{cat.label}</span>
                <span className={`px-2 py-0.2 rounded-full text-[10px] font-mono ${
                  isSelected ? 'bg-amber-400 text-stone-900 font-black' : 'bg-stone-200 text-stone-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-stone-100">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên món hoặc mô tả hương vị..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-hidden focus:border-[#14452F] transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <span className="text-xs text-stone-500 font-mono font-bold">
            Hiển thị <strong>{filteredProducts.length}</strong> / {products.length} món
          </span>
        </div>
      </div>

      {/* 3. PRODUCT GRID WITH REAL DATA */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/80">
          <Coffee className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="font-bold text-stone-800 text-sm">Không tìm thấy món nào phù hợp</h3>
          <p className="text-xs text-stone-400 mt-1">Thử đổi từ khóa tìm kiếm hoặc chọn danh mục khác</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((prod) => {
            const isAvailable = prod.isAvailable === 1 || prod.isAvailable === true || prod.isAvailable === undefined;

            return (
              <div
                key={prod.id}
                className={`bg-white rounded-3xl p-4 border transition duration-200 flex flex-col justify-between group shadow-xs ${
                  isAvailable
                    ? 'border-stone-200/80 hover:border-[#14452F]/40 hover:shadow-md'
                    : 'border-stone-200 bg-stone-50/60 opacity-75'
                }`}
              >
                <div>
                  {/* Thumbnail Image */}
                  <div className="w-full h-40 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center p-3 relative overflow-hidden mb-3">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/3d_drinks/drink_coffee_muoi.png';
                      }}
                    />

                    {/* Status Badge */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
                      {isAvailable ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle className="w-2.5 h-2.5" />
                          <span>Đang Bán</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-stone-200 text-stone-600 flex items-center gap-1">
                          <XCircle className="w-2.5 h-2.5" />
                          <span>Tạm Hết</span>
                        </span>
                      )}
                    </div>

                    {/* ID Pill */}
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-[9px] font-mono text-stone-400 bg-white/90 border border-stone-200">
                      #{prod.id}
                    </span>
                  </div>

                  {/* Info */}
                  <h4 className="font-extrabold text-sm text-stone-900 group-hover:text-[#14452F] transition line-clamp-1">
                    {prod.name}
                  </h4>
                  <p className="text-[11px] text-stone-500 mt-1 line-clamp-2 leading-relaxed min-h-[32px]">
                    {prod.subtitle || prod.description || 'Hương vị thơm ngon đặc trưng phong cách HONNE'}
                  </p>
                </div>

                {/* Price & Action Buttons */}
                <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase font-bold block">Giá niêm yết</span>
                    <span className="font-mono font-black text-sm text-[#14452F]">
                      {formatCurrencyVND(prod.price)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Full Edit Button */}
                    <button
                      onClick={() => handleOpenEdit(prod)}
                      className="p-2 rounded-xl text-stone-600 hover:text-amber-800 hover:bg-amber-100/60 transition cursor-pointer"
                      title="Chỉnh sửa toàn bộ thông tin món (Tên, giá, ảnh, ghi chú...)"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Toggle Availability */}
                    <button
                      onClick={() => onToggleAvailability(prod.id)}
                      className={`p-2 rounded-xl transition cursor-pointer ${
                        isAvailable
                          ? 'text-stone-400 hover:text-amber-600 hover:bg-amber-50'
                          : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                      }`}
                      title={isAvailable ? 'Tạm ngưng bán món này' : 'Mở bán lại món này'}
                    >
                      {isAvailable ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>

                    {/* Delete with Confirmation Modal */}
                    <button
                      onClick={() => setDeletingProduct(prod)}
                      className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Xóa món khỏi thực đơn"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. MODAL: FULL EDIT PRODUCT (CHỈNH SỬA TÊN, GIÁ, ẢNH, GHI CHÚ,...)   */}
      {/* ===================================================================== */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingProduct(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-stone-100 text-stone-500 hover:text-stone-900"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <h3 className="font-black text-lg text-stone-900">
                Chỉnh Sửa Thông Tin Đồ Uống
              </h3>
            </div>
            <p className="text-xs text-stone-500 mb-5">
              Cập nhật tên, giá bán, danh mục, mô tả hương vị và ảnh lưu trực tiếp vào Cloudflare D1
            </p>

            <form onSubmit={handleSaveEditSubmit} className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Tên Đồ Uống *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-900 focus:outline-hidden focus:border-[#14452F]"
                />
              </div>

              {/* Category & Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Danh Mục *</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 font-bold focus:outline-hidden focus:border-[#14452F]"
                  >
                    <option value="coffee">Cà Phê Rang Mộc</option>
                    <option value="tea">Trà Trái Cây Tươi</option>
                    <option value="matcha">Matcha Nhật Bản</option>
                    <option value="cacao">Cacao Đắk Lắk</option>
                    <option value="combo">Combo Tiết Kiệm</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Giá Bán (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={1000}
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 font-mono font-bold focus:outline-hidden focus:border-[#14452F]"
                  />
                </div>
              </div>

              {/* Subtitle / Hương vị */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Mô Tả Hương Vị Món</label>
                <input
                  type="text"
                  value={editSubtitle}
                  onChange={(e) => setEditSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-hidden focus:border-[#14452F]"
                  placeholder="Ví dụ: Cà phê muối béo mặn nhẹ quyện vị rang mộc..."
                />
              </div>

              {/* Description / Ghi chú công thức */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Ghi Chú Công Thức / Thành Phần</label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-hidden focus:border-[#14452F]"
                  placeholder="Ghi chú pha chế, định lượng siro hoặc lưu ý đặc biệt..."
                />
              </div>

              {/* Image Upload / Change */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Ảnh Đại Diện Đồ Uống</label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-center overflow-hidden shrink-0">
                    <img
                      src={editImage}
                      alt="Preview"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/3d_drinks/drink_coffee_muoi.png';
                      }}
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <label className="block py-2 px-3 rounded-xl border border-dashed border-stone-300 hover:border-[#14452F] bg-stone-50/50 text-center cursor-pointer transition">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleUploadImage(f, true);
                        }}
                        className="hidden"
                      />
                      <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#14452F]">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploading ? 'Đang tải lên R2...' : 'Tải ảnh mới từ máy'}</span>
                      </div>
                    </label>

                    <input
                      type="text"
                      placeholder="Hoặc nhập URL ảnh trực tiếp..."
                      value={editImage}
                      onChange={(e) => setEditImage(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-stone-50 border border-stone-200 text-[11px] text-stone-700 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Availability Switch */}
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-stone-800 block">Trạng Thái Mở Bán</span>
                  <span className="text-[10px] text-stone-400">Cho phép khách hàng đặt món này trên ứng dụng</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditIsAvailable(!editIsAvailable)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    editIsAvailable ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  {editIsAvailable ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Đang Bán</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Tạm Hết</span>
                    </>
                  )}
                </button>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSavingEdit || isUploading}
                  className="flex-1 py-3 rounded-2xl bg-[#0B281A] hover:bg-[#14452F] text-amber-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>{isSavingEdit ? 'Đang lưu vào D1...' : 'Lưu Thay Đổi Món'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs cursor-pointer"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. MODAL: ADD NEW DRINK                                              */}
      {/* ===================================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-stone-100 text-stone-500 hover:text-stone-900"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-black text-lg text-stone-900 mb-1">Thêm Món Mới Vào Thực Đơn</h3>
            <p className="text-xs text-stone-500 mb-5">Đồ uống mới sẽ lưu vào Cloudflare D1 và hiển thị tức thì</p>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Tên Đồ Uống *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Cà phê Muối Biển Macchiato"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-hidden focus:border-[#14452F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Phân Nhóm Chuẩn *</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 font-bold focus:outline-hidden focus:border-[#14452F]"
                  >
                    <option value="coffee">Cà Phê Rang Mộc</option>
                    <option value="tea">Trà Trái Cây Tươi</option>
                    <option value="matcha">Matcha Nhật Bản</option>
                    <option value="cacao">Cacao Đắk Lắk</option>
                    <option value="combo">Combo Tiết Kiệm</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Giá Bán (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={1000}
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 font-mono font-bold focus:outline-hidden focus:border-[#14452F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Mô Tả Hương Vị Món</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Lớp kem muối béo mặn nhẹ quyện cà phê Robusta"
                  value={newProdSubtitle}
                  onChange={(e) => setNewProdSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-hidden focus:border-[#14452F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Ảnh Đại Diện Đồ Uống</label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-center overflow-hidden shrink-0">
                    <img src={newProdImage} alt="Preview" className="w-full h-full object-contain" />
                  </div>
                  <label className="flex-1 py-2.5 px-3 rounded-xl border border-dashed border-stone-300 hover:border-[#14452F] bg-stone-50/50 text-center cursor-pointer transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleUploadImage(f, false);
                      }}
                      className="hidden"
                    />
                    <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#14452F]">
                      <Upload className="w-4 h-4" />
                      <span>{isUploading ? 'Đang tải lên R2...' : 'Tải ảnh từ máy'}</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 py-3 rounded-2xl bg-[#0B281A] hover:bg-[#14452F] text-amber-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Xác Nhận Thêm Món</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs cursor-pointer"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 6. MODAL: CONFIRM DELETE PRODUCT (POPUP XÁC NHẬN XÓA AN TOÀN)         */}
      {/* ===================================================================== */}
      <ConfirmDeleteModal
        isOpen={Boolean(deletingProduct)}
        title="Xác Nhận Xóa Đồ Uống"
        itemName={deletingProduct ? `${deletingProduct.name} (#${deletingProduct.id})` : undefined}
        description="Món đồ uống này sẽ bị xóa hoàn toàn khỏi cơ sở dữ liệu Cloudflare D1 và không còn xuất hiện trên thực đơn khách hàng. Bạn có chắc chắn muốn xóa không?"
        confirmText="Xóa Món Khỏi D1"
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingProduct(null)}
      />
    </div>
  );
};
