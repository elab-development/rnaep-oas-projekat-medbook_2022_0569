import { useState } from 'react';
import { updatePatientRecord } from '../../api/medicalRecords';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const initials = (name) =>
  name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

export default function MedicalRecordModal({ patientId, patientName, onClose, onSaved }) {
  const [bloodType, setBloodType] = useState('');
  const [allergies, setAllergies] = useState('');
  const [chronicDiseases, setChronicDiseases] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {};
      if (bloodType) payload.blood_type = bloodType;
      if (allergies.trim())
        payload.allergies = allergies.split(',').map((s) => s.trim()).filter(Boolean);
      if (chronicDiseases.trim())
        payload.chronic_diseases = chronicDiseases.split(',').map((s) => s.trim()).filter(Boolean);
      await updatePatientRecord(patientId, payload);
      setSuccess(true);
      setTimeout(onSaved, 900);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to update medical record.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>

        <div className="modal-header">
          <div className="modal-doctor-info">
            <div className="modal-avatar" style={{ background: 'linear-gradient(135deg, #0369a1, #38bdf8)', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
              {initials(patientName)}
            </div>
            <div>
              <p className="modal-doctor-name">{patientName}</p>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Medical Record Update</span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="alert alert-error" style={{ margin: 0 }}>{error}</div>
          )}

          {success && (
            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', color: '#166534', borderRadius: 10, padding: '0.75rem 1rem', fontSize: '0.9rem', fontWeight: 500 }}>
              ✓ Medical record updated successfully
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            <div className="modal-section">
              <span className="section-micro-label">Blood Type</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                {BLOOD_TYPES.map((bt) => (
                  <button
                    key={bt}
                    type="button"
                    onClick={() => setBloodType(bt === bloodType ? '' : bt)}
                    style={{
                      padding: '0.5rem',
                      borderRadius: 10,
                      border: bloodType === bt ? '2px solid #0369a1' : '1.5px solid #e2e8f0',
                      background: bloodType === bt ? '#eff6ff' : '#fff',
                      color: bloodType === bt ? '#0369a1' : '#374151',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {bt}
                  </button>
                ))}
              </div>
            </div>

            <div className="modal-section">
              <span className="section-micro-label">Allergies</span>
              <input
                type="text"
                className="modal-input"
                placeholder="e.g. penicillin, pollen, latex"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                onFocus={(e) => (e.target.style.borderColor = '#0369a1')}
                onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
              />
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Separate multiple entries with commas</span>
            </div>

            <div className="modal-section">
              <span className="section-micro-label">Chronic Diseases</span>
              <input
                type="text"
                className="modal-input"
                placeholder="e.g. diabetes, hypertension, asthma"
                value={chronicDiseases}
                onChange={(e) => setChronicDiseases(e.target.value)}
                style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                onFocus={(e) => (e.target.style.borderColor = '#0369a1')}
                onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
              />
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Separate multiple entries with commas</span>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.25rem' }}>
              <button type="button" className="btn-danger-outline" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={saving || success} style={{ minWidth: 100 }}>
                {saving ? 'Saving…' : success ? 'Saved ✓' : 'Save Record'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
