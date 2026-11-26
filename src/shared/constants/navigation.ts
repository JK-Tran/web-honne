export interface NavLinkItem {
  name: string;
  path: string;
  badge?: string;
}

export const NAV_LINKS: NavLinkItem[] = [
  { name: 'Trang chủ', path: '/' },
  { name: 'Thực đơn', path: '/san-pham' },
  { name: 'Ưu đãi & Xu', path: '/uu-dai', badge: 'Hot' },
  { name: 'Hệ thống cửa hàng', path: '/cua-hang' },
  { name: 'Góp ý & Liên hệ', path: '/lien-he' },
];
