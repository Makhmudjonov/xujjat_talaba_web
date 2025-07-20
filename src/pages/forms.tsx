import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Slide from "@mui/material/Slide";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  ButtonProps,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { styled } from "@mui/system";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import ApplicationHistory from "./ApplicationHistory";

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  boxShadow: "0px 6px 25px rgba(0,0,0,0.08)",
  borderRadius: `${Number(theme.shape.borderRadius) * 3}px`,
  overflow: "hidden",
  padding: theme.spacing(2, 0),
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1.8, 4),
  borderRadius: `${Number(theme.shape.borderRadius) * 3}px`,
  fontWeight: 600,
  fontSize: "1rem",
  transition: "transform 0.2s ease-in-out",
  "&:hover": { transform: "translateY(-2px)" },
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.error.main,
  "&:hover": {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.contrastText,
  },
}));

const FileInputButton = styled(Button)<ButtonProps>(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  flexShrink: 0,
  minWidth: "150px",
  justifyContent: "center",
  textTransform: "none",
  padding: theme.spacing(1.2, 2),
  borderRadius: `${Number(theme.shape.borderRadius) * 2}px`,
  "& .MuiButton-startIcon": { marginRight: theme.spacing(1) },
}));

interface Direction {
  id: number;
  name: string;
  type: "score" | "test" | "file" | "gpa";
  require_file: boolean;
  gpa: string | null;
  score: number | null;
  test_result: number | null;
  min_score: number;
  max_score: number;
  section: { id: number; name?: string } | number;
}

interface FormProps {
  directions: Direction[];
  applicationTypeId: number;
  onSuccess?: () => void;
}

export const ApplicationForm: React.FC<FormProps> = ({
  directions,
  applicationTypeId,
  onSuccess,
}) => {
  const [directionFiles, setDirectionFiles] = useState<Record<number, File | null>>({});
  const [loading, setLoading] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const initial: Record<number, File | null> = {};
    directions.forEach((d) => (initial[d.id] = null));
    setDirectionFiles(initial);
  }, [directions]);

  const handleFileChange = (dirId: number, file: File | null) =>
    setDirectionFiles((prev) => ({ ...prev, [dirId]: file }));

  const handleFileDelete = (dirId: number) =>
    setDirectionFiles((prev) => ({ ...prev, [dirId]: null }));

  const validateForm = () => {
    setSubmissionMessage(null);
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setSubmissionMessage(null);

    const formData = new FormData();
    formData.append("application_type", applicationTypeId.toString());
    formData.append("comment", "");

    const items = directions.map((dir) => {
      const file = directionFiles[dir.id];
      const hasFile = file !== null;
      const fileMeta = hasFile ? [{ section: dir.section, comment: "" }] : [];

      return {
        direction: dir.id,
        student_comment: "",
        ...(dir.type === "gpa" && dir.gpa !== null && { gpa: dir.gpa }),
        ...(dir.type === "test" && dir.test_result !== null && { test_result: dir.test_result }),
        files: fileMeta,
      };
    });

    formData.append("items", JSON.stringify(items));

    directions.forEach((dir, idx) => {
      const file = directionFiles[dir.id];
      if (file) {
        formData.append(`files_${idx}_0`, file);
      }
    });

    try {
      const res = await fetchWithAuth("https://tanlov.medsfera.uz/api/student/applications/", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSubmissionMessage({
          type: "error",
          message: data.detail || "Xatolik yuz berdi. Iltimos, ma'lumotlarni tekshiring.",
        });
      } else {
        setSubmissionMessage({ type: "success", message: "Arizangiz muvaffaqiyatli yuborildi." });
        
        setTimeout(() => {
          const cleared: Record<number, File | null> = {};
          directions.forEach((d) => (cleared[d.id] = null));
          setDirectionFiles(cleared);
          onSuccess?.();
        }, 3000);
        window.location.reload();
      }
    } catch {
      setSubmissionMessage({
        type: "error",
        message: "Tarmoq xatosi. Iltimos, internet aloqangizni tekshiring.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!directions || directions.length === 0) {
    return <ApplicationHistory />;
  }

  return (
    <Box>
      {submissionMessage && (
        <Snackbar
          open={!!submissionMessage}
          autoHideDuration={3000}
          onClose={() => setSubmissionMessage(null)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          TransitionComponent={(props) => <Slide {...props} direction="down" />}
        >
          <Alert
            severity={submissionMessage.type}
            iconMapping={{
              success: <CheckCircleIcon fontSize="inherit" />,
              error: <ErrorIcon fontSize="inherit" />,
            }}
            onClose={() => setSubmissionMessage(null)}
            variant="filled"
            sx={{
              fontSize: "1rem",
              fontWeight: 500,
              textAlign: "center",
              py: 2,
              boxShadow: 3,
              borderRadius: 2,
            }}
          >
            {submissionMessage.message}
          </Alert>
        </Snackbar>
      )}

      <StyledCard>
        <CardContent sx={{ px: { xs: 2, sm: 4 }, py: { xs: 3, sm: 4 } }}>
          <Typography
            variant="h5"
            component="h2"
            color="primary"
            sx={{
              mb: 3,
              fontWeight: 700,
              textAlign: "center",
              pb: 2,
              borderBottom: "1px solid",
              borderColor: (t) => t.palette.grey[300],
            }}
          >
            Ijtimoiy faollik mezonlariga hujjatlarni (yoki natijalarni) taqdim eting
          </Typography>

          {directions.map((dir, idx) => {
            const file = directionFiles[dir.id];
            const sectionName =
              typeof dir.section === "object" && dir.section?.name ? ` (${dir.section.name})` : "";
            const isGpa = dir.type === "score";
            const isTest = dir.type === "test";

            return (
              <Box key={dir.id} sx={{ mb: 3 }}>
                <Typography
                  variant="body1"
                  sx={{ mb: 1.5, fontWeight: "bold", fontSize: "1.05rem" }}
                >
                  {idx + 1}. {dir.name}
                  {sectionName}
                </Typography>

                {isGpa && (
                  <Typography variant="body2" color="text.secondary" sx={{ ml: { xs: 0, sm: 2 }, mb: 1 }}>
                    <Box component="span" sx={{ fontWeight: "bold", color: "text.primary" }}>
                      GPA: {dir.gpa}
                    </Box>{" "}
                    ball asosida avtomatik hisoblanadi. Hujjat yuklash shart emas.
                  </Typography>
                )}

                {isTest && (
                  <Box sx={{ ml: { xs: 0, sm: 1 }, mb: 3 }}>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      flexWrap="wrap"
                    >
                      <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                        <Box component="span" sx={{ fontWeight: "bold", color: "text.primary" }}>
                          Test natijasi:
                        </Box>{" "}
                        {dir.test_result !== null ? (
                          <Box component="span" sx={{ fontWeight: "bold", color: "primary.dark" }}>
                            {dir.test_result}
                          </Box>
                        ) : (
                          <em>Natija kutilmoqda</em>
                        )}
                        . Hujjat yuklash shart emas.
                      </Typography>

                      {dir.test_result === null && (
                        <StyledButton
                          size="small"
                          color="primary"
                          onClick={() => navigate("/tests")}
                          sx={{ mt: { xs: 1, sm: 0 } }}
                        >
                          Test topshirish
                        </StyledButton>
                      )}
                    </Box>
                  </Box>
                )}

                {!isGpa && !isTest && (
                  <Box
                    display="flex"
                    flexDirection={{ xs: "column", sm: "row" }}
                    gap={2}
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    sx={{
                      p: 2,
                      border: "1px dashed",
                      borderColor: (theme) => theme.palette.grey[400],
                      borderRadius: 2,
                      backgroundColor: (theme) => theme.palette.grey[50],
                    }}
                  >
                    <FileInputButton
                      variant="contained"
                      component="label"
                      startIcon={<CloudUploadIcon />}
                      color="info"
                    >
                      {file ? (file.name.length > 30 ? file.name.slice(0, 27) + "..." : file.name) : "Hujjat yuklash"}
                      <input
                        type="file"
                        accept=".pdf"
                        hidden
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const maxSize = 4 * 1024 * 1024;
                            if (file.size > maxSize) {
                              alert("Fayl hajmi 4 MB dan oshmasligi kerak!");
                              return;
                            }
                            handleFileChange(dir.id, file);
                          }
                        }}
                      />
                    </FileInputButton>
                    {file && (
                      <StyledIconButton onClick={() => handleFileDelete(dir.id)}>
                        <DeleteIcon />
                      </StyledIconButton>
                    )}
                    {!file && (
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        Hujjat ixtiyoriy.
                      </Typography>
                    )}
                  </Box>
                )}

                {idx < directions.length - 1 && <Divider sx={{ my: 3 }} />}
              </Box>
            );
          })}
        </CardContent>
      </StyledCard>

      <Box display="flex" justifyContent="flex-end" alignItems="center" mt={4}>
        <StyledButton variant="contained" color="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? <CircularProgress size={24} color="inherit" /> : "Arizani yuborish"}
        </StyledButton>
      </Box>
    </Box>
  );
};

export default ApplicationForm;
