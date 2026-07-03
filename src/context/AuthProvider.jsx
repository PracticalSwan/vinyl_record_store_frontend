import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as api from '../lib/api';
import { AuthContext } from './authContext';

async function resolveSessionState({ signal } = {}) {
  try {
    const response = await api.fetchSession({ signal });
    return response.data.authenticated
      ? { status: 'authenticated', user: response.data.user, error: null }
      : { status: 'anonymous', user: null, error: null };
  } catch (error) {
    if (error.name === 'AbortError') return null;
    return { status: 'error', user: null, error };
  }
}

export function AuthProvider({ children }) {
  const [state, setState] = useState({ status: 'loading', user: null, error: null });
  const operation = useRef(0);

  const restoreSession = useCallback(({ signal } = {}) => {
    const generation = ++operation.current;
    setState((current) => ({ ...current, status: 'loading', error: null }));
    return resolveSessionState({ signal }).then((next) => {
      if (next && generation === operation.current) setState(next);
    });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const generation = ++operation.current;
    resolveSessionState({ signal: controller.signal }).then((next) => {
      if (next && generation === operation.current) setState(next);
    });
    return () => controller.abort();
  }, []);

  const signIn = useCallback(async (credentials) => {
    const response = await api.login(credentials);
    operation.current += 1;
    setState({ status: 'authenticated', user: response.data.user, error: null });
    return response.data.user;
  }, []);

  const signUp = useCallback(async (account) => {
    const response = await api.register(account);
    operation.current += 1;
    setState({ status: 'authenticated', user: response.data.user, error: null });
    return response.data.user;
  }, []);

  const signOut = useCallback(async () => {
    await api.logout();
    operation.current += 1;
  }, []);

  const clearSession = useCallback(() => {
    operation.current += 1;
    setState({ status: 'anonymous', user: null, error: null });
  }, []);

  const value = useMemo(() => ({
    ...state,
    restoreSession,
    signIn,
    signUp,
    signOut,
    clearSession,
  }), [state, restoreSession, signIn, signUp, signOut, clearSession]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
