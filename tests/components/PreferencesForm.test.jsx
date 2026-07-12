import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import PreferencesForm from '../../src/components/preferences/PreferencesForm';

describe('PreferencesForm', () => {
  it('preserves the wizard and submits a valid three-step preference request', async () => {
    const onSave = vi.fn();
    const user = userEvent.setup();
    render(<PreferencesForm wizard initial={{}} onSave={onSave} onSkip={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByText(/Choose at least one favorite genre/)).toBeVisible();
    await user.click(within(screen.getByRole('group', { name: /Favorite genres/ })).getByLabelText('Jazz'));
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await user.type(screen.getByLabelText(/Favorite artists/), 'Miles Davis');
    await user.type(screen.getByLabelText('Minimum'), '10');
    await user.type(screen.getByLabelText('Maximum'), '80');
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByText('Miles Davis')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Save preferences' }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      favoriteGenres: ['Jazz'],
      favoriteArtists: ['Miles Davis'],
      budget: { min: 10, max: 80 },
      completed: true,
    }));
  });

  it('keeps budget validation beside step two instead of advancing to review', async () => {
    const user = userEvent.setup();
    render(<PreferencesForm wizard initial={{}} onSave={vi.fn()} onSkip={vi.fn()} />);

    await user.click(within(screen.getByRole('group', { name: /Favorite genres/ })).getByLabelText('Jazz'));
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await user.type(screen.getByLabelText('Minimum'), '100');
    await user.type(screen.getByLabelText('Maximum'), '20');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(screen.getByText('Step 2 of 3')).toBeVisible();
    expect(screen.getByText(/Minimum budget cannot exceed maximum/)).toBeVisible();
  });

  it('clears the editable draft without saving and allows an explicit empty save', async () => {
    const onSave = vi.fn();
    const onDraftChange = vi.fn();
    const user = userEvent.setup();
    render(
      <PreferencesForm
        initial={{ favoriteGenres: ['Jazz'] }}
        onSave={onSave}
        onDraftChange={onDraftChange}
        showClear
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Clear preferences' }));
    expect(onSave).not.toHaveBeenCalled();
    expect(onDraftChange).toHaveBeenLastCalledWith(expect.objectContaining({ favoriteGenres: [] }));

    await user.click(screen.getByRole('button', { name: 'Save preferences' }));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      favoriteGenres: [],
      completed: false,
    }));
  });
});
