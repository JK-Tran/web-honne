import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { API_BASE_URL, authFetch } from '../../shared/utils/api-client';

export interface Branch {
  id: string;
  name: string;
  address: string;
  ward: string;
  district: string;
  city: string;
  phone: string;
  openingHours: string;
  latitude: number;
  longitude: number;
}

export interface UserAddress {
  id: string;
  userId?: string;
  label: string; // 'Nhà riêng', 'Văn phòng', 'Khác'
  receiverName: string;
  receiverPhone: string;
  addressDetail: string;
  ward?: string;
  district?: string;
  distanceKm?: number;
  isDefault?: boolean;
}

export type OrderMode = 'delivery' | 'pickup';

export function computeDistanceToBranch(branch: Branch, addressStr: string): number {
  if (!addressStr) return 1.0;
  const lower = addressStr.toLowerCase();

  if (lower.includes('183 cộng hòa') || lower.includes('183/')) {
    if (branch.id === 'branch-183-cong-hoa') return 0.2;
    if (branch.id === 'branch-2-quach-van-tuan') return 0.6;
    if (branch.id === 'branch-121-cong-hoa') return 0.7;
    return 1.4;
  }
  if (lower.includes('quách văn tuấn')) {
    if (branch.id === 'branch-2-quach-van-tuan') return 0.3;
    if (branch.id === 'branch-183-cong-hoa') return 0.6;
    if (branch.id === 'branch-121-cong-hoa') return 0.8;
    return 1.5;
  }
  if (lower.includes('121 cộng hòa') || lower.includes('121/')) {
    if (branch.id === 'branch-121-cong-hoa') return 0.2;
    if (branch.id === 'branch-183-cong-hoa') return 0.7;
    if (branch.id === 'branch-2-quach-van-tuan') return 0.8;
    return 1.1;
  }
  if (lower.includes('22a cộng hòa') || lower.includes('22 cộng hòa') || lower.includes('lăng cha cả')) {
    if (branch.id === 'branch-22a-cong-hoa') return 0.2;
    if (branch.id === 'branch-121-cong-hoa') return 1.1;
    if (branch.id === 'branch-2-quach-van-tuan') return 1.5;
    return 1.6;
  }
  if (lower.includes('hoàng hoa thám')) {
    if (branch.id === 'branch-183-cong-hoa') return 0.9;
    if (branch.id === 'branch-2-quach-van-tuan') return 1.1;
    if (branch.id === 'branch-121-cong-hoa') return 1.3;
    return 1.8;
  }
  if (lower.includes('út tịch')) {
    if (branch.id === 'branch-22a-cong-hoa') return 0.7;
    if (branch.id === 'branch-121-cong-hoa') return 1.0;
    return 1.5;
  }
  if (lower.includes('trường chinh') || lower.includes('bảy hiền')) {
    if (branch.id === 'branch-183-cong-hoa') return 1.4;
    return 1.8;
  }
  if (lower.includes('bạch đằng') || lower.includes('sân bay') || lower.includes('tân sơn nhất')) {
    if (branch.id === 'branch-22a-cong-hoa') return 1.7;
    return 2.4;
  }
  if (
    lower.includes('quận 1') ||
    lower.includes('quận 3') ||
    lower.includes('bình thạnh') ||
    lower.includes('thủ đức') ||
    lower.includes('quận 7') ||
    lower.includes('gò vấp') ||
    lower.includes('quận 12') ||
    lower.includes('hóc môn')
  ) {
    return 5.5; // Vượt quá 2km
  }

  let hash = 0;
  for (let i = 0; i < addressStr.length; i++) {
    hash = (hash << 5) - hash + addressStr.charCodeAt(i);
    hash |= 0;
  }
  const branchOffset = (branch.name.length % 5) * 0.2;
  const normalized = Math.abs(hash % 16) / 10 + 0.4 + branchOffset;
  return Number(normalized.toFixed(1));
}

interface LocationContextType {
  orderMode: OrderMode;
  setOrderMode: (mode: OrderMode) => void;
  branches: Branch[];
  selectedBranch: Branch;
  setSelectedBranch: (branch: Branch) => void;
  savedAddresses: UserAddress[];
  currentAddress: UserAddress;
  setCurrentAddress: (addr: UserAddress) => void;
  addNewAddress: (addr: Omit<UserAddress, 'id'>) => Promise<UserAddress>;
  deleteAddress: (id: string) => Promise<void>;
  isLocationModalOpen: boolean;
  setIsLocationModalOpen: (open: boolean) => void;
  shippingFee: number;
  distanceKm: number;
  isWithinDeliveryRange: boolean;
  getDistanceToBranch: (branch: Branch, addressStr?: string) => number;
}

const DEFAULT_BRANCHES: Branch[] = [
  {
    id: 'branch-183-cong-hoa',
    name: 'HONNE 183 Cộng Hòa',
    address: '183 Cộng Hòa',
    ward: 'Phường 12',
    district: 'Tân Bình',
    city: 'TP. Hồ Chí Minh',
    phone: '0909 183 183',
    openingHours: '06:30 - 22:30',
    latitude: 10.8015,
    longitude: 106.6521
  },
  {
    id: 'branch-2-quach-van-tuan',
    name: 'HONNE Số 2 Quách Văn Tuấn',
    address: 'Số 2 Quách Văn Tuấn',
    ward: 'Phường 12',
    district: 'Tân Bình',
    city: 'TP. Hồ Chí Minh',
    phone: '0909 002 002',
    openingHours: '06:30 - 22:30',
    latitude: 10.8032,
    longitude: 106.654
  },
  {
    id: 'branch-121-cong-hoa',
    name: 'HONNE 121 Cộng Hòa',
    address: '121 Cộng Hòa',
    ward: 'Phường 12',
    district: 'Tân Bình',
    city: 'TP. Hồ Chí Minh',
    phone: '0909 121 121',
    openingHours: '06:30 - 22:30',
    latitude: 10.7998,
    longitude: 106.6565
  },
  {
    id: 'branch-22a-cong-hoa',
    name: 'HONNE 22A Cộng Hòa',
    address: '22A Cộng Hòa',
    ward: 'Phường 4',
    district: 'Tân Bình',
    city: 'TP. Hồ Chí Minh',
    phone: '0909 022 022',
    openingHours: '06:30 - 22:30',
    latitude: 10.7952,
    longitude: 106.661
  }
];

const DEFAULT_ADDRESS: UserAddress = {
  id: 'addr-default-1',
  label: 'Nhà riêng',
  receiverName: 'Nguyễn Thu Hà',
  receiverPhone: '0901234567',
  addressDetail: '183/12 Cộng Hòa, Phường 12, Tân Bình',
  ward: 'Phường 12',
  district: 'Tân Bình',
  distanceKm: 0.8,
  isDefault: true
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, accessToken } = useAuth();
  const [orderMode, setOrderMode] = useState<OrderMode>('delivery');
  const [branches, setBranches] = useState<Branch[]>(DEFAULT_BRANCHES);
  const [selectedBranch, setSelectedBranch] = useState<Branch>(DEFAULT_BRANCHES[0]);
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>(() => {
    try {
      const stored = localStorage.getItem('honne_saved_addresses');
      return stored ? JSON.parse(stored) : [DEFAULT_ADDRESS];
    } catch {
      return [DEFAULT_ADDRESS];
    }
  });
  const [currentAddress, setCurrentAddress] = useState<UserAddress>(() => {
    try {
      const stored = localStorage.getItem('honne_current_address');
      return stored ? JSON.parse(stored) : DEFAULT_ADDRESS;
    } catch {
      return DEFAULT_ADDRESS;
    }
  });
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Load branches from Backend API on mount
  useEffect(() => {
    fetch('https://api-honne.hanhan02102012.workers.dev/api/branches')
      .then((res) => res.json())
      .then((json: any) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const mapped = json.data.map((b: any) => ({
            id: b.id,
            name: b.name,
            address: b.address,
            ward: b.ward,
            district: b.district,
            city: b.city,
            phone: b.phone,
            openingHours: b.opening_hours || '06:30 - 22:30',
            latitude: b.latitude || 10.8,
            longitude: b.longitude || 106.65
          }));
          setBranches(mapped);
          setSelectedBranch(mapped[0]);
        }
      })
      .catch((err) => console.warn('Could not load remote branches:', err));
  }, []);

  // Sync addresses with backend only when user is genuinely logged in with token
  useEffect(() => {
    if (user?.id) {
      authFetch(`${API_BASE_URL}/addresses/${user.id}`)
        .then((res) => res.json())
        .then((json: any) => {
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            const mapped = json.data.map((a: any) => ({
              id: a.id,
              userId: a.user_id,
              label: a.label || 'Nhà riêng',
              receiverName: a.receiver_name,
              receiverPhone: a.receiver_phone,
              addressDetail: a.address_detail,
              ward: a.ward,
              district: a.district || 'Tân Bình',
              distanceKm: 1.2,
              isDefault: !!a.is_default
            }));
            setSavedAddresses(mapped);
            const def = mapped.find((a: UserAddress) => a.isDefault) || mapped[0];
            if (def) setCurrentAddress(def);
          }
        })
        .catch((err) => console.warn('Could not load user addresses from D1:', err));
    }
  }, [user?.id, accessToken]);

  // Persist current address and saved addresses
  useEffect(() => {
    localStorage.setItem('honne_saved_addresses', JSON.stringify(savedAddresses));
  }, [savedAddresses]);

  useEffect(() => {
    localStorage.setItem('honne_current_address', JSON.stringify(currentAddress));
  }, [currentAddress]);

  const addNewAddress = async (newAddr: Omit<UserAddress, 'id'>): Promise<UserAddress> => {
    const addressWithId: UserAddress = {
      ...newAddr,
      id: 'addr-' + Date.now(),
      distanceKm: newAddr.distanceKm || 1.5
    };

    setSavedAddresses((prev) => [addressWithId, ...prev]);
    setCurrentAddress(addressWithId);

    // Sync to D1 Database if logged in
    if (user?.id) {
      try {
        await authFetch(`${API_BASE_URL}/addresses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: user.id,
            label: newAddr.label,
            receiverName: newAddr.receiverName,
            receiverPhone: newAddr.receiverPhone,
            addressDetail: newAddr.addressDetail,
            ward: newAddr.ward || '',
            district: newAddr.district || 'Tân Bình',
            isDefault: newAddr.isDefault ? 1 : 0
          })
        });
      } catch (err) {
        console.warn('Could not sync new address to D1:', err);
      }
    }

    return addressWithId;
  };

  const deleteAddress = async (id: string) => {
    setSavedAddresses((prev) => prev.filter((a) => a.id !== id));
    if (currentAddress.id === id) {
      const remaining = savedAddresses.filter((a) => a.id !== id);
      if (remaining.length > 0) setCurrentAddress(remaining[0]);
    }

    if (user?.id) {
      try {
        await authFetch(`${API_BASE_URL}/addresses/${id}`, {
          method: 'DELETE'
        });
      } catch (err) {
        console.warn('Could not delete address on D1:', err);
      }
    }
  };

  // Distance logic: Freeship 0đ for <= 1.0km from selected branch
  const getDistanceToBranch = (branch: Branch, addressStr?: string) => {
    return computeDistanceToBranch(branch, addressStr || currentAddress.addressDetail);
  };

  const distanceKm = getDistanceToBranch(selectedBranch, currentAddress.addressDetail);
  const isWithinDeliveryRange = distanceKm <= 1.0;
  // Rule: Freeship 0đ within 1km, 0đ for pickup
  const shippingFee = 0;

  return (
    <LocationContext.Provider
      value={{
        orderMode,
        setOrderMode,
        branches,
        selectedBranch,
        setSelectedBranch,
        savedAddresses,
        currentAddress,
        setCurrentAddress,
        addNewAddress,
        deleteAddress,
        isLocationModalOpen,
        setIsLocationModalOpen,
        shippingFee,
        distanceKm,
        isWithinDeliveryRange,
        getDistanceToBranch
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
