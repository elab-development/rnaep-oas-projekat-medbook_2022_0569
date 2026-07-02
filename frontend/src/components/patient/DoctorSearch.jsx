import { useState, useEffect } from 'react';
import { getAllDoctors } from '../../api/users';
import BookingModal from './BookingModal';

const initials = (name, surname) =>
  `${name?.[0] ?? ''}${surname?.[0] ?? ''}`.toUpperCase();

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default function DoctorSearch() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeDoctor, setActiveDoctor] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState('');

  useEffect(() => {
    getAllDoctors()
      .then(setDoctors)
      .catch(() => setError('Failed to load doctors. Make sure the backend is running.'))
      .finally(() => setLoading(false));
  }, []);

  const handleBooked = ({ doctor, date, time }) => {
    setActiveDoctor(null);
    setBookingSuccess(
      `Appointment with Dr. ${doctor.name} ${doctor.surname} on ${date} at ${time} booked successfully!`
    );
    setTimeout(() => setBookingSuccess(''), 5000);
  };

  if (loading) return <p className="empty-state">Loading doctors…</p>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (doctors.length === 0) return <p className="empty-state">No doctors registered yet.</p>;

  return (
    <>
      {bookingSuccess && (
        <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
          {bookingSuccess}
        </div>
      )}

      <div className="doctor-grid">
        {doctors.map((doctor) => (
          <div key={doctor.email} className="doctor-card">
            <div className="doctor-card-header">
              <div className="doctor-avatar">
                {initials(doctor.name, doctor.surname)}
              </div>
              <div>
                <h4 className="doctor-name">Dr. {doctor.name} {doctor.surname}</h4>
                <span className="badge badge-teal">{cap(doctor.specialization)}</span>
                <p className="doctor-city">{doctor.city}</p>
              </div>
            </div>

            <div className="doctor-meta">
              <span className="meta-label">Email</span>
              <span className="meta-value">{doctor.email}</span>
            </div>
            <div className="doctor-meta">
              <span className="meta-label">Hired</span>
              <span className="meta-value">
                {new Date(doctor.hire_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>

            <button
              className="btn-book btn-book--full"
              onClick={() => setActiveDoctor(doctor)}
            >
              Book Appointment
            </button>
          </div>
        ))}
      </div>

      {activeDoctor && (
        <BookingModal
          doctor={activeDoctor}
          onClose={() => setActiveDoctor(null)}
          onBooked={handleBooked}
        />
      )}
    </>
  );
}
