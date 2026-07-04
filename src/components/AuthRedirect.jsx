import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function AuthRedirect() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!auth.redirectTo) return;
    const current = `${location.pathname}${location.search}${location.hash}`;
    if (current === auth.redirectTo) auth.consumeRedirect();
    else navigate(auth.redirectTo, { replace: true });
  }, [auth, location.hash, location.pathname, location.search, navigate]);

  return null;
}
