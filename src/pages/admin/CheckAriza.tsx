import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface File {
  id: number;
  file_url: string;
  comment: string;
  section: number;
}

interface Direction {
  id: number;
  name: string;
}

interface Score {
  id: number;
  value: number;
  note?: string;
}

interface ApplicationDetail {
  id: number;
  student: number;
  direction: Direction;
  submitted_at: string;
  status: string;
  comment: string;
  scores: Score[];
  files: File[];
}

const CheckAriza = () => {
  const { id } = useParams<{ id: string }>();

  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [scoreValue, setScoreValue] = useState<number>(0);
  const [note, setNote] = useState<string>('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) {
      setError("ID topilmadi");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("Token topilmadi, iltimos login qiling");

        const res = await fetch(`http://localhost:8000/api/komissiya/applications/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || "Ma'lumot olishda xatolik");
        }

        const data = await res.json();
        setApplication(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);
    setSubmitting(true);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Token topilmadi, iltimos login qiling");

      if (scoreValue < 0 || scoreValue > 10) {
        throw new Error("Ball 0 dan 10 gacha bo‘lishi kerak");
      }

      const res = await fetch(`http://localhost:8000/api/komissiya/applications/${id}/score/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          value: scoreValue,
          note: note.trim(),
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Ball qo‘yishda xatolik yuz berdi');
      }

      setSubmitSuccess("Ball muvaffaqiyatli qo‘yildi");
      
      const updatedApp = await res.json();
      setApplication(prev => prev ? {...prev, scores: [updatedApp]} : prev);

    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p style={{textAlign: 'center', marginTop: 30}}>Yuklanmoqda...</p>;
  if (error) return <p style={{ color: 'red', textAlign: 'center', marginTop: 30 }}>Xatolik: {error}</p>;
  if (!application) return <p style={{textAlign: 'center', marginTop: 30}}>Ariza topilmadi</p>;

  const alreadyScored = application.scores.length > 0;

  return (
    <div style={{ maxWidth: 700, margin: '30px auto', padding: 20, boxShadow: '0 4px 8px rgba(0,0,0,0.1)', borderRadius: 8, backgroundColor: '#fff' }}>
      <h2 style={{ marginBottom: 20, borderBottom: '2px solid #1976d2', paddingBottom: 8, color: '#1976d2' }}>
        Ariza #{application.id} tafsilotlari
      </h2>

      <div style={{ marginBottom: 15 }}>
        <strong>Yo'nalish:</strong> <span>{application.direction.name}</span>
      </div>
      <div style={{ marginBottom: 15 }}>
        <strong>Izoh:</strong> <span>{application.comment || '-'}</span>
      </div>
      <div style={{ marginBottom: 15 }}>
        <strong>Status:</strong> <span style={{ textTransform: 'capitalize' }}>{application.status}</span>
      </div>
      <div style={{ marginBottom: 30 }}>
        <strong>Yuborilgan sana:</strong> <span>{new Date(application.submitted_at).toLocaleString()}</span>
      </div>

      <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: 6, marginBottom: 15 }}>Fayllar</h3>
      {application.files.length === 0 ? (
        <p>Fayl mavjud emas</p>
      ) : (
        <ul style={{ paddingLeft: 20, marginBottom: 30 }}>
          {application.files.map(f => (
            <li key={f.id} style={{ marginBottom: 6 }}>
              <a 
                href={f.file_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ color: '#1976d2', textDecoration: 'underline' }}
              >
                Fayl #{f.id} - {f.comment}
              </a>
            </li>
          ))}
        </ul>
      )}

      <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: 6, marginBottom: 15 }}>Ball (Baholash)</h3>
      {alreadyScored ? (
        <p style={{ fontSize: 18, fontWeight: 'bold', color: 'green' }}>
          Berilgan ball: {application.scores[0].value}
        </p>
      ) : (
        <form onSubmit={handleScoreSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          <label style={{ fontWeight: 'bold' }}>
            Ball (0-10):
            <input
              type="number"
              min={0}
              max={10}
              value={scoreValue}
              onChange={e => setScoreValue(parseInt(e.target.value))}
              required
              style={{
                marginTop: 6,
                padding: 8,
                borderRadius: 4,
                border: '1px solid #ccc',
                fontSize: 16,
                width: 100,
              }}
            />
          </label>

          <label style={{ fontWeight: 'bold' }}>
            Izoh (ixtiyoriy):
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
              style={{
                marginTop: 6,
                padding: 8,
                borderRadius: 4,
                border: '1px solid #ccc',
                fontSize: 16,
                resize: 'vertical',
              }}
            />
          </label>

          {submitError && <p style={{ color: 'red', fontWeight: 'bold' }}>{submitError}</p>}
          {submitSuccess && <p style={{ color: 'green', fontWeight: 'bold' }}>{submitSuccess}</p>}

          <button
            type="submit"
            disabled={submitting}
            style={{
              backgroundColor: '#1976d2',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: 5,
              fontSize: 16,
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? 'Jo‘natilmoqda...' : 'Ball qo‘yish'}
          </button>
        </form>
      )}
    </div>
  );
};

export default CheckAriza;
