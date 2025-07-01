import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Divider,
  Grid,
  CircularProgress,
} from '@mui/material';

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

const AccountPage: React.FC = () => {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentProfile = async () => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("⚠️ accessToken topilmadi.");
      return;
    }

    const response = await fetch("http://localhost:8000/api/student/account/", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text(); // Agar JSON bo'lmasa, uni ham ko'rish uchun
      console.error("❌ So‘rov muvaffaqiyatsiz:", response.status, text);
      return;
    }

    const data = await response.json();
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
    <Box p={3}>
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid >
              <Avatar
                src={student.image}
                alt={student.full_name}
                sx={{ width: 150, height: 150 }}
              />
            </Grid>
            <Grid >
              <Typography variant="h5">{student.full_name}</Typography>
              <Typography color="text.secondary">{student.short_name}</Typography>
              <Divider sx={{ my: 2 }} />
              <Typography><strong>ID:</strong> {student.student_id_number}</Typography>
              <Typography><strong>Jinsi:</strong> {student.gender}</Typography>
              <Typography><strong>Tug‘ilgan sana:</strong> {student.birth_date}</Typography>
              <Typography><strong>Email:</strong> {student.email}</Typography>
              <Typography><strong>Telefon:</strong> {student.phone}</Typography>
              <Typography><strong>Manzil:</strong> {student.address}</Typography>
              <Typography><strong>Universitet:</strong> {student.university}</Typography>
              <Typography><strong>Fakultet:</strong> {student.faculty_name}</Typography>
              <Typography><strong>Guruh:</strong> {student.group}</Typography>
              <Typography><strong>Kurs:</strong> {student.level_name}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          GPA yozuvlari
        </Typography>
        {student.gpa_records.map((record, idx) => (
          <Card key={idx} sx={{ my: 2 }}>
            <CardContent>
              <Typography variant="subtitle1">
                📚 {record.education_year} ({record.level})
              </Typography>
              <Typography>GPA: {record.gpa}</Typography>
              <Typography>Kreditlar summasi: {record.credit_sum}</Typography>
              <Typography>Fanlar soni: {record.subjects}</Typography>
              <Typography>Qarzdor fanlar: {record.debt_subjects}</Typography>
              <Typography>Ko‘chish huquqi: {record.can_transfer ? "Ha" : "Yo‘q"}</Typography>
              <Typography>Usul: {record.method}</Typography>
              <Typography fontSize="small" color="text.secondary">
                Kiritilgan sana: {new Date(record.created_at).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default AccountPage;
