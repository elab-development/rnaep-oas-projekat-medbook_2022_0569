import { useState, useEffect } from 'react';
import { getUpcomingSlots, bookAppointment } from '../../api/appointments';

const fmtChip = (dateStr) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    weekday: 'short', day: '2-digit', month: 'short',
  });
};

const fmtFull = (dateStr) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    weekday: 'long', day: '2-digit', month: 'long',
  });
};

const fmtTime = (t) => (t ? String(t).slice(0, 5) : '');
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default function BookingModal({ doctor, onClose, onBooked }) {
  const [days, setDays] = useState([]);
  const [selected, setSelected] = useState(null);
  const [pending, setPending] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    getUpcomingSlots(doctor.user_id)
      .then((data) => {
        setDays(data);
        if (data.length > 0) setSelected(data[0]);
      })
      .catch(() => setError('Failed to load schedule.'))
      .finally(() => setLoading(false));
  }, [doctor.user_id]);

  const handleConfirm = async () => {
    const dateTime = `${selected.date}T${pending}:00`;
    try {
      await bookAppointment(doctor.user_id, dateTime, null);
      setSuccess(`Appointment confirmed — ${fmtFull(selected.date)} at ${pending}`);
      setPending(null);
      onBooked?.({ doctor, date: selected.date, time: pending });

      getUpcomingSlots(doctor.user_id).then((data) => {
        setDays(data);
        const updated = data.find((d) => d.date === selected.date);
        if (updated) setSelected(updated);
      });
    } catch {
      setError('Booking failed. The slot may already be taken.');
    }
  };

  const workingHours = [...new Map(
    days.map((d) => [d.day_name, d])
  ).values()];

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">

        <div className="modal-header">
          <div className="modal-doctor-info">
            <div className="doctor-avatar modal-avatar">
              {doctor.name[0]}{doctor.surname[0]}
            </div>
            <div>
              <h3 className="modal-doctor-name">Dr. {doctor.name} {doctor.surname}</h3>
              <span className="badge badge-teal">{cap(doctor.specialization)}</span>
              <p className="doctor-city">{doctor.city}</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {loading ? (
          <p className="empty-state">Loading…</p>
        ) : days.length === 0 ? (
          <p className="empty-state">This doctor has no schedule set yet.</p>
        ) : (
          <div className="modal-body">

            <div className="modal-section">
              <p className="section-micro-label">Working hours</p>
              <div className="schedule-chips">
                {workingHours.map((d) => (
                  <span key={d.day_name} className="schedule-chip">
                    <strong>{d.day_name}</strong> · {fmtTime(d.slots[0]?.start_time)} – {fmtTime(d.slots[d.slots.length - 1]?.end_time)}
                  </span>
                ))}
              </div>
            </div>

            {success && <div className="alert alert-success">{success}</div>}
            {error && <div className="alert alert-error">{error}</div>}

            <div className="modal-section">
              <p className="section-micro-label">Pick a date</p>
              <div className="date-picker">
                {days.map((day) => (
                  <button
                    key={day.date}
                    className={`date-chip${selected?.date === day.date ? ' active' : ''}`}
                    onClick={() => { setSelected(day); setPending(null); setError(''); setSuccess(''); }}
                  >
                    {fmtChip(day.date)}
                  </button>
                ))}
              </div>
            </div>

            {selected && (
              <div className="modal-section">
                <p className="section-micro-label">Slots · {fmtFull(selected.date)}</p>

                {selected.slots.length === 0 ? (
                  <p className="empty-state">No slots available for this day.</p>
                ) : (
                  <div className="slots-grid">
                    {selected.slots.map((slot) => {
                      const timeStr = fmtTime(slot.start_time);
                      const isPending = pending === timeStr;
                      return (
                        <button
                          key={timeStr}
                          disabled={!slot.available}
                          className={`slot-chip ${!slot.available ? 'booked' : isPending ? 'selected' : 'free'}`}
                          onClick={() => slot.available && setPending(isPending ? null : timeStr)}
                        >
                          {timeStr}
                        </button>
                      );
                    })}
                  </div>
                )}

                {pending && !success && (
                  <div className="booking-confirm">
                    <p>
                      Book <strong>{pending}</strong> on <strong>{fmtFull(selected.date)}</strong>?
                    </p>
                    <div className="confirm-actions">
                      <button className="btn-confirm" onClick={handleConfirm}>Confirm Booking</button>
                      <button className="btn-cancel-sm" onClick={() => setPending(null)}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
