# HONNE COFFEE & TEA - Modern React Clean Architecture

Dự án website chính thức cho thương hiệu **HONNE COFFEE & TEA** được thiết kế & phát triển dựa trên chuẩn kiến trúc **Clean Architecture** (dễ bảo trì, mở rộng và scale tính năng), bám sát 8 màn hình giao diện từ ảnh mẫu thiết kế.

---

## 🏗️ Kiến trúc Clean Architecture

Dự án được phân tầng rõ ràng theo nguyên lý độc lập nghiệp vụ:

```
src/
├── app/                              # Khởi tạo ứng dụng & Cấu hình Routes
│   ├── App.tsx                       # Root Component + Providers (Cart, Toast) + Layout
│   └── routes.tsx                    # Cấu hình React Router (8 màn hình)
│
├── core/                             # Core Domain Layer (Độc lập UI và Framework)
│   ├── entities/                     # Enterprise Business Entities & Types
│   │   ├── product.ts                # Model Sản phẩm, danh mục, kích thước, topping
│   │   ├── cart.ts                   # Model Giỏ hàng, Voucher, Khuyến mại
│   │   ├── store.ts                  # Model Cửa hàng, định vị địa lý
│   │   └── promo.ts                  # Model Combo, tin tức Blog
│   └── repositories/                 # Contracts / Interfaces cho tầng dữ liệu
│       ├── product.repository.ts
│       ├── store.repository.ts
│       └── promo.repository.ts
│
├── data/                             # Data Layer (Adapters & Repositories)
│   ├── mock/                         # Dữ liệu mẫu chuẩn thương hiệu HONNE
│   │   ├── products.mock.ts          # Cà phê muối, Matcha Latte, Trà đào...
│   │   ├── stores.mock.ts            # Hệ thống cửa hàng Q1, Phú Nhuận, Thảo Điền...
│   │   └── promos.mock.ts            # Combo Thật Chill, Blog cà phê
│   └── repositories/                 # Concrete Repositories (Dễ dàng thay thế bằng API thật)
│       ├── product.repository.impl.ts
│       ├── store.repository.impl.ts
│       └── promo.repository.impl.ts
│
├── presentation/                     # Presentation / UI Layer
│   ├── components/                   # Reusable Components
│   │   ├── layout/                   # Navbar (Sticky + Cart badge + Search), Footer
│   │   └── product/                  # ProductCard, Badges, Steppers
│   ├── context/                      # State Management (React Context)
│   │   ├── CartContext.tsx           # Quản lý giỏ hàng, LocalStorage, Voucher logic
│   │   └── ToastContext.tsx          # Toast thông báo trải nghiệm người dùng
│   ├── hooks/                        # Custom React Hooks
│   │   ├── useProducts.ts            # Lọc danh mục, tìm kiếm món
│   │   ├── useStores.ts              # Quản lý cửa hàng & bản đồ
│   │   └── usePromos.ts              # Quản lý khuyến mại & bài viết
│   └── screens/                      # 8 Màn hình cụ thể theo ảnh mẫu
│       ├── home/HomeScreen.tsx       # Màn 1: Trang chủ (Hero Kiosk, Menu nổi bật, Combo chill, Vì sao chọn)
│       ├── products/ProductsScreen.tsx # Màn 2: Danh mục sản phẩm (Tabs, Cà phê, Trà sữa, Matcha)
│       ├── product-detail/ProductDetailScreen.tsx # Màn 3: Chi tiết món (Ảnh thực tế, Size M/L, Tab mô tả)
│       ├── cart/CartScreen.tsx       # Màn 4: Giỏ hàng (Tăng giảm số lượng, Voucher, Thanh toán Confetti)
│       ├── about/AboutScreen.tsx     # Màn 5: Về HONNE (Câu chuyện thương hiệu, không gian xanh)
│       ├── promotions/PromotionsScreen.tsx # Màn 6: Ưu đãi & Tin tức Blog
│       ├── stores/StoresScreen.tsx   # Màn 7: Hệ thống cửa hàng (Bản đồ tương tác, Chỉ đường)
│       └── contact/ContactScreen.tsx # Màn 8: Liên hệ (Form gửi tin nhắn, Hotline, Mascot)
│
└── shared/                           # Tiện ích dùng chung
    ├── constants/                    # Theme, Navigation links, Brand info
    └── utils/                        # Formatter tiền tệ VND, thời gian
```

---

## 🎨 8 Màn hình giao diện đã hoàn thiện (Theo mẫu thiết kế)

1. **Trang chủ (`/`)**:
   - Hero Banner 3D Kiosk thương hiệu HONNE màu xanh rừng nhiệt đới & ly nước Signature.
   - Menu nổi bật: Cà phê muối, Trà sữa truyền thống, Matcha Latte, Socola đá xay.
   - Banner Combo Thật Chill (Cà phê + Bánh ngọt chỉ từ 49K).
   - 4 giá trị thương hiệu "Vì sao chọn HONNE ?".
   - Newsletter đăng ký nhận ưu đãi & footer phong cách xanh organic.

2. **Sản phẩm (`/san-pham`)**:
   - Phân loại bộ lọc linh hoạt: Tất cả, Cà phê, Trà sữa, Trà trái cây, Matcha, Khác.
   - Phân cụm nhóm thức uống chuẩn mực kèm nút xem tất cả.
   - Thanh tìm kiếm món theo từ khóa.

3. **Chi tiết sản phẩm (`/san-pham/:id`)**:
   - Breadcrumbs điều hướng nhanh.
   - Hình ảnh ly nước chất lượng cao và bộ dụng cụ chasen pha trà truyền thống.
   - Bộ chọn Size (M, L) và bộ đếm số lượng thông minh.
   - Các nút CTA "Thêm vào giỏ hàng" & "Mua ngay".
   - Tab chi tiết: Mô tả, Thành phần nguyên liệu tuyển chọn, Đánh giá của khách hàng.

4. **Giỏ hàng (`/gio-hang`)**:
   - Danh sách món đã chọn kèm ảnh thu nhỏ, size, giá thành và nút chỉnh số lượng / xóa món.
   - Áp dụng mã Voucher tự động (`HONNE20` giảm 20%, `FREESHIP` giảm 15.000đ).
   - Quy trình đặt hàng nhanh, chọn COD / Chuyển khoản QR và hiệu ứng pháo hoa Confetti chúc mừng.

5. **Về HONNE (`/ve-chung-toi`)**:
   - Câu chuyện triết lý thương hiệu "Hơn cả một ly cà phê, đó là trải nghiệm tuyệt vời".
   - Triết lý cà phê rang mộc và trà xanh thượng hạng.
   - Khẩu hiệu "More Coffee, More Happiness!".

6. **Ưu đãi & Tin tức (`/uu-dai`)**:
   - Danh sách combo ưu đãi đặc biệt: Combo Thật Chill 20%, Món mới Matcha Latte 49K...
   - Chuyên mục Blog & Tin tức chia sẻ phong cách sống lành mạnh.

7. **Hệ thống cửa hàng (`/cua-hang`)**:
   - Bản đồ tương tác trực quan với các pin định vị từng chi nhánh.
   - Thẻ thông tin chi tiết: HONNE Nguyễn Văn Cừ (Quận 1), HONNE Phú Nhuận, HONNE Thảo Điền...
   - Trạng thái hoạt động, giờ mở cửa và nút mở Google Maps chỉ đường tức thì.

8. **Liên hệ (`/lien-he`)**:
   - Thẻ thông tin Hotline, Email và Địa chỉ trụ sở.
   - Form gửi phản hồi & liên hệ trực tuyến cho khách hàng.

---

## 🚀 Hướng dẫn khởi chạy

Chạy lệnh sau tại thư mục dự án:

```bash
# Cài đặt thư viện (nếu cần)
npm install

# Khởi chạy máy chủ phát triển
npm run dev
```

Truy cập: `http://localhost:5173` trên trình duyệt để trải nghiệm website!
