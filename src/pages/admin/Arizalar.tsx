import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Alert,
  useTheme,
  Pagination,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid, // Grid komponenti to'g'ri import qilingan
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

// --- Sahifalash uchun doimiy o'zgaruvchi ---
const PAGE_SIZE = 10;

// --- Typings (Backend API javobiga aniq mos keladigan turlar) ---
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

interface File {
  id: number;
  comment: string | null;
  file: string;
  section: number | null;
}

interface Score {
  id: number;
  value: number;
  note: string | null;
  scored_at?: string;
  item?: number;
  reviewer?: number;
}

interface AppItem {
  id: number;
  direction_name: string;
  student_comment: string | null;
  reviewer_comment: string | null;
  score: Score | null;
  files: File[];
}

interface StudentShort {
  id: number;
  full_name: string;
  student_id_number: string;
  faculty: number | null;
  level: number | null;
  gpa_records?: GPARecord[]; // GPA records qo'shildi
}

interface Application {
  id: number;
  status: string;
  comment: string | null;
  submitted_at: string;
  student: StudentShort;
  items: AppItem[];
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Application[];
}

// --- Helper Utility Function (API javobini tahlil qilish) ---
const parsePaginatedResponse = async (
  res: Response
): Promise<PaginatedResponse> => {
  const data = await res.json();
  console.log("parsePaginatedResponse: API xom javobi:", data);

  if (
    typeof data.count === "number" &&
    Array.isArray(data.results) &&
    (typeof data.next === "string" || data.next === null) &&
    (typeof data.previous === "string" || data.previous === null)
  ) {
    return data as PaginatedResponse;
  }

  console.error(
    "parsePaginatedResponse: Xato: API javobi kutilgan paginatsiya formatida emas.",
    data
  );
  throw new Error(
    "Serverdan kutilmagan javob formati. Iltimos, backend javobini tekshiring."
  );
};

// --- COMPONENT ---
const Arizalar: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- Filtr holatlari ---
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("pending"); // Default pending arizalar

  const navigate = useNavigate();
  const theme = useTheme();

  const fetchApplications = useCallback(
    async (page: number) => {
      setLoading(true);
      setError(null);
      console.log(
        `>>> fetchApplications: Arizalarni yuklash boshlandi: Sahifa ${page}, Qidiruv: "${searchQuery}", Status: "${filterStatus}"`
      );

      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          console.warn(
            "fetchApplications: Token mavjud emas. Foydalanuvchi login sahifasiga yo'naltirilmoqda."
          );
          localStorage.clear(); // Token bo'lmasa tozalaymiz
          navigate("/admin/login");
          throw new Error("Token mavjud emas — iltimos login qiling.");
        }

        const url = new URL("https://tanlov.medsfera.uz/api/admin/applications/");

        // --- Filtr parametrlarini URL'ga qo'shamiz ---
        if (filterStatus !== "all") {
          url.searchParams.set("status", filterStatus);
        }
        if (searchQuery.trim()) {
          url.searchParams.set("search", searchQuery.trim());
        }
        url.searchParams.set("page", String(page));
        url.searchParams.set("page_size", String(PAGE_SIZE));

        console.log("fetchApplications: API so'rovi URL:", url.toString());

        const res = await fetchWithAuth(url.toString(), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          if (res.status === 401) {
            console.error(
              "fetchApplications: 401 Unauthorized: Sessiya tugagan. Token tozalanmoqda va login sahifasiga yo'naltirilmoqda."
            );
            localStorage.clear();
            navigate("/admin/login");
            throw new Error("Sessiya tugagan. Iltimos, qaytadan kiring.");
          }
          const err = await res.json().catch(() => ({}));
          const errorMessage =
            err.detail ||
            `Maʼlumotlarni olishda xatolik: ${res.status} ${res.statusText}`;
          console.error(
            "fetchApplications: API javob xatosi:",
            errorMessage,
            err
          );
          throw new Error(errorMessage);
        }

        const { results, count } = await parsePaginatedResponse(res);

        setApplications(results);
        const calculatedTotalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
        setTotalPages(calculatedTotalPages);
        setCurrentPage(page);

        console.log(
          `fetchApplications: Yuklangan arizalar soni (joriy sahifada): ${results.length}`
        );
        console.log(`fetchApplications: Jami yozuvlar (count): ${count}`);
        console.log(
          `fetchApplications: Hisoblangan jami sahifalar (totalPages): ${calculatedTotalPages}`
        );
        console.log(`fetchApplications: Joriy sahifa (currentPage): ${page}`);
      } catch (err: any) {
        setError(err.message ?? "Nomaʼlum xatolik yuz berdi.");
        setApplications([]);
        console.error("fetchApplications: Funksiyada xato:", err);
      } finally {
        setLoading(false);
        console.log("<<< fetchApplications: Arizalarni yuklash yakunlandi.");
      }
    },
    [searchQuery, filterStatus, navigate]
  );

  // --- Filterlar o'zgarganda ma'lumotlarni qayta yuklash ---
  useEffect(() => {
    console.log("useEffect: Filtrlar o'zgardi, birinchi sahifa yuklanmoqda.");
    fetchApplications(1);
  }, [searchQuery, filterStatus, fetchApplications]);

  // --- Qidiruv maydoni o'zgarishini boshqarish ---
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // --- Status filtri o'zgarishini boshqarish ---
  const handleStatusChange = (event: any) => {
    setFilterStatus(event.target.value as string);
  };

  // --- Filtrlarni tozalash ---
  const handleClearFilters = () => {
    setSearchQuery("");
    setFilterStatus("pending");
  };

  // --- Talabaning so'nggi GPA'sini ko'rsatish funksiyasi ---
  const renderStudentGPA = (student: StudentShort) => {
    if (student.gpa_records && student.gpa_records.length > 0) {
      // Eng oxirgi GPA rekordini topish
      const latestGPA = student.gpa_records.reduce((latest, current) => {
        return new Date(current.created_at) > new Date(latest.created_at)
          ? current
          : latest;
      });
      return (
        <Typography variant="body2" fontWeight="medium">
          {latestGPA.gpa}
        </Typography>
      );
    }
    return (
      <Typography variant="body2" color="text.secondary">
        -
      </Typography>
    );
  };

  // --- Yo'nalishlarni ko'rsatish funksiyasi (o'zgarishsiz) ---
  const renderDirections = (app: Application) => (
    <Typography
      variant="body2"
      sx={{
        maxWidth: "150px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {app.items.map((it) => it.direction_name).join(", ")}
    </Typography>
  );

  // --- Status rangini aniqlash funksiyasi (o'zgarishsiz) ---
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return theme.palette.warning.main;
      case "approved":
      case "accepted":
        return theme.palette.success.main;
      case "rejected":
        return theme.palette.error.main;
      default:
        return theme.palette.text.primary;
    }
  };

  return (
    <Box sx={{ p: theme.spacing(3) }}>
      {/* <Typography variant="h4" component="h1" gutterBottom sx={{ mb: theme.spacing(4), fontWeight: 700 }}>
        📋 Arizalar ro'yxati
      </Typography> */}
      {/* --- Filtr Boshqaruvlari --- */}
      <Paper
        elevation={2}
        sx={{
          p: theme.spacing(3),
          mb: theme.spacing(4),
          borderRadius: theme.shape.borderRadius,
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ mb: theme.spacing(2) }}>
          Filtrlar
        </Typography>
        <Grid container spacing={2} alignItems="center">
          {/* Grid item xs={12} sm={6} md={4} -> Grid item xs={12} sm={6} md={4} bo'lishi kerak */}
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Talaba F.I.Sh. yoki ID"
              variant="outlined"
              fullWidth
              size="small"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Qidiruv..."
            />
          </Grid>
          {/* Grid size={{xs:12, sm:6, md:3}} -> Grid item xs={12} sm={6} md={3} bo'lishi kerak */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter-select"
                value={filterStatus}
                onChange={handleStatusChange}
                label="Status"
              >
                <MenuItem value="pending">Kutilmoqda</MenuItem>
                <MenuItem value="all">Barchasi</MenuItem>
                <MenuItem value="approved">Tasdiqlangan</MenuItem>
                <MenuItem value="accepted">Qabul qilingan</MenuItem>
                <MenuItem value="rejected">Rad etilgan</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {/* Grid size={{xs:12, sm:6, md:2}} -> Grid item xs={12} sm={6} md={2} bo'lishi kerak */}
          <Grid item xs={12} sm={6} md={2}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleClearFilters}
              fullWidth
              sx={{ py: 1 }}
            >
              Filtrni tozalash
            </Button>
          </Grid>
        </Grid>
      </Paper>
      {/* --- Yuklanish indikatori --- */}
      {loading && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            my: theme.spacing(4),
          }}
        >
          <CircularProgress color="primary" sx={{ mb: theme.spacing(2) }} />
          <Typography variant="body1" color="text.secondary">
            Ma'lumotlar yuklanmoqda...
          </Typography>
        </Box>
      )}
      {/* --- Xato xabari --- */}
      {error && (
        <Alert severity="error" sx={{ my: theme.spacing(3) }}>
          {error}
        </Alert>
      )}
      {/* --- Bo'sh ro'yxat xabari --- */}
      {!loading && applications.length === 0 && !error && (
        <Alert severity="info" sx={{ my: theme.spacing(3) }}>
          Filtrga mos arizalar topilmadi.
        </Alert>
      )}
      {/* --- Arizalar jadvali --- */}
      {!loading && applications.length > 0 && (
        <TableContainer
          component={Paper}
          elevation={3}
          sx={{ borderRadius: theme.shape.borderRadius }}
        >
          <Table size="small" aria-label="Arizalar jadvali">
            <TableHead sx={{ bgcolor: theme.palette.primary.dark }}>
              <TableRow>
                <TableCell
                  sx={{
                    color: theme.palette.common.white,
                    fontWeight: 600,
                    fontSize: "0.85rem",
                  }}
                >
                  ID
                </TableCell>
                <TableCell
                  sx={{
                    color: theme.palette.common.white,
                    fontWeight: 600,
                    fontSize: "0.85rem",
                  }}
                >
                  Talaba F.I.Sh.
                </TableCell>
                <TableCell
                  sx={{
                    color: theme.palette.common.white,
                    fontWeight: 600,
                    fontSize: "0.85rem",
                  }}
                >
                  Talaba ID
                </TableCell>
                <TableCell
                  sx={{
                    color: theme.palette.common.white,
                    fontWeight: 600,
                    fontSize: "0.85rem",
                  }}
                >
                  Yo‘nalish(lar)
                </TableCell>
                <TableCell
                  sx={{
                    color: theme.palette.common.white,
                    fontWeight: 600,
                    fontSize: "0.85rem",
                  }}
                >
                  Izoh
                </TableCell>
                <TableCell
                  sx={{
                    color: theme.palette.common.white,
                    fontWeight: 600,
                    fontSize: "0.85rem",
                  }}
                >
                  GPA
                </TableCell>{" "}
                {/* Yangi ustun */}
                <TableCell
                  sx={{
                    color: theme.palette.common.white,
                    fontWeight: 600,
                    fontSize: "0.85rem",
                  }}
                >
                  Status
                </TableCell>
                <TableCell
                  sx={{
                    color: theme.palette.common.white,
                    fontWeight: 600,
                    fontSize: "0.85rem",
                  }}
                >
                  Amallar
                </TableCell>{" "}
                {/* Ball ustuni olib tashlandi, chunki ikkita Ball ustuni bor edi */}
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.map((app) => (
                <TableRow
                  key={app.id}
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                    "&:hover": { bgcolor: theme.palette.action.hover },
                  }}
                >
                  <TableCell component="th" scope="row">
                    <Typography variant="body2" fontWeight="bold">
                      {app.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {app.student.full_name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {app.student.student_id_number}
                    </Typography>
                  </TableCell>
                  <TableCell>{renderDirections(app)}</TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        maxWidth: "120px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {app.comment || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell>{renderStudentGPA(app.student)}</TableCell>{" "}
                  {/* GPA ko'rsatish */}
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        textTransform: "capitalize",
                        fontWeight: "bold",
                        color: getStatusColor(app.status),
                      }}
                    >
                      {app.status}
                    </Typography>
                  </TableCell>
                  {/* Ball ustuni faqat bitta bo'lishi kerak, shuning uchun ikkinchisi olib tashlandi */}
                  <TableCell>
                    <Button
                      variant="contained"
                      color="info"
                      size="small"
                      onClick={() => navigate(`/admin/check-ariza/${app.id}`)}
                      sx={{ minWidth: 70, fontSize: "0.75rem", py: 0.5 }}
                    >
                      Ko‘rish
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      ---
      {/* --- Pagination komponenti --- */}
      {!loading && totalPages > 1 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: theme.spacing(4),
          }}
        >
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => fetchApplications(page)}
            color="primary"
            showFirstButton
            showLastButton
            size="large"
          />
        </Box>
      )}
    </Box>
  );
};

export default Arizalar;
