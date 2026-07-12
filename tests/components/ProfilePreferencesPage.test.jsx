import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  createMemoryRouter,
  RouterProvider,
  useNavigate,
} from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProfilePreferencesPage from '../../src/pages/ProfilePreferencesPage';

const savePreferences = vi.fn();
let authState;

vi.mock('../../src/context/useAuth', () => ({
  useAuth: () => authState,
}));

vi.mock('../../src/components/TrackingPreference', () => ({
  default: () => null,
}));

function PreferencesWithNavigation() {
  const navigate = useNavigate();
  return (
    <>
      <button type="button" onClick={() => navigate('/catalog')}>Catalog navigation</button>
      <ProfilePreferencesPage />
    </>
  );
}

function renderPage() {
  const router = createMemoryRouter([
    { path: '/profile/preferences', element: <PreferencesWithNavigation /> },
    { path: '/account', element: <p>Account destination</p> },
    { path: '/catalog', element: <p>Catalog destination</p> },
  ], { initialEntries: ['/account', '/profile/preferences'], initialIndex: 1 });
  return { router, ...render(<RouterProvider router={router} />) };
}

describe('ProfilePreferencesPage', () => {
  beforeEach(() => {
    savePreferences.mockReset();
    authState = {
      user: {
        publicId: 'user-1',
        username: 'listener',
        role: 'customer',
        preferences: { favoriteGenres: ['Jazz'] },
      },
      savePreferences,
    };
    savePreferences.mockImplementation(async (request) => ({
      ...authState.user,
      onboardingComplete: request.completed,
      preferences: request,
    }));
  });

  it('clears only the draft and discards it through the unsaved-changes dialog', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Clear preferences' }));
    expect(savePreferences).not.toHaveBeenCalled();
    expect(screen.getByText('You have unsaved changes.')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Back to account' }));
    let dialog = screen.getByRole('dialog', { name: 'Unsaved preference changes' });
    expect(within(dialog).getByRole('button', { name: 'Keep editing' })).toHaveFocus();
    await user.tab({ shift: true });
    expect(within(dialog).getByRole('button', { name: 'Save changes' })).toHaveFocus();
    await user.tab();
    expect(within(dialog).getByRole('button', { name: 'Keep editing' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: 'Unsaved preference changes' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back to account' })).toHaveFocus();

    await user.click(screen.getByRole('button', { name: 'Back to account' }));
    dialog = screen.getByRole('dialog', { name: 'Unsaved preference changes' });
    await user.click(within(dialog).getByRole('button', { name: 'Discard changes' }));

    expect(await screen.findByText('Account destination')).toBeVisible();
    expect(savePreferences).not.toHaveBeenCalled();
  });

  it('guards navigation outside the custom back button and resumes the pending destination', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Clear preferences' }));
    await user.click(screen.getByRole('button', { name: 'Catalog navigation' }));
    let dialog = screen.getByRole('dialog', { name: 'Unsaved preference changes' });
    await user.click(within(dialog).getByRole('button', { name: 'Keep editing' }));
    expect(screen.getByRole('heading', { name: 'Edit recommendation preferences' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Catalog navigation' })).toHaveFocus();

    await user.click(screen.getByRole('button', { name: 'Catalog navigation' }));
    dialog = screen.getByRole('dialog', { name: 'Unsaved preference changes' });
    await user.click(within(dialog).getByRole('button', { name: 'Discard changes' }));

    expect(await screen.findByText('Catalog destination')).toBeVisible();
    expect(savePreferences).not.toHaveBeenCalled();
  });

  it('saves an intentionally cleared draft only after the user confirms', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Clear preferences' }));
    await user.click(screen.getByRole('button', { name: 'Back to account' }));
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(savePreferences).toHaveBeenCalledWith(expect.objectContaining({
      favoriteGenres: [],
      completed: false,
    }));
    expect(await screen.findByText('Account destination')).toBeVisible();
  });
});
