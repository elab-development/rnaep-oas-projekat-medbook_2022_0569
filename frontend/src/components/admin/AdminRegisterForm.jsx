import { useState } from 'react';
import { registerAdmin } from '../../api/auth';

export default function AdminRegisterForm({ onCreated }) {
  const [form, setForm] = useState({ name: '', surname: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await registerAdmin(form);
      setSuccess(`Admin ${form.name} ${form.surname} created successfully.`);
      setForm({ name: '', surname: '', email: '', password: '' });
      onCreated?.();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create admin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="schedule-card" style={{ maxWidth: 480 }}>
      <h3 className="schedule-card-title">Create New Admin</h3>

      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{success}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-row">
          <div className="form-group">
            <label>First Name</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="John" required />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input name="surname" value={form.surname} onChange={handleChange} placeholder="Doe" required />
          </div>
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="admin@example.com" required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" required minLength={8} />
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Creating…' : 'Create Admin'}
        </button>
      </form>
    </div>
  );
}
