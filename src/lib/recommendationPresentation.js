const MODE_PRESENTATION = {
  'demo-profile': {
    homeLabel: 'Featured picks',
    pageLabel: 'Featured picks',
    intro: 'Explore a curated selection of records chosen for discovery.',
  },
  'anonymous-fallback': {
    homeLabel: 'Discover more',
    pageLabel: 'Discover more',
    intro: 'Explore a selection from the current catalog. Sign in and save your preferences to make future picks more personal.',
  },
  'cold-start': {
    homeLabel: 'Discover more',
    pageLabel: 'Getting to know your taste',
    intro: 'Browse the collection and save your preferences to make these picks more personal.',
  },
  'preference-profile': {
    homeLabel: 'Picked for you',
    pageLabel: 'Based on your preferences',
    intro: 'These picks reflect the genres, artists, and formats you saved.',
  },
  'behavior-profile': {
    homeLabel: 'Picked for you',
    pageLabel: 'Based on your activity',
    intro: 'These picks reflect the ratings, saved records, and shopping activity available for your account.',
  },
  popularity: {
    homeLabel: 'Popular picks',
    pageLabel: 'Popular picks',
    intro: 'Explore records that stand out in listener ratings.',
  },
  'personalized-hybrid': {
    homeLabel: 'Picked for you',
    pageLabel: 'Personalized picks',
    intro: 'These picks combine your saved preferences with your account activity.',
  },
};

const DEFAULT_PRESENTATION = {
  homeLabel: 'Recommended records',
  pageLabel: 'Recommended records',
  intro: 'Explore records selected for this list.',
};

export function recommendationPresentation(mode) {
  return MODE_PRESENTATION[mode] || DEFAULT_PRESENTATION;
}
