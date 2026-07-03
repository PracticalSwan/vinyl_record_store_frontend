import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../context/useStore';
import { useAuth } from '../context/useAuth';
import { IconGrid, IconStar, IconHeart, IconCart, IconSearch, IconUser } from './Icons';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { wishlist, cart } = useStore();
  const auth = useAuth();
  const [query, setQuery] = useState('');

  const is = (path) => location.pathname === path;

  const handleSearch = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  };

  return (
    <nav className="nav" aria-label="Main navigation">
      <div className="nav-inner">
        <button className="nav-brand" onClick={() => navigate('/')} aria-label="Groovehaus home">
          Groove<span>haus</span>
        </button>

        <div className="nav-search" role="search">
          <span className="nav-search-icon"><IconSearch /></span>
          <input
            type="search"
            placeholder="Search records, artists, labels…"
            aria-label="Search records"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>

        <ul className="nav-links" role="list">
          <li>
            <button
              className={`nav-link${is('/catalog') ? ' active' : ''}`}
              onClick={() => navigate('/catalog')}
              aria-label="Catalog"
              aria-current={is('/catalog') ? 'page' : undefined}
            >
              <IconGrid /><span>Catalog</span>
            </button>
          </li>
          <li>
            <button
              className={`nav-link${is('/recommendations') ? ' active' : ''}`}
              onClick={() => navigate('/recommendations')}
              aria-label="Recommendations"
              aria-current={is('/recommendations') ? 'page' : undefined}
            >
              <IconStar /><span>For You</span>
            </button>
          </li>
          <li>
            <button
              className={`nav-link${is('/wishlist') ? ' active' : ''}`}
              onClick={() => navigate('/wishlist')}
              aria-label={`Wishlist, ${wishlist.length} items`}
              aria-current={is('/wishlist') ? 'page' : undefined}
            >
              <IconHeart />
              <span>Wishlist</span>
              {wishlist.length > 0 && (
                <span className="nav-badge" aria-hidden="true">{wishlist.length}</span>
              )}
            </button>
          </li>
          <li>
            <button
              className={`nav-link${is('/cart') ? ' active' : ''}`}
              onClick={() => navigate('/cart')}
              aria-label={`Cart, ${cart.length} items`}
              aria-current={is('/cart') ? 'page' : undefined}
            >
              <IconCart />
              <span>Cart</span>
              {cart.length > 0 && (
                <span className="nav-badge" aria-hidden="true">{cart.length}</span>
              )}
            </button>
          </li>
          <li>
            <button
              className={`nav-link${is('/account') || is('/login') || is('/register') ? ' active' : ''}`}
              onClick={() => navigate(auth.status === 'authenticated' ? '/account' : '/login')}
              aria-label={auth.status === 'authenticated' ? `Account for ${auth.user.username}` : 'Sign in'}
              aria-current={is('/account') || is('/login') || is('/register') ? 'page' : undefined}
            >
              <IconUser /><span>{auth.status === 'authenticated' ? 'Account' : 'Sign in'}</span>
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
