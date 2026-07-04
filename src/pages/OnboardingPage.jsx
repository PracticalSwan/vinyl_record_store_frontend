import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PreferencesForm from '../components/preferences/PreferencesForm';
import { useAuth } from '../context/useAuth';

export default function OnboardingPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const save = async (preferences) => {
    setSubmitting(true);
    setError(null);
    try {
      await auth.savePreferences(preferences);
      navigate('/account', { replace: true });
    } catch (requestError) {
      setError(requestError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="preferences-page container">
      <section className="preferences-card" aria-labelledby="onboarding-heading">
        <p className="auth-eyebrow">Optional profile setup</p>
        <h1 id="onboarding-heading">Tell us what belongs in your crate</h1>
        <p className="auth-intro">These preferences are saved for future recommendations. The current demo algorithm does not use them yet.</p>
        {auth.user.seeded && <p className="account-note">This shared classroom account keeps preferences only for the current session.</p>}
        <PreferencesForm initial={auth.user.preferences} onSave={save} onSkip={() => navigate('/account', { replace: true })} wizard submitting={submitting} requestError={error} />
      </section>
    </main>
  );
}

