import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  IconButton,
  Stack,
  CircularProgress,
  Link,
  Divider,
  Fade,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { alpha } from '@mui/material/styles';
import {
  Edit,
  Save,
  Cancel,
  CloudUpload,
  InsertDriveFile,
  CheckCircleOutline,
  Close,
} from "@mui/icons-material";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import { motion } from "framer-motion";

interface FileItem {
  id: number;
  file_url: string;
  comment: string;
  application_title: string;
}

interface DirectionItem {
  id: number;
  title: string;
  student_comment: string;
  test_result: number | null;
  gpa: number | null;
  reviewer_comment: string | null;
  files: FileItem[];
}

interface Props {
  item: DirectionItem;
  onUpdated: () => void;
}

interface ApplicationType {
  allowed_levels: string[]; // Changed to string[] as it's typically an array of strings like "1-kurs", "2-kurs"
  id: number;
  key: string;
  name: string;
  subtitle: string;
  icon?: JSX.Element;
  can_apply: boolean;
  reason: string | null;
  student_gpa?: number; // Added to interface if present in API response
  student_level?: string; // Added to interface if present in API response
}

const API = "https://tanlov.medsfera.uz/api/student/application-types/";

const SubmittedApplicationCard: React.FC<Props> = ({ item, onUpdated }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [gpa, setGpa] = useState<number | null>(null);

  const [editingMainComment, setEditingMainComment] = useState(false);
  const [mainComment, setMainComment] = useState(item.student_comment);
  const [savingMainComment, setSavingMainComment] = useState(false);

  const [editingFileComment, setEditingFileComment] = useState<number | null>(null);
  const [fileCommentInput, setFileCommentInput] = useState("");
  const [savingFileComment, setSavingFileComment] = useState(false);

  const [replacingFileId, setReplacingFileId] = useState<number | null>(null);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  const [uploadingNewFile, setUploadingNewFile] = useState(false);
  const [newFileComment, setNewFileComment] = useState(""); // Comment for new file upload

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "info" | "warning">("success");

  const showSnackbar = (message: string, severity: "success" | "error" | "info" | "warning" = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  useEffect(()=>{
    const fetchApplicationTypes = async () => {
      const res = await fetchWithAuth(API);
      const data: ApplicationType[] = await res.json();

      if (data.length > 0) {
          if (typeof data[0].student_gpa === "number") {
            setGpa(data[0].student_gpa);
          }}
    }
    fetchApplicationTypes();
    
  },[])


  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  const getFileNameFromUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return decodeURIComponent(urlObj.pathname.split("/").pop() || url);
    } catch (e) {
      return url;
    }
  };

  const handleSaveMainComment = async () => {
    setSavingMainComment(true);
    try {
      const res = await fetchWithAuth(`https://tanlov.medsfera.uz/api/student/application-items/${item.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_comment: mainComment }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Asosiy izohni saqlashda xatolik yuz berdi");
      }
      setEditingMainComment(false);
      onUpdated();
      showSnackbar("Asosiy izoh saqlandi!", "success");
    } catch (e: any) {
      showSnackbar(`Xatolik: ${e.message}`, "error");
      console.error("Asosiy izohni saqlashda xato:", e);
    } finally {
      setSavingMainComment(false);
    }
  };

  const handleSaveFileComment = async (fileId: number) => {
    setSavingFileComment(true);
    try {
      const res = await fetchWithAuth(`https://tanlov.medsfera.uz/api/student/files/${fileId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: fileCommentInput }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Fayl izohini saqlashda xatolik yuz berdi");
      }
      setEditingFileComment(null);
      onUpdated();
      showSnackbar("Fayl izohi saqlandi!", "success");
    } catch (e: any) {
      showSnackbar(`Xatolik: ${e.message}`, "error");
      console.error("Fayl izohini saqlashda xato:", e);
    } finally {
      setSavingFileComment(false);
    }
  };

  const handleFileReplace = async (fileId: number) => {
    if (!newFile) {
      showSnackbar("Iltimos, fayl tanlang!", "warning");
      return;
    }
    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append("file", newFile);
      // Optionally include comment if needed
      formData.append("comment", fileCommentInput || "");

      const res = await fetchWithAuth(`https://tanlov.medsfera.uz/api/student/files/${fileId}/`, {
        method: "PATCH",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Faylni almashtirishda xatolik yuz berdi");
      }

      setReplacingFileId(null);
      setNewFile(null);
      setFileCommentInput("");
      onUpdated();
      showSnackbar("Fayl muvaffaqiyatli almashtirildi!", "success");
    } catch (error: any) {
      showSnackbar(`Faylni almashtirishda xatolik: ${error.message}`, "error");
      console.error("Faylni almashtirishda xato:", error);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleUploadNewFile = async () => {
    if (!newFile) {
        showSnackbar("Iltimos, fayl tanlang!", "warning");
        return;
    }
    setUploadingNewFile(true);
    try {
        const formData = new FormData();
        formData.append("file", newFile);
        formData.append("comment", newFileComment);

        // Example: Hardcoded section_id
        formData.append("section_id", "1");

        // Dynamic section_id (assuming item.section contains the section ID)
        // Adjust based on actual item structure from GET /api/student/application-items/
        // if (item.section) {
        //     formData.append("section_id", item.section.toString());
        // } else {
        //     // Fallback or default section_id if not available
        //     formData.append("section_id", "1"); // Example default
        //     console.warn("Section ID not found in item, using default: 1");
        // }

        const res = await fetchWithAuth(`https://tanlov.medsfera.uz/api/student/application-items/${item.id}/files/`, {
            method: "POST",
            body: formData,
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.detail || `Faylni yuklashda xatolik yuz berdi (Status: ${res.status})`);
        }

        setNewFile(null);
        setNewFileComment("");
        onUpdated();
        showSnackbar("Fayl muvaffaqiyatli yuklandi!", "success");
    } catch (error: any) {
        showSnackbar(`Faylni yuklashda xatolik: ${error.message}`, "error");
        console.error("Faylni yuklashda xato:", error);
    } finally {
        setUploadingNewFile(false);
    }
};

  return (

    
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          mb: 3,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          borderRadius: 2,
          background: "#ffffff",
          border: "1px solid #E0E0E0",
          transition: "border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
          "&:hover": {
            borderColor: "#C0C0C0",
            boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
          },
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography
            variant={isMobile ? "h6" : "h5"}
            component="div"
            sx={{
              fontWeight: 700,
              color: "#333333",
              mb: 1,
              pb: 1,
              textAlign: isMobile ? "center" : "left",
              letterSpacing: '0.02em',
            }}
          >
            {item.title}
          </Typography>
          <Divider sx={{ my: 1.5, borderColor: "#F0F0F0" }} />

          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="text.secondary">
              Ball:
            </Typography>
            
            {(item.title === 'Kitobxonlik madaniyati' || item.title === 'Talabaning akademik o‘zlashtirishi') && (
              <>
                {item.test_result !== null && item.test_result !== undefined ? (
                  <Typography>{item.test_result * 20/100} ball (Test). Test natijasi: {item.test_result}%</Typography>
                ) : gpa !== undefined && gpa !== null ? (
                  <Typography>{gpa*10/5}. - GPA: {gpa}.</Typography>
                ) : (
                  <Typography></Typography>
                )}
              </>
            )}


            
          </Box>



          {item.reviewer_comment && (
            <Box
              sx={{
                mb: 2,
                bgcolor: alpha(theme.palette.info.light, 0.1),
                p: 1.5,
                borderRadius: 1,
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                alignItems: isMobile ? "flex-start" : "center",
                gap: 1,
                color: theme.palette.info.dark,
                border: "1px solid " + alpha(theme.palette.info.main, 0.2),
              }}
            >
              <CheckCircleOutline sx={{ fontSize: 20, color: theme.palette.success.main }} />
              <Typography variant="body2" sx={{ lineHeight: 1.5, color: "#333333" }}>
                Admin izohi: {item.reviewer_comment}
              </Typography>
            </Box>
          )}

          {(item.title !== "Kitobxonlik madaniyati" && item.title !== "Talabaning akademik o‘zlashtirishi") && (<>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              color: "#666666",
              mb: 1.5,
              mt: 2.5,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Yuklangan fayllar:
          </Typography>

          {item.files.length === 0 ? (
            <Fade in={true}>
              <Box sx={{ p: 1.5, border: `1px dashed ${theme.palette.grey[400]}`, borderRadius: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                <Typography variant="caption" sx={{ mb: 1, color: "#666666", display: 'block' }}>
                  Fayl yuklash:
                </Typography>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    if (e.target.files?.[0]) setNewFile(e.target.files[0]);
                  }}
                  style={{ marginBottom: '12px', display: 'block', width: '100%', border: `1px solid ${theme.palette.grey[300]}`, padding: '8px', borderRadius: '4px' }}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Fayl izohi (ixtiyoriy)"
                  value={newFileComment}
                  onChange={(e) => setNewFileComment(e.target.value)}
                  sx={{
                    mb: 1,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1,
                      "&.Mui-focused fieldset": {
                        borderColor: theme.palette.primary.main,
                        borderWidth: '1.5px',
                      },
                    },
                  }}
                  disabled={uploadingNewFile}
                />
                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setNewFile(null);
                      setNewFileComment("");
                    }}
                    disabled={uploadingNewFile}
                    startIcon={<Cancel fontSize="small" />}
                    sx={{
                      borderRadius: 1,
                      borderColor: "#C0C0C0",
                      color: "#666666",
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        borderColor: theme.palette.primary.main,
                        color: theme.palette.primary.main,
                      },
                    }}
                  >
                    Bekor
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={handleUploadNewFile}
                    disabled={!newFile || uploadingNewFile}
                    startIcon={
                      uploadingNewFile ? <CircularProgress size={14} sx={{ color: 'white' }} /> : <CloudUpload fontSize="small" />
                    }
                    sx={{
                      borderRadius: 1,
                      bgcolor: theme.palette.primary.main,
                      color: "#ffffff",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      "&:hover": {
                        bgcolor: theme.palette.primary.dark,
                        boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                      },
                    }}
                  >
                    {uploadingNewFile ? "Yuklanmoqda..." : "Yuklash"}
                  </Button>
                </Stack>
              </Box>
            </Fade>
          ) : (
            <Stack spacing={1.5} sx={{ mb: 2 }}>
              {item.files.map((file) => (
                <Box
                  key={file.id}
                  sx={{
                    p: 1.5,
                    border: `1px solid ${editingFileComment === file.id || replacingFileId === file.id ? theme.palette.primary.main : '#E0E0E0'}`,
                    borderRadius: 1.5,
                    bgcolor: "#ffffff",
                    transition: "border-color 0.2s, background-color 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      borderColor: alpha(theme.palette.primary.main, 0.5),
                      bgcolor: alpha(theme.palette.primary.main, 0.03),
                      boxShadow: "0px 1px 3px rgba(0,0,0,0.02)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: (editingFileComment === file.id || replacingFileId === file.id) ? 1 : 0,
                    }}
                  >
                    <InsertDriveFile sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
                    <Link
                      href={file.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="body2"
                      sx={{
                        color: "#333333",
                        textDecoration: "none",
                        flexGrow: 1,
                        fontWeight: 500,
                        "&:hover": { textDecoration: "underline", color: theme.palette.primary.dark },
                      }}
                    >
                      {getFileNameFromUrl(file.file_url)}
                    </Link>
                  </Box>

                  {editingFileComment === file.id ? (
                    <Fade in={true}>
                      <Box sx={{ mt: 1, pl: isMobile ? 0 : 3 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Fayl izohi"
                          value={fileCommentInput}
                          onChange={(e) => setFileCommentInput(e.target.value)}
                          sx={{
                            mb: 1,
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 1,
                              "&.Mui-focused fieldset": {
                                borderColor: theme.palette.primary.main,
                                borderWidth: '1.5px',
                              },
                            },
                          }}
                          disabled={savingFileComment}
                        />
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => setEditingFileComment(null)}
                            disabled={savingFileComment}
                            startIcon={<Cancel fontSize="small" />}
                            sx={{
                              borderRadius: 1,
                              borderColor: "#C0C0C0",
                              color: "#666666",
                              "&:hover": {
                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                                borderColor: theme.palette.primary.main,
                                color: theme.palette.primary.main,
                              },
                            }}
                          >
                            Bekor
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleSaveFileComment(file.id)}
                            disabled={savingFileComment}
                            startIcon={
                              savingFileComment ? <CircularProgress size={14} sx={{ color: 'white' }} /> : <Save fontSize="small" />
                            }
                            sx={{
                              borderRadius: 1,
                              bgcolor: theme.palette.primary.main,
                              color: "#ffffff",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                              "&:hover": {
                                bgcolor: theme.palette.primary.dark,
                                boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                              },
                            }}
                          >
                            {savingFileComment ? "Saqlanmoqda..." : "Saqlash"}
                          </Button>
                        </Stack>
                      </Box>
                    </Fade>
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        pl: isMobile ? 0 : 3,
                        pr: 0.5,
                        mt: 0.5,
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="#666666"
                        sx={{ fontStyle: file.comment ? "normal" : "italic", flexGrow: 1 }}
                      >
                        {file.comment ? `Izoh: ${file.comment}` : "Izoh yo‘q"}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setEditingFileComment(file.id);
                          setFileCommentInput(file.comment || "");
                        }}
                        sx={{
                          color: "#999999",
                          "&:hover": {
                            color: theme.palette.primary.main,
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                            borderRadius: 1,
                          },
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Box>
                  )}

                  {replacingFileId === file.id ? (
                    <Fade in={true}>
                      <Box sx={{ mt: 1.5, p: 1.5, border: `1px dashed ${theme.palette.grey[400]}`, borderRadius: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                        <Typography variant="caption" sx={{ mb: 1, color: "#666666", display: 'block' }}>
                          Faylni almashtirish:
                        </Typography>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => {
                            if (e.target.files?.[0]) setNewFile(e.target.files[0]);
                          }}
                          style={{ marginBottom: '12px', display: 'block', width: '100%', border: `1px solid ${theme.palette.grey[300]}`, padding: '8px', borderRadius: '4px' }}
                        />
                        <TextField
                          fullWidth
                          size="small"
                          label="Fayl izohi (ixtiyoriy)"
                          value={fileCommentInput}
                          onChange={(e) => setFileCommentInput(e.target.value)}
                          sx={{
                            mb: 1,
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 1,
                              "&.Mui-focused fieldset": {
                                borderColor: theme.palette.primary.main,
                                borderWidth: '1.5px',
                              },
                            },
                          }}
                          disabled={uploadingFile}
                        />
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              setReplacingFileId(null);
                              setNewFile(null);
                              setFileCommentInput("");
                            }}
                            disabled={uploadingFile}
                            startIcon={<Cancel fontSize="small" />}
                            sx={{
                              borderRadius: 1,
                              borderColor: "#C0C0C0",
                              color: "#666666",
                              "&:hover": {
                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                                borderColor: theme.palette.primary.main,
                                color: theme.palette.primary.main,
                              },
                            }}
                          >
                            Bekor
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleFileReplace(file.id)}
                            disabled={!newFile || uploadingFile}
                            startIcon={
                              uploadingFile ? <CircularProgress size={14} sx={{ color: 'white' }} /> : <CloudUpload fontSize="small" />
                            }
                            sx={{
                              borderRadius: 1,
                              bgcolor: theme.palette.primary.main,
                              color: "#ffffff",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                              "&:hover": {
                                bgcolor: theme.palette.primary.dark,
                                boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                              },
                            }}
                          >
                            {uploadingFile ? "Yuklanmoqda..." : "Yangilash"}
                          </Button>
                        </Stack>
                      </Box>
                    </Fade>
                  ) : (
                    <Box sx={{ mt: 1, textAlign: 'right' }}>
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => {
                          setReplacingFileId(file.id);
                          setFileCommentInput(file.comment || "");
                        }}
                        sx={{
                          color: theme.palette.primary.main,
                          "&:hover": { color: theme.palette.primary.dark, bgcolor: alpha(theme.palette.primary.main, 0.05) },
                        }}
                      >
                        Faylni almashtirish
                      </Button>
                    </Box>
                  )}
                </Box>
              ))}
            </Stack>
          )}</>)}

          <Divider sx={{ my: 2.5, borderColor: "#F0F0F0" }} />

          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              color: "#666666",
              mb: 1.5,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Asosiy izoh:
          </Typography>

          {!editingMainComment ? (
            <Fade in={true}>
              <Box>
                <Typography variant="body2" sx={{ mb: 1, color: "#333333", lineHeight: 1.5 }}>
                  {mainComment || <em style={{ color: "#999999" }}>Izoh kiritilmagan</em>}
                </Typography>
                <Button
                  size="small"
                  variant="text"
                  startIcon={<Edit fontSize="small" />}
                  onClick={() => setEditingMainComment(true)}
                  sx={{
                    color: theme.palette.primary.main,
                    "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.05), color: theme.palette.primary.dark },
                  }}
                >
                  Izohni tahrirlash
                </Button>
              </Box>
            </Fade>
          ) : (
            <Fade in={true}>
              <Box>
                <TextField
                  fullWidth
                  multiline
                  rows={isMobile ? 3 : 4}
                  label="Asosiy izohingizni kiriting"
                  value={mainComment}
                  onChange={(e) => setMainComment(e.target.value)}
                  sx={{
                    mb: 1.5,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1,
                      "&.Mui-focused fieldset": {
                        borderColor: theme.palette.primary.main,
                        borderWidth: '1.5px',
                      },
                    },
                  }}
                  disabled={savingMainComment}
                />
                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setEditingMainComment(false)}
                    startIcon={<Cancel fontSize="small" />}
                    disabled={savingMainComment}
                    sx={{
                      borderRadius: 1,
                      borderColor: "#C0C0C0",
                      color: "#666666",
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        borderColor: theme.palette.primary.main,
                        color: theme.palette.primary.main,
                      },
                    }}
                  >
                    Bekor
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={handleSaveMainComment}
                    startIcon={
                      savingMainComment ? <CircularProgress size={14} sx={{ color: 'white' }} /> : <Save fontSize="small" />
                    }
                    disabled={savingMainComment}
                    sx={{
                      borderRadius: 1,
                      bgcolor: theme.palette.primary.main,
                      color: "#ffffff",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      "&:hover": {
                        bgcolor: theme.palette.primary.dark,
                        boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                      },
                    }}
                  >
                    {savingMainComment ? "Saqlanmoqda..." : "Saqlash"}
                  </Button>
                </Stack>
              </Box>
            </Fade>
          )}
        </CardContent>
      </Card>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        TransitionComponent={Fade}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{
            width: '100%',
            maxWidth: '350px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            borderRadius: 1.5,
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </motion.div>
  );
};

export default SubmittedApplicationCard;