import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { HomeScreen } from '../presentation/screens/home/HomeScreen';
import { ProductsScreen } from '../presentation/screens/products/ProductsScreen';
import { ProductDetailScreen } from '../presentation/screens/product-detail/ProductDetailScreen';
import { CartScreen } from '../presentation/screens/cart/CartScreen';
import { AboutScreen } from '../presentation/screens/about/AboutScreen';
import { PromotionsScreen } from '../presentation/screens/promotions/PromotionsScreen';
import { StoresScreen } from '../presentation/screens/stores/StoresScreen';
import { ContactScreen } from '../presentation/screens/contact/ContactScreen';
import { OrderHistoryScreen } from '../presentation/screens/orders/OrderHistoryScreen';
import { OrderTrackingScreen } from '../presentation/screens/orders/OrderTrackingScreen';
import { UserProfileScreen } from '../presentation/screens/profile/UserProfileScreen';
import { AdminDashboardScreen } from '../presentation/screens/admin/AdminDashboardScreen';
import { AdminLoginScreen } from '../presentation/screens/admin/AdminLoginScreen';

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.25, ease: 'easeInOut' }}
  >
    {children}
  </motion.div>
);

export const AppRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><HomeScreen /></PageWrapper>} />
        <Route path="/san-pham" element={<PageWrapper><ProductsScreen /></PageWrapper>} />
        <Route path="/san-pham/:id" element={<PageWrapper><ProductDetailScreen /></PageWrapper>} />
        <Route path="/gio-hang" element={<PageWrapper><CartScreen /></PageWrapper>} />
        <Route path="/ve-chung-toi" element={<Navigate to="/" replace />} />
        <Route path="/uu-dai" element={<PageWrapper><PromotionsScreen /></PageWrapper>} />
        <Route path="/cua-hang" element={<PageWrapper><StoresScreen /></PageWrapper>} />
        <Route path="/lien-he" element={<PageWrapper><ContactScreen /></PageWrapper>} />
        <Route path="/lich-su-don-hang" element={<PageWrapper><OrderHistoryScreen /></PageWrapper>} />
        <Route path="/theo-doi-don-hang/:id" element={<PageWrapper><OrderTrackingScreen /></PageWrapper>} />
        <Route path="/ho-so" element={<PageWrapper><UserProfileScreen /></PageWrapper>} />
        <Route path="/admin/login" element={<AdminLoginScreen />} />
        <Route path="/admin" element={<AdminDashboardScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};
