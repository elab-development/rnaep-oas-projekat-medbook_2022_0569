import { useState, useEffect } from 'react';
import { getMyDoctorProfile, updateDoctorProfile } from '../../api/users';

const SPECIALIZATIONS = ['cardiology', 'dermatology', 'neurology', 'pediatrics', 'orthopedics', 'general'];

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const fmt = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

export default function DoctorProfile() {
  const [doctor, setDoctor] = useState(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ city: '', specialization: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyDoctorProfile()
      .then((data) => {
        setDoctor(data);
        setDraft({ city: data.city, specialization: data.specialization });
      })
      .catch(() => setError('Failed to load profile.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      await updateDoctorProfile(draft.city, draft.specialization);
      setDoctor((prev) => ({ ...prev, ...draft }));
      setEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to update profile.');
    }
  };

  const handleCancel = () => {
    setDraft({ city: doctor.city, specialization: doctor.specialization });
    setEditing(false);
    setError('');
  };

  if (loading) return <p className="empty-state">Loading profile…</p>;
  if (!doctor) return <div className="alert alert-error">{error || 'Profile not found.'}</div>;

  return (
    <div className="profile-card" style={{ maxWidth: 680 }}>
      <div className="profile-header">
        <div className="profile-avatar">
          {doctor.name[0]}{doctor.surname[0]}
        </div>
        <div className="profile-identity">
          <h3>Dr. {doctor.name} {doctor.surname}</h3>
          <span className="profile-email">{doctor.email}</span>
          <span className="badge badge-teal">Doctor</span>
        </div>
      </div>

      {success && <div className="alert alert-success" style={{ margin: '0 2rem 1rem' }}>{success}</div>}
      {error && <div className="alert alert-error" style={{ margin: '0 2rem 1rem' }}>{error}</div>}

      <div className="info-grid">
        <div className="info-item">
          <span className="info-label">Specialization</span>
          {editing ? (
            <select
              className="info-edit-input"
              value={draft.specialization}
              onChange={(e) => setDraft((p) => ({ ...p, specialization: e.target.value }))}
            >
              {SPECIALIZATIONS.map((s) => (
                <option key={s} value={s}>{cap(s)}</option>
              ))}
            </select>
          ) : (
            <span className="info-value">{cap(doctor.specialization)}</span>
          )}
        </div>

        <div className="info-item">
          <span className="info-label">City</span>
          {editing ? (
            <input
              className="info-edit-input"
              value={draft.city}
              onChange={(e) => setDraft((p) => ({ ...p, city: e.target.value }))}
            />
          ) : (
            <span className="info-value">{doctor.city}</span>
          )}
        </div>

        <div className="info-item">
          <span className="info-label">Hire Date</span>
          <span className="info-value">{fmt(doctor.hire_date)}</span>
        </div>

        <div className="info-item">
          <span className="info-label">Licence</span>
          <span className="info-value info-mono">{doctor.licence}</span>
        </div>
      </div>

      <div className="profile-actions">
        {editing ? (
          <>
            <button className="btn-primary" style={{ width: 'auto', padding: '0.5rem 1.5rem' }} onClick={handleSave}>
              Save Changes
            </button>
            <button className="btn-ghost-sm" onClick={handleCancel}>Cancel</button>
          </>
        ) : (
          <button className="btn-edit" onClick={() => setEditing(true)}>
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
}
