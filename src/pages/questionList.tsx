import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  CircularProgress,
  Alert,
  Paper,
  TableContainer,
  useTheme,
  DialogTitle,
  DialogActions,
  DialogContent,
  Dialog,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../utils/fetchWithAuth";

interface Test {
  id: number;
  title: string;
  start_time: string;
  question_count: number;
  total_questions: number;
  time_limit: number;
  created_at: string;
  status: "ishlangan" | "ishlanmagan" | "ishlanmoqda";
  session_id?: number;
  result?: {
    score: number;
    correct: number;
    total: number;
  } | null;
}

const TestsPage: React.FC = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const theme = useTheme();
  const [selectedTestId, setSelectedTestId] = useState<number | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const loadTests = async () => {
      try {
        const res = await fetchWithAuth("https://tanlov.medsfera.uz/api/tests/");
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || "Testlarni yuklashda xatolik yuz berdi");
        }
        const data: Test[] = await res.json();
        setTests(data);
      } catch (err: any) {
        setError(err.message || "Server bilan bog‘lanishda xatolik");
      } finally {
        setLoading(false);
      }
    };

    loadTests();
  }, []);

  const handleStartClick = (testId: number, sessionId?: number) => {
    setSelectedTestId(testId);
    setSelectedSessionId(sessionId || null);
    setConfirmOpen(true);
  };

  const handleConfirmStart = () => {
    if (selectedTestId !== null) {
      if (selectedSessionId) {
        navigate("/test/resume", {
          state: { testId: selectedTestId, sessionId: selectedSessionId },
        });
      } else {
        navigate("/test/start", {
          state: { testId: selectedTestId },
        });
      }
    }
    setConfirmOpen(false);
  };

  const handleCancel = () => {
    setConfirmOpen(false);
    setSelectedTestId(null);
    setSelectedSessionId(null);
  };

  const handleResult = (test: any) => {
    if (!test.result) return;
    setResult(test.result);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Alert severity="error" sx={{ fontSize: "1rem", px: 3, py: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight={700} align="center">
        📋 Mavjud testlar ro'yxati
      </Typography>

      <Paper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: theme.palette.action.hover }}>
              <TableRow>
                <TableCell>Nomi</TableCell>
                <TableCell>Boshlanish vaqti</TableCell>
                <TableCell>Savollar (ruxsat)</TableCell>
                <TableCell>Vaqt limiti (daq)</TableCell>
                <TableCell>Holat</TableCell>
                <TableCell>Natija</TableCell>
                <TableCell>Yig'ilgan ball</TableCell>
                <TableCell align="center">Amal</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tests.map((test) => (
                <TableRow key={test.id}>
                  <TableCell>{test.title}</TableCell>
                  <TableCell>
                    {test.start_time
                      ? new Date(test.start_time).toLocaleString("uz-UZ")
                      : "—"}
                  </TableCell>
                  <TableCell>{test.question_count}</TableCell>
                  <TableCell>{test.time_limit}</TableCell>
                  <TableCell>
                    {test.status === "ishlangan" ? "✅ Ishlangan" : test.status === "ishlanmoqda" ? "⏳ Ishlanmoqda" : "⌛ Ishlanmagan"}
                  </TableCell>
                  <TableCell>
                    {test.status === "ishlangan" && test.result ? (
                      <>
                        <strong>{test.result.correct ?? 0}</strong> /{" "}
                        {test.result.total ?? 0} (
                        {test.result.score ?? 0}% to‘g‘ri)
                      </>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    {test.status === "ishlangan" && test.result ? (
                      <>
                        <strong>{(test.result.score * 4) / 100}</strong>
                      </>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {test.status === "ishlangan" ? (
                      <Button
                        variant="outlined"
                        size="small"
                        color="success"
                        onClick={() => handleResult(test)}
                      >
                        Natija
                      </Button>
                    ) : test.status === "ishlanmoqda" ? (
                      <Button
                        variant="contained"
                        size="small"
                        color="warning"
                        onClick={() => handleStartClick(test.id, test.session_id)}
                      >
                        Davom etish
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleStartClick(test.id)}
                      >
                        Boshlash
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={confirmOpen} onClose={handleCancel}>
          <DialogTitle>{selectedSessionId ? "Testni davom ettirish" : "Testni boshlash"}</DialogTitle>
          <DialogContent>
            <Typography>
              {selectedSessionId
                ? "Testni oxirgi savoldan davom ettirishni xohlaysizmi?"
                : "Testni boshlashni xohlaysizmi? Vaqt darhol hisoblanadi."}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancel} color="secondary">
              Bekor qilish
            </Button>
            <Button onClick={handleConfirmStart} color="primary" variant="contained">
              {selectedSessionId ? "Davom etish" : "Boshlash"}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default TestsPage;