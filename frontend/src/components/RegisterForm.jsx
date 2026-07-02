import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerPatient, registerDoctor, registerAdmin } from '../api/auth';

const SPECIALIZATIONS = [
  'cardiology',
  'dermatology',
  'neurology',
  'pediatrics',
  'orthopedics',
  'general',
];

const ROLES = [
  { key: 'patient', label: 'Patient', description: 'Book appointments & view records' },
  { key: 'doctor', label: 'Doctor', description: 'Manage schedule & patients' },
];

const REGISTER_FN = {
  patient: registerPatient,
  doctor: registerDoctor,
};

export default function RegisterForm() {
  const [role, setRole] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const selectRole = (r) => {
    setRole(r);
    setForm({});
    setError('');
    setSuccess('');
  };

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await REGISTER_FN[role](form);
      setSuccess('Account created! Redirecting to sign in…');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      if (!err.response) {
        setError('Cannot reach the server. Make sure the backend is running on localhost:8000.');
      } else {
        const detail = err.response.data?.detail;
        if (Array.isArray(detail)) {
          setError(detail.map((d) => d.msg).join(', '));
        } else {
          setError(detail || `Server error ${err.response.status}`);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <h2 className="form-title">Create Account</h2>

      <div className="role-selector">
        {ROLES.map((r) => (
          <button
            key={r.key}
            type="button"
            className={`role-btn${role === r.key ? ' active' : ''}`}
            onClick={() => selectRole(r.key)}
          >
            <span className="role-label">Register as {r.label}</span>
            <span className="role-desc">{r.description}</span>
          </button>
        ))}
      </div>

      {role && (
        <form onSubmit={handleSubmit} noValidate>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">First Name</label>
              <input
                id="name"
                name="name"
                value={form.name || ''}
                onChange={handleChange}
                placeholder="John"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="surname">Last Name</label>
              <input
                id="surname"
                name="surname"
                value={form.surname || ''}
                onChange={handleChange}
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Email address</label>
            <input
              id="reg-email"
              type="email"
              name="email"
              value={form.email || ''}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">
              Password <span className="hint">(min. 8 characters)</span>
            </label>
            <input
              id="reg-password"
              type="password"
              name="password"
              value={form.password || ''}
              onChange={handleChange}
              placeholder="••••••••"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          {role === 'patient' && (
            <>
              <div className="form-group">
                <label htmlFor="telephone">Telephone</label>
                <input
                  id="telephone"
                  name="telephone"
                  value={form.telephone || ''}
                  onChange={handleChange}
                  placeholder="+381 60 123 4567"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="address">Address</label>
                <input
                  id="address"
                  name="address"
                  value={form.address || ''}
                  onChange={handleChange}
                  placeholder="Street, City"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="date_of_birth">Date of Birth</label>
                <input
                  id="date_of_birth"
                  type="date"
                  name="date_of_birth"
                  value={form.date_of_birth || ''}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          {role === 'doctor' && (
            <>
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  id="city"
                  name="city"
                  value={form.city || ''}
                  onChange={handleChange}
                  placeholder="Belgrade"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="specialization">Specialization</label>
                <select
                  id="specialization"
                  name="specialization"
                  value={form.specialization || ''}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select specialization…</option>
                  {SPECIALIZATIONS.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0) + s.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="hire_date">Hire Date</label>
                <input
                  id="hire_date"
                  type="date"
                  name="hire_date"
                  value={form.hire_date || ''}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading
              ? 'Registering…'
              : `Register as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
          </button>
        </form>
      )}

      <p className="auth-switch">
        Already have an account? <Link to="/login">Sign In</Link>
      </p>
    </div>
  );
}
