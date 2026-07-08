'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'same-origin',
        cache: 'no-store',
        body: JSON.stringify({ password }),
      });

      const data = (await response.json().catch(() => null)) as { success?: boolean; message?: string } | null;

      if (!response.ok || !data?.success) {
        setError(data?.message || 'Login failed.');
        return;
      }

      window.location.href = '/admin';
    } catch {
      setError('Could not sign in. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <p>Rotary Club of Kitende Breeze</p>
        <h1>Admin sign in</h1>
        <span>Enter the admin password to view attendance, search records, paginate tables, and export CSV files.</span>

        <form onSubmit={handleSubmit}>
          <label>
            Admin password
            <input
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError('');
              }}
              autoComplete="current-password"
              autoFocus
              required
            />
          </label>

          {error && <strong className="admin-login-error">{error}</strong>}

          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <Link href="/">Back to guest check-in</Link>
      </section>
    </main>
  );
}
