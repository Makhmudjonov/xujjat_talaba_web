import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Card,
  Container,
  Divider,
  Grid,
  Typography,
  CircularProgress,
} from "@mui/material";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

interface GPARecord {
  education_year: string;
  level: string;
  gpa: string;
  credit_sum: number;
  subjects: number;
  debt_subjects: number;
  can_transfer: boolean;
  method: string;
  created_at: string;
}

interface Student {
  student_id_number: string;
  full_name: string;
  short_name: string;
  email: string;
  phone: string;
  image: string;
  gender: string;
  birth_date: string;
  address: string;
  university: string;
  faculty_name: string;
  group: string;
  level_name: string;
  gpa_records: GPARecord[];
}

/* -------------------------------------------------------------------------- */
/*                                UI helpers                                  */
/* -------------------------------------------------------------------------- */

const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <Box
    sx={{
      bgcolor: "#f8f9fe",
      borderRadius: 3,
      p: 2,
      height: "100%",
      boxShadow: 1,
    }}
  >
    <Typography variant="caption" color="text.secondary" fontWeight={600}>
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={500}>
      {value}
    </Typography>
  </Box>
);

/* -------------------------------------------------------------------------- */
/*                               Main component                               */
/* -------------------------------------------------------------------------- */

const AccountPage: React.FC = () => {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          console.error("⚠️ accessToken topilmadi.");
          return;
        }

        const response = await fetch(
          "http://localhost:8000/api/student/account/",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          const text = await response.text();
          console.error("❌ So‘rov muvaffaqiyatsiz:", response.status, text);
          return;
        }

        const data: Student = await response.json();
        setStudent(data);
      } catch (error) {
        console.error("❌ Student ma'lumotlarini olishda xatolik:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentProfile();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  if (!student) {
    return <Typography color="error">Talaba ma'lumotlari topilmadi</Typography>;
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        gap: 3,
        p: 3,
        bgcolor: "#f4f6f9",
        minHeight: "100vh",
      }}
    >
      <Box sx={{ flex: 2 }}>
        <Container maxWidth="md" sx={{ py: 2 }}>
          <Card sx={{ p: 4, borderRadius: 4, boxShadow: 5, background: "linear-gradient(135deg, #e0f7fa 0%, #ffffff 100%)" }}>
            <Grid container spacing={4}>
              <Grid size={{xs:12, md:4}}>
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  textAlign="center"
                >
                  <Avatar
                    alt={student.full_name}
                    src={student.image}
                    sx={{
                      width: 150,
                      height: 150,
                      mb: 2,
                      border: "4px solid #00acc1",
                    }}
                  />
                  <Typography variant="h6" fontWeight={600}>{student.full_name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {student.university}
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{xs:12, md:8}}>
                <Typography variant="subtitle1" fontWeight={700} mb={1}>
                  👤 Shaxsiy Maʼlumotlar
                </Typography>
                <Grid container spacing={2}>
                  {[{ label: "ID raqami", value: student.student_id_number }, { label: "Qisqa ism", value: student.short_name }, { label: "Email", value: student.email }, { label: "Telefon", value: student.phone }, { label: "Jinsi", value: student.gender }, { label: "Tug‘ilgan sana", value: student.birth_date }, { label: "Manzil", value: student.address }].map(({ label, value }, idx) => (
                    <Grid size={{xs:12, sm:6,}} key={idx}>
                      <InfoItem label={label} value={value} />
                    </Grid>
                  ))}
                </Grid>

                <Divider sx={{ my: 4 }} />

                <Typography variant="subtitle1" fontWeight={700} mb={1}>
                  🎓 Taʼlim Maʼlumotlari
                </Typography>
                <Grid container spacing={2}>
                  {[{ label: "Universitet", value: student.university }, { label: "Fakultet", value: student.faculty_name }, { label: "Guruh", value: student.group }, { label: "Bosqich", value: student.level_name }].map(({ label, value }, idx) => (
                    <Grid size={{xs:12, sm:6}} key={idx}>
                      <InfoItem label={label} value={value} />
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </Card>
        </Container>
      </Box>

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        <Card sx={{ p: 3, borderRadius: 3, boxShadow: 4, background: "linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)" }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            📊 GPA Tafsilotlari
          </Typography>
          {student.gpa_records.length > 0 ? (
            student.gpa_records.map((gpa: GPARecord, index: number) => (
              <Box
                key={index}
                sx={{
                  bgcolor: index % 2 === 0 ? "#f0f4ff" : "#ffffff",
                  borderRadius: 2,
                  px: 2,
                  py: 1.5,
                  mb: 1,
                  borderLeft: "4px solid #00acc1",
                  transition: "all 0.3s",
                  '&:hover': {
                    boxShadow: 3,
                    bgcolor: "#e1f5fe",
                  }
                }}
              >
                <Typography variant="body2" fontWeight={600}>
                  {gpa.education_year} | {gpa.level}
                </Typography>
                <Typography variant="body2">
                  GPA: {gpa.gpa}, Kredit: {gpa.credit_sum}, Fanlar: {gpa.subjects}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Qarz fanlar: {gpa.debt_subjects} | Transfer: {gpa.can_transfer ? "Ha" : "Yo‘q"}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              Maʼlumotlar yoʻq
            </Typography>
          )}
        </Card>

        <Card sx={{ p: 3, borderRadius: 3, boxShadow: 4, background: "#fefefe" }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            📝 Qo‘shimcha Maʼlumot
          </Typography>
          <Typography variant="body2">
            Bu yerga transfer statusi, grant/tolov, yoki boshqa tegishli info qo‘shishingiz mumkin.
          </Typography>
        </Card>
      </Box>
      </Box>
  );
};

export default AccountPage;
