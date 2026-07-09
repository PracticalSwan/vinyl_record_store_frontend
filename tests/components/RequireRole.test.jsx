import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// authState is mutated per test; the hoisted mock factory closes over it and is
// only evaluated when RequireRole calls useAuth() during render.
let authState = { status: 'loading', user: null, redirectTo: null };
vi.mock('../../src/context/useAuth', () => ({
  useAuth: () => authState,
}));

const RequireRole = (await import('../../src/components/RequireRole')).default;

function renderWith(child) {
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <RequireRole role="admin">{child}</RequireRole>
    </MemoryRouter>,
  );
}

describe('RequireRole', () => {
  it('renders children for an authenticated admin', () => {
    authState = { status: 'authenticated', user: { role: 'admin', username: 'admin' }, redirectTo: null };
    renderWith(<p>Admin workspace</p>);
    expect(screen.getByText('Admin workspace')).toBeTruthy();
  });

  it('shows a forbidden notice for a verified customer', () => {
    authState = { status: 'authenticated', user: { role: 'customer', username: 'listener' }, redirectTo: null };
    renderWith(<p>Admin workspace</p>);
    expect(screen.getByText('Administrator access required')).toBeTruthy();
    expect(screen.queryByText('Admin workspace')).toBeNull();
  });

  it('renders a loading state while the session restores', () => {
    authState = { status: 'loading', user: null, redirectTo: null };
    renderWith(<p>Admin workspace</p>);
    expect(screen.getByText('Restoring your session...')).toBeTruthy();
  });

  it('renders a sign-out banner while redirecting on logout', () => {
    authState = { status: 'authenticated', user: { role: 'admin' }, redirectTo: '/' };
    renderWith(<p>Admin workspace</p>);
    expect(screen.getByText('Signing out...')).toBeTruthy();
  });
});
