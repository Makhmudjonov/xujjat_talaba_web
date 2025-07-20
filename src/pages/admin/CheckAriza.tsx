// src/pages/admin/CheckAriza.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  Link,
  Divider,
  Grid,
  useTheme,
  Snackbar,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DoNotDisturbAltIcon from '@mui/icons-material/DoNotDisturbAlt';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendIcon from '@mui/icons-material/Send';
import DoneAllIcon from '@mui/icons-material/DoneAll';

// Assuming you have a fetchWithAuth utility similar to the LoginPage
// If not, you'll need to define it or integrate token handling directly
// import { fetchWithAuth } from '../utils/fetchWithAuth';

// --- Typings (remains mostly the same, ensuring consistency) ---
interface Score {
  id: number;
  value: number;
  note?: string;
}

interface ApplicationFile {
  id: number;
  file: string;
  comment: string;
  section: number;
}

interface ApplicationItem {
  id: number;
  direction_name: string;
  student_comment: string;
  reviewer_comment?: string;
  score?: Score | null;
  files: ApplicationFile[];
}

interface ApplicationDetail {
  id: number;
  submitted_at: string;
  status: string;
  comment: string;
  // Assuming student info might be available on the application detail for completeness
  student?: {
    full_name: string;
    student_id_number: string;
  };
  items: ApplicationItem[];
}

// Helper function for authorized fetches (placeholder if not globally defined)
const fetchWithAuth = async (url: string, options?: RequestInit) => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('Token mavjud emas — iltimos login qiling');
  }
  const headers = {
    ...options?.headers,
    Authorization: `Bearer ${token}`,
  };
  const response = await fetch(url, { ...options, headers });
  return response;
};

// --- Main Component ---
const CheckAriza = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();

  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingItemId, setSubmittingItemId] = useState<number | null>(null);
  const [scoreInputs, setScoreInputs] = useState<Record<number, { value: number | ''; note: string }>>({});
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState('');
  // Fix: Add 'warning' to the possible types for snackBarSeverity
  const [snackBarSeverity, setSnackBarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info');

  const [isApplicationAccepting, setIsApplicationAccepting] = useState(false); // New state for overall application approval

  // Helper to check if all items are scored
  const areAllItemsScored = application?.items.every(item => item.score !== null && item.score !== undefined) ?? false;

  useEffect(() => {
    if (!id) {
      setError("ID topilmadi");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetchWithAuth(`https://tanlov.medsfera.uz/api/admin/applications/${id}/`);

        if (!res.ok) {
          if (res.status === 401) {
            localStorage.clear();
            navigate('/login');
            throw new Error('Sessiya tugagan. Iltimos, qaytadan kiring.');
          }
          const err = await res.json();
          throw new Error(err.detail || "Ma'lumot olishda xatolik");
        }

        const data: ApplicationDetail = await res.json();
        setApplication(data);

        // Initialize scoreInputs with existing scores if any
        const initialScoreInputs: Record<number, { value: number | ''; note: string }> = {};
        data.items.forEach(item => {
          if (item.score) {
            initialScoreInputs[item.id] = {
              value: item.score.value,
              note: item.score.note || '',
            };
          } else {
            initialScoreInputs[item.id] = { value: '', note: '' };
          }
        });
        setScoreInputs(initialScoreInputs);

      } catch (err: any) {
        setError(err.message);
        setSnackBarMessage(err.message);
        setSnackBarSeverity('error');
        setSnackBarOpen(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleScoreSubmit = async (itemId: number) => {
    const scoreData = scoreInputs[itemId];
    const value = typeof scoreData?.value === 'number' ? scoreData.value : NaN;
    const note = scoreData?.note || '';

    if (isNaN(value) || value < 0 || value > 10) {
      setSnackBarMessage("Ball 0 dan 10 gacha bo‘lishi kerak.");
      setSnackBarSeverity('warning'); // This is now allowed
      setSnackBarOpen(true);
      return;
    }

    try {
      setSubmittingItemId(itemId);

      const res = await fetchWithAuth(`https://tanlov.medsfera.uz/api/admin/score/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item: itemId,
          value,
          note: note.trim(),
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Ball qo‘yishda xatolik yuz berdi.');
      }

      const newScore: Score = await res.json();
      const updatedItems = application!.items.map((item) =>
        item.id === itemId ? { ...item, score: newScore } : item
      );
      setApplication({ ...application!, items: updatedItems });

      setSnackBarMessage("✅ Ball muvaffaqiyatli qo‘yildi!");
      setSnackBarSeverity('success');
      setSnackBarOpen(true);
    } catch (err: any) {
      setSnackBarMessage(err.message);
      setSnackBarSeverity('error');
      setSnackBarOpen(true);
    } finally {
      setSubmittingItemId(null);
    }
  };

  const handleApplicationAccept = async () => {
    if (!application) return;

    // Optional: Add a confirmation dialog before accepting
    if (!window.confirm("Arizani to'liq qabul qilishni xohlaysizmi?")) {
      return;
    }

    setIsApplicationAccepting(true);
    try {
      // Assuming an endpoint to update application status
      const res = await fetchWithAuth(`https://tanlov.medsfera.uz/api/admin/applications/${application.id}/update_status/`, {
        method: 'PATCH', // Or PUT, depending on your API
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'approved' }), // Or 'accepted', based on your backend enum
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Arizani qabul qilishda xatolik yuz berdi.");
      }

      setApplication({ ...application, status: 'approved' }); // Update local state
      setSnackBarMessage("🎉 Ijtimoiy Faollik indeksimuvaffaqiyatli qabul qilindi!");
      setSnackBarSeverity('success');
      setSnackBarOpen(true);
      // Optional: Navigate back to applications list or refresh
      // navigate('/admin/arizalar');
    } catch (err: any) {
      setSnackBarMessage(err.message);
      setSnackBarSeverity('error');
      setSnackBarOpen(true);
    } finally {
      setIsApplicationAccepting(false);
    }
  };


  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return theme.palette.warning.main;
      case 'approved':
      case 'accepted': // Add 'accepted' if that's your target status
        return theme.palette.success.main;
      case 'rejected':
        return theme.palette.error.main;
      default:
        return theme.palette.text.primary;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Yuklanmoqda...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: theme.spacing(3), textAlign: 'center' }}>
        <Alert severity="error">Xatolik: {error}</Alert>
        <Button variant="outlined" sx={{ mt: 2 }} onClick={() => navigate('/admin/arizalar')}>
          Arizalar ro'yxatiga qaytish
        </Button>
      </Box>
    );
  }

  if (!application) {
    return (
      <Box sx={{ p: theme.spacing(3), textAlign: 'center' }}>
        <Alert severity="info">Ijtimoiy Faollik indeksitopilmadi.</Alert>
        <Button variant="outlined" sx={{ mt: 2 }} onClick={() => navigate('/admin/arizalar')}>
          Arizalar ro'yxatiga qaytish
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: theme.spacing(3) }}>
      <Paper elevation={3} sx={{ p: theme.spacing(4), mb: theme.spacing(4), borderRadius: theme.shape.borderRadius }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
          Ijtimoiy Faollik indeksi#{application.id} Detallari
        </Typography>
        {application.student && (
          <Box sx={{ mb: theme.spacing(2) }}>
            <Typography variant="body1">
              <strong>Talaba:</strong> {application.student.full_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Talaba ID:</strong> {application.student.student_id_number}
            </Typography>
          </Box>
        )}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Status:</strong>{" "}
              <Typography component="span" sx={{ color: getStatusColor(application.status), fontWeight: 'bold', textTransform: 'capitalize' }}>
                {application.status}
              </Typography>
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Yuborilgan:</strong> {new Date(application.submitted_at).toLocaleString('uz-UZ')}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1">
              <strong>Umumiy izoh:</strong> {application.comment || <span style={{ color: theme.palette.text.secondary }}>Kiritilmagan</span>}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Approve Application Button */}
      {application.status !== 'approved' && application.status !== 'accepted' && areAllItemsScored && (
        <Box sx={{ mb: theme.spacing(4), textAlign: 'center' }}>
          {/* <Button
            variant="contained"
            color="success"
            size="large"
            startIcon={<DoneAllIcon />}
            onClick={handleApplicationAccept}
            disabled={isApplicationAccepting}
            sx={{
              py: theme.spacing(1.5),
              px: theme.spacing(4),
              fontSize: '1.1rem',
              fontWeight: 600,
            }}
          >
            {isApplicationAccepting ? 'Qabul qilinmoqda...' : 'Arizani qabul qilish'}
          </Button> */}
        </Box>
      )}
      {application.status === 'approved' && (
         <Alert severity="success" sx={{ mb: theme.spacing(3) }}>
           Bu Ijtimoiy Faollik indeksiallaqachon qabul qilingan.
         </Alert>
      )}


      <Typography variant="h5" component="h2" gutterBottom sx={{ mt: theme.spacing(5), mb: theme.spacing(3), fontWeight: 600 }}>
        Ijtimoiy Faollik indeksiYo‘nalishlari
      </Typography>

      {application.items.length === 0 ? (
        <Alert severity="info">Bu arizada hech qanday yo'nalish topilmadi.</Alert>
      ) : (
        application.items.map((item) => (
          <Paper key={item.id} elevation={2} sx={{ p: theme.spacing(3), mb: theme.spacing(3), borderRadius: theme.shape.borderRadius }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: theme.palette.secondary.main }}>
              🧾 {item.direction_name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: theme.spacing(1) }}>
              <strong>Talaba izohi:</strong> {item.student_comment || <span style={{ color: theme.palette.text.disabled }}>Kiritilmagan</span>}
            </Typography>

            <Divider sx={{ my: theme.spacing(2) }} />

            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
              📎 Fayllar:
            </Typography>
            {item.files.length === 0 ? (
              <Typography variant="body2" color="text.secondary">Fayl mavjud emas</Typography>
            ) : (
              <List dense>
                {item.files.map((f) => (
                  <ListItem key={f.id} disablePadding>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <AttachFileIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <Link href={f.file} target="_blank" rel="noreferrer" variant="body2">
                      {f.comment || `Fayl ${f.id}`}
                      {f.section && ` (Bo'lim: ${f.section})`}
                    </Link>
                  </ListItem>
                ))}
              </List>
            )}

            <Divider sx={{ my: theme.spacing(2) }} />

            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
              🎯 Ball qo‘yish:
            </Typography>
            {item.score ? (
              <Box sx={{ display: 'flex', alignItems: 'center', color: theme.palette.success.main, gap: 1 }}>
                <CheckCircleIcon />
                <Typography variant="body1" fontWeight="bold">Berilgan ball: {item.score.value}</Typography>
                {item.score.note && (
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    (Izoh: {item.score.note})
                  </Typography>
                )}
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: theme.spacing(2) }}>
                <TextField
                  label="Ball (0-10)"
                  type="number"
                  inputProps={{ min: 0, max: 10, step: 0.1 }} // Allow decimals if needed
                  value={scoreInputs[item.id]?.value ?? ''}
                  onChange={(e) =>
                    setScoreInputs((prev) => ({
                      ...prev,
                      [item.id]: {
                        ...prev[item.id],
                        value: e.target.value === '' ? '' : parseFloat(e.target.value),
                      },
                    }))
                  }
                  fullWidth
                  variant="outlined"
                  size="small"
                />
                <TextField
                  label="Izoh"
                  multiline
                  rows={3}
                  placeholder="Izoh yozing (ixtiyoriy)"
                  value={scoreInputs[item.id]?.note ?? ''}
                  onChange={(e) =>
                    setScoreInputs((prev) => ({
                      ...prev,
                      [item.id]: {
                        ...prev[item.id],
                        note: e.target.value,
                      },
                    }))
                  }
                  fullWidth
                  variant="outlined"
                  size="small"
                />
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SendIcon />}
                  onClick={() => handleScoreSubmit(item.id)}
                  disabled={submittingItemId === item.id || scoreInputs[item.id]?.value === '' || isNaN(Number(scoreInputs[item.id]?.value))}
                  sx={{ py: theme.spacing(1.2) }}
                >
                  {submittingItemId === item.id ? 'Jo‘natilmoqda...' : 'Ball qo‘yish'}
                </Button>
              </Box>
            )}
            {item.reviewer_comment && ( // Show reviewer comment if available
              <Box sx={{ mt: theme.spacing(2), p: theme.spacing(1.5), bgcolor: theme.palette.action.selected, borderRadius: theme.shape.borderRadius }}>
                <Typography variant="body2" fontWeight="medium">
                  Tekshiruvchi izohi:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.reviewer_comment}
                </Typography>
              </Box>
            )}
          </Paper>
        ))
      )}

      <Snackbar
        open={snackBarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackBarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackBarOpen(false)} severity={snackBarSeverity} sx={{ width: '100%' }}>
          {snackBarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CheckAriza;