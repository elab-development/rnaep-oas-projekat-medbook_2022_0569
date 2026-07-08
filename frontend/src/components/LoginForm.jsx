import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as loginUser } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { sanitizeObject } from '../utils/sanitize';

export default function LoginForm() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginUser(sanitizeObject(form));
      const token = res.data.access_token;
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
      const payload = JSON.parse(atob(padded));
      const role = payload?.role;
      const id = payload?.sub ? parseInt(payload.sub) : null;
      login(token, { email: form.email, role, id });
      if (role === 'patient') navigate('/patient');
      else if (role === 'doctor') navigate('/doctor');
      else if (role === 'admin') navigate('/admin');
      else navigate('/login');
    } catch (err) {
      if (!err.response) {
        setError('Cannot reach the server. Make sure the backend is running on localhost:8000.');
      } else {
        setError(err.response.data?.detail || `Server error ${err.response.status}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <h2 className="form-title">Sign In</h2>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-group">
        <label htmlFor="email">Email address</label>
        <input
          id="email"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="••••••••"
          required
          autoComplete="current-password"
        />
      </div>

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Signing in…' : 'Sign In'}
      </button>

      <p className="auth-switch">
        Don&apos;t have an account?{' '}
        <Link to="/register">Create one</Link>
      </p>
    </form>
  );
}
