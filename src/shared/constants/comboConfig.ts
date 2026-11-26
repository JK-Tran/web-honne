export interface PromoCombo {
  id: string;
  name: string;
  subtitle: string;
  badge: string;
  originalPrice: number;
  promoPrice: number;
  savings: number;
  image: string;
  items: string[];
  description: string;
  validHours: string;
}

export interface DrinkTopping {
  id: string;
  name: string;
  price: number;
  isFree?: boolean;
}

export interface DrinkOption {
  id: string;
  name: string;
  category: 'coffee' | 'tea' | 'matcha' | 'cacao';
  categoryLabel: string;
  image: string;
}

export interface ComboCupConfig {
  drinkName: string;
  drinkImage: string;
  size: 'M' | 'L';
  sugar: string;
  ice: string;
  selectedToppingIds: string[];
  freeToppingId?: string;
}

export const DRINK_CATALOG: DrinkOption[] = [
  // 1. CÀ PHÊ
  {
    id: 'PRD_CF_001',
    name: 'Cà phê Muối Cố Đô',
    category: 'coffee',
    categoryLabel: 'Cà phê rang mộc',
    image: '/images/assets/drink_coffee_muoi.png'
  },
  {
    id: 'PRD_CF_002',
    name: 'Cà phê Sữa Đá Sài Gòn',
    category: 'coffee',
    categoryLabel: 'Cà phê rang mộc',
    image: '/images/assets/drink_coffee_milk.png'
  },
  {
    id: 'PRD_CF_003',
    name: 'Bạc Xỉu 3 Tầng Sữa Dừa',
    category: 'coffee',
    categoryLabel: 'Cà phê rang mộc',
    image: '/images/assets/drink_coffee_milk.png'
  },
  {
    id: 'PRD_CF_004',
    name: 'Cà phê Sữa Tươi Thanh Trùng',
    category: 'coffee',
    categoryLabel: 'Cà phê rang mộc',
    image: '/images/assets/drink_coffee_milk.png'
  },
  {
    id: 'PRD_CF_005',
    name: 'Cà phê Đen Đá Rang Mộc',
    category: 'coffee',
    categoryLabel: 'Cà phê rang mộc',
    image: '/images/assets/drink_coffee_black.png'
  },

  // 2. TRÀ (HOA QUẢ TƯƠI - STRICTLY NO MILKTEA)
  {
    id: 'PRD_TR_001',
    name: 'Trà Đào Cam Sả Tươi',
    category: 'tea',
    categoryLabel: 'Trà hoa quả tươi',
    image: '/images/assets/drink_peach_tea_honne.png'
  },
  {
    id: 'PRD_TR_002',
    name: 'Trà Vải Hoa Lài Thanh Mát',
    category: 'tea',
    categoryLabel: 'Trà hoa quả tươi',
    image: '/images/assets/drink_lychee_tea.png'
  },
  {
    id: 'PRD_TR_004',
    name: 'Trà Ô Long Sen Vàng Hạt Sen',
    category: 'tea',
    categoryLabel: 'Trà hoa quả tươi',
    image: '/images/assets/drink_lychee_tea.png'
  },
  {
    id: 'PRD_TR_007',
    name: 'Trà Mãng Cầu Tươi Đắk Lắk',
    category: 'tea',
    categoryLabel: 'Trà hoa quả tươi',
    image: '/images/assets/drink_lychee_tea.png'
  },

  // 3. MATCHA
  {
    id: 'PRD_MC_001',
    name: 'Matcha Latte Shizuoka Thượng Hạng',
    category: 'matcha',
    categoryLabel: 'Matcha Nhật Bản',
    image: '/images/assets/drink_matcha.png'
  },
  {
    id: 'PRD_MC_002',
    name: 'Matcha Dừa Tươi Bến Tre',
    category: 'matcha',
    categoryLabel: 'Matcha Nhật Bản',
    image: '/images/assets/drink_matcha.png'
  },

  // 4. CACAO
  {
    id: 'PRD_CC_001',
    name: 'Cacao Sữa Tươi Đậm Đà',
    category: 'cacao',
    categoryLabel: 'Cacao nguyên chất',
    image: '/images/assets/drink_choco_frappe.png'
  },
  {
    id: 'PRD_CC_002',
    name: 'Cacao Muối Biển Macchiato',
    category: 'cacao',
    categoryLabel: 'Cacao nguyên chất',
    image: '/images/assets/drink_choco_frappe.png'
  }
];

export function findDrinkInfo(name: string): DrinkOption {
  const match = DRINK_CATALOG.find((d) => d.name.toLowerCase() === name.toLowerCase());
  return (
    match || {
      id: 'custom',
      name: name,
      category: 'coffee',
      categoryLabel: 'Thức uống HONNE',
      image: '/images/assets/drink_coffee_muoi.png'
    }
  );
}

export function getToppingsForDrink(drinkName: string, freeToppingId?: string): DrinkTopping[] {
  const lower = drinkName.toLowerCase();
  let baseList: { id: string; name: string; price: number }[] = [];

  if (lower.includes('cà phê') || lower.includes('bạc xỉu') || lower.includes('coffee') || lower.includes('americano')) {
    baseList = [
      { id: 'top-kem-muoi', name: 'Lớp Kem Muối béo mịn', price: 6000 },
      { id: 'top-shot', name: 'Thêm 1 Shot Espresso mộc', price: 5000 },
      { id: 'top-thach-cf', name: 'Thạch Cà phê giòn dai', price: 4000 }
    ];
  } else if (lower.includes('đào') || lower.includes('vải') || lower.includes('trà') || lower.includes('sen vàng') || lower.includes('mãng cầu')) {
    baseList = [
      { id: 'top-dao-them', name: 'Thêm Đào miếng giòn ngọt', price: 6000 },
      { id: 'top-vai-them', name: 'Thêm Vải tươi mọng nước', price: 6000 },
      { id: 'top-thach-cu-nang', name: 'Thạch Củ Năng giòn ngọt', price: 4000 },
      { id: 'top-nha-dam', name: 'Nha đam tươi giòn mát', price: 4000 }
    ];
  } else if (lower.includes('matcha') || lower.includes('cacao') || lower.includes('choco')) {
    baseList = [
      { id: 'top-kem-cheese', name: 'Kem Cheese Macchiato mặn', price: 6000 },
      { id: 'top-pudding', name: 'Pudding Trứng nướng béo ngậy', price: 5000 },
      { id: 'top-thach-cu-nang', name: 'Thạch Củ Năng giòn ngọt', price: 4000 }
    ];
  } else {
    baseList = [
      { id: 'top-kem-cheese', name: 'Kem Cheese Macchiato', price: 6000 },
      { id: 'top-thach-cu-nang', name: 'Thạch Củ Năng giòn', price: 4000 }
    ];
  }

  return baseList.map((top) => {
    if (top.id === freeToppingId) {
      return {
        ...top,
        price: 0,
        isFree: true
      };
    }
    return top;
  });
}

export const PROMO_COMBOS: PromoCombo[] = [
  {
    id: 'combo-morning',
    name: 'Combo Cà Phê Năng Lượng Đôi (02 Ly)',
    subtitle: '01 Cà phê Muối Cố Đô + 01 Cà phê Sữa Tươi Thanh Trùng',
    badge: 'BÁN CHẠY NHẤT',
    originalPrice: 50000,
    promoPrice: 39000,
    savings: 11000,
    image: '/images/assets/drink_coffee_muoi.png',
    items: ['01 Cà phê Muối Cố Đô (Size M)', '01 Cà phê Sữa Tươi Thanh Trùng (Size M)'],
    description:
      'Bắt đầu ngày mới đầy năng lượng cùng đồng nghiệp với 2 ly cà phê rang mộc thơm nức chuẩn vị cao nguyên Đắk Lắk.',
    validHours: 'Áp dụng: 06:30 - 12:00 hàng ngày'
  },
  {
    id: 'combo-afternoon',
    name: 'Combo Trà Trái Cây Thanh Nhiệt (02 Ly)',
    subtitle: '01 Trà Đào Cam Sả Tươi + 01 Trà Vải Hoa Lài Thanh Mát',
    badge: 'GIẢI NHIỆT MÙA NẮNG',
    originalPrice: 56000,
    promoPrice: 45000,
    savings: 11000,
    image: '/images/assets/drink_peach_tea_honne.png',
    items: [
      '01 Trà Đào Cam Sả Tươi (Size M + Tặng đào miếng 0đ)',
      '01 Trà Vải Hoa Lài Thanh Mát (Size M + Tặng vải tươi 0đ)'
    ],
    description:
      'Giải nhiệt sảng khoái với những lát đào giòn ngọt, quả vải mọng nước kết hợp cốt trà hoa lài ủ lạnh thơm thanh khiết.',
    validHours: 'Áp dụng: 11:30 - 18:00 hàng ngày'
  },
  {
    id: 'combo-pair',
    name: 'Combo Cacao & Matcha Cặp Đôi (02 Ly)',
    subtitle: '01 Cacao Muối Biển Macchiato + 01 Matcha Latte Shizuoka',
    badge: 'CẶP ĐÔI YÊU THÍCH',
    originalPrice: 60000,
    promoPrice: 49000,
    savings: 11000,
    image: '/images/assets/drink_matcha.png',
    items: [
      '01 Cacao Muối Biển Macchiato thơm ngậy (Size M)',
      '01 Matcha Latte Shizuoka Thượng Hạng (Size M)'
    ],
    description:
      'Bộ đôi hòa quyện hoàn hảo giữa vị béo mặn của macchiato cacao Đắk Lắk và hương thanh tao của matcha Nhật Bản.',
    validHours: 'Áp dụng cả ngày tại mọi chi nhánh'
  },
  {
    id: 'combo-party',
    name: 'Tiệc Trà & Cà Phê Nhóm Văn Phòng (5 Ly Tự Chọn)',
    subtitle: 'Tự do chọn 5 ly nước tùy thích - Tặng kèm 2 phần thạch củ năng',
    badge: 'SIÊU DEAL NHÓM',
    originalPrice: 140000,
    promoPrice: 119000,
    savings: 21000,
    image: '/images/assets/drink_peach_tea_honne.png',
    items: ['5 ly thức uống tự chọn có ảnh thực tế', 'Tặng kèm 2 phần Thạch Củ Năng giòn ngọt (0đ)'],
    description:
      'Lựa chọn lý tưởng cho các buổi họp team, tiệc sinh nhật văn phòng hoặc sum họp bạn bè cùng thưởng thức.',
    validHours: 'Áp dụng khi đặt từ 5 ly trở lên'
  }
];
