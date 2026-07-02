import { useState, useEffect } from 'react';
import { getDoctorAppointments, completeAppointment, cancelAppointment } from '../../api/appointments';

const STATUS_BADGE = {
  scheduled: 'badge-orange',
  completed: 'badge-green',
  cancelled: 'badge-red',
};

const isoDate = (iso) => new Date(iso).toISOString().split('T')[0];

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

const groupByDate = (list) =>
  list.reduce((acc, appt) => {
    const key = isoDate(appt.date);
    (acc[key] = acc[key] || []).push(appt);
    return acc;
  }, {});

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('upcoming');

  useEffect(() => {
    getDoctorAppointments()
      .then(setAppointments)
      .catch(() => setError('Failed to load appointments.'))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toISOString().split('T')[0];

  const upcoming = appointments.filter((a) => isoDate(a.date) >= today && a.status === 'scheduled');
  const past = appointments.filter((a) => isoDate(a.date) < today || a.status !== 'scheduled');

  const list = tab === 'upcoming' ? upcoming : past;
  const grouped = groupByDate(list);
  const sortedDates = Object.keys(grouped).sort();

  const markCompleted = async (id) => {
    try {
      const updated = await completeAppointment(id);
      setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: updated.status } : a)));
    } catch {
      setError('Failed to complete appointment.');
    }
  };

  const handleCancel = async (id) => {
    try {
      await cancelAppointment(id);
      setAppointments((prev) => prev.filter((a) => a.id !== id));
    } catch {
      setError('Failed to cancel appointment.');
    }
  };

  if (loading) return <p className="empty-state">Loading appointments…</p>;

  return (
    <div>
      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      <div className="section-tabs">
        <button className={`tab-btn${tab === 'upcoming' ? ' active' : ''}`} onClick={() => setTab('upcoming')}>
          Upcoming
          {upcoming.length > 0 && <span className="tab-count">{upcoming.length}</span>}
        </button>
        <button className={`tab-btn${tab === 'past' ? ' active' : ''}`} onClick={() => setTab('past')}>
          Past
        </button>
      </div>

      {sortedDates.length === 0 && (
        <p className="empty-state">
          {tab === 'upcoming' ? 'No upcoming appointments.' : 'No past appointments.'}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 680 }}>
        {sortedDates.map((date) => (
          <div key={date}>
            <p className="appt-date-header">{fmtDate(date)}</p>
            <div className="appointment-list" style={{ marginTop: '0.5rem' }}>
              {grouped[date].map((appt) => {
                const name = appt.patient_name || `Patient #${appt.patient_id}`;
                const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
                return (
                <div key={appt.id} className="appointment-card appt-card-doctor">
                  <div className="appt-top">
                    <div className="appt-info">
                      <div className="patient-avatar-sm">{initials}</div>
                      <div>
                        <h4 className="appt-doctor">{name}</h4>
                        <span className="appt-spec">{appt.description || 'No description'}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span className="appt-time-badge">{fmtTime(appt.date)}</span>
                      <span className={`badge ${STATUS_BADGE[appt.status]}`}>
                        {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {appt.status === 'scheduled' && (
                    <div className="appt-actions">
                      <button className="btn-complete" onClick={() => markCompleted(appt.id)}>
                        Mark as Completed
                      </button>
                      <button className="btn-danger-outline" onClick={() => handleCancel(appt.id)}>
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
