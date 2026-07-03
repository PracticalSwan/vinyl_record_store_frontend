import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../../src/context/AuthProvider';
import { useAuth } from '../../src/context/useAuth';
import * as api from '../../src/lib/api';

vi.mock('../../src/lib/api', () => ({
  fetchSession: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
}));

function Probe() {
  const auth = useAuth();
  return (
    <div>
      <p>{auth.status}</p>
      <p>{auth.user?.username || 'no-user'}</p>
      <button type="button" onClick={() => auth.signIn({ username: 'listener', password: 'password value' }).catch(() => {})}>Sign in test</button>
      <button type="button" onClick={() => auth.signUp({ username: 'listener', password: 'password value' }).catch(() => {})}>Sign up test</button>
      <button type="button" onClick={async () => { try { await auth.signOut(); auth.clearSession(); } catch { /* Preserve the current or restoring session. */ } }}>Sign out test</button>
    </div>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('restores an anonymous session and transitions through login and logout', async () => {
    api.fetchSession.mockResolvedValue({ data: { authenticated: false } });
    api.login.mockResolvedValue({ data: { user: { username: 'listener', role: 'customer' } } });
    api.logout.mockResolvedValue({ data: { authenticated: false } });
    const user = userEvent.setup();

    render(<AuthProvider><Probe /></AuthProvider>);
    await screen.findByText('anonymous');
    await user.click(screen.getByRole('button', { name: 'Sign in test' }));
    await screen.findByText('authenticated');
    expect(screen.getByText('listener')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Sign out test' }));
    await waitFor(() => expect(screen.getByText('anonymous')).toBeInTheDocument());
  });

  it('surfaces session restoration failures without inventing a user', async () => {
    api.fetchSession.mockRejectedValue(new Error('Backend unavailable'));
    render(<AuthProvider><Probe /></AuthProvider>);
    await screen.findByText('error');
    expect(screen.getByText('no-user')).toBeInTheDocument();
  });

  it('does not let a stale session restore overwrite a completed login', async () => {
    let resolveRestore;
    api.fetchSession.mockReturnValue(new Promise((resolve) => {
      resolveRestore = resolve;
    }));
    api.login.mockResolvedValue({ data: { user: { username: 'listener', role: 'customer' } } });
    const user = userEvent.setup();

    render(<AuthProvider><Probe /></AuthProvider>);
    await user.click(screen.getByRole('button', { name: 'Sign in test' }));
    await screen.findByText('authenticated');
    await act(async () => {
      resolveRestore({ data: { authenticated: false } });
      await Promise.resolve();
    });
    expect(screen.getByText('authenticated')).toBeInTheDocument();
    expect(screen.getByText('listener')).toBeInTheDocument();
  });

  it.each([
    ['login', 'Sign in test', () => api.login.mockRejectedValue(new Error('Login failed'))],
    ['registration', 'Sign up test', () => api.register.mockRejectedValue(new Error('Registration failed'))],
    ['logout', 'Sign out test', () => api.logout.mockRejectedValue(new Error('Logout failed'))],
  ])('lets a pending restore settle after failed %s', async (_name, buttonName, rejectRequest) => {
    let resolveRestore;
    api.fetchSession.mockReturnValue(new Promise((resolve) => {
      resolveRestore = resolve;
    }));
    rejectRequest();
    const user = userEvent.setup();

    render(<AuthProvider><Probe /></AuthProvider>);
    await waitFor(() => expect(api.fetchSession).toHaveBeenCalledTimes(1));
    await user.click(screen.getByRole('button', { name: buttonName }));
    await act(async () => {
      resolveRestore({ data: { authenticated: false } });
      await Promise.resolve();
    });
    expect(screen.getByText('anonymous')).toBeInTheDocument();
  });
});
