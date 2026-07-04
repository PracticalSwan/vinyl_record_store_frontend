import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function AccountPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const signOut = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await auth.signOut();
      navigate('/', { replace: true });
    } catch (requestError) {
      setError(requestError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="account-page container">
      <section className="account-card" aria-labelledby="account-heading">
        <p className="auth-eyebrow">Authenticated session</p>
        <h1 id="account-heading">{auth.user.displayName || auth.user.username}</h1>
        <dl className="account-details">
          <div><dt>Username</dt><dd>{auth.user.username}</dd></div>
          <div><dt>Role</dt><dd>{auth.user.role}</dd></div>
          <div><dt>Preferences</dt><dd>{auth.user.onboardingComplete ? 'Completed' : 'Not completed'}</dd></div>
        </dl>
        <p className="account-note">Wishlist, cart, and rating pages remain guest demo state until the separate state-migration plan is implemented.</p>
        {error && <p className="form-error" role="alert">{error.message}</p>}
        <button className="btn btn-outline" type="button" onClick={signOut} disabled={submitting}>
          {submitting ? 'Signing out...' : 'Sign out'}
        </button>
      </section>
    </main>
  );
}
