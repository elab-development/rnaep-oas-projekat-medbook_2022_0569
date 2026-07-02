const PATIENT = {
  name: 'Marko',
  surname: 'Marković',
  email: 'marko.markovic@gmail.com',
  telephone: '+381 60 123 4567',
  address: 'Terazije 5, Beograd',
  date_of_birth: '1990-03-15',
  lbo: '1503990710049',
};

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('sr-RS', { day: '2-digit', month: '2-digit', year: 'numeric' });

export default function PatientProfile() {
  return (
    <div className="profile-card">
      <div className="profile-header">
        <div className="profile-avatar">
          {PATIENT.name[0]}{PATIENT.surname[0]}
        </div>
        <div className="profile-identity">
          <h3>{PATIENT.name} {PATIENT.surname}</h3>
          <span className="profile-email">{PATIENT.email}</span>
          <span className="badge badge-blue">Patient</span>
        </div>
      </div>

      <div className="info-grid">
        <div className="info-item">
          <span className="info-label">Phone</span>
          <span className="info-value">{PATIENT.telephone}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Address</span>
          <span className="info-value">{PATIENT.address}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Date of Birth</span>
          <span className="info-value">{formatDate(PATIENT.date_of_birth)}</span>
        </div>
        <div className="info-item">
          <span className="info-label">LBO</span>
          <span className="info-value info-mono">{PATIENT.lbo}</span>
        </div>
      </div>
    </div>
  );
}
