import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../src/context/authContext';
import { CatalogProvider } from '../../src/context/CatalogProvider';
import { useCatalog } from '../../src/context/useCatalog';
import * as api from '../../src/lib/api';

vi.mock('../../src/lib/api', () => ({
  fetchMyRecommendations: vi.fn(),
  fetchShowcaseRecommendations: vi.fn(),
}));

const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
};

function response(title, mode = 'cold-start') {
  const requestId = `request-${title.toLowerCase().replace(/\s+/g, '-')}`;
  return {
    data: {
      mode,
      algorithmVersion: 'content-demo-v1',
      requestId,
      listId: `${requestId}:primary`,
      recommendationLogged: false,
      profileSummary: ['Test summary'],
      recommendations: [{
        product: { id: title.length, title, artist: 'Test Artist', genre: 'Jazz' },
        score: 1,
        reasons: ['Test reason.'],
        rank: 1,
        algorithmVersion: 'content-demo-v1',
      }],
    },
  };
}

function Probe() {
  const catalog = useCatalog();
  return (
    <>
      <output aria-label="Recommendation status">{catalog.recommendationStatus}</output>
      <output aria-label="Recommendation mode">{catalog.recommendationMode || 'none'}</output>
      <output aria-label="Recommendation title">{catalog.recommendations[0]?.title || 'none'}</output>
      <button type="button" onClick={catalog.reloadRecommendations}>Reload recommendations</button>
    </>
  );
}

function tree(auth) {
  return (
    <MemoryRouter initialEntries={['/recommendations']}>
      <AuthContext.Provider value={auth}>
        <CatalogProvider><Probe /></CatalogProvider>
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

describe('CatalogProvider recommendation identity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.fetchMyRecommendations.mockResolvedValue(response('Default result'));
  });

  it('waits for auth restoration before loading and then uses the session-owned endpoint', async () => {
    const view = render(tree({ status: 'loading', user: null }));
    await act(() => Promise.resolve());
    expect(api.fetchMyRecommendations).not.toHaveBeenCalled();

    view.rerender(tree({
      status: 'authenticated',
      user: { publicId: 'user-owner', role: 'customer' },
    }));
    await screen.findByText('Default result');
    expect(api.fetchMyRecommendations).toHaveBeenCalledWith(expect.objectContaining({
      anonymous: false,
      surface: 'recommendations',
      signal: expect.any(AbortSignal),
    }));
    expect(api.fetchShowcaseRecommendations).not.toHaveBeenCalled();
  });

  it('uses the same optional-session endpoint with anonymous headers for visitors', async () => {
    render(tree({ status: 'anonymous', user: null }));
    await screen.findByText('Default result');
    expect(api.fetchMyRecommendations).toHaveBeenCalledWith(expect.objectContaining({
      anonymous: true,
      surface: 'recommendations',
    }));
  });

  it('aborts an anonymous request and ignores its stale response after sign-in', async () => {
    const anonymousRequest = deferred();
    const customerRequest = deferred();
    api.fetchMyRecommendations
      .mockReturnValueOnce(anonymousRequest.promise)
      .mockReturnValueOnce(customerRequest.promise);
    const view = render(tree({ status: 'anonymous', user: null }));
    await waitFor(() => expect(api.fetchMyRecommendations).toHaveBeenCalledTimes(1));
    const anonymousSignal = api.fetchMyRecommendations.mock.calls[0][0].signal;

    view.rerender(tree({
      status: 'authenticated',
      user: { publicId: 'user-owner', role: 'customer' },
    }));
    await waitFor(() => expect(api.fetchMyRecommendations).toHaveBeenCalledTimes(2));
    expect(anonymousSignal.aborted).toBe(true);
    await act(async () => customerRequest.resolve(response('Customer result')));
    await screen.findByText('Customer result');
    await act(async () => anonymousRequest.resolve(response('Stale anonymous result', 'anonymous-fallback')));
    expect(screen.getByLabelText('Recommendation title')).toHaveTextContent('Customer result');
  });

  it('clears signed-in results immediately on sign-out and loads anonymous fallback', async () => {
    api.fetchMyRecommendations.mockResolvedValueOnce(response('Customer result'));
    const view = render(tree({
      status: 'authenticated',
      user: { publicId: 'user-owner', role: 'customer' },
    }));
    await screen.findByText('Customer result');

    const anonymousRequest = deferred();
    api.fetchMyRecommendations.mockReturnValueOnce(anonymousRequest.promise);
    view.rerender(tree({ status: 'anonymous', user: null }));
    expect(screen.getByLabelText('Recommendation status')).toHaveTextContent('loading');
    expect(screen.getByLabelText('Recommendation title')).toHaveTextContent('none');
    await act(async () => anonymousRequest.resolve(response('Anonymous result', 'anonymous-fallback')));
    await screen.findByText('Anonymous result');
    expect(screen.getByLabelText('Recommendation mode')).toHaveTextContent('anonymous-fallback');
  });

  it('keeps endpoint failures recoverable through an explicit retry', async () => {
    api.fetchMyRecommendations
      .mockRejectedValueOnce(new Error('Recommendation backend unavailable'))
      .mockResolvedValueOnce(response('Recovered result'));
    const user = userEvent.setup();
    render(tree({ status: 'anonymous', user: null }));
    await waitFor(() => expect(screen.getByLabelText('Recommendation status')).toHaveTextContent('error'));
    await user.click(screen.getByRole('button', { name: 'Reload recommendations' }));
    await screen.findByText('Recovered result');
  });
});
