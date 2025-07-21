import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchWithAuth } from "../utils/fetchWithAuth";

const API_BASE_URL = "https://tanlov.medsfera.uz/api/test";

interface Option {
  id: number;
  label: string;
  text: string;
}

interface Question {
  id: number;
  text: string;
  options: Option[];
}

interface StartResponse {
  session_id: number;
  duration: number;
  first_question: Question | null;
  total_questions: number;
  resume: boolean;
  current_index: number;
  remaining_seconds: number;
}

interface ResumeResponse {
  id: number;
  total_questions: number;
  current_question: Question | null;
  remaining_seconds: number;
  current_index: number;
}

const TestSessionPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { testId, sessionId: initialSessionId } = location.state
    ? (location.state as { testId?: number; sessionId?: number })
    : { testId: undefined, sessionId: undefined };

  const [sessionId, setSessionId] = useState<number | null>(
    initialSessionId || null
  );
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [remainingSec, setRemainingSec] = useState<number>(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [currentIndex, setCurrentIndex] = useState<number>(1);
  const [isFinished, setIsFinished] = useState(false);
  const isInitialized = useRef(false); // Prevent double execution in Strict Mode

  useEffect(() => {
    if (!testId) {
      navigate("/tests", { replace: true });
      return;
    }

    if (isInitialized.current) {
      return; // Prevent re-running init if already initialized
    }
    isInitialized.current = true;

    let isMounted = true;

    const init = async () => {
      try {
        console.log(
          "Initializing test session, testId:",
          testId,
          "initialSessionId:",
          initialSessionId
        );
        const savedSession = localStorage.getItem(`testSession_${testId}`);

        if (initialSessionId) {
          console.log("Resuming session with sessionId:", initialSessionId);
          await resumeSession(initialSessionId);
        } else if (savedSession) {
          const { sessionId, remainingSec, currentIndex } =
            JSON.parse(savedSession);
          if (typeof sessionId === "number" && sessionId > 0) {
            console.log("Resuming from localStorage, sessionId:", sessionId);
            setSessionId(sessionId);
            setRemainingSec(remainingSec || 0);
            setCurrentIndex(currentIndex || 1);
            await resumeSession(sessionId);
          } else {
            throw new Error("Invalid sessionId in localStorage");
          }
        } else {
          console.log("Starting new session for testId:", testId);
          await startNewSession();
        }
      } catch (e: any) {
        console.error("Init error:", e.message);
        setError(
          "Testni yuklashda muammo yuz berdi. Iltimos, qaytadan urinib ko‘ring."
        );
        localStorage.removeItem(`testSession_${testId}`);
        setTimeout(() => navigate("/tests", { replace: true }), 3000);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, [testId, initialSessionId, navigate]);

  useEffect(() => {
    if (sessionId && testId) {
      localStorage.setItem(
        `testSession_${testId}`,
        JSON.stringify({ sessionId, remainingSec, currentIndex })
      );
    }
  }, [sessionId, remainingSec, currentIndex, testId]);

  const finishTest = useCallback(async () => {
    if (!sessionId || isFinished) return;
    setIsFinished(true);
    try {
      setLoading(true);
      console.log("Finishing test session, sessionId:", sessionId);
      const res = await fetchWithAuth(`${API_BASE_URL}/${sessionId}/finish/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        const data = await res.json();
        const msg = `✅ Test yakunlandi! Siz ${data.correct_answers}/${data.total_questions} ta savolga to‘g‘ri javob berdingiz. Natijangiz: ${data.score}%`;
        setResultMessage(msg);
        localStorage.removeItem(`testSession_${testId}`);
        setTimeout(() => navigate("/tests", { replace: true }), 3000);
      } else {
        const err = await res.json();
        setError(err.detail || "Testni yakunlashda muammo yuz berdi.");
        if (
          err.detail?.includes("yakunlangan") ||
          err.detail?.includes("No TestSession")
        ) {
          localStorage.removeItem(`testSession_${testId}`);
          navigate("/tests", { replace: true });
        }
      }
    } catch (e: any) {
      console.error("Finish test error:", e.message);
      setError(e.message || "Testni yakunlashda muammo yuz berdi.");
    } finally {
      setLoading(false);
    }
  }, [sessionId, testId, navigate, isFinished]);

  useEffect(() => {
    if (!sessionId || remainingSec <= 0 || isFinished) return;

    const timer = setInterval(() => {
      setRemainingSec((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionId, remainingSec, isFinished, finishTest]);

  const startNewSession = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Starting new session, testId:", testId);
      const res = await fetchWithAuth(`${API_BASE_URL}/start/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ test_id: testId }),
      });
      const raw = await res.json();

      if (!res.ok) {
        console.error("Start session error:", raw);
        if (raw.session_id) {
          navigate(`/test/${raw.session_id}/result`, { replace: true });
          return;
        }
        throw new Error(raw.detail || "Testni boshlashda xato yuz berdi");
      }

      const data: StartResponse = raw;
      if (!data.first_question || !data.first_question.options) {
        console.error("Invalid question format in start response:", data);
        throw new Error("Noto‘g‘ri savol formati");
      }

      console.log(
        "New session started, sessionId:",
        data.session_id,
        "question:",
        data.first_question
      );
      setSessionId(data.session_id);
      setQuestion(data.first_question);
      setRemainingSec(data.remaining_seconds);
      setTotalQuestions(data.total_questions);
      setCurrentIndex(data.current_index);
      setSelectedOption(null);
    } catch (e: any) {
      console.error("Start new session error:", e.message);
      setError(
        e.message ||
          "Testni boshlashda muammo yuz berdi. Iltimos, qaytadan urinib ko‘ring."
      );
    } finally {
      setLoading(false);
    }
  }, [testId, navigate]);

  const resumeSession = useCallback(
    async (sessionId: number) => {
      try {
        setLoading(true);
        console.log("Resuming session, sessionId:", sessionId);
        const res = await fetchWithAuth(
          `${API_BASE_URL}/${sessionId}/resume/`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const raw = await res.json();
        if (res.ok) {
          const data: ResumeResponse = raw;
          if (!data.current_question || !data.current_question.options) {
            console.error("Invalid question format in resume response:", data);
            throw new Error("Noto‘g‘ri savol formati");
          }
          console.log("Session resumed, question:", data.current_question);
          setQuestion(data.current_question);
          setTotalQuestions(data.total_questions);
          setRemainingSec(data.remaining_seconds);
          setCurrentIndex(data.current_index);
          setSelectedOption(null);
          setSessionId(sessionId);
        } else {
          console.error("Resume session error:", raw);
          throw new Error(raw.detail || "Sessiyani davom ettirib bo‘lmadi");
        }
      } catch (e: any) {
        console.error("Resume session error:", e.message);
        setError(e.message || "Sessiyani davom ettirishda muammo yuz berdi.");
        localStorage.removeItem(`testSession_${testId}`);
        navigate("/tests", { replace: true });
      } finally {
        setLoading(false);
      }
    },
    [testId, navigate]
  );

  const loadNext = useCallback(async () => {
    if (!sessionId) return;
    try {
      setLoading(true);
      console.log("Loading next question, sessionId:", sessionId);
      const res = await fetchWithAuth(`${API_BASE_URL}/${sessionId}/next/`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      const raw = await res.json();
      if (res.ok) {
        if (raw.detail?.includes("yakunlangan")) {
          console.log("Test session finished via next question");
          finishTest();
        } else {
          if (!raw.options) {
            console.error("Invalid question format in next response:", raw);
            throw new Error("Noto‘g‘ri savol formati");
          }
          console.log("Next question loaded:", raw);
          setQuestion(raw);
          setSelectedOption(null);
          setCurrentIndex((prev) => prev + 1);
        }
      } else {
        console.error("Load next question error:", raw);
        setError(raw.detail || "Keyingi savolni olishda xato");
        if (
          raw.detail?.includes("yakunlangan") ||
          raw.detail?.includes("No TestSession")
        ) {
          localStorage.removeItem(`testSession_${testId}`);
          finishTest();
        }
      }
    } catch (e: any) {
      console.error("Load next question error:", e.message);
      setError(e.message || "Keyingi savolni yuklashda muammo yuz berdi.");
    } finally {
      setLoading(false);
    }
  }, [sessionId, testId, finishTest]);

  const submitAnswer = useCallback(async () => {
    if (!sessionId || !question || selectedOption === null) return;
    try {
      setLoading(true);
      console.log(
        "Submitting answer, questionId:",
        question.id,
        "selectedOption:",
        selectedOption
      );
      const res = await fetchWithAuth(`${API_BASE_URL}/${sessionId}/answer/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question_id: question.id,
          selected_option_id: Number(selectedOption),
        }),
      });
      const raw = await res.json();
      if (res.ok) {
        console.log("Answer submitted successfully");
        loadNext();
      } else {
        console.error("Submit answer error:", raw);
        setError(raw.detail || "Javobni yuborishda xato");
        if (
          raw.detail?.includes("yakunlangan") ||
          raw.detail?.includes("No TestSession")
        ) {
          localStorage.removeItem(`testSession_${testId}`);
          finishTest();
        }
      }
    } catch (e: any) {
      console.error("Submit answer error:", e.message);
      setError(e.message || "Javobni yuborishda muammo yuz berdi.");
    } finally {
      setLoading(false);
    }
  }, [sessionId, question, selectedOption, testId, loadNext, finishTest]);

  const fmt = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          minHeight="60vh"
        >
          <CircularProgress />
          <Typography mt={2}>
            Test yuklanmoqda... (Savol: {currentIndex}/{totalQuestions})
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {resultMessage && (
        <Box mb={3}>
          <Alert severity="success" variant="filled">
            {resultMessage} (yo‘naltirilmoqda...)
          </Alert>
        </Box>
      )}

      <Paper elevation={4} sx={{ p: 4 }}>
        <Box display="flex" justifyContent="space-between" mb={3}>
          <Typography variant="h6" fontWeight={600}>
            Savol: {currentIndex} / {totalQuestions}
          </Typography>
          <Typography
            variant="h6"
            color={remainingSec < 60 ? "error" : "text.primary"}
          >
            {fmt(remainingSec)}
          </Typography>
        </Box>

        {question ? (
          <>
            <Typography variant="h6" fontWeight={600} mb={2}>
              {question.text}
            </Typography>

            <RadioGroup
              value={selectedOption ?? ""}
              onChange={(e) => setSelectedOption(e.target.value)}
            >
              {question.options?.map((o) => (
                <FormControlLabel
                  key={o.id}
                  value={o.id.toString()}
                  control={<Radio />}
                  label={`${o.label}. ${o.text}`}
                />
              ))}
            </RadioGroup>

            <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => setConfirmOpen(true)}
              >
                Yakunlash
              </Button>
              <Button
                variant="contained"
                disabled={selectedOption === null}
                onClick={submitAnswer}
              >
                {currentIndex >= totalQuestions ? "Yakunlash" : "Keyingisi"}
              </Button>
            </Box>
          </>
        ) : (
          <Typography>Test savollari yakunlandi...</Typography>
        )}
      </Paper>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Testni yakunlash</DialogTitle>
        <DialogContent>
          <Typography>
            Testni yakunlamoqchimisiz? Yakunlaganingizdan so‘ng qayta davom
            ettira olmaysiz.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} color="secondary">
            Bekor qilish
          </Button>
          <Button onClick={finishTest} variant="contained">
            Yakunlash
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TestSessionPage;
