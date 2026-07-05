import { useState, useEffect } from 'react';
import { getPatientAppointments, cancelAppointment } from '../../api/appointments';

const isoDate = (iso) => new Date(iso).toISOString().split('T')[0];

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

const STATUS_BADGE = {
  scheduled: 'badge-orange',
  completed: 'badge-green',
  cancelled: 'badge-red',
};

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('upcoming');
  const [cancelId, setCancelId] = useState(null);

  useEffect(() => {
    getPatientAppointments()
      .then(setAppointments)
      .catch(() => setError('Failed to load appointments.'))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toISOString().split('T')[0];

  const upcoming = appointments.filter(
    (a) => isoDate(a.date) >= today && a.status === 'scheduled'
  );
  const past = appointments.filter(
    (a) => isoDate(a.date) < today || a.status !== 'scheduled'
  );

  const handleCancel = async (id) => {
    try {
      await cancelAppointment(id);
      setAppointments((prev) => prev.filter((a) => a.id !== id));
      setCancelId(null);
    } catch {
      setError('Failed to cancel appointment.');
    }
  };

  const list = tab === 'upcoming' ? upcoming : past;

  if (loading) return <p className="empty-state">Loading appointments…</p>;

  return (
    <div>
      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      <div className="section-tabs">
        <button
          className={`tab-btn${tab === 'upcoming' ? ' active' : ''}`}
          onClick={() => setTab('upcoming')}
        >
          Upcoming
          {upcoming.length > 0 && <span className="tab-count">{upcoming.length}</span>}
        </button>
        <button
          className={`tab-btn${tab === 'past' ? ' active' : ''}`}
          onClick={() => setTab('past')}
        >
          Past
        </button>
      </div>

      {list.length === 0 && (
        <p className="empty-state">
          {tab === 'upcoming' ? 'No upcoming appointments.' : 'No past appointments.'}
        </p>
      )}

      <div className="appointment-list">
        {list.map((appt) => (
          <div key={appt.id} className="appointment-card">
            <div className="appt-top">
              <div className="appt-info">
                <h4 className="appt-doctor">Dr. {appt.doctor_name || `#${appt.doctor_id}`}</h4>
                <span className="appt-spec">{appt.description || 'No description'}</span>
              </div>
              <span className={`badge ${STATUS_BADGE[appt.status]}`}>
                {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
              </span>
            </div>

            <div className="appt-datetime">
              {formatDate(appt.date)} at {formatTime(appt.date)}
            </div>

            {appt.status === 'scheduled' && (
              <div className="appt-actions">
                {cancelId === appt.id ? (
                  <div className="cancel-confirm">
                    <span>Cancel this appointment?</span>
                    <button className="btn-danger-sm" onClick={() => handleCancel(appt.id)}>
                      Yes, cancel
                    </button>
                    <button className="btn-ghost-sm" onClick={() => setCancelId(null)}>
                      Keep it
                    </button>
                  </div>
                ) : (
                  <button className="btn-danger-outline" onClick={() => setCancelId(appt.id)}>
                    Cancel Appointment
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
