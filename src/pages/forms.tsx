import React, { useState } from "react";
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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

interface Direction {
  id: number;
  name: string;
  section: {
    id: number;
    name: string;
  };
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

interface Props {
  directions: Direction[];
  applicationTypeId: number;
}

const ApplicationForm: React.FC<Props> = ({ directions, applicationTypeId }) => {
  const [items, setItems] = useState<ApplicationItem[]>([
    { direction: "", student_comment: "", files: [] },
  ]);

  const handleItemChange = (index: number, field: keyof ApplicationItem, value: any) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleFileChange = (
    itemIndex: number,
    fileIndex: number,
    field: keyof FileItem,
    value: any
  ) => {
    const updated = [...items];
    updated[itemIndex].files[fileIndex][field] = value;
    setItems(updated);
  };

  const addFileToItem = (index: number) => {
    const updated = [...items];
    updated[index].files.push({ file: null, comment: "", section: null });
    setItems(updated);
  };

  const handleFileDelete = (itemIndex: number, fileIndex: number) => {
    const updated = [...items];
    updated[itemIndex].files.splice(fileIndex, 1);
    setItems(updated);
  };

  const addItem = () => {
    setItems((prev) => [...prev, { direction: "", student_comment: "", files: [] }]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const logFormData = (formData: FormData) => {
    console.log("📦 FormData:");
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }
  };

  const validateForm = (): boolean => {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.direction) {
        alert(`Yo‘nalish ${i + 1} tanlanmagan.`);
        return false;
      }
      const dir = directions.find((d) => d.id === item.direction);
      if (!dir) {
        alert(`Yo‘nalish ${i + 1} noto‘g‘ri.`);
        return false;
      }

      if (dir.require_file && item.files.length === 0) {
        alert(`Yo‘nalish ${dir.name} uchun fayl majburiy.`);
        return false;
      }

      for (let j = 0; j < item.files.length; j++) {
        const f = item.files[j];
        if (dir.require_file && !f.file) {
          alert(`Yo‘nalish ${dir.name} fayli ${j + 1} yuklanmagan.`);
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append("application_type", applicationTypeId.toString());
    formData.append("comment", "");

    const itemsJson = items.map((item) => ({
      direction: item.direction,
      student_comment: item.student_comment,
      files: item.files.map((f) => ({
        comment: f.comment,
        section: f.section,
      })),
    }));

    formData.append("items", JSON.stringify(itemsJson));

    items.forEach((item, i) => {
      item.files.forEach((file, j) => {
        if (file.file) {
          formData.append(`files_${i}_${j}`, file.file);
        }
      });
    });

    logFormData(formData);

    try {
      const res = await fetch("/api/student/applications/", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        console.error("❌ Error response:", data);
        alert("Xatolik yuz berdi.");
      } else {
        alert("✅ Muvaffaqiyatli yuborildi.");
        setItems([{ direction: "", student_comment: "", files: [] }]);
      }
    } catch (error) {
      console.error("❌ Tarmoq xatosi:", error);
      alert("Tarmoq xatosi.");
    }
  };

  return (
    <Box>
      {items.map((item, idx) => {
        const directionData = directions.find((d) => d.id === item.direction);

        return (
          <Card key={idx} sx={{ mb: 2, p: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Yo‘nalish {idx + 1}</Typography>
                {items.length > 1 && (
                  <IconButton onClick={() => removeItem(idx)} color="error">
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>

              <TextField
                select
                fullWidth
                label="Yo‘nalish"
                value={item.direction}
                onChange={(e) =>
                  handleItemChange(idx, "direction", Number(e.target.value))
                }
                sx={{ mt: 2 }}
              >
                {directions.map((dir) => (
                  <MenuItem key={dir.id} value={dir.id}>
                    {dir.name} ({dir.section.name})
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                label="Izoh"
                value={item.student_comment}
                onChange={(e) =>
                  handleItemChange(idx, "student_comment", e.target.value)
                }
                sx={{ mt: 2 }}
              />

              <Divider sx={{ my: 2 }} />

              {item.files.map((file, fi) => (
                <Box key={fi} display="flex" gap={2} alignItems="center" mb={1}>
                  <TextField
                    type="file"
                    onChange={(e) =>
                      handleFileChange(idx, fi, "file", e.target.files?.[0] || null)
                    }
                  />
                  <TextField
                    label="Fayl izohi"
                    value={file.comment}
                    onChange={(e) =>
                      handleFileChange(idx, fi, "comment", e.target.value)
                    }
                  />
                  <TextField
                    select
                    label="Bo‘lim"
                    value={file.section ?? ""}
                    onChange={(e) =>
                      handleFileChange(idx, fi, "section", Number(e.target.value))
                    }
                  >
                    {directions
                      .map((d) => d.section)
                      .filter(
                        (section, index, self) =>
                          index ===
                          self.findIndex((s) => s.id === section.id)
                      )
                      .map((section) => (
                        <MenuItem key={section.id} value={section.id}>
                          {section.name}
                        </MenuItem>
                      ))}
                  </TextField>

                  <IconButton
                    onClick={() => handleFileDelete(idx, fi)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}

              <Button onClick={() => addFileToItem(idx)} sx={{ mt: 1 }}>
                Fayl qo‘shish
              </Button>
            </CardContent>
          </Card>
        );
      })}

      <Button onClick={addItem} variant="outlined" sx={{ mb: 2 }}>
        Yangi yo‘nalish qo‘shish
      </Button>

      <Box textAlign="right">
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Yuborish
        </Button>
      </Box>
    </Box>
  );
};

export default ApplicationForm;
