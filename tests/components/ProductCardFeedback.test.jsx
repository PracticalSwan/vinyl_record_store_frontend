import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProductCard from '../../src/components/ProductCard';
import { deleteFeedback, putFeedback } from '../../src/lib/feedback';

vi.mock('../../src/context/useStore', () => ({
  useStore: () => ({
    wishlist: [],
    toggleWishlist: vi.fn(),
    isPending: () => false,
  }),
}));

vi.mock('../../src/context/useTracking', () => ({
  useTracking: () => ({ track: vi.fn() }),
}));

vi.mock('../../src/context/useAuth', () => ({
  useAuth: () => ({
    status: 'authenticated',
    user: { publicId: 'user-1', role: 'customer' },
  }),
}));

vi.mock('../../src/lib/features', () => ({
  personalizationMeEndpointEnabled: () => true,
  personalizationProfileDomainEnabled: () => true,
  personalizationNegativeFeedbackEnabled: () => true,
}));

vi.mock('../../src/lib/feedback', () => ({
  putFeedback: vi.fn(),
  deleteFeedback: vi.fn(),
}));

vi.mock('../../src/components/ProductImage', () => ({
  default: () => <div data-testid="product-image" />,
}));

const record = {
  id: 17,
  title: 'Review Record',
  artist: 'Review Artist',
  genre: 'Jazz',
  year: 2001,
  stock: 'in',
  price: 25,
  currency: 'USD',
  condition: 'NM',
  reason: 'Matches your Jazz preference.',
  recommendationContext: {
    requestId: 'request-1',
    listId: 'list-1',
    rank: 1,
    mode: 'preference-profile',
    algorithmVersion: 'preference-profile-v1',
  },
};

describe('ProductCard feedback flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    putFeedback.mockResolvedValue({ data: { productPublicId: 17, kind: 'not-interested' } });
    deleteFeedback.mockResolvedValue({ data: { productPublicId: 17, removed: true } });
  });

  it('replaces recommendation content with a focused Undo placeholder and restores it after undo', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ProductCard record={record} showReason surface="recommendations" />
      </MemoryRouter>,
    );

    const notInterested = screen.getByRole('button', { name: 'Not interested' });
    await user.click(notInterested);

    expect(putFeedback).toHaveBeenCalledWith(17, { kind: 'not-interested' });
    const undo = await screen.findByRole('button', { name: 'Undo' });
    await waitFor(() => expect(undo).toHaveFocus());
    expect(screen.getByRole('status')).toHaveTextContent('Removed from recommendations.');
    expect(screen.queryByText('Review Record')).toBeNull();
    expect(screen.queryByText('Matches your Jazz preference.')).toBeNull();
    expect(screen.queryByTestId('product-image')).toBeNull();

    await user.click(undo);

    expect(deleteFeedback).toHaveBeenCalledWith(17);
    const restored = await screen.findByRole('button', { name: 'Not interested' });
    await waitFor(() => expect(restored).toHaveFocus());
    expect(screen.getByText('Review Record')).toBeVisible();
    expect(screen.getByText('Matches your Jazz preference.')).toBeVisible();
    expect(screen.getByTestId('product-image')).toBeInTheDocument();
  });

  it('restores the exact feedback control focus when create fails', async () => {
    putFeedback.mockRejectedValueOnce(new Error('Feedback could not be saved.'));
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ProductCard record={record} showReason surface="recommendations" />
      </MemoryRouter>,
    );

    const alreadyOwn = screen.getByRole('button', { name: 'Already own' });
    await user.click(alreadyOwn);

    await screen.findByRole('alert');
    await waitFor(() => expect(alreadyOwn).toHaveFocus());
    expect(screen.getByText('Review Record')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Undo' })).toBeNull();
  });

  it('keeps the confirmed placeholder and restores Undo focus when undo fails', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ProductCard record={record} showReason surface="recommendations" />
      </MemoryRouter>,
    );

    const alreadyOwn = screen.getByRole('button', { name: 'Already own' });
    await user.click(alreadyOwn);
    const undo = await screen.findByRole('button', { name: 'Undo' });
    await waitFor(() => expect(undo).toHaveFocus());
    expect(screen.getByRole('status')).toHaveTextContent('Marked as already owned.');
    expect(screen.getByRole('status')).not.toHaveTextContent(/not interested|dislike/i);

    deleteFeedback.mockRejectedValueOnce(new Error('Feedback could not be undone.'));
    await user.click(undo);

    await screen.findByRole('alert');
    await waitFor(() => expect(undo).toHaveFocus());
    expect(screen.getByRole('status')).toHaveTextContent('Marked as already owned.');
    expect(screen.queryByText('Review Record')).toBeNull();
  });

  it('returns focus to the feedback action that created the removed state', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ProductCard record={record} showReason surface="recommendations" />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: 'Already own' }));
    const undo = await screen.findByRole('button', { name: 'Undo' });
    await user.click(undo);

    const alreadyOwn = await screen.findByRole('button', { name: 'Already own' });
    await waitFor(() => expect(alreadyOwn).toHaveFocus());
  });

  it('renders at most two unique non-empty server reasons without score or weight fields', () => {
    render(
      <MemoryRouter>
        <ProductCard
          record={{
            ...record,
            recommendationReasons: [
              'Matches your Jazz preference.',
              '  ',
              'Matches your Jazz preference.',
              'Reflects records saved to your account.',
              'This third reason must not render.',
            ],
            recommendationScore: 0.91,
            componentWeights: { preference: 0.6, behavior: 0.4 },
          }}
          showReason
          surface="recommendations"
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('Matches your Jazz preference.')).toBeVisible();
    expect(screen.getByText('Reflects records saved to your account.')).toBeVisible();
    expect(screen.queryByText('This third reason must not render.')).toBeNull();
    expect(screen.queryByText('0.91')).toBeNull();
    expect(screen.queryByText('0.6')).toBeNull();
    expect(screen.queryByText('0.4')).toBeNull();
  });

});
