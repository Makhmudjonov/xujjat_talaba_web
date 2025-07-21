import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
// import CheckedArizalar from './checkedAriza';

const PAGE_SIZE = 10;

/* -------------------------------------------------------------------------- */
/* Typings (o'zgarishsiz)                                                 */
/* -------------------------------------------------------------------------- */
interface File {
  id: number;
  comment: string | null;
  file: string;
  section: number | null;
}
interface Score {
  value: number | null;
  note: number | null;
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
}
interface Application {
  id: number;
  status: string;
  comment: string | null;
  submitted_at: string;
  student: StudentShort;
  items: AppItem[];
}

/* -------------------------------------------------------------------------- */
/* Helper Utility Function(s) (o'zgarishsiz)                                  */
/* -------------------------------------------------------------------------- */
const parseResponse = async (
  res: Response
): Promise<{
  list: Application[];
  total: number;
}> => {
  const data = await res.json();

  if ("results" in data && Array.isArray(data.results)) {
    return {
      list: data.results as Application[],
      total: typeof data.count === "number" ? data.count : data.results.length,
    };
  }
  if (Array.isArray(data)) {
    return { list: data as Application[], total: data.length };
  }
  return { list: [], total: 0 };
};

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                  */
/* -------------------------------------------------------------------------- */
const CheckedArizalar: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const theme = useTheme();

  const fetchApplications = async (page: number) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        throw new Error("Token mavjud emas — iltimos login qiling");
      }

      const url = new URL(
        "https://tanlov.medsfera.uz/api/admin/applications/?status=accepted"
      );
      url.searchParams.set("page", String(page));
      url.searchParams.set("page_size", String(PAGE_SIZE));

      const res = await fetchWithAuth(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.clear();
          navigate("/login");
          throw new Error("Sessiya tugagan. Iltimos, qaytadan kiring.");
        }
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Maʼlumotlarni olishda xatolik");
      }

      const { list, total } = await parseResponse(res);

      setApplications(list);
      setTotalPages(Math.max(1, Math.ceil(total / PAGE_SIZE)));
      setCurrentPage(page);
    } catch (err: any) {
      setError(err.message ?? "Nomaʼlum xatolik");
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications(1);
  }, []);

  const renderScore = (app: Application) => {
    const scores = app.items
      .map((it) => it.score?.value)
      .filter((v): v is number => typeof v === "number");

    if (!scores.length)
      return (
        <Typography variant="caption" color="text.secondary">
          -
        </Typography>
      ); // `caption` o'rniga `body2`
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return (
      <Typography variant="caption" fontWeight="medium">
        {avg.toFixed(1)}
      </Typography>
    ); // `caption` o'rniga `body2`
  };

  const renderCommentAdmin = (app: Application) => {
    const reviewerComments = app.items
      .map((it) => it.score?.note) // `score` mavjud bo'lishi shart
      .filter(Boolean); // null, undefined yoki bo'sh stringni olib tashlaydi

    if (reviewerComments.length === 0) {
      return (
        <Typography variant="body2" color="text.secondary">
          -
        </Typography>
      );
    }

    return (
      <Typography variant="body2" fontWeight="medium">
        {reviewerComments.join(", ")}
      </Typography>
    );
  };

  const renderDirections = (app: Application) => (
    <Typography
      variant="caption"
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return theme.palette.warning.main;
      case "approved":
        return theme.palette.success.main;
      case "rejected":
        return theme.palette.error.main;
      default:
        return theme.palette.text.primary;
    }
  };

  return (
    <Box sx={{ p: theme.spacing(3) }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ mb: theme.spacing(4), fontWeight: 700 }}
      >
        📋 Arizalar ro'yxati
      </Typography>

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
            Yuklanmoqda…
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ my: theme.spacing(3) }}>
          {error}
        </Alert>
      )}

      {!loading && applications.length === 0 && !error && (
        <Alert severity="info" sx={{ my: theme.spacing(3) }}>
          Arizalar topilmadi.
        </Alert>
      )}

      {!loading && applications.length > 0 && (
        <TableContainer
          component={Paper}
          elevation={3}
          sx={{ borderRadius: theme.shape.borderRadius }}
        >
          <Table size="small" aria-label="Arizalar jadvali">
            {" "}
            {/* <<< MUHIM O'ZGARTIRISH: size="small" */}
            <TableHead sx={{ bgcolor: theme.palette.primary.dark }}>
              <TableRow>
                {/* Header Cell stilini ham kichikroq qilish uchun sx qo'shamiz */}
                <TableCell
                  sx={{
                    color: theme.palette.common.white,
                    fontWeight: 600,
                    fontSize: "0.8rem",
                  }}
                >
                  ID
                </TableCell>
                <TableCell
                  sx={{
                    color: theme.palette.common.white,
                    fontWeight: 600,
                    fontSize: "0.8rem",
                  }}
                >
                  Talaba F.I.Sh.
                </TableCell>
                <TableCell
                  sx={{
                    color: theme.palette.common.white,
                    fontWeight: 600,
                    fontSize: "0.8rem",
                  }}
                >
                  Talaba ID
                </TableCell>
                <TableCell
                  sx={{
                    color: theme.palette.common.white,
                    fontWeight: 600,
                    fontSize: "0.8rem",
                  }}
                >
                  Yo‘nalish(lar)
                </TableCell>
                <TableCell
                  sx={{
                    color: theme.palette.common.white,
                    fontWeight: 600,
                    fontSize: "0.8rem",
                  }}
                >
                  Izoh
                </TableCell>
                <TableCell
                  sx={{
                    color: theme.palette.common.white,
                    fontWeight: 600,
                    fontSize: "0.8rem",
                  }}
                >
                  Status
                </TableCell>
                <TableCell
                  sx={{
                    color: theme.palette.common.white,
                    fontWeight: 600,
                    fontSize: "0.8rem",
                  }}
                >
                  Ball
                </TableCell>
                <TableCell
                  sx={{
                    color: theme.palette.common.white,
                    fontWeight: 600,
                    fontSize: "0.8rem",
                  }}
                >
                  Amallar
                </TableCell>
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
                    <Typography variant="caption" fontWeight="bold">
                      {app.id}
                    </Typography>{" "}
                    {/* <<< variant="caption" */}
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" fontWeight="medium">
                      {" "}
                      {/* <<< variant="caption" */}
                      {app.student.full_name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {" "}
                      {/* <<< variant="caption" */}
                      {app.student.student_id_number}
                    </Typography>
                  </TableCell>
                  <TableCell>{renderDirections(app)}</TableCell>{" "}
                  {/* renderDirections o'zi variantni boshqaradi */}
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {" "}
                      {/* <<< variant="caption" */}
                      {renderCommentAdmin(app) || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="caption" // <<< variant="caption"
                      sx={{
                        textTransform: "capitalize",
                        fontWeight: "bold",
                        color: getStatusColor(app.status),
                      }}
                    >
                      {app.status}
                    </Typography>
                  </TableCell>
                  <TableCell>{renderScore(app)}</TableCell>{" "}
                  {/* renderScore o'zi variantni boshqaradi */}
                  <TableCell>
                    <Button
                      variant="contained"
                      color="info"
                      size="small" // <<< size="small"
                      onClick={() => navigate(`/admin/check-ariza/${app.id}`)}
                      sx={{ minWidth: 70, fontSize: "0.75rem" }} // <<< minWidth va fontSize ni ham kichraytirish
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

      {/* Pagination (o'zgarishsiz qoladi, u allaqachon yaxshi o'lchamda) */}
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

export default CheckedArizalar;
