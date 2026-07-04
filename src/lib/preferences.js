export const GENRES = ['Jazz', 'Rock', 'Soul', 'Electronic', 'Classical', 'Folk', 'Hip-Hop', 'Blues'];
export const CONDITIONS = ['M', 'NM', 'VG+', 'VG', 'G'];
export const FORMATS = ['LP, 33 1/3 rpm', '2xLP', '3xLP', '2xLP + EP'];

export const emptyPreferences = () => ({
  favoriteGenres: [],
  dislikedGenres: [],
  favoriteArtists: [],
  budget: { min: '', max: '' },
  conditions: [],
  formats: [],
});

const unique = (values) => [...new Set(values)];
const money = (value) => value === null || value === undefined || value === '' ? '' : String(value);

export function normalizePreferences(value = {}) {
  return {
    favoriteGenres: unique(value.favoriteGenres || []),
    dislikedGenres: unique(value.dislikedGenres || []),
    favoriteArtists: unique((value.favoriteArtists || []).map((artist) => String(artist).trim()).filter(Boolean)),
    budget: { min: money(value.budget?.min), max: money(value.budget?.max) },
    conditions: unique(value.conditions || []),
    formats: unique(value.formats || []),
  };
}

function controlled(values, allowed, name, label, errors) {
  if (values.length > 5 || values.some((value) => !allowed.includes(value))) {
    errors[name] = `Choose at most five supported ${label}.`;
  }
}

export function validatePreferences(value, { completed = true } = {}) {
  const preferences = normalizePreferences(value);
  const errors = {};
  controlled(preferences.favoriteGenres, GENRES, 'favoriteGenres', 'favorite genres', errors);
  controlled(preferences.dislikedGenres, GENRES, 'dislikedGenres', 'disliked genres', errors);
  controlled(preferences.conditions, CONDITIONS, 'conditions', 'conditions', errors);
  controlled(preferences.formats, FORMATS, 'formats', 'formats', errors);
  if (completed && preferences.favoriteGenres.length === 0) {
    errors.favoriteGenres = 'Choose at least one favorite genre to complete onboarding.';
  }
  if (preferences.favoriteGenres.some((genre) => preferences.dislikedGenres.includes(genre))) {
    errors.dislikedGenres = 'Favorite and disliked genres cannot overlap.';
  }
  if (preferences.favoriteArtists.length > 5 || preferences.favoriteArtists.some((artist) => artist.length > 200)) {
    errors.favoriteArtists = 'Enter at most five artists, each under 200 characters.';
  }
  const min = preferences.budget.min === '' ? null : Number(preferences.budget.min);
  const max = preferences.budget.max === '' ? null : Number(preferences.budget.max);
  if ((min !== null && (!Number.isFinite(min) || min < 0)) || (max !== null && (!Number.isFinite(max) || max < 0))) {
    errors.budget = 'Budget values must be non-negative numbers.';
  } else if (min !== null && max !== null && min > max) {
    errors.budget = 'Minimum budget cannot exceed maximum budget.';
  }
  return { preferences, errors, valid: Object.keys(errors).length === 0 };
}

export function toPreferenceRequest(value, { completed = true } = {}) {
  const result = validatePreferences(value, { completed });
  if (!result.valid) return result;
  return {
    ...result,
    request: {
      ...result.preferences,
      budget: {
        min: result.preferences.budget.min === '' ? null : Number(result.preferences.budget.min),
        max: result.preferences.budget.max === '' ? null : Number(result.preferences.budget.max),
      },
      completed,
      schemaVersion: 1,
    },
  };
}
