import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './context/StoreProvider';
import { CatalogProvider } from './context/CatalogProvider';
import { AuthProvider } from './context/AuthProvider';
import { TrackingProvider } from './context/TrackingProvider';
import RequireAuth from './components/RequireAuth';
import AuthRedirect from './components/AuthRedirect';
import StoreStatus from './components/StoreStatus';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import DetailPage from './pages/DetailPage';
import SearchPage from './pages/SearchPage';
import RecommendationsPage from './pages/RecommendationsPage';
import WishlistPage from './pages/WishlistPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccountPage from './pages/AccountPage';
import OnboardingPage from './pages/OnboardingPage';
import ProfilePreferencesPage from './pages/ProfilePreferencesPage';

export default function App() {
  return (
    <BrowserRouter>
      <CatalogProvider>
        <AuthProvider>
          <TrackingProvider>
            <AuthRedirect />
            <StoreProvider>
            <Navbar />
            <div className="container global-store-status"><StoreStatus /></div>
            <Routes>
              <Route path="/"                element={<HomePage />} />
              <Route path="/catalog"         element={<CatalogPage />} />
              <Route path="/records/:id"     element={<DetailPage />} />
              <Route path="/search"          element={<SearchPage />} />
              <Route path="/recommendations" element={<RecommendationsPage />} />
              <Route path="/wishlist"        element={<WishlistPage />} />
              <Route path="/cart"            element={<CartPage />} />
              <Route path="/login"           element={<LoginPage />} />
              <Route path="/register"        element={<RegisterPage />} />
              <Route path="/account" element={<RequireAuth><AccountPage /></RequireAuth>} />
              <Route path="/onboarding" element={<RequireAuth><OnboardingPage /></RequireAuth>} />
              <Route path="/profile/preferences" element={<RequireAuth><ProfilePreferencesPage /></RequireAuth>} />
              <Route path="*"                element={<Navigate to="/" replace />} />
            </Routes>
            <Footer />
            </StoreProvider>
          </TrackingProvider>
        </AuthProvider>
      </CatalogProvider>
    </BrowserRouter>
  );
}
