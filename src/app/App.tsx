import React, { useEffect } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { ToastProvider } from '../presentation/context/ToastContext';
import { AuthProvider } from '../presentation/context/AuthContext';
import { LocationProvider } from '../presentation/context/LocationContext';
import { CartProvider } from '../presentation/context/CartContext';
import { RewardProvider } from '../presentation/context/RewardContext';
import { Navbar } from '../presentation/components/layout/Navbar';
import { Footer } from '../presentation/components/layout/Footer';
import { DailyCheckInModal } from '../presentation/components/rewards/DailyCheckInModal';
import { AuthModal } from '../presentation/components/auth/AuthModal';
import { DeliverySetupModal } from '../presentation/components/location/DeliverySetupModal';
import { AppRoutes } from './routes';

// Scroll to top on page navigation
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
};

const AppContent: React.FC = () => {
  const { pathname } = useLocation();
  const isAdminRoute = pathname.startsWith('/admin');

  // Dedicated Admin Portal (NO Client Navbar, Footer, or Modals)
  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] text-stone-900 font-sans">
        <ScrollToTop />
        <AppRoutes />
      </div>
    );
  }

  // Client Web Portal
  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-stone-900 w-full overflow-x-hidden">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1 w-full overflow-x-hidden">
        <AppRoutes />
      </main>
      <Footer />
      <DailyCheckInModal />
      <AuthModal />
      <DeliverySetupModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <LocationProvider>
            <RewardProvider>
              <CartProvider>
                <AppContent />
              </CartProvider>
            </RewardProvider>
          </LocationProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
