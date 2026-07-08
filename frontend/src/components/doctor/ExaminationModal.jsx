import { useState } from 'react';
import { addExamination } from '../../api/medicalRecords';
import { sanitize } from '../../utils/sanitize';

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

const EMPTY_THERAPY = { medicine: '', dose: '', frequency: '', duration: '' };

export default function ExaminationModal({ appointment, onClose, onSaved }) {
  const [form, setForm] = useState({
    diagnosis: '',
    symptoms: '',
    recommendations: '',
    description: '',
  });
  const [therapy, setTherapy] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const addTherapyRow = () => setTherapy((prev) => [...prev, { ...EMPTY_THERAPY }]);

  const updateTherapyRow = (index, field, value) =>
    setTherapy((prev) => prev.map((t, i) => i === index ? { ...t, [field]: value } : t));

  const removeTherapyRow = (index) =>
    setTherapy((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.diagnosis.trim()) { setError('Diagnosis is required.'); return; }
    setError('');
    setLoading(true);
    try {
      await addExamination({
        appointment_id: appointment.id,
        patient_id: appointment.patient_id,
        diagnosis: sanitize(form.diagnosis.trim()),
        symptoms: form.symptoms.split(',').map((s) => sanitize(s.trim())).filter(Boolean),
        recommendations: sanitize(form.recommendations.trim()),
        description: sanitize(form.description.trim()),
        therapy: therapy
          .filter((t) => t.medicine.trim())
          .map((t) => ({
            medicine: sanitize(t.medicine.trim()),
            dose: sanitize(t.dose.trim()),
            frequency: sanitize(t.frequency.trim()),
            duration: parseInt(t.duration) || 0,
          })),
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
              />
            </div>

            <div>
              <div className="therapy-header">
                <label className="therapy-label">Therapy</label>
                <button type="button" className="btn-add-medicine" onClick={addTherapyRow}>
                  + Add medicine
                </button>
              </div>
              {therapy.length === 0 && (
                <p className="therapy-empty">No medicines added yet.</p>
              )}
              {therapy.map((t, i) => (
                <div key={i} className="therapy-row">
                  <input
                    className="modal-input"
                    value={t.medicine}
                    onChange={(e) => updateTherapyRow(i, 'medicine', e.target.value)}
                    placeholder="Medicine"
                  />
                  <input
                    className="modal-input"
                    value={t.dose}
                    onChange={(e) => updateTherapyRow(i, 'dose', e.target.value)}
                    placeholder="Dose"
                  />
                  <input
                    className="modal-input"
                    value={t.frequency}
                    onChange={(e) => updateTherapyRow(i, 'frequency', e.target.value)}
                    placeholder="Frequency"
                  />
                  <input
                    className="modal-input"
                    type="number"
                    value={t.duration}
                    onChange={(e) => updateTherapyRow(i, 'duration', e.target.value)}
                    placeholder="Days"
                    min={1}
                  />
                  <button type="button" className="btn-remove" onClick={() => removeTherapyRow(i)}>
                    ×
                  </button>
                </div>
              ))}
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
