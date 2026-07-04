import { describe, expect, it } from 'vitest';
import { emptyPreferences, toPreferenceRequest, validatePreferences } from '../../src/lib/preferences';

describe('preferences', () => {
  it('requires a favorite genre only when onboarding is completed', () => {
    expect(validatePreferences(emptyPreferences(), { completed: true })).toMatchObject({
      valid: false,
      errors: { favoriteGenres: expect.any(String) },
    });
    expect(toPreferenceRequest(emptyPreferences(), { completed: false })).toMatchObject({
      valid: true,
      request: { completed: false, schemaVersion: 1 },
    });
  });

  it('rejects overlapping genres and inverted budgets', () => {
    const result = validatePreferences({
      ...emptyPreferences(),
      favoriteGenres: ['Jazz'],
      dislikedGenres: ['Jazz'],
      budget: { min: '100', max: '20' },
    });
    expect(result.errors).toMatchObject({
      dislikedGenres: expect.any(String),
      budget: expect.any(String),
    });
  });

  it('maps valid form strings to the bounded backend contract', () => {
    expect(toPreferenceRequest({
      ...emptyPreferences(),
      favoriteGenres: ['Jazz'],
      favoriteArtists: ['Miles Davis'],
      budget: { min: '10.50', max: '80' },
      conditions: ['NM'],
      formats: ['LP, 33 1/3 rpm'],
    }).request).toEqual({
      favoriteGenres: ['Jazz'],
      dislikedGenres: [],
      favoriteArtists: ['Miles Davis'],
      budget: { min: 10.5, max: 80 },
      conditions: ['NM'],
      formats: ['LP, 33 1/3 rpm'],
      completed: true,
      schemaVersion: 1,
    });
  });
});
