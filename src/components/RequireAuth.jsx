import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

// Escape hatch for a hung session restore: if the backend accepts the
// connection but never responds, the loading state would otherwise trap the
// user on every protected route. This component mounts only while loading, so
// its timer is naturally fresh each time the user enters that state and gone
// the moment status changes.
const SLOW_RESTORE_MS = 6_000;

function SlowRetry({ onRetry }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setShow(true), SLOW_RESTORE_MS);
    return () => clearTimeout(timer);
  }, []);
  if (!show) return null;
  return (
    <button className="btn btn-primary" type="button" onClick={onRetry}>
      Try again
    </button>
  );
}

export default function RequireAuth({ children }) {
  const auth = useAuth();
  const location = useLocation();

  if (auth.status === 'loading') {
    return (
      <main className="container catalog-state" aria-busy="true">
        <p>Restoring your session...</p>
        <SlowRetry onRetry={() => auth.restoreSession()} />
      </main>
    );
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
