import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getPatientExaminations, getPatientRecord, createPatientRecord } from '../../api/medicalRecords';
import client from '../../api/client';

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

function WikiModal({ diagnosis, onClose }) {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    client.get('/medical-records/diagnosis-info', { params: { term: diagnosis } })
      .then((r) => { setInfo(r.data); setLoading(false); })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [diagnosis]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <div>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.25rem' }}>Wikipedia</p>
            <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{info?.title || diagnosis}</h3>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {loading && <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading…</p>}

          {notFound && (
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              No Wikipedia article found for <strong>{diagnosis}</strong>.
            </p>
          )}

          {info && !loading && (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              {info.thumbnail && (
                <img
                  src={info.thumbnail}
                  alt={info.title}
                  style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }}
                />
              )}
              <div>
                <p style={{ fontSize: '0.9rem', color: '#374151', lineHeight: 1.6, margin: '0 0 1rem' }}>
                  {info.extract}
                </p>
                {info.page_url && (
                  <a
                    href={info.page_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: '0.8rem', color: '#0369a1', fontWeight: 600, textDecoration: 'none' }}
                  >
                    Read full article on Wikipedia →
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MedicalHistory() {
  const { user } = useAuth();
  const [examinations, setExaminations] = useState([]);
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('examinations');
  const [wikiDiagnosis, setWikiDiagnosis] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    const loadData = async () => {
      try {
        const [exams, rec] = await Promise.all([
          getPatientExaminations(user.id).catch(() => []),
          getPatientRecord(user.id).catch(async (err) => {
            if (err?.response?.status === 404) {
              await createPatientRecord(user.id).catch(() => null);
              return getPatientRecord(user.id).catch(() => null);
            }
            return null;
          }),
        ]);
        setExaminations(exams);
        setRecord(rec);
      } catch {
        setError('Failed to load medical history.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user?.id]);

  if (loading) return <p className="empty-state">Loading medical history…</p>;

  return (
    <div style={{ maxWidth: 720 }}>
      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {wikiDiagnosis && (
        <WikiModal diagnosis={wikiDiagnosis} onClose={() => setWikiDiagnosis(null)} />
      )}

      <div className="section-tabs">
        <button
          className={`tab-btn${tab === 'examinations' ? ' active' : ''}`}
          onClick={() => setTab('examinations')}
        >
          Examination History
          {examinations.length > 0 && <span className="tab-count">{examinations.length}</span>}
        </button>
        <button
          className={`tab-btn${tab === 'record' ? ' active' : ''}`}
          onClick={() => setTab('record')}
        >
          Medical Record
        </button>
      </div>

      {tab === 'examinations' && (
        <div>
          {examinations.length === 0 ? (
            <p className="empty-state">No examinations on record yet.</p>
          ) : (
            <div className="appointment-list">
              {examinations.map((exam) => (
                <div key={exam.id} className="appointment-card">
                  <div className="appt-top">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h4 className="appt-doctor" style={{ margin: 0 }}>{exam.diagnosis}</h4>
                        <button
                          onClick={() => setWikiDiagnosis(exam.diagnosis)}
                          title="Learn more on Wikipedia"
                          style={{
                            background: '#f1f5f9',
                            border: 'none',
                            borderRadius: '50%',
                            width: 22,
                            height: 22,
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: '#64748b',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          ?
                        </button>
                      </div>
                      <span className="appt-spec">{fmtDate(exam.date)}</span>
                    </div>
                    <span className="badge badge-teal">Dr. #{exam.doctor_id}</span>
                  </div>

                  {exam.symptoms.length > 0 && (
                    <div style={{ margin: '0.75rem 0 0.5rem' }}>
                      <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Symptoms</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                        {exam.symptoms.map((s, i) => (
                          <span key={i} className="schedule-chip">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {exam.recommendations && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Recommendations</p>
                      <p style={{ fontSize: '0.9rem', color: '#374151' }}>{exam.recommendations}</p>
                    </div>
                  )}

                  {exam.description && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Notes</p>
                      <p style={{ fontSize: '0.875rem', color: '#64748b' }}>{exam.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'record' && (
        <div>
          {!record ? (
            <p className="empty-state">Loading medical record…</p>
          ) : (
            <div className="profile-card">
              <div className="profile-header">
                <div className="profile-avatar">
                  {user?.email?.[0]?.toUpperCase()}
                </div>
                <div className="profile-identity">
                  <h3>Medical Record</h3>
                  <span className="profile-email">Created: {fmtDate(record.created_at)}</span>
                </div>
              </div>

              {(!record.blood_type || record.blood_type === 'Unknown') &&
                record.allergies.length === 0 &&
                record.chronic_diseases.length === 0 && (
                <div className="alert" style={{ background: '#f0f9ff', border: '1px solid #bae6fd', color: '#0369a1', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
                  Your medical record has been created. Your doctor will fill in the details during your visit.
                </div>
              )}

              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Blood Type</span>
                  <span className="info-value">
                    {record.blood_type && record.blood_type !== 'Unknown' ? record.blood_type : '—'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Allergies</span>
                  <span className="info-value">
                    {record.allergies.length > 0 ? record.allergies.join(', ') : '—'}
                  </span>
                </div>
                <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                  <span className="info-label">Chronic Diseases</span>
                  <span className="info-value">
                    {record.chronic_diseases.length > 0 ? record.chronic_diseases.join(', ') : '—'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
