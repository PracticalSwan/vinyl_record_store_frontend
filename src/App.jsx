import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './context/StoreProvider';
import { CatalogProvider } from './context/CatalogProvider';
import CatalogGate from './components/CatalogGate';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import DetailPage from './pages/DetailPage';
import SearchPage from './pages/SearchPage';
import RecommendationsPage from './pages/RecommendationsPage';
import WishlistPage from './pages/WishlistPage';
import CartPage from './pages/CartPage';

export default function App() {
  return (
    <BrowserRouter>
      <CatalogProvider>
        <StoreProvider>
          <Navbar />
          <CatalogGate>
            <Routes>
              <Route path="/"                element={<HomePage />} />
              <Route path="/catalog"         element={<CatalogPage />} />
              <Route path="/records/:id"     element={<DetailPage />} />
              <Route path="/search"          element={<SearchPage />} />
              <Route path="/recommendations" element={<RecommendationsPage />} />
              <Route path="/wishlist"        element={<WishlistPage />} />
              <Route path="/cart"            element={<CartPage />} />
              <Route path="*"                element={<Navigate to="/" replace />} />
            </Routes>
          </CatalogGate>
          <Footer />
        </StoreProvider>
      </CatalogProvider>
    </BrowserRouter>
  );
}
