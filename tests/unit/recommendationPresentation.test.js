import { describe, expect, it } from 'vitest';
import { recommendationPresentation } from '../../src/lib/recommendationPresentation';

describe('recommendation presentation', () => {
  it.each([
    ['demo-profile', 'Curated showcase profile', 'Showcase profile'],
    ['anonymous-fallback', 'Anonymous catalog fallback', 'Anonymous fallback'],
    ['cold-start', 'Session-owned cold-start', 'Session-owned cold-start'],
    ['preference-profile', 'Saved preference profile', 'Saved preferences'],
  ])('preserves the existing %s mode copy', (mode, homeLabel, pageLabel) => {
    expect(recommendationPresentation(mode)).toMatchObject({ homeLabel, pageLabel });
  });

  it('describes behavior-profile without claiming passive tracking is required', () => {
    expect(recommendationPresentation('behavior-profile')).toEqual({
      homeLabel: 'Behavior profile',
      pageLabel: 'Behavior profile',
      intro: 'These results use activity and account signals available for this profile.',
    });
  });

  it('describes popularity as aggregate research evidence rather than personalized or recent activity', () => {
    const presentation = recommendationPresentation('popularity');
    expect(presentation.homeLabel).toBe('Research-rating popularity');
    expect(presentation.intro).toContain('aggregate research ratings dataset');
    expect(presentation.intro).toContain('not personalized');
    expect(presentation.intro).toContain('not personalized or based on recent storefront activity');
  });

  it('labels hybrid only for the backend hybrid mode', () => {
    expect(recommendationPresentation('personalized-hybrid')).toEqual({
      homeLabel: 'Personalized hybrid',
      pageLabel: 'Personalized hybrid',
      intro: 'These results are personalized from the preferences and account activity available for this profile.',
    });
    expect(recommendationPresentation('preference-profile').pageLabel).toBe('Saved preferences');
    expect(recommendationPresentation('behavior-profile').pageLabel).toBe('Behavior profile');
    expect(recommendationPresentation('popularity').pageLabel).toBe('Research-rating popularity');
  });
});
