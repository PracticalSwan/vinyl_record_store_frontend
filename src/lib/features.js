function booleanFeature(value, defaultValue) {
  if (value === undefined || value === null || String(value).trim() === '') {
    return defaultValue;
  }
  return ['1', 'true', 'yes', 'on'].includes(String(value).trim().toLowerCase());
}

export function personalizationMeEndpointEnabled(environment = import.meta.env) {
  return booleanFeature(environment.VITE_PERS_ME_ENDPOINT, true);
}

export function personalizationProfileDomainEnabled(environment = import.meta.env) {
  return booleanFeature(environment.VITE_PERS_PROFILE_DOMAIN, false);
}

export function personalizationNegativeFeedbackEnabled(environment = import.meta.env) {
  return booleanFeature(environment.VITE_PERS_NEGATIVE_FEEDBACK, false);
}
