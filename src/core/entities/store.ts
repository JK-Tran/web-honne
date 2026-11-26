export interface StoreLocation {
  id: string;
  name: string;
  address: string;
  district: string;
  city: string;
  phone: string;
  openingHours: string;
  status: 'active' | 'busy' | 'closed';
  statusText: string;
  image: string;
  avatar?: string;
  lat: number;
  lng: number;
  isFlagship?: boolean;
  rating?: number;
  reviewsCount?: number;
  quote?: string;
  googleMapsUrl?: string;
}
