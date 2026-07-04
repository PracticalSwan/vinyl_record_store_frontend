// Same-origin post-auth return path. Anything that would escape the app
// (protocol-relative URLs, javascript: schemes, absolute foreign URLs) falls
// back to /account, so returnTo can never become an open redirect.
export function safeReturnTo(value) {
  if (!value) return '/account';
  try {
    const target = new URL(value, window.location.origin);
    return target.origin === window.location.origin
      ? `${target.pathname}${target.search}${target.hash}`
      : '/account';
  } catch {
    return '/account';
  }
}
