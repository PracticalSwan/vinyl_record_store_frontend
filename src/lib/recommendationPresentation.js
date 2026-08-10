const MODE_PRESENTATION = {
  'demo-profile': {
    homeLabel: 'Curated showcase profile',
    pageLabel: 'Showcase profile',
    intro: 'These explainable results use a curated showcase profile rather than a signed-in customer.',
  },
  'anonymous-fallback': {
    homeLabel: 'Anonymous catalog fallback',
    pageLabel: 'Anonymous fallback',
    intro: 'No customer session is active, so these are catalog-based fallback suggestions without account history.',
  },
  'cold-start': {
    homeLabel: 'Session-owned cold-start',
    pageLabel: 'Session-owned cold-start',
    intro: 'This request is owned by the signed-in session, but the preference-profile branch is disabled or has no applicable signal, so ranking remains cold-start.',
  },
  'preference-profile': {
    homeLabel: 'Saved preference profile',
    pageLabel: 'Saved preferences',
    intro: 'These results use the preferences you saved for this account.',
  },
  'behavior-profile': {
    homeLabel: 'Behavior profile',
    pageLabel: 'Behavior profile',
    intro: 'These results use activity and account signals available for this profile.',
  },
  popularity: {
    homeLabel: 'Research-rating popularity',
    pageLabel: 'Research-rating popularity',
    intro: 'These results are popular in the aggregate research ratings dataset; they are not personalized or based on recent storefront activity.',
  },
  'personalized-hybrid': {
    homeLabel: 'Personalized hybrid',
    pageLabel: 'Personalized hybrid',
    intro: 'These results are personalized from the preferences and account activity available for this profile.',
  },
};

const DEFAULT_PRESENTATION = {
  homeLabel: 'Explainable ranked suggestions',
  pageLabel: 'Current ranking mode',
  intro: 'These results use the active backend ranking mode and its item-level explanations.',
};

export function recommendationPresentation(mode) {
  return MODE_PRESENTATION[mode] || DEFAULT_PRESENTATION;
}
