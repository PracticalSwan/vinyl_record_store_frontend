import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useProductQuery } from '../../src/hooks/useRemoteProducts';

const query = (q) => ({
  q, page: 1, limit: 24, genres: [], eras: [], conditions: [],
  minPrice: null, maxPrice: null, inStock: false, sort: 'newest',
});
const response = (title) => ({
  ok: true,
  status: 200,
  json: vi.fn().mockResolvedValue({
    data: { items: title ? [{ id: 1, title }] : [] },
    meta: { page: 1, limit: 24, total: title ? 1 : 0, totalPages: title ? 1 : 0, facets: {} },
  }),
});
const failure = {
  ok: false,
  status: 503,
  json: vi.fn().mockResolvedValue({
    error: { code: 'PERSISTENCE_UNAVAILABLE', message: 'Catalog unavailable.' },
  }),
};
const deferred = () => {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
};

function Harness({ search }) {
  const state = useProductQuery(query(search));
  return <output aria-label="Query state">{state.status}:{state.items[0]?.title || 'none'}</output>;
}

afterEach(() => vi.unstubAllGlobals());

describe('useProductQuery', () => {
  it('ignores stale responses even when the transport ignores abort', async () => {
    const first = deferred();
    const second = deferred();
    vi.stubGlobal('fetch', vi.fn()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise));
    const view = render(<Harness search="first" />);
    view.rerender(<Harness search="second" />);
    second.resolve(response('Second result'));
    await waitFor(() => expect(screen.getByLabelText('Query state')).toHaveTextContent('success:Second result'));
    first.resolve(response('Stale result'));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(screen.getByLabelText('Query state')).toHaveTextContent('success:Second result');
  });

  it('distinguishes an empty result set', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response(null)));
    render(<Harness search="missing" />);
    await waitFor(() => expect(screen.getByLabelText('Query state')).toHaveTextContent('empty:none'));
  });

  it('clears prior results when a newer query fails', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(response('Prior result'))
      .mockResolvedValueOnce(failure));
    const view = render(<Harness search="first" />);
    await waitFor(() => expect(screen.getByLabelText('Query state')).toHaveTextContent('success:Prior result'));
    view.rerender(<Harness search="failed" />);
    await waitFor(() => expect(screen.getByLabelText('Query state')).toHaveTextContent('error:none'));
  });
});
