import { useState } from 'react';
import PreferencesForm from '../components/preferences/PreferencesForm';
import TrackingPreference from '../components/TrackingPreference';
import { useAuth } from '../context/useAuth';
import { emptyPreferences, toPreferenceRequest } from '../lib/preferences';

export default function ProfilePreferencesPage() {
  const auth = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const save = async (preferences) => {
    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      await auth.savePreferences(preferences);
      setMessage(auth.user.seeded ? 'Preferences saved for this session.' : 'Preferences saved to your account.');
    } catch (requestError) {
      setError(requestError);
    } finally {
      setSubmitting(false);
    }
  };

  const clear = async () => {
    const result = toPreferenceRequest(emptyPreferences(), { completed: false });
    await save(result.request);
  };

  return (
    <main className="preferences-page container">
      <section className="preferences-card" aria-labelledby="preferences-heading">
        <p className="auth-eyebrow">Account preferences</p>
        <h1 id="preferences-heading">Edit recommendation preferences</h1>
        <p className="auth-intro">Saving these choices does not change the current demo-profile or cold-start ranking.</p>
        {message && <p className="form-success" role="status">{message}</p>}
        <PreferencesForm initial={auth.user.preferences} onSave={save} onClear={clear} submitting={submitting} requestError={error} />
        <TrackingPreference />
      </section>
    </main>
  );
}
