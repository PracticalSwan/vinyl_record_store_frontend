import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function RequireAuth({ children }) {
  const auth = useAuth();
  const location = useLocation();

  if (auth.status === 'loading') {
    return <main className="container catalog-state" aria-busy="true">Restoring your session...</main>;
  }
  if (auth.status === 'error') {
    return (
      <main className="container catalog-state">
        <div className="state-box" role="alert">
          <p className="state-title">Session check unavailable</p>
          <p className="state-desc">{auth.error.message}</p>
          <button className="btn btn-primary" type="button" onClick={() => auth.restoreSession()}>
            Try again
          </button>
        </div>
      </main>
    );
  }
  if (auth.status !== 'authenticated') {
    const returnTo = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?returnTo=${encodeURIComponent(returnTo)}`} replace />;
  }
  return children;
}
