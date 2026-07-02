import { useState, useEffect } from 'react';
import { getAllUsers, toggleUserActive } from '../../api/users';

const ROLE_BADGE = {
  patient: 'badge-teal',
  doctor: 'badge-orange',
  admin: 'badge-red',
};

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAllUsers()
      .then(setUsers)
      .catch(() => setError('Failed to load users.'))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (id) => {
    try {
      await toggleUserActive(id);
      setUsers((prev) =>
        prev.map((u) => (u.user_id === id ? { ...u, active: !u.active } : u))
      );
    } catch {
      setError('Failed to update user status.');
    }
  };

  if (loading) return <p className="empty-state">Loading users…</p>;

  return (
    <div>
      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      <div className="appointment-list" style={{ maxWidth: 720 }}>
        {users.map((u) => (
          <div key={u.user_id} className="appointment-card" style={{ opacity: u.active ? 1 : 0.55 }}>
            <div className="appt-top">
              <div className="appt-info">
                <div className="patient-avatar-sm">
                  {u.name[0]}{u.surname[0]}
                </div>
                <div>
                  <h4 className="appt-doctor">{u.name} {u.surname}</h4>
                  <span className="appt-spec">{u.email}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className={`badge ${ROLE_BADGE[u.role] || 'badge-orange'}`}>
                  {cap(u.role)}
                </span>
                <span className={`badge ${u.active ? 'badge-green' : 'badge-red'}`}>
                  {u.active ? 'Active' : 'Inactive'}
                </span>
                <button
                  className={u.active ? 'btn-danger-outline' : 'btn-complete'}
                  onClick={() => handleToggle(u.user_id)}
                >
                  {u.active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
