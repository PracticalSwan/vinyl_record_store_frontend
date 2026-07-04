import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as api from '../lib/api';
import { prepareTrackingIdentityChange } from '../lib/tracking';
import { AuthContext } from './authContext';

async function resolveSessionState({ signal } = {}) {
  try {
    const response = await api.fetchSession({ signal });
    return response.data.authenticated
      ? { status: 'authenticated', user: response.data.user, error: null, authMethod: 'restore' }
      : { status: 'anonymous', user: null, error: null, authMethod: null };
  } catch (error) {
    if (error.name === 'AbortError') return null;
    return { status: 'error', user: null, error, authMethod: null };
  }
}

export function AuthProvider({ children }) {
  const [state, setState] = useState({ status: 'loading', user: null, error: null, authMethod: null });
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

  // Write operations commit only if no other auth operation committed while
  // they were awaiting. A failed write throws before committing and does NOT
  // advance the counter, so a pending session restore can still settle.
  const signIn = useCallback(async (credentials) => {
    const before = operation.current;
    await prepareTrackingIdentityChange();
    const response = await api.login(credentials);
    if (operation.current !== before) return response.data.user;
    operation.current += 1;
    setState({ status: 'authenticated', user: response.data.user, error: null, authMethod: 'login' });
    return response.data.user;
  }, []);

  const signUp = useCallback(async (account) => {
    const before = operation.current;
    await prepareTrackingIdentityChange();
    const response = await api.register(account);
    if (operation.current !== before) return response.data.user;
    operation.current += 1;
    setState({ status: 'authenticated', user: response.data.user, error: null, authMethod: 'register' });
    return response.data.user;
  }, []);

  const signOut = useCallback(async () => {
    const before = operation.current;
    await prepareTrackingIdentityChange();
    await api.logout();
    if (operation.current !== before) return;
    operation.current += 1;
    setState({ status: 'anonymous', user: null, error: null, redirectTo: '/', authMethod: null });
  }, []);

  const consumeRedirect = useCallback(() => {
    setState((current) => current.redirectTo ? { ...current, redirectTo: null } : current);
  }, []);

  const savePreferences = useCallback(async (preferences) => {
    const before = operation.current;
    const response = await api.updatePreferences(preferences);
    if (operation.current !== before) return response.data.user;
    operation.current += 1;
    setState((current) => ({ ...current, status: 'authenticated', user: response.data.user, error: null }));
    return response.data.user;
  }, []);

  const value = useMemo(() => ({
    ...state,
    restoreSession,
    signIn,
    signUp,
    signOut,
    savePreferences,
    consumeRedirect,
  }), [state, restoreSession, signIn, signUp, signOut, savePreferences, consumeRedirect]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
