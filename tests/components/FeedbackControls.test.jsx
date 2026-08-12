import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import FeedbackControls from '../../src/components/FeedbackControls';

describe('FeedbackControls', () => {
  it('offers only the two supported feedback actions', () => {
    render(<FeedbackControls onCreate={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Not interested' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Already own' })).toBeVisible();
    expect(screen.queryByRole('button', { name: /fewer/i })).toBeNull();
  });

  it('renders a confirmed status with undo and calls it', async () => {
    const onUndo = vi.fn();
    const user = userEvent.setup();
    render(<FeedbackControls status="confirmed" onUndo={onUndo} />);
    expect(screen.getByRole('status')).toHaveTextContent('Removed from recommendations.');
    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(onUndo).toHaveBeenCalledOnce();
  });

  it('uses neutral already-owned confirmation copy without dislike wording', () => {
    render(<FeedbackControls status="confirmed" confirmedKind="already-own" onUndo={vi.fn()} />);
    expect(screen.getByRole('status')).toHaveTextContent('Marked as already owned.');
    expect(screen.getByRole('status')).not.toHaveTextContent(/not interested|dislike/i);
  });
});
