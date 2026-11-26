import { ComboDeal, BlogPost } from '../../core/entities/promo';

export const MOCK_COMBOS: ComboDeal[] = [
  {
    id: 'combo-chill-1',
    title: 'COMBO NĂNG LƯỢNG',
    subtitle: 'Cà phê muối + Cà phê sữa tươi thanh trùng',
    price: 39000,
    originalPrice: 50000,
    discountPercent: 22,
    image: '/images/assets/drink_coffee_muoi.png',
    validUntil: '01 - 31/12/2026',
    description: 'Thưởng thức 02 ly cà phê rang mộc chuẩn vị cao nguyên Đắk Lắk. Lựa chọn tuyệt hảo cho buổi sáng tràn đầy năng lượng.'
  },
  {
    id: 'combo-matcha-latte',
    title: 'COMBO THANH NHIỆT',
    subtitle: 'Trà đào cam sả tươi + Trà vải hoa lài',
    price: 45000,
    originalPrice: 56000,
    discountPercent: 20,
    image: '/images/assets/drink_peach_tea_honne.png',
    validUntil: '01 - 31/12/2026',
    description: 'Ưu đãi giải nhiệt mùa nắng với những lát đào giòn ngọt và vải tươi mọng nước trên nền trà hoa lài thanh khiết.'
  },
  {
    id: 'combo-ban-be',
    title: 'COMBO CẶP ĐÔI',
    subtitle: 'Cacao muối biển macchiato + Matcha latte Shizuoka',
    price: 49000,
    originalPrice: 60000,
    discountPercent: 18,
    image: '/images/assets/drink_matcha.png',
    validUntil: '01 - 31/12/2026',
    description: 'Bộ đôi hòa quyện hoàn hảo giữa vị béo mặn của macchiato cacao Đắk Lắk và hương thanh tao của matcha Nhật Bản.'
  }
];

export const MOCK_BLOGS: BlogPost[] = [
  {
    id: 'blog-1',
    title: 'Matcha - Thức uống xanh cho cuộc sống lành mạnh',
    summary: 'Khám phá bí mật dinh dưỡng, chất chống oxy hóa EGCG và nguồn năng lượng bình an mà bột matcha thượng hạng mang lại.',
    image: '/images/assets/blog1.png',
    category: 'Sức khỏe & Phong cách sống',
    date: '15/11/2026',
    readTime: '4 phút đọc'
  },
  {
    id: 'blog-2',
    title: '5 lý do bạn nên thưởng thức cà phê chất lượng mỗi ngày',
    summary: 'Không chỉ giúp tỉnh táo, cà phê rang mộc nguyên chất còn hỗ trợ trao đổi chất và cải thiện sự tập trung sáng tạo.',
    image: '/images/assets/blog2.png',
    category: 'Văn hóa Cà phê',
    date: '12/11/2026',
    readTime: '3 phút đọc'
  },
  {
    id: 'blog-3',
    title: 'Không gian xanh mát thư giãn tại HONNE Coffee & Tea',
    summary: 'Một góc trú ẩn bình yên giữa lòng phố thị náo nhiệt, nơi bạn tìm thấy sự an tĩnh bên tách trà thơm ngát.',
    image: '/images/assets/blog3.png',
    category: 'Không gian & Trải nghiệm',
    date: '08/11/2026',
    readTime: '5 phút đọc'
  }
];
