import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Stack,
  Fade,
  CircularProgress,
  Link,
} from "@mui/material";
import { Edit, Save, Cancel, Description } from "@mui/icons-material";
import { fetchWithAuth } from "../utils/fetchWithAuth";

interface FileItem {
  id: number;
  file_url: string;
  comment: string;
  application_title: string;
}

interface Props {
  file: FileItem;
  onUpdated: () => void; // Callback after update
}

const ApplicationFileCommentEditor: React.FC<Props> = ({ file, onUpdated }) => {
  const [editing, setEditing] = useState(false);
  const [commentText, setCommentText] = useState(file.comment || "");
  const [saving, setSaving] = useState(false);

  const handleEdit = () => {
    setCommentText(file.comment || "");
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setCommentText(file.comment || "");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetchWithAuth(`https://tanlov.medsfera.uz/api/student/files/${file.id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comment: commentText }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Fayl izohini yangilashda xatolik.");
      }

      setEditing(false);
      onUpdated(); // Refresh parent
    } catch (err: any) {
      alert("Izohni saqlashda xatolik: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        border: "1px solid #e0e0e0",
        bgcolor: "#f9f9f9",
        mb: 2,
      }}
    >
      <Link
        href={file.file_url}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          display: "flex",
          alignItems: "center",
          color: "#2563eb",
          textDecoration: "none",
          fontWeight: 600,
          mb: 1,
        }}
      >
        <Description sx={{ mr: 1 }} />
        {file.application_title || file.file_url.split("/").pop()}
      </Link>

      {editing ? (
        <Fade in={editing}>
          <Box>
            <TextField
              label="Fayl izohi"
              fullWidth
              size="small"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              sx={{ mb: 1 }}
              disabled={saving}
            />
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Cancel />}
                onClick={handleCancel}
                disabled={saving}
              >
                Bekor
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={saving ? <CircularProgress size={16} /> : <Save />}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saqlanmoqda..." : "Saqlash"}
              </Button>
            </Stack>
          </Box>
        </Fade>
      ) : (
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" sx={{ color: "#555" }}>
            {file.comment ? `Izoh: ${file.comment}` : <em>Izoh yo‘q</em>}
          </Typography>
          <IconButton onClick={handleEdit} size="small" sx={{ color: "#2563eb" }}>
            <Edit fontSize="small" />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export default ApplicationFileCommentEditor;
