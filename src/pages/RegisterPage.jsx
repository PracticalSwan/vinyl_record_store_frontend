import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { postAuthDestination } from '../lib/returnTo';

export default function RegisterPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ username: '', displayName: '', password: '' });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (auth.status === 'authenticated') return <Navigate to={postAuthDestination(auth.user, searchParams.get('returnTo'))} replace />;

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };
  const submit = async (event) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await auth.signUp({
        username: form.username,
        password: form.password,
        displayName: form.displayName.trim() || null,
      });
      navigate(postAuthDestination(user, searchParams.get('returnTo')), { replace: true });
    } catch (requestError) {
      setError(requestError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page container">
      <section className="auth-card" aria-labelledby="register-heading">
        <p className="auth-eyebrow">Customer registration</p>
        <h1 id="register-heading">Create an account</h1>
        <p className="auth-intro">Create your Groovehaus account to save records, manage your cart, rate releases, and set listening preferences.</p>
        <form className="auth-form" onSubmit={submit}>
          <label htmlFor="register-username">Username</label>
          <input id="register-username" autoComplete="username" required minLength={3} maxLength={64} pattern="[A-Za-z0-9_-]+" value={form.username} onChange={update('username')} />
          <label htmlFor="register-display-name">Display name <span>(optional)</span></label>
          <input id="register-display-name" autoComplete="name" maxLength={100} value={form.displayName} onChange={update('displayName')} />
          <label htmlFor="register-password">Password</label>
          <input id="register-password" type="password" autoComplete="new-password" required minLength={10} maxLength={128} value={form.password} onChange={update('password')} />
          <p className="field-help">Use 10 to 128 characters.</p>
          {error && <p className="form-error" role="alert">{error.message}</p>}
          <button className="btn btn-accent auth-submit" type="submit" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Create customer account'}
          </button>
        </form>
        <p className="auth-switch">Already registered? <Link to="/login">Sign in</Link></p>
      </section>
    </main>
  );
}
