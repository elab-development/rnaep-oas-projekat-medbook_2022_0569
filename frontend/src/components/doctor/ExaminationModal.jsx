import { useState } from 'react';
import { addExamination } from '../../api/medicalRecords';

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

export default function ExaminationModal({ appointment, onClose, onSaved }) {
  const [form, setForm] = useState({
    diagnosis: '',
    symptoms: '',
    recommendations: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.diagnosis.trim()) { setError('Diagnosis is required.'); return; }
    setError('');
    setLoading(true);
    try {
      await addExamination({
        appointment_id: appointment.id,
        patient_id: appointment.patient_id,
        diagnosis: form.diagnosis.trim(),
        symptoms: form.symptoms.split(',').map((s) => s.trim()).filter(Boolean),
        recommendations: form.recommendations.trim(),
        description: form.description.trim(),
        therapy: [],
      });
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save examination.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <h3 className="modal-doctor-name">Add Examination</h3>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '0.25rem 0 0' }}>
              {appointment.patient_name} · {fmtDate(appointment.date)}
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label>Diagnosis *</label>
              <input
                name="diagnosis"
                value={form.diagnosis}
                onChange={handleChange}
                placeholder="e.g. Contact dermatitis"
                required
              />
            </div>

            <div className="form-group">
              <label>Symptoms <span style={{ color: '#94a3b8', fontWeight: 400 }}>(comma separated)</span></label>
              <input
                name="symptoms"
                value={form.symptoms}
                onChange={handleChange}
                placeholder="e.g. itching, redness, swelling"
              />
            </div>

            <div className="form-group">
              <label>Recommendations</label>
              <textarea
                name="recommendations"
                value={form.recommendations}
                onChange={handleChange}
                placeholder="e.g. Avoid allergens, apply cream twice daily"
                rows={3}
                style={{ resize: 'vertical', padding: '0.625rem 0.875rem', border: '1.5px solid #d1d5db', borderRadius: '9px', fontSize: '0.9375rem', fontFamily: 'inherit' }}
              />
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Additional notes..."
                rows={2}
                style={{ resize: 'vertical', padding: '0.625rem 0.875rem', border: '1.5px solid #d1d5db', borderRadius: '9px', fontSize: '0.9375rem', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
              <button type="submit" className="btn-primary" disabled={loading} style={{ margin: 0 }}>
                {loading ? 'Saving…' : 'Save Examination'}
              </button>
              <button type="button" className="btn-cancel-sm" onClick={onClose}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
