import React, { useEffect, useState } from "react";
import SubmittedApplicationCard from "./SubmittedApplicationCard";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import { Typography, CircularProgress, Box, Container } from "@mui/material";
import { motion } from "framer-motion";

interface FileItem {
  id: number;
  file_url: string;
  comment: string;
  application_title: string;
  section: number;
  application_id: number;
}

interface DirectionItem {
  id: number;
  title: string;
  student_comment: string;
  reviewer_comment: string | null;
  direction: number;
  gpa: number | null;
  test_result: number | null;
  files: FileItem[];
}

const ApplicationHistory: React.FC = () => {
  const [items, setItems] = useState<DirectionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(
        "https://tanlov.medsfera.uz/api/student/application-items/"
      );
      if (!res.ok) throw new Error("Xatolik yuz berdi");
      const data = await res.json();
      const fetchedItems = data.results || data;
      setItems(fetchedItems);
    } catch (error: any) {
      alert(`Xatolik: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, textAlign: "center", mb: 4 }}
        >
          Mening Arizalarim Tarixi
        </Typography>

        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            mt={8}
          >
            <CircularProgress size={40} />
          </Box>
        ) : items.length === 0 ? (
          <Box textAlign="center" mt={8}>
            <Typography variant="h6">
              Sizda hozircha arizalar mavjud emas.
            </Typography>
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" gap={3}>
            {items.map((item) => (
              <SubmittedApplicationCard
                key={item.id}
                item={item}
                onUpdated={loadData}
              />
            ))}
          </Box>
        )}
      </motion.div>
    </Container>
  );
};

export default ApplicationHistory;
