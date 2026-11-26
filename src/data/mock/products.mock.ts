import { Product } from '../../core/entities/product';

export const MOCK_PRODUCTS: Product[] = [
  // ================= 1. CÀ PHÊ (10 MÓN: PRD_CF_001 -> PRD_CF_010) =================
  {
    id: 'PRD_CF_001',
    name: 'Cà phê Muối Cố Đô',
    category: 'coffee',
    price: 26000,
    originalPrice: 30000,
    image: '/images/assets/drink_coffee_muoi.png',
    subtitle: 'Kem muối béo ngậy chuẩn vị Huế',
    description: 'Cà phê Robusta Đắk Lắk đậm đà hòa quyện cùng lớp kem muối biển mịn màng, thơm béo ngậy.',
    rating: 4.9,
    reviewCount: 142,
    availableSizes: ['M', 'L'],
    isFeatured: true,
    isBestSeller: true,
    discountBadge: 'Bán chạy nhất',
    customizationRules: {
      allowedSugarLevels: [0, 30, 50, 70, 100],
      allowedIceLevels: ['không đá', '50% đá', '100% đá', 'đá riêng'],
      allowedToppings: [
        { id: 'top-kem-muoi', name: 'Lớp Kem Muối béo', price: 6000, recommended: true },
        { id: 'top-shot', name: 'Thêm 1 Shot Espresso', price: 5000 }
      ]
    },
    reviews: []
  },
  {
    id: 'PRD_CF_002',
    name: 'Cà phê Sữa Đá Sài Gòn',
    category: 'coffee',
    price: 22000,
    originalPrice: 25000,
    image: '/images/assets/drink_coffee_milk.png',
    subtitle: 'Đậm đà truyền thống nồng nàn',
    description: 'Cà phê phin truyền thống pha cùng sữa đặc hảo hạng, mang đậm nét văn hóa cà phê Sài Gòn.',
    rating: 4.9,
    reviewCount: 98,
    availableSizes: ['M', 'L'],
    isFeatured: true,
    isBestSeller: true,
    discountBadge: 'Yêu thích',
    customizationRules: {
      allowedSugarLevels: [0, 30, 50, 70, 100],
      allowedIceLevels: ['không đá', '50% đá', '100% đá', 'đá riêng'],
      allowedToppings: [
        { id: 'top-kem-muoi', name: 'Kem Muối béo ngậy', price: 6000 },
        { id: 'top-thach-cf', name: 'Thạch Cà phê giòn dai', price: 4000 }
      ]
    },
    reviews: []
  },
  {
    id: 'PRD_CF_003',
    name: 'Bạc Xỉu 3 Tầng Sữa Dừa',
    category: 'coffee',
    price: 25000,
    originalPrice: 28000,
    image: '/images/assets/drink_coffee_milk.png',
    subtitle: 'Hòa quyện cốt dừa thơm béo',
    description: 'Sự kết hợp tinh tế giữa sữa đặc ngọt ngào, cốt dừa Bến Tre thanh mát và cà phê phin nồng nàn.',
    rating: 4.9,
    reviewCount: 86,
    availableSizes: ['M', 'L'],
    isFeatured: true,
    isNew: true,
    discountBadge: 'Món mới',
    customizationRules: {
      allowedSugarLevels: [30, 50, 70, 100],
      allowedIceLevels: ['không đá', '50% đá', '100% đá', 'đá riêng'],
      allowedToppings: [
        { id: 'top-kem-cheese', name: 'Kem Cheese Macchiato', price: 6000 },
        { id: 'top-pudding', name: 'Pudding Trứng nướng', price: 5000 }
      ]
    },
    reviews: []
  },
  {
    id: 'PRD_CF_004',
    name: 'Cà phê Sữa Tươi Thanh Trùng',
    category: 'coffee',
    price: 24000,
    originalPrice: 28000,
    image: '/images/assets/drink_coffee_milk.png',
    subtitle: 'Sữa tươi Dalat Milk êm dịu',
    description: 'Cà phê rang mộc hòa quyện cùng sữa tươi thanh trùng nguyên kem, vị ngọt thanh tự nhiên.',
    rating: 4.8,
    reviewCount: 64,
    availableSizes: ['M', 'L'],
    isNew: true,
    discountBadge: 'Thơm béo',
    customizationRules: {
      allowedSugarLevels: [0, 30, 50, 70, 100],
      allowedIceLevels: ['không đá', '50% đá', '100% đá', 'đá riêng'],
      allowedToppings: []
    },
    reviews: []
  },
  {
    id: 'PRD_CF_005',
    name: 'Cà phê Đen Đá Rang Mộc',
    category: 'coffee',
    price: 18000,
    originalPrice: 20000,
    image: '/images/assets/drink_coffee_black.png',
    subtitle: '100% Robusta mộc không hương liệu',
    description: 'Cà phê đen nguyên bản, hậu vị đắng nhẹ sâu lắng và hương thơm mộc mạc đặc trưng.',
    rating: 4.8,
    reviewCount: 75,
    availableSizes: ['M', 'L'],
    customizationRules: {
      allowedSugarLevels: [0, 30, 50, 70, 100],
      allowedIceLevels: ['không đá', '50% đá', '100% đá', 'đá riêng'],
      allowedToppings: [
        { id: 'top-shot', name: 'Thêm 1 Shot Espresso', price: 5000 }
      ]
    },
    reviews: []
  },
  {
    id: 'PRD_CF_006',
    name: 'Cà phê Kem Trứng BMT',
    category: 'coffee',
    price: 28000,
    originalPrice: 32000,
    image: '/images/assets/drink_coffee_bmt.png',
    subtitle: 'Lớp kem trứng nướng sánh mịn',
    description: 'Vị đắng nồng của cà phê cân bằng hoàn hảo với lớp kem trứng nướng béo bùi thơm lừng.',
    rating: 4.8,
    reviewCount: 52,
    availableSizes: ['M', 'L'],
    isFeatured: true,
    discountBadge: 'Đặc sản',
    customizationRules: {
      allowedSugarLevels: [30, 50, 70, 100],
      allowedIceLevels: ['không đá', '50% đá', '100% đá', 'đá riêng'],
      allowedToppings: []
    },
    reviews: []
  },
  {
    id: 'PRD_CF_007',
    name: 'Americano Cam Vàng Tươi',
    category: 'coffee',
    price: 28000,
    originalPrice: 32000,
    image: '/images/assets/drink_coffee_black.png',
    subtitle: 'Sảng khoái, giàu vitamin C',
    description: 'Espresso tươi kết hợp cùng nước cam vàng mọng nước, mang đến cảm giác thanh nhẹ sảng khoái.',
    rating: 4.7,
    reviewCount: 43,
    availableSizes: ['M', 'L'],
    isNew: true,
    discountBadge: 'Giải nhiệt',
    customizationRules: {
      allowedSugarLevels: [30, 50, 70, 100],
      allowedIceLevels: ['không đá', '50% đá', '100% đá', 'đá riêng'],
      allowedToppings: []
    },
    reviews: []
  },
  {
    id: 'PRD_CF_008',
    name: 'Cà phê Dừa Tuyết Xay',
    category: 'coffee',
    price: 29000,
    originalPrice: 34000,
    image: '/images/assets/drink_coffee_milk.png',
    subtitle: 'Cốt dừa đá tuyết mát lạnh',
    description: 'Đá xay nhuyễn với cốt dừa béo bùi, rưới thêm shot cà phê phin sánh đậm.',
    rating: 4.8,
    reviewCount: 39,
    availableSizes: ['M', 'L'],
    customizationRules: {
      allowedSugarLevels: [30, 50, 70, 100],
      allowedIceLevels: ['đá xay chuẩn vị'],
      allowedToppings: []
    },
    reviews: []
  },
  {
    id: 'PRD_CF_009',
    name: 'Latte Hạnh Nhân Nướng',
    category: 'coffee',
    price: 30000,
    originalPrice: 35000,
    image: '/images/assets/drink_coffee_milk.png',
    subtitle: 'Sữa hạt dinh dưỡng tốt sức khỏe',
    description: 'Cà phê Espresso nhẹ nhàng kết hợp sữa hạnh nhân rang bùi ngậy không ngấy.',
    rating: 4.7,
    reviewCount: 31,
    availableSizes: ['M', 'L'],
    customizationRules: {
      allowedSugarLevels: [0, 30, 50, 70, 100],
      allowedIceLevels: ['không đá', '50% đá', '100% đá', 'đá riêng'],
      allowedToppings: []
    },
    reviews: []
  },
  {
    id: 'PRD_CF_010',
    name: 'Cold Brew Ủ Lạnh Mộc',
    category: 'coffee',
    price: 29000,
    originalPrice: 34000,
    image: '/images/assets/drink_coffee_black.png',
    subtitle: 'Ủ lạnh 18h êm dịu thanh tao',
    description: 'Cà phê Arabica Cầu Đất ủ lạnh 18 tiếng, hương hoa quả ngọt ngào, ít chua và êm dịu.',
    rating: 4.8,
    reviewCount: 47,
    availableSizes: ['M', 'L'],
    discountBadge: 'Ủ lạnh',
    customizationRules: {
      allowedSugarLevels: [0, 30, 50, 70, 100],
      allowedIceLevels: ['không đá', '50% đá', '100% đá', 'đá riêng'],
      allowedToppings: []
    },
    reviews: []
  },

  // ================= 2. TRÀ (10 MÓN: PRD_TR_001 -> PRD_TR_010) =================
  {
    id: 'PRD_TR_001',
    name: 'Trà Đào Cam Sả Tươi',
    category: 'tea',
    price: 28000,
    originalPrice: 32000,
    image: '/images/assets/drink_peach_tea_honne.png',
    subtitle: 'Đào miếng giòn ngọt, cam sả thơm lừng',
    description: 'Cốt trà đen đậm đà kết hợp cùng những lát đào giòn ngọt và hương cam sả tươi mát.',
    rating: 4.9,
    reviewCount: 168,
    availableSizes: ['M', 'L'],
    isFeatured: true,
    isBestSeller: true,
    discountBadge: 'Signature',
    customizationRules: {
      allowedSugarLevels: [30, 50, 70, 100],
      allowedIceLevels: ['không đá', '50% đá', '100% đá', 'đá riêng'],
      allowedToppings: [
        { id: 'top-dao-them', name: 'Thêm Đào miếng giòn', price: 6000, recommended: true },
        { id: 'top-thach-cu-nang', name: 'Thạch Củ Năng giòn ngọt', price: 4000 }
      ]
    },
    reviews: []
  },
  {
    id: 'PRD_TR_002',
    name: 'Trà Vải Hoa Lài Thanh Mát',
    category: 'tea',
    price: 28000,
    originalPrice: 32000,
    image: '/images/assets/drink_lychee_tea.png',
    subtitle: 'Vải tươi ngọt mọng, trà lài ngát hương',
    description: 'Hương hoa nhài tự nhiên hòa quyện với những quả vải giòn ngọt mọng nước giải nhiệt sảng khoái.',
    rating: 4.9,
    reviewCount: 115,
    availableSizes: ['M', 'L'],
    isFeatured: true,
    isBestSeller: true,
    discountBadge: 'Bán chạy',
    customizationRules: {
      allowedSugarLevels: [30, 50, 70, 100],
      allowedIceLevels: ['không đá', '50% đá', '100% đá', 'đá riêng'],
      allowedToppings: [
        { id: 'top-vai-them', name: 'Thêm Vải ngâm mọng nước', price: 6000, recommended: true },
        { id: 'top-thach-cu-nang', name: 'Thạch Củ Năng giòn ngọt', price: 4000 }
      ]
    },
    reviews: []
  },
  {
    id: 'PRD_TR_003',
    name: 'Trà Dâu Tằm Rừng Tây Bắc',
    category: 'tea',
    price: 28000,
    originalPrice: 32000,
    image: '/images/assets/drink_peach_tea_honne.png',
    subtitle: 'Vị chua ngọt thanh tao quyến rũ',
    description: 'Cốt trà mộc kết hợp mứt dâu tằm tươi dầm chua ngọt hài hòa, thanh lọc cơ thể.',
    rating: 4.8,
    reviewCount: 82,
    availableSizes: ['M', 'L'],
    isNew: true,
    discountBadge: 'Mới ra mắt',
    customizationRules: {
      allowedSugarLevels: [30, 50, 70, 100],
      allowedIceLevels: ['không đá', '50% đá', '100% đá', 'đá riêng'],
      allowedToppings: []
    },
    reviews: []
  },
  {
    id: 'PRD_TR_004',
    name: 'Trà Ô Long Sen Vàng Hạt Sen',
    category: 'tea',
    price: 30000,
    originalPrice: 35000,
    image: '/images/assets/drink_lychee_tea.png',
    subtitle: 'Hạt sen bùi dẻo, trà ô long thơm dịu',
    description: 'Hạt sen Huế ninh mềm dẻo bùi kết hợp cốt trà ô long thanh khiết và thạch củ năng.',
    rating: 4.8,
    reviewCount: 76,
    availableSizes: ['M', 'L'],
    isFeatured: true,
    discountBadge: 'Thanh mát',
    customizationRules: {
      allowedSugarLevels: [30, 50, 70, 100],
      allowedIceLevels: ['không đá', '50% đá', '100% đá', 'đá riêng'],
      allowedToppings: [
        { id: 'top-thach-cu-nang', name: 'Thạch Củ Năng giòn ngọt', price: 4000 }
      ]
    },
    reviews: []
  },
  {
    id: 'PRD_TR_005',
    name: 'Trà Chanh Mật Ong Rừng',
    category: 'tea',
    price: 22000,
    originalPrice: 25000,
    image: '/images/assets/drink_peach_tea_honne.png',
    subtitle: 'Mật ong rừng Tây Nguyên ngọt dịu',
    description: 'Chanh tươi vắt nguyên chất kết hợp mật ong hoa rừng tự nhiên và cốt trà xanh thanh sạch.',
    rating: 4.8,
    reviewCount: 65,
    availableSizes: ['M', 'L'],
    customizationRules: {
      allowedSugarLevels: [30, 50, 70, 100],
      allowedIceLevels: ['không đá', '50% đá', '100% đá', 'đá riêng'],
      allowedToppings: []
    },
    reviews: []
  },
  {
    id: 'PRD_TR_006',
    name: 'Trà Ổi Hồng Bạc Hà',
    category: 'tea',
    price: 28000,
    originalPrice: 32000,
    image: '/images/assets/drink_peach_tea_honne.png',
    subtitle: 'Hương ổi hồng ngọt ngào, lá bạc hà the mát',
    description: 'Nước ép ổi hồng thanh ngọt hòa quyện cùng lá bạc hà vò tươi, thơm mát tức thì.',
    rating: 4.8,
    reviewCount: 54,
    availableSizes: ['M', 'L'],
    isNew: true,
    discountBadge: 'Hot trend',
    customizationRules: {
      allowedSugarLevels: [30, 50, 70, 100],
      allowedIceLevels: ['không đá', '50% đá', '100% đá', 'đá riêng'],
      allowedToppings: []
    },
    reviews: []
  },
  {
    id: 'PRD_TR_007',
    name: 'Trà Mãng Cầu Tươi Đắk Lắk',
    category: 'tea',
    price: 29000,
    originalPrice: 33000,
    image: '/images/assets/drink_lychee_tea.png',
    subtitle: 'Mãng cầu xiêm chua ngọt giòn giòn',
    description: 'Thịt mãng cầu xiêm tươi dầm kết hợp cốt trà hoa lài ủ lạnh thơm nức mũi.',
    rating: 4.9,
    reviewCount: 93,
    availableSizes: ['M', 'L'],
    isFeatured: true,
    isNew: true,
    discountBadge: 'Cực cuốn',
    customizationRules: {
      allowedSugarLevels: [30, 50, 70, 100],
      allowedIceLevels: ['không đá', '50% đá', '100% đá', 'đá riêng'],
      allowedToppings: []
    },
    reviews: []
  },
  {
    id: 'PRD_TR_008',
    name: 'Trà Bưởi Hồng Nam Mỹ',
    category: 'tea',
    price: 29000,
    originalPrice: 34000,
    image: '/images/assets/drink_peach_tea_honne.png',
    subtitle: 'Múi bưởi hồng tươi mọng ngọt thanh',
    description: 'Trà hoa cúc kết hợp cùng tép bưởi hồng tươi giòn, giàu chất chống oxy hóa.',
    rating: 4.7,
    reviewCount: 38,
    availableSizes: ['M', 'L'],
    customizationRules: {
      allowedSugarLevels: [30, 50, 70, 100],
      allowedIceLevels: ['không đá', '50% đá', '100% đá', 'đá riêng'],
      allowedToppings: []
    },
    reviews: []
  },
  {
    id: 'PRD_TR_009',
    name: 'Trà Táo Quế Thảo Mộc',
    category: 'tea',
    price: 27000,
    originalPrice: 30000,
    image: '/images/assets/drink_peach_tea_honne.png',
    subtitle: 'Hương táo đỏ và vỏ quế ấm nồng',
    description: 'Cốt trà đen ủ cùng táo tươi và thanh quế tự nhiên, uống đá thanh ngọt, uống nóng ấm lòng.',
    rating: 4.7,
    reviewCount: 29,
    availableSizes: ['M', 'L'],
    customizationRules: {
      allowedSugarLevels: [30, 50, 70, 100],
      allowedIceLevels: ['nóng', 'không đá', '50% đá', '100% đá', 'đá riêng'],
      allowedToppings: []
    },
    reviews: []
  },
  {
    id: 'PRD_TR_010',
    name: 'Trà Xanh Hoa Cúc Mật Ong',
    category: 'tea',
    price: 24000,
    originalPrice: 28000,
    image: '/images/assets/drink_lychee_tea.png',
    subtitle: 'Thanh lọc cơ thể, dễ chịu thư thái',
    description: 'Bông cúc sấy mộc hòa cùng mật ong rừng và trà xanh hữu cơ dịu nhẹ.',
    rating: 4.8,
    reviewCount: 42,
    availableSizes: ['M', 'L'],
    discountBadge: 'Dưỡng sinh',
    customizationRules: {
      allowedSugarLevels: [30, 50, 70, 100],
      allowedIceLevels: ['nóng', 'không đá', '50% đá', '100% đá', 'đá riêng'],
      allowedToppings: []
    },
    reviews: []
  },

  // ================= 3. MATCHA (5 MÓN: PRD_MC_001 -> PRD_MC_005) =================
  {
    id: 'PRD_MC_001',
    name: 'Matcha Latte Shizuoka Thượng Hạng',
    category: 'matcha',
    price: 32000,
    originalPrice: 36000,
    image: '/images/assets/drink_matcha.png',
    subtitle: 'Matcha Nhật Bản nguyên chất 100%',
    description: 'Bột matcha thượng hạng nhập khẩu Shizuoka đánh bông cùng sữa tươi thanh trùng thơm ngậy.',
    rating: 4.9,
    reviewCount: 126,
    availableSizes: ['M', 'L'],
    isFeatured: true,
    isBestSeller: true,
    discountBadge: 'Bán chạy',
    customizationRules: {
      allowedSugarLevels: [0, 30, 50, 70, 100],
      allowedIceLevels: ['không đá', '50% đá', '100% đá', 'đá riêng'],
      allowedToppings: [
        { id: 'top-kem-cheese', name: 'Kem Cheese Macchiato', price: 6000, recommended: true },
        { id: 'top-pudding', name: 'Pudding Trứng nướng béo', price: 5000 }
      ]
    },
    reviews: []
  },
  {
    id: 'PRD_MC_002',
    name: 'Matcha Dừa Tươi Bến Tre',
    category: 'matcha',
    price: 32000,
    originalPrice: 36000,
    image: '/images/assets/drink_matcha.png',
    subtitle: 'Nước dừa tươi ngọt lành quyện matcha',
    description: 'Sự pha trộn độc đáo giữa nước dừa xiêm ngọt thanh và matcha Nhật đắng dịu.',
    rating: 4.9,
    reviewCount: 74,
    availableSizes: ['M', 'L'],
    isFeatured: true,
    isNew: true,
    discountBadge: 'Món mới',
    customizationRules: {
      allowedSugarLevels: [30, 50, 70, 100],
      allowedIceLevels: ['không đá', '50% đá', '100% đá', 'đá riêng'],
      allowedToppings: []
    },
    reviews: []
  },
  {
    id: 'PRD_MC_003',
    name: 'Matcha Espresso 2 Tầng',
    category: 'matcha',
    price: 34000,
    originalPrice: 38000,
    image: '/images/assets/drink_matcha.png',
    subtitle: 'Matcha đậm đà kết hợp cà phê espresso',
    description: 'Bùng nổ năng lượng với 2 tầng sắc màu: xanh matcha êm dịu và nâu cà phê nồng nàn.',
    rating: 4.8,
    reviewCount: 63,
    availableSizes: ['M', 'L'],
    isNew: true,
    discountBadge: 'Đặc biệt',
    customizationRules: {
      allowedSugarLevels: [0, 30, 50, 70, 100],
      allowedIceLevels: ['không đá', '50% đá', '100% đá', 'đá riêng'],
      allowedToppings: []
    },
    reviews: []
  },
  {
    id: 'PRD_MC_004',
    name: 'Matcha Đá Xay Tuyết Kem Béo',
    category: 'matcha',
    price: 35000,
    originalPrice: 40000,
    image: '/images/assets/drink_matcha.png',
    subtitle: 'Đá xay nhuyễn mịn với kem macchiato',
    description: 'Matcha xay cùng sữa tươi và đá tuyết, phủ trên cùng lớp kem macchiato béo ngọt.',
    rating: 4.8,
    reviewCount: 58,
    availableSizes: ['M', 'L'],
    discountBadge: 'Mát lạnh',
    customizationRules: {
      allowedSugarLevels: [30, 50, 70, 100],
      allowedIceLevels: ['đá xay chuẩn vị'],
      allowedToppings: []
    },
    reviews: []
  },
  {
    id: 'PRD_MC_005',
    name: 'Matcha Đậu Đỏ Dẻo Bùi',
    category: 'matcha',
    price: 34000,
    originalPrice: 38000,
    image: '/images/assets/drink_matcha.png',
    subtitle: 'Hạt đậu đỏ Azuki Nhật Bản dẻo ngọt',
    description: 'Matcha latte truyền thống kèm topping đậu đỏ dẻo ngọt thanh, bùi bùi bắt miệng.',
    rating: 4.8,
    reviewCount: 45,
    availableSizes: ['M', 'L'],
    customizationRules: {
      allowedSugarLevels: [30, 50, 70, 100],
      allowedIceLevels: ['không đá', '50% đá', '100% đá', 'đá riêng'],
      allowedToppings: []
    },
    reviews: []
  },

  // ================= 4. CACAO (5 MÓN: PRD_CC_001 -> PRD_CC_005) =================
  {
    id: 'PRD_CC_001',
    name: 'Cacao Sữa Tươi Đậm Đà',
    category: 'cacao',
    price: 25000,
    originalPrice: 28000,
    image: '/images/assets/drink_choco_frappe.png',
    subtitle: 'Cacao Đắk Lắk nguyên chất thơm nồng',
    description: 'Cacao nguyên chất nấu sánh mịn hòa cùng sữa tươi thanh trùng, vị đắng dịu ngọt ngào.',
    rating: 4.9,
    reviewCount: 88,
    availableSizes: ['M', 'L'],
    isFeatured: true,
    isBestSeller: true,
    discountBadge: 'Yêu thích',
    customizationRules: {
      allowedSugarLevels: [0, 30, 50, 70, 100],
      allowedIceLevels: ['nóng', 'không đá', '50% đá', '100% đá', 'đá riêng'],
      allowedToppings: [
        { id: 'top-kem-cheese', name: 'Kem Cheese Macchiato', price: 6000 },
        { id: 'top-pudding', name: 'Pudding Trứng béo', price: 5000 }
      ]
    },
    reviews: []
  },
  {
    id: 'PRD_CC_002',
    name: 'Cacao Muối Biển Macchiato',
    category: 'cacao',
    price: 28000,
    originalPrice: 32000,
    image: '/images/assets/drink_choco_frappe.png',
    subtitle: 'Lớp kem mặn macchiato béo đê mê',
    description: 'Cacao nóng hoặc đá thơm lừng phủ lớp kem béo mặn macchiato cân bằng vị giác.',
    rating: 4.9,
    reviewCount: 94,
    availableSizes: ['M', 'L'],
    isFeatured: true,
    isBestSeller: true,
    isNew: true,
    discountBadge: 'Best seller',
    customizationRules: {
      allowedSugarLevels: [30, 50, 70, 100],
      allowedIceLevels: ['không đá', '50% đá', '100% đá', 'đá riêng'],
      allowedToppings: []
    },
    reviews: []
  },
  {
    id: 'PRD_CC_003',
    name: 'Cacao Bạc Hà Mát Lạnh',
    category: 'cacao',
    price: 28000,
    originalPrice: 32000,
    image: '/images/assets/drink_choco_frappe.png',
    subtitle: 'Bạc hà the mát hòa quyện socola',
    description: 'Hương bạc hà mát lạnh bừng tỉnh sảng khoái quyện cùng cacao đậm đà.',
    rating: 4.8,
    reviewCount: 56,
    availableSizes: ['M', 'L'],
    discountBadge: 'Sảng khoái',
    customizationRules: {
      allowedSugarLevels: [30, 50, 70, 100],
      allowedIceLevels: ['không đá', '50% đá', '100% đá', 'đá riêng'],
      allowedToppings: []
    },
    reviews: []
  },
  {
    id: 'PRD_CC_004',
    name: 'Choco Frappe Đá Xay Vụn Oreo',
    category: 'cacao',
    price: 35000,
    originalPrice: 40000,
    image: '/images/assets/drink_choco_frappe.png',
    subtitle: 'Socola đá xay phủ vụn bánh oreo giòn',
    description: 'Đá xay socola cacao sánh đậm, phủ lớp kem tươi và vụn bánh oreo giòn rụm.',
    rating: 4.8,
    reviewCount: 71,
    availableSizes: ['M', 'L'],
    discountBadge: 'Hot deal',
    customizationRules: {
      allowedSugarLevels: [30, 50, 70, 100],
      allowedIceLevels: ['đá xay chuẩn vị'],
      allowedToppings: []
    },
    reviews: []
  },
  {
    id: 'PRD_CC_005',
    name: 'Cacao Dừa Kem Nướng',
    category: 'cacao',
    price: 30000,
    originalPrice: 35000,
    image: '/images/assets/drink_choco_frappe.png',
    subtitle: 'Cốt dừa béo thơm và kem trứng nướng',
    description: 'Cacao sánh mịn kết hợp cốt dừa non và lớp kem trứng nướng cháy xém hấp dẫn.',
    rating: 4.8,
    reviewCount: 49,
    availableSizes: ['M', 'L'],
    isNew: true,
    discountBadge: 'Món mới',
    customizationRules: {
      allowedSugarLevels: [30, 50, 70, 100],
      allowedIceLevels: ['không đá', '50% đá', '100% đá', 'đá riêng'],
      allowedToppings: []
    },
    reviews: []
  }
];
