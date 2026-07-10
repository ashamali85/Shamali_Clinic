'use client';

import { useActionState } from 'react';
import { loginAction } from '@/lib/actions';
import { SubmitButton } from '@/components/SubmitButton';
import { StomachLogo } from '@/components/StomachLogo';

export default function LoginPage() {
  const [state, formAction] = useActionState(loginAction, null);

  return (
    <main className="container-narrow" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <div style={{ width: '100%' }}>
        <div className="center" style={{ marginBottom: 22 }}>
          <span className="brand-lock">
            <StomachLogo variant="light" className="logo-tile logo-tile-login" />
            <span>
              <span className="t">Dr. Shamali Gastroenterology Clinic</span>
              <br />
              <span className="s">Patient Registry</span>
            </span>
          </span>
        </div>

        <div className="card card-pad-lg">
          <h1 className="center" style={{ marginBottom: 4 }}>Welcome back</h1>
          <p className="muted center" style={{ marginBottom: 20 }}>
            Sign in to access the patient records.
          </p>

          {state?.error && <div className="alert alert-error">{state.error}</div>}

          <form action={formAction}>
            <div className="field">
              <label htmlFor="username">Username</label>
              <input id="username" name="username" autoComplete="username" required />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" autoComplete="current-password" required />
            </div>
            <SubmitButton className="btn btn-primary btn-block mt-2" pendingText="Signing in…">
              Sign in
            </SubmitButton>
          </form>

          <p className="muted center small mt-4">
            Demo credentials — <b>doctor</b> / <b>clinic123</b>
          </p>
        </div>
      </div>
    </main>
  );
}
