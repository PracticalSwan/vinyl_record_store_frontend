import { useEffect, useRef, useState } from 'react';
import { useBlocker, useNavigate } from 'react-router-dom';
import PreferencesForm from '../components/preferences/PreferencesForm';
import TrackingPreference from '../components/TrackingPreference';
import { useAuth } from '../context/useAuth';
import { normalizePreferences, preferencesEqual } from '../lib/preferences';

function UnsavedChangesDialog({ open, submitting, onSave, onDiscard, onCancel }) {
  const dialogRef = useRef(null);
  const cancelRef = useRef(onCancel);
  const submittingRef = useRef(submitting);

  useEffect(() => {
    cancelRef.current = onCancel;
    submittingRef.current = submitting;
  }, [onCancel, submitting]);

  useEffect(() => {
    if (!open) return undefined;
    const previouslyFocused = document.activeElement;
    const dialog = dialogRef.current;
    const focusable = () => [...dialog.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
    )];
    focusable()[0]?.focus();
    const containFocus = (event) => {
      if (event.key === 'Escape' && !submittingRef.current) {
        event.preventDefault();
        cancelRef.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const elements = focusable();
      if (elements.length === 0) {
        event.preventDefault();
        return;
      }
      const first = elements[0];
      const last = elements[elements.length - 1];
      const outside = !dialog.contains(document.activeElement);
      if (event.shiftKey && (outside || document.activeElement === first)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (outside || document.activeElement === last)) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', containFocus);
    return () => {
      document.removeEventListener('keydown', containFocus);
      if (previouslyFocused?.isConnected && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus();
      }
    };
  }, [open]);

  if (!open) return null;
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="unsaved-title" aria-describedby="unsaved-description">
      <div className="modal" ref={dialogRef}>
        <h2 id="unsaved-title">Unsaved preference changes</h2>
        <p className="modal-body" id="unsaved-description">Save your current choices before leaving this page, or discard them and restore the last saved preferences.</p>
        <div className="modal-actions preference-dialog-actions">
          <button className="btn btn-ghost" type="button" onClick={onCancel} disabled={submitting}>Keep editing</button>
          <button className="btn btn-outline" type="button" onClick={onDiscard} disabled={submitting}>Discard changes</button>
          <button className="btn btn-accent" type="submit" form="profile-preferences-form" disabled={submitting} onClick={onSave}>
            {submitting ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePreferencesPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const initial = normalizePreferences(auth.user.preferences);
  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [formVersion, setFormVersion] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const leaveAfterSave = useRef(false);
  const dirty = !preferencesEqual(saved, draft);
  const blocker = useBlocker(({ currentLocation, nextLocation }) => (
    dirty && (
      currentLocation.pathname !== nextLocation.pathname
      || currentLocation.search !== nextLocation.search
      || currentLocation.hash !== nextLocation.hash
    )
  ));

  useEffect(() => {
    if (!dirty) return undefined;
    const warnBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warnBeforeUnload);
    return () => window.removeEventListener('beforeunload', warnBeforeUnload);
  }, [dirty]);

  const save = async (preferences) => {
    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      const user = await auth.savePreferences(preferences);
      const next = normalizePreferences(user.preferences);
      setSaved(next);
      setDraft(next);
      setFormVersion((value) => value + 1);
      setMessage('Preferences saved to your account.');
      if (leaveAfterSave.current) {
        leaveAfterSave.current = false;
        if (blocker.state === 'blocked') blocker.proceed();
      }
    } catch (requestError) {
      setError(requestError);
      leaveAfterSave.current = false;
      if (blocker.state === 'blocked') blocker.reset();
    } finally {
      setSubmitting(false);
    }
  };

  const backToAccount = () => {
    navigate('/account');
  };

  const discardAndLeave = () => {
    leaveAfterSave.current = false;
    setDraft(saved);
    setFormVersion((value) => value + 1);
    if (blocker.state === 'blocked') blocker.proceed();
    else navigate('/account');
  };

  return (
    <main className="preferences-page container">
      <section className="preferences-card" aria-labelledby="preferences-heading">
        <p className="auth-eyebrow">Account preferences</p>
        <h1 id="preferences-heading">Edit recommendation preferences</h1>
        <p className="auth-intro">Choose the genres, artists, formats, condition, and budget range that fit your collection.</p>
        <button className="btn btn-ghost preferences-back" type="button" onClick={backToAccount}>Back to account</button>
        {dirty && <p className="form-unsaved" role="status">You have unsaved changes.</p>}
        {message && <p className="form-success" role="status">{message}</p>}
        <PreferencesForm
          key={formVersion}
          formId="profile-preferences-form"
          initial={saved}
          onSave={save}
          onDraftChange={(next) => {
            setDraft(normalizePreferences(next));
            setMessage(null);
          }}
          onValidationError={() => {
            leaveAfterSave.current = false;
            if (blocker.state === 'blocked') blocker.reset();
          }}
          showClear
          submitting={submitting}
          requestError={error}
        />
        <TrackingPreference />
      </section>
      <UnsavedChangesDialog
        open={blocker.state === 'blocked'}
        submitting={submitting}
        onSave={() => {
          leaveAfterSave.current = true;
        }}
        onDiscard={discardAndLeave}
        onCancel={() => {
          leaveAfterSave.current = false;
          if (blocker.state === 'blocked') blocker.reset();
        }}
      />
    </main>
  );
}
