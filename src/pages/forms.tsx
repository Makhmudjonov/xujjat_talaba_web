import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Divider,
  CircularProgress,
  Container,
  Alert,
  ButtonProps,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { styled } from "@mui/system";
import { fetchWithAuth } from "../utils/fetchWithAuth";

// Styled components (unchanged)
const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  borderRadius: `${Number(theme.shape.borderRadius) * 2}px`,
  overflow: "visible",
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1.5, 3),
  borderRadius: `${Number(theme.shape.borderRadius) * 2}px`,
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
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

// Interfaces (unchanged)
interface Direction {
  id: number;
  name: string;
  section: { id: number; name: string };
  require_file: boolean;
}

interface FileItem {
  file: File | null;
  comment: string;
  section: number | null;
}

interface ApplicationItem {
  direction: number | "";
  student_comment: string;
  files: FileItem[];
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
  const [items, setItems] = useState<ApplicationItem[]>([
    { direction: "", student_comment: "", files: [] },
  ]);
  const [loading, setLoading] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // --- NEW: Memoize currently selected direction IDs ---
  const selectedDirectionIds = useMemo(() => {
    return items.map(item => item.direction).filter(Boolean) as number[];
  }, [items]);
  // --- END NEW ---

  const handleItemChange = (
    index: number,
    field: keyof ApplicationItem,
    value: any
  ) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index][field] = value === "" ? "" : value;
      return updated;
    });
  };

  const handleFileChange = (
    itemIndex: number,
    fileIndex: number,
    field: keyof FileItem,
    value: any
  ) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[itemIndex].files[fileIndex] = {
        ...updated[itemIndex].files[fileIndex],
        [field]: value,
      };
      return updated;
    });
  };

  const addFileToItem = (index: number) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index].files.push({ file: null, comment: "", section: null });
      return updated;
    });
  };

  const handleFileDelete = (itemIndex: number, fileIndex: number) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[itemIndex].files.splice(fileIndex, 1);
      return updated;
    });
  };

  const addItem = () =>
    setItems((prev) => [...prev, { direction: "", student_comment: "", files: [] }]);

  const removeItem = (index: number) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  const validateForm = (): boolean => {
    setSubmissionMessage(null); // Clear previous messages
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.direction === "") {
        setSubmissionMessage({
          type: "error",
          message: `Yo‘nalish ${i + 1} tanlanmagan.`,
        });
        return false;
      }
      const dir = directions.find((d) => d.id === item.direction);
      if (!dir) {
        setSubmissionMessage({
          type: "error",
          message: `Yo‘nalish ${i + 1} noto‘g‘ri.`,
        });
        return false;
      }
      if (dir.require_file && item.files.length === 0) {
        setSubmissionMessage({
          type: "error",
          message: `Yo‘nalish ${dir.name} uchun fayl majburiy.`,
        });
        return false;
      }
      for (let j = 0; j < item.files.length; j++) {
        const f = item.files[j];
        if (dir.require_file && !f.file) {
          setSubmissionMessage({
            type: "error",
            message: `Yo‘nalish ${dir.name} fayli ${j + 1} yuklanmagan.`,
          });
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setSubmissionMessage(null);

    const formData = new FormData();
    formData.append("application_type", applicationTypeId.toString());
    formData.append("comment", ""); // Assuming this is an overall application comment, currently empty

    const itemsJson = items.map((item) => ({
      direction: item.direction,
      student_comment: item.student_comment,
      files: item.files.map((f) => ({ comment: f.comment, section: f.section })),
    }));
    formData.append("items", JSON.stringify(itemsJson));

    items.forEach((item, i) =>
      item.files.forEach((file, j) => {
        if (file.file) formData.append(`files_${i}_${j}`, file.file);
      })
    );

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetchWithAuth(
        "https://tanlov.medsfera.uz/api/student/applications/",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error("❌ Error:", data);
        setSubmissionMessage({
          type: "error",
          message: data.detail || "Xatolik yuz berdi.",
        });
      } else {
        setSubmissionMessage({
          type: "success",
          message: "Muvaffaqiyatli yuborildi.",
        });
        setItems([{ direction: "", student_comment: "", files: [] }]);
        onSuccess?.();
      }
    } catch (err) {
      console.error("❌ Network error:", err);
      setSubmissionMessage({
        type: "error",
        message: "Tarmoq xatosi. Iltimos, internet aloqangizni tekshiring.",
      });
    } finally {
      setLoading(false);
    }
  };

  const uniqueSections = useMemo(() => {
    const map = new Map<number, string>();
    directions.forEach((d) => map.set(d.section.id, d.section.name));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [directions]);

  return (
    <Box>
      {submissionMessage && (
        <Alert severity={submissionMessage.type} sx={{ mb: 2 }}>
          {submissionMessage.message}
        </Alert>
      )}

      {items.map((item, idx) => (
        <StyledCard key={idx}>
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h6" color="primary">
                Ariza {idx + 1}
              </Typography>
              {items.length > 1 && (
                <StyledIconButton onClick={() => removeItem(idx)}>
                  <DeleteIcon />
                </StyledIconButton>
              )}
            </Box>

            <TextField
              select
              fullWidth
              label="Yo‘nalish tanlang"
              value={item.direction}
              onChange={(e) =>
                handleItemChange(
                  idx,
                  "direction",
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              sx={{ mb: 2 }}
              variant="outlined"
            >
              <MenuItem value="">Tanlang</MenuItem>
              {/* --- NEW: Filter directions based on selectedDirectionIds --- */}
              {directions.map((dir) => (
                <MenuItem
                  key={dir.id}
                  value={dir.id}
                  // Disable if already selected in another item,
                  // but allow if it's the currently selected direction for THIS item
                  disabled={selectedDirectionIds.includes(dir.id) && dir.id !== item.direction}
                >
                  {dir.name} ({dir.section.name})
                </MenuItem>
              ))}
              {/* --- END NEW --- */}
            </TextField>

            <TextField
              fullWidth
              label="Talaba izohi"
              value={item.student_comment}
              onChange={(e) =>
                handleItemChange(idx, "student_comment", e.target.value)
              }
              multiline
              rows={2}
              sx={{ mb: 3 }}
              variant="outlined"
            />

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" sx={{ mb: 2 }}>
              Fayllar
            </Typography>
            {item.files.length === 0 && (
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Hali hech qanday fayl qo'shilmagan.
              </Typography>
            )}
            {item.files.map((file, fi) => (
              <Box
                key={fi}
                display="flex"
                flexDirection={{ xs: "column", sm: "row" }}
                gap={2}
                alignItems={{ xs: "flex-start", sm: "center" }}
                mb={2}
                sx={{
                  p: 2,
                  border: "1px dashed #ccc",
                  borderRadius: 1,
                  backgroundColor: "#f9f9f9",
                }}
              >
                <FileInputButton variant="outlined" component="label" startIcon={<CloudUploadIcon />}>
                  {file.file ? file.file.name : "Fayl tanlash"}
                  <input
                    type="file"
                    hidden
                    onChange={(e) =>
                      handleFileChange(idx, fi, "file", e.target.files?.[0] || null)
                    }
                  />
                </FileInputButton>
                <TextField
                  label="Fayl izohi"
                  value={file.comment}
                  onChange={(e) => handleFileChange(idx, fi, "comment", e.target.value)}
                  sx={{ flexGrow: 1, minWidth: { xs: "100%", sm: "150px" } }}
                  variant="outlined"
                  size="small"
                />
                <TextField
                  select
                  label="O'quv yili"
                  value={file.section ?? ""}
                  onChange={(e) =>
                    handleFileChange(
                      idx,
                      fi,
                      "section",
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  }
                  sx={{ minWidth: { xs: "100%", sm: "120px" } }}
                  variant="outlined"
                  size="small"
                >
                  <MenuItem value="">Tanlang</MenuItem>
                  {uniqueSections.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name}
                    </MenuItem>
                  ))}
                </TextField>
                <StyledIconButton onClick={() => handleFileDelete(idx, fi)}>
                  <DeleteIcon />
                </StyledIconButton>
              </Box>
            ))}
            <Button
              onClick={() => addFileToItem(idx)}
              variant="text"
              startIcon={<AddCircleOutlineIcon />}
              sx={{ mt: 1 }}
            >
              Fayl qo‘shish
            </Button>
          </CardContent>
        </StyledCard>
      ))}
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
        <StyledButton
          onClick={addItem}
          variant="outlined"
          startIcon={<AddCircleOutlineIcon />}
          color="secondary"
        >
          Yangi yo‘nalish qo‘shish
        </StyledButton>
        <StyledButton
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Arizani yuborish"
          )}
        </StyledButton>
      </Box>
    </Box>
  );
};

// ApplicationFormPage (unchanged)
interface PageProps {
  applicationTypeId: number;
}

const ApplicationFormPage: React.FC<PageProps> = ({ applicationTypeId }) => {
  const [directions, setDirections] = useState<Direction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDirections = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetchWithAuth(
          `https://tanlov.medsfera.uz/api/directions?application_type_id=${applicationTypeId}`,
          
        );
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.detail || "Yo‘nalishlarni olishda xatolik");
        }
        const data = await res.json();
        setDirections(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchDirections();
  }, [applicationTypeId]);

  if (loading)
    return (
      <Box textAlign="center" mt={8}>
        <CircularProgress size={60} />
        <Typography variant="h6" color="textSecondary" mt={2}>
          Ma'lumotlar yuklanmoqda...
        </Typography>
      </Box>
    );

  if (error)
    return (
      <Box textAlign="center" mt={8}>
        <Alert severity="error" sx={{ maxWidth: 400, mx: "auto" }}>
          {error}
        </Alert>
      </Box>
    );

  if (!loading && directions.length === 0)
    return (
      <Box textAlign="center" mt={8}>
        <Alert severity="info" sx={{ maxWidth: 600, mx: "auto" }}>
          Ushbu tur uchun yo'nalishlar mavjud emas yoki siz allaqachon bu turga ariza
          yuborgansiz.
        </Alert>
      </Box>
    );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Grid container spacing={4} justifyContent="center">
        <Grid size={{xs:12}}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            align="center"
            sx={{ fontWeight: "bold", color: "primary.main" }}
          >
            Ariza topshirish
          </Typography>
          <Divider sx={{ mb: 4 }} />
        </Grid>
        <Grid size={{xs:12}}>
          <ApplicationForm
            directions={directions}
            applicationTypeId={applicationTypeId}
            onSuccess={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default ApplicationFormPage;