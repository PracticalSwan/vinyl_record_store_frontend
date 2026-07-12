import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from 'react-router-dom';
import { StoreProvider } from './context/StoreProvider';
import { CatalogProvider } from './context/CatalogProvider';
import { AuthProvider } from './context/AuthProvider';
import { TrackingProvider } from './context/TrackingProvider';
import RequireAuth from './components/RequireAuth';
import RequireRole from './components/RequireRole';
import AuthRedirect from './components/AuthRedirect';
import StoreStatus from './components/StoreStatus';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminLayout from './layouts/AdminLayout';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import DetailPage from './pages/DetailPage';
import SearchPage from './pages/SearchPage';
import RecommendationsPage from './pages/RecommendationsPage';
import WishlistPage from './pages/WishlistPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import DemoOrderConfirmationPage from './pages/DemoOrderConfirmationPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccountPage from './pages/AccountPage';
import OnboardingPage from './pages/OnboardingPage';
import ProfilePreferencesPage from './pages/ProfilePreferencesPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminProductFormPage from './pages/admin/AdminProductFormPage';
import AdminImportPage from './pages/admin/AdminImportPage';

function AppShell() {
  return (
    <AuthProvider>
      <TrackingProvider>
        <CatalogProvider>
          <AuthRedirect />
          <StoreProvider>
            <Navbar />
            <div className="site-content">
              <div className="container global-store-status"><StoreStatus /></div>
              <Outlet />
            </div>
            <Footer />
          </StoreProvider>
        </CatalogProvider>
      </TrackingProvider>
    </AuthProvider>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'catalog', element: <CatalogPage /> },
      { path: 'records/:id', element: <DetailPage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'recommendations', element: <RecommendationsPage /> },
      { path: 'wishlist', element: <WishlistPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'checkout', element: <RequireAuth><CheckoutPage /></RequireAuth> },
      { path: 'orders/preview/:reference', element: <RequireAuth><DemoOrderConfirmationPage /></RequireAuth> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'account', element: <RequireAuth><AccountPage /></RequireAuth> },
      { path: 'onboarding', element: <RequireAuth><OnboardingPage /></RequireAuth> },
      { path: 'profile/preferences', element: <RequireAuth><ProfilePreferencesPage /></RequireAuth> },
      {
        path: 'admin',
        element: <RequireRole><AdminLayout /></RequireRole>,
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: 'products', element: <AdminProductsPage /> },
          { path: 'products/new', element: <AdminProductFormPage /> },
          { path: 'products/:id/edit', element: <AdminProductFormPage /> },
          { path: 'import', element: <AdminImportPage /> },
        ],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
