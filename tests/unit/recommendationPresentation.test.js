import { describe, expect, it } from 'vitest';
import { recommendationPresentation } from '../../src/lib/recommendationPresentation';

describe('recommendation presentation', () => {
  it.each([
    ['demo-profile', 'Featured picks', 'Featured picks', 'Explore a curated selection of records chosen for discovery.'],
    ['anonymous-fallback', 'Discover more', 'Discover more', 'Explore a selection from the current catalog. Sign in and save your preferences to make future picks more personal.'],
    ['cold-start', 'Discover more', 'Getting to know your taste', 'Browse the collection and save your preferences to make these picks more personal.'],
    ['preference-profile', 'Picked for you', 'Based on your preferences', 'These picks reflect the genres, artists, and formats you saved.'],
    ['behavior-profile', 'Picked for you', 'Based on your activity', 'These picks reflect the ratings, saved records, and shopping activity available for your account.'],
    ['popularity', 'Popular picks', 'Popular picks', 'Explore records that stand out in listener ratings.'],
    ['personalized-hybrid', 'Picked for you', 'Personalized picks', 'These picks combine your saved preferences with your account activity.'],
  ])('uses shopper-facing copy for %s', (mode, homeLabel, pageLabel, intro) => {
    expect(recommendationPresentation(mode)).toEqual({ homeLabel, pageLabel, intro });
  });

  it('does not expose engineering terminology in shopper-facing mode copy', () => {
    const forbidden = /research|dataset|backend|cold-start|fallback|ranking mode|showcase profile|source-derived/i;
    for (const mode of [
      'demo-profile',
      'anonymous-fallback',
      'cold-start',
      'preference-profile',
      'behavior-profile',
      'popularity',
      'personalized-hybrid',
    ]) {
      const presentation = recommendationPresentation(mode);
      expect(`${presentation.homeLabel} ${presentation.pageLabel} ${presentation.intro}`).not.toMatch(forbidden);
    }
  });

  it('uses a safe store-facing default for unknown modes', () => {
    expect(recommendationPresentation('unknown-mode')).toEqual({
      homeLabel: 'Recommended records',
      pageLabel: 'Recommended records',
      intro: 'Explore records selected for this list.',
    });
  });
});
