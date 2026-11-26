export interface ComboDeal {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  image: string;
  validUntil: string;
  description: string;
}

export interface BlogPost {
  id: string;
  title: string;
  summary: string;
  image: string;
  category: string;
  date: string;
  readTime: string;
}
