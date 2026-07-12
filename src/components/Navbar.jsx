import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../context/useStore';
import { useAuth } from '../context/useAuth';
import { useTracking } from '../context/useTracking';
import { useRecentSearches } from '../hooks/useRecentSearches';
import { normalizeSearchTerm } from '../lib/recentSearches';
import { IconGrid, IconStar, IconHeart, IconCart, IconSearch, IconUser } from './Icons';
import RecentSearches from './RecentSearches';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { wishlist, cart } = useStore();
  const auth = useAuth();
  const tracking = useTracking();
  const locationQuery = location.pathname === '/search'
    ? new URLSearchParams(location.search).get('q') || ''
    : '';
  const [draft, setDraft] = useState({ sourceQuery: locationQuery, value: locationQuery });
  const [historyOpen, setHistoryOpen] = useState(false);
  const query = draft.sourceQuery === locationQuery ? draft.value : locationQuery;
  const searchScope = auth.status === 'authenticated' ? auth.user.publicId : 'guest';
  const recentSearches = useRecentSearches(searchScope);

  const is = (path) => location.pathname === path;

  useEffect(() => {
    const nextQuery = normalizeSearchTerm(query);
    const currentQuery = normalizeSearchTerm(locationQuery);
    if (nextQuery === currentQuery || (!nextQuery && location.pathname !== '/search')) return undefined;
    const timer = setTimeout(() => {
      navigate(nextQuery ? `/search?q=${encodeURIComponent(nextQuery)}` : '/search', { replace: true });
    }, 300);
    return () => clearTimeout(timer);
  }, [location.pathname, locationQuery, navigate, query]);

  const commitSearch = (value) => {
    const term = normalizeSearchTerm(value);
    if (!term) return;
    recentSearches.add(term);
    tracking.track('search_submit', {
      surface: 'search',
      value: Math.min(99, term.length),
      dedupeKey: `search:${term}`,
    });
    setDraft({ sourceQuery: term, value: term });
    navigate(`/search?q=${encodeURIComponent(term)}`);
    setHistoryOpen(false);
  };

  const handleSearch = (event) => {
    if (event.key === 'Enter') commitSearch(query);
    if (event.key === 'Escape') setHistoryOpen(false);
  };

  return (
    <nav className="nav" aria-label="Main navigation">
      <div className="nav-inner">
        <button className="nav-brand" onClick={() => navigate('/')} aria-label="Groovehaus home">
          Groove<span>haus</span>
        </button>

        <div
          className="nav-search"
          role="search"
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setHistoryOpen(false);
          }}
        >
          <span className="nav-search-icon"><IconSearch /></span>
          <input
            type="search"
            placeholder="Search records, artists, labels…"
            aria-label="Search records"
            value={query}
            onFocus={() => setHistoryOpen(true)}
            onChange={(event) => {
              setDraft({ sourceQuery: locationQuery, value: event.target.value });
              setHistoryOpen(true);
            }}
            onKeyDown={handleSearch}
          />
          {historyOpen && (
            <div id="nav-recent-searches" className="nav-recent-searches">
              <RecentSearches
                items={recentSearches.items}
                onSelect={commitSearch}
                onClear={recentSearches.clear}
                compact
              />
            </div>
          )}
        </div>

        <ul className="nav-links" role="list">
          {auth.status === 'authenticated' && auth.user?.role === 'admin' && (
            <li>
              <button
                className={`nav-link${location.pathname.startsWith('/admin') ? ' active' : ''}`}
                onClick={() => navigate('/admin')}
                aria-label="Administration"
                aria-current={location.pathname.startsWith('/admin') ? 'page' : undefined}
              >
                <span>Admin</span>
              </button>
            </li>
          )}
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
