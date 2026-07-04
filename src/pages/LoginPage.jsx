import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { postAuthDestination } from '../lib/returnTo';

export default function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (auth.status === 'authenticated') return <Navigate to={postAuthDestination(auth.user, searchParams.get('returnTo'))} replace />;

  const submit = async (event) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await auth.signIn(form);
      navigate(postAuthDestination(user, searchParams.get('returnTo')), { replace: true });
    } catch (requestError) {
      setError(requestError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page container">
      <section className="auth-card" aria-labelledby="login-heading">
        <p className="auth-eyebrow">Account access</p>
        <h1 id="login-heading">Sign in to Groovehaus</h1>
        <p className="auth-intro">Use a classroom account or a registered customer account.</p>
        <form className="auth-form" onSubmit={submit}>
          <label htmlFor="login-username">Username</label>
          <input
            id="login-username"
            name="username"
            autoComplete="username"
            required
            minLength={3}
            maxLength={64}
            value={form.username}
            onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
          />
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            minLength={10}
            maxLength={128}
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          />
          {error && <p className="form-error" role="alert">{error.message}</p>}
          <button className="btn btn-accent auth-submit" type="submit" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="auth-switch">New customer? <Link to="/register">Create an account</Link></p>
      </section>
    </main>
  );
}
