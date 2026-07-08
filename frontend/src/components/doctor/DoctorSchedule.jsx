import { useState, useEffect } from 'react';
import { getMySchedule, addSchedule, removeSchedule } from '../../api/schedule';

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TIME_OPTIONS = Array.from({ length: 32 }, (_, i) => {
  const h = Math.floor(i / 2) + 6;
  const m = i % 2 === 0 ? '00' : '30';
  return `${String(h).padStart(2, '0')}:${m}`;
});
const DAY_ORDER = { Monday: 0, Tuesday: 1, Wednesday: 2, Thursday: 3, Friday: 4, Saturday: 5 };

const fmtTime = (t) => (t ? t.slice(0, 5) : '');

const duration = (start, end) => {
  const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const mins = toMin(end) - toMin(start);
  const h = Math.floor(mins / 60), m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
};

const slotCount = (start, end) => {
  const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  return Math.floor((toMin(end) - toMin(start)) / 30);
};

export default function DoctorSchedule() {
  const [schedule, setSchedule] = useState([]);
  const [form, setForm] = useState({ day: '', start_time: '08:00', end_time: '16:00' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMySchedule()
      .then((data) => setSchedule([...data].sort((a, b) => DAY_ORDER[a.day] - DAY_ORDER[b.day])))
      .catch(() => setError('Failed to load schedule.'))
      .finally(() => setLoading(false));
  }, []);

  const usedDays = new Set(schedule.map((s) => s.day));
  const availableDays = ALL_DAYS.filter((d) => !usedDays.has(d));

  const handleAdd = async () => {
    if (!form.day) { setError('Please select a day.'); return; }
    if (form.start_time >= form.end_time) { setError('End time must be after start time.'); return; }
    setError('');
    try {
      await addSchedule(form.day, form.start_time, form.end_time);
      const updated = await getMySchedule();
      setSchedule([...updated].sort((a, b) => DAY_ORDER[a.day] - DAY_ORDER[b.day]));
      setForm({ day: '', start_time: '08:00', end_time: '16:00' });
      setSuccess('Working day added!');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to add schedule entry.');
    }
  };

  const handleRemove = async (id) => {
    try {
      await removeSchedule(id);
      setSchedule((prev) => prev.filter((s) => s.schedule_id !== id));
    } catch {
      setError('Failed to remove schedule entry.');
    }
  };

  if (loading) return <p className="empty-state">Loading schedule…</p>;

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div className="schedule-card">
        <h3 className="schedule-card-title">Current Schedule</h3>

        {schedule.length === 0 ? (
          <p className="empty-state" style={{ padding: '1.5rem' }}>
            No working days set yet.
          </p>
        ) : (
          <div className="schedule-list">
            {schedule.map((entry) => {
              const start = fmtTime(entry.start_time);
              const end = fmtTime(entry.end_time);
              return (
                <div key={entry.schedule_id} className="schedule-row">
                  <div className="schedule-day-badge">{entry.day.slice(0, 3)}</div>
                  <div className="schedule-row-info">
                    <span className="schedule-day-name">{entry.day}</span>
                    <span className="schedule-time-range">{start} – {end}</span>
                  </div>
                  <div className="schedule-row-meta">
                    <span className="schedule-duration">{duration(start, end)}</span>
                    <span className="schedule-slots">{slotCount(start, end)} slots</span>
                  </div>
                  <button
                    className="btn-remove"
                    onClick={() => handleRemove(entry.schedule_id)}
                    aria-label="Remove"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="schedule-card" style={{ marginTop: '1rem' }}>
        <h3 className="schedule-card-title">Add Working Day</h3>

        {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}
        {success && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{success}</div>}

        {availableDays.length === 0 ? (
          <p className="empty-state" style={{ padding: '1rem 0' }}>
            All days are already scheduled.
          </p>
        ) : (
          <div className="add-schedule-form">
            <div className="form-group">
              <label>Day</label>
              <select
                value={form.day}
                onChange={(e) => setForm((p) => ({ ...p, day: e.target.value }))}
              >
                <option value="">Select day…</option>
                {availableDays.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="time-row">
              <div className="form-group">
                <label>Start time</label>
                <select
                  value={form.start_time}
                  onChange={(e) => setForm((p) => ({ ...p, start_time: e.target.value }))}
                >
                  {TIME_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>End time</label>
                <select
                  value={form.end_time}
                  onChange={(e) => setForm((p) => ({ ...p, end_time: e.target.value }))}
                >
                  {TIME_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {form.day && form.start_time < form.end_time && (
              <p className="schedule-preview">
                {slotCount(form.start_time, form.end_time)} slots · {duration(form.start_time, form.end_time)} total
              </p>
            )}

            <button className="btn-primary" style={{ marginTop: '0.25rem' }} onClick={handleAdd}>
              Add to Schedule
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
