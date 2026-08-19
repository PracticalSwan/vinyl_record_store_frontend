import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import ProductCard from '../../src/components/ProductCard';

vi.mock('../../src/context/useStore', () => ({ useStore: () => ({ wishlist: [], toggleWishlist: vi.fn(), isPending: () => false }) }));
vi.mock('../../src/context/useTracking', () => ({ useTracking: () => ({ track: vi.fn() }) }));
vi.mock('../../src/context/useAuth', () => ({ useAuth: () => ({ status: 'anonymous', user: null }) }));
vi.mock('../../src/lib/features', () => ({
  personalizationMeEndpointEnabled: () => true,
  personalizationProfileDomainEnabled: () => true,
  personalizationNegativeFeedbackEnabled: () => true,
}));
vi.mock('../../src/components/ProductImage', () => ({ default: () => <div data-testid="product-image" /> }));

describe('ProductCard research release distinction', () => {
  it('shows the source label on research records so same-title editions remain distinguishable', () => {
    render(<MemoryRouter><ProductCard record={{ id: 1, title: 'Ordinary Man', artist: 'Ozzy Osbourne', genre: 'Rock', editionReleaseYear: 2020, label: 'Epic Records', datasetKey: 'dataset-v3', catalogMode: 'research-only' }} /></MemoryRouter>);
    expect(screen.getByText('Epic Records')).toBeVisible();
  });

  it('does not add a label badge to commerce preview cards', () => {
    render(<MemoryRouter><ProductCard record={{ id: 2, title: 'Store Record', artist: 'Artist', genre: 'Rock', year: 2020, label: 'Store Label', price: 20, currency: 'USD', stock: 'in' }} /></MemoryRouter>);
    expect(screen.queryByText('Store Label')).toBeNull();
  });
});
describe('ProductCard missing research metadata', () => {
  it('does not invent a label badge when the source has no label', () => {
    render(<MemoryRouter><ProductCard record={{ id: 3, title: 'Piano & a Microphone 1983', artist: 'Prince', genre: 'Pop', datasetKey: 'dataset-v3', catalogMode: 'research-only' }} /></MemoryRouter>);
    expect(screen.queryByText('Label unknown')).toBeNull();
  });
});
