import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

// Frontend route guard for administrator pages. This improves navigation only;
// the backend `requireRole('admin')` check on every /api/admin route is the
// real security boundary. A verified customer lands on a clear forbidden page
// and an anonymous visitor is sent to login with a safe return path.
export default function RequireRole({ role = 'admin', children }) {
  const auth = useAuth();
  const location = useLocation();

  if (auth.redirectTo) {
    return <main className="container catalog-state" role="status">Signing out...</main>;
  }
  if (auth.status === 'loading') {
    return (
      <main className="container catalog-state" aria-busy="true">
        <p>Restoring your session...</p>
      </main>
    );
  }
  if (auth.status !== 'authenticated') {
    const returnTo = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?returnTo=${encodeURIComponent(returnTo)}`} replace />;
  }
  if (auth.user.role !== role) {
    return (
      <main className="container catalog-state">
        <div className="state-box" role="alert">
          <p className="state-title">Administrator access required</p>
          <p className="state-desc">
            The page you tried to open is restricted to administrators. You are signed in as a customer.
          </p>
          <Link className="btn btn-primary" to="/">Back to the store</Link>
        </div>
      </main>
    );
  }
  return children;
}
