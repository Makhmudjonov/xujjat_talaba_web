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
  Stepper,
  Step,
  StepLabel,
  useTheme,
  Alert,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import { styled } from "@mui/system";
import { fetchWithAuth } from "../utils/fetchWithAuth";

// Interfaces (unchanged)
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

interface ApplicationStatus {
  id: number;
  application_type: number;
  application_type_name: string;
  status: string;
  submitted_at: string;
}

interface ApplicationFile {
  id: number;
  file_url: string;
  comment: string;
  application_title: string;
}

interface Score {
  id: number;
  value: number;
  note: string;
  scored_at: string;
}

interface ApplicationItem {
  id: number;
  application: number;
  application_type_name: string;
  direction: number;
  direction_name: string;
  title: string;
  student_comment: string;
  reviewer_comment: string | null;
  gpa: number | null;
  test_result: number | null;
  files: ApplicationFile[];
  status: boolean;
  score: Score | null;
}

interface ScoreObj {
  id: number;
  value: number;
  note?: string;
  scored_at: string;
}

// interface ApplicationItem {
//   id: number;
//   application: number;
//   title: string;
//   student_comment: string;
//   reviewer_comment: string | null;
//   direction: number;
//   direction_name: string;
//   submitted_at: string;
//   score: ScoreObj | null;      // ⬅️  obyekt yoki null
//   reviewed_at: string | null;
// }

// Define the custom primary color for easier use
const PRIMARY_BLUE = "#253B80";

// Custom styled Box for information items
const StyledInfoItem = styled(Box)(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "light"
      ? theme.palette.grey[50]
      : theme.palette.grey[800],
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  padding: theme.spacing(2),
  height: "100%",
  // boxShadow: theme.shadows[0], // No initial shadow, very flat
  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: theme.shadows, // Subtle hover shadow
  },
}));

// InfoItem component
const InfoItem: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <StyledInfoItem>
    <Typography variant="caption" color="text.secondary" fontWeight={600}>
      {label}
    </Typography>
    <Typography
      variant="body2"
      fontWeight={500}
      sx={{ wordBreak: "break-word" }}
    >
      {value}
    </Typography>
  </StyledInfoItem>
);

// Custom Step Icon for the Stepper
const StepIconRoot = styled("div")<{
  ownerState: {
    active?: boolean;
    completed?: boolean;
    status?: string;
    stepIndex: number;
    currentStatusIndex: number;
  };
}>(({ theme, ownerState }) => ({
  color:
    theme.palette.mode === "light"
      ? theme.palette.grey[400]
      : theme.palette.grey[600], // Default faded grey
  display: "flex",
  height: 22,
  alignItems: "center",
  // Apply color based on current status and step index
  ...(ownerState.completed && {
    color: theme.palette.success.main, // Completed steps are green
  }),
  ...(ownerState.active && {
    color: PRIMARY_BLUE, // Active step is primary blue
  }),
  // Specific color for 'rejected' status, overriding others if it's the current status step
  ...(ownerState.status === "rejected" &&
    ownerState.stepIndex === ownerState.currentStatusIndex && {
      color: theme.palette.error.main, // Red for the rejected step if it's the current status
    }),
  // Icons styling
  "& .MuiSvgIcon-root": {
    zIndex: 1,
    fontSize: 28,
  },
}));

// Define steps globally
const steps = ["pending", "reviewed", "accepted", "rejected"];

function CustomStepIcon(props: {
  active: boolean;
  completed: boolean;
  className: string;
  icon: number; // Represents the step index (1-based)
  status: string; // The current application status
}) {
  const { active, completed, className, icon, status } = props;
  const stepIndex = icon - 1; // Convert 1-based icon to 0-based index
  const currentStatusIndex = steps.indexOf(status);

  const icons: { [key: string]: React.ReactElement } = {
    "1": <HourglassEmptyIcon />, // pending
    "2": <AssignmentTurnedInIcon />, // reviewed
    "3": <CheckCircleOutlineIcon />, // accepted
    "4": <RemoveCircleOutlineIcon />, // rejected
  };

  let iconToRender = icons[String(icon)];

  // Determine the color based on active, completed, and the overall status
  // If a step is completed, it's green.
  // If it's the current active step, it's PRIMARY_BLUE (or red if rejected).
  // Otherwise, it's faded.

  // Custom logic for icon rendering based on status
  if (completed) {
    iconToRender = <CheckCircleOutlineIcon />;
  } else if (stepIndex === currentStatusIndex && status === "rejected") {
    iconToRender = <RemoveCircleOutlineIcon />;
  } else if (stepIndex === currentStatusIndex) {
    // Current step
    if (status === "pending") iconToRender = <HourglassEmptyIcon />;
    else if (status === "reviewed") iconToRender = <AssignmentTurnedInIcon />;
    else if (status === "accepted") iconToRender = <CheckCircleOutlineIcon />; // Should be completed, but for robustness
  }

  return (
    <StepIconRoot
      ownerState={{
        active,
        completed,
        status: status,
        stepIndex: stepIndex,
        currentStatusIndex: currentStatusIndex,
      }}
    >
      {iconToRender}
    </StepIconRoot>
  );
}

const AccountPage: React.FC = () => {
  const [student, setStudent] = useState<Student | null>(null);
  const [applications, setApplications] = useState<ApplicationStatus[]>([]);
  const [applicationItems, setApplicationItems] = useState<ApplicationItem[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const token = localStorage.getItem("accessToken");
  //       if (!token) {
  //         setError("Tizimga kirilmagan. Iltimos, qayta kiring.");
  //         setLoading(false);
  //         return;
  //       }

  //       const headers = { Authorization: `Bearer ${token}` };

  //       // Fetch student data
  //       const resStu = await fetchWithAuth("https://tanlov.medsfera.uz/api/student/account/");
  //       if (!resStu.ok) {
  //         const errorData = await resStu.json();
  //         throw new Error(errorData.detail || "Talaba ma'lumotlarini olishda xatolik yuz berdi.");
  //       }
  //       const stu: Student = await resStu.json();
  //       setStudent(stu);

  //       // // Fetch applications data
  //       // const resApp = await fetchWithAuth("https://tanlov.medsfera.uz/api/student/applications/");
  //       // if (!resApp.ok) {
  //       //   if (resApp.status !== 404) {
  //       //     const errorData = await resApp.json();
  //       //     console.error("Failed to fetch applications:", errorData);
  //       //   }
  //       //   setApplications([]);
  //       // } else {
  //       //   const apps: ApplicationStatus[] = await resApp.json();
  //       //   setApplications(apps);
  //       // }

  //       // Fetch application items data
  //       // const resItems = await fetchWithAuth("https://tanlov.medsfera.uz/api/student/application-items/");
  //       // if (!resItems.ok) {
  //       //   if (resItems.status !== 404) {
  //       //     const errorData = await resItems.json();
  //       //     console.error("Failed to fetch application items:", errorData);
  //       //   }
  //       //   setApplicationItems([]);
  //       // } else {
  //       //   const items: ApplicationItem[] = await resItems.json();
  //       //   setApplicationItems(items);
  //       // }
  //     } catch (err) {
  //       setError((err as Error).message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchData();
  // }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setError("Tizimga kirilmagan. Iltimos, qayta kiring.");
          setLoading(false);
          return;
        }

        // Fetch student info (base64 coded)
        const resStu = await fetchWithAuth(
          "https://tanlov.medsfera.uz/api/student/account/"
        );
        if (!resStu.ok) {
          const errorData = await resStu.json();
          throw new Error(
            errorData.detail ||
              "Talaba ma'lumotlarini olishda xatolik yuz berdi."
          );
        }

        // Fetch applications data
        // const resApp = await fetchWithAuth("https://tanlov.medsfera.uz/api/student/applications/");
        // if (!resApp.ok) {
        //   if (resApp.status !== 404) {
        //     const errorData = await resApp.json();
        //     console.error("Failed to fetch applications:", errorData);
        //   }
        //   setApplications([]);
        // } else {
        //   const apps: ApplicationStatus[] = await resApp.json();
        //   setApplications(apps);
        // }

        // Fetch application items data
        const loadApplicationItems = async () => {
          try {
            const resItems = await fetchWithAuth("https://tanlov.medsfera.uz/api/student/application-items/");
            if (!resItems.ok) {
              if (resItems.status !== 404) {
                const errorData = await resItems.json();
                console.error("Failed to fetch application items:", errorData);
              }
              setApplicationItems([]);
            } else {
              const items: ApplicationItem[] = await resItems.json();
              setApplicationItems(items); // score, files, gpa, test_result va boshqalar shu object ichida
            }
          } catch (error) {
            console.error("Server error while fetching application items:", error);
            setApplicationItems([]);
          }
        };
      
        loadApplicationItems();

        const encoded = await resStu.json(); // { data: "base64_string" }
        const decodedStudent: Student = JSON.parse(atob(encoded.data));
        setStudent(decodedStudent);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Determine custom icon for Stepper
  const getStepIcon = (status: string) => {
    return function (props: any) {
      return <CustomStepIcon {...props} status={status} />;
    };
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress size={60} sx={{ color: PRIMARY_BLUE }} />
        <Typography variant="h6" color="text.secondary" ml={2}>
          Ma'lumotlar yuklanmoqda...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <Alert severity="error" sx={{ px: 4, py: 2, borderRadius: 2 }}>
          <Typography variant="h6" color="error">
            Xatolik!
          </Typography>
          <Typography>{error}</Typography>
          <Typography mt={1}>
            Sahifani yangilab ko'ring yoki keyinroq urinib ko'ring.
          </Typography>
        </Alert>
      </Box>
    );
  }

  if (!student) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <Alert severity="info" sx={{ px: 4, py: 2, borderRadius: 2 }}>
          <Typography variant="h6">Ma'lumot topilmadi</Typography>
          <Typography>
            Talaba ma'lumotlari mavjud emas. Profilingizni to'ldirishingiz kerak
            bo'lishi mumkin.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        gap: theme.spacing(3),
        p: theme.spacing(3),
        bgcolor: theme.palette.grey[50],
        minHeight: "100vh",
      }}
    >
      {/* Left Column: Student Profile */}
      <Box sx={{ flex: 2 }}>
        <Container maxWidth="md" sx={{ py: theme.spacing(2) }}>
          <Card
            sx={{
              p: theme.spacing(4),
              borderRadius: Number(theme.shape.borderRadius) * 2,
              boxShadow: theme.shadows[1], // Even softer shadow for minimalist feel
              background: theme.palette.background.paper, // Solid white background
              border: `1px solid ${theme.palette.grey[100]}`, // Very light border
            }}
          >
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
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
                      mb: theme.spacing(2),
                      border: `3px solid ${PRIMARY_BLUE}`,
                      boxShadow: theme.shadows[1], // Softer shadow
                    }}
                  />
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    color="text.primary"
                  >
                    {student.full_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {student.university}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={8}>
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  mb={theme.spacing(1)}
                  sx={{ color: PRIMARY_BLUE }}
                >
                  👤 Shaxsiy Maʼlumotlar
                </Typography>
                <Grid container spacing={theme.spacing(2)}>
                  {[
                    { label: "ID raqami", value: student.student_id_number },
                    { label: "Qisqa ism", value: student.short_name },
                    { label: "Email", value: student.email },
                    { label: "Telefon", value: student.phone },
                    { label: "Jinsi", value: student.gender },
                    { label: "Tug‘ilgan sana", value: student.birth_date },
                    { label: "Manzil", value: student.address },
                  ].map((info, idx) => (
                    <Grid item xs={12} sm={6} key={idx}>
                      <InfoItem label={info.label} value={info.value} />
                    </Grid>
                  ))}
                </Grid>
                <Divider sx={{ my: theme.spacing(4) }} />
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  mb={theme.spacing(1)}
                  sx={{ color: PRIMARY_BLUE }}
                >
                  🎓 Taʼlim Maʼlumotlari
                </Typography>
                <Grid container spacing={theme.spacing(2)}>
                  {[
                    { label: "Universitet", value: student.university },
                    { label: "Fakultet", value: student.faculty_name },
                    { label: "Guruh", value: student.group },
                    { label: "Bosqich", value: student.level_name },
                  ].map((info, idx) => (
                    <Grid item xs={12} sm={6} key={idx}>
                      <InfoItem label={info.label} value={info.value} />
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </Card>
        </Container>
      </Box>

      {/* Right Column: GPA Details and Application Status */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: theme.spacing(2),
        }}
      >
        {/* GPA Details Card */}
        <Card
          sx={{
            p: theme.spacing(3),
            borderRadius: Number(theme.shape.borderRadius) * 2,
            boxShadow: theme.shadows[1], // Softer shadow
            background: theme.palette.background.paper, // Solid white background
            border: `1px solid ${theme.palette.grey[100]}`, // Very light border
          }}
        >
          <Typography
            variant="h6"
            fontWeight={700}
            gutterBottom
            sx={{ color: PRIMARY_BLUE }}
          >
            📊 GPA Tafsilotlari
          </Typography>
          {student.gpa_records.length > 0 ? (
            student.gpa_records.map((gpa, idx) => (
              <Box
                key={idx}
                sx={{
                  bgcolor: theme.palette.background.paper,
                  borderRadius: Number(theme.shape.borderRadius) * 1,
                  px: theme.spacing(2),
                  py: theme.spacing(1.5),
                  mb: theme.spacing(1),
                  borderLeft: `4px solid ${PRIMARY_BLUE}`,
                  transition: "all 0.3s",
                  "&:hover": {
                    boxShadow: theme.shadows[1], // Softer hover shadow
                    transform: "scale(1.01)",
                  },
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color="text.primary"
                >
                  {gpa.education_year} | {gpa.level}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  GPA: <strong>{gpa.gpa}</strong>, Kredit:{" "}
                  <strong>{gpa.credit_sum}</strong>, Fanlar:{" "}
                  <strong>{gpa.subjects}</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Qarz fanlar: {gpa.debt_subjects} | Transfer:{" "}
                  {gpa.can_transfer ? "Ha" : "Yo‘q"}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontStyle: "italic" }}
            >
              GPA maʼlumotlari mavjud emas.
            </Typography>
          )}
        </Card>

        {/* Application Status Card */}
        <Card
          sx={{
            p: theme.spacing(3),
            borderRadius: Number(theme.shape.borderRadius) * 2,
            boxShadow: theme.shadows[1], // Softer shadow
            background: theme.palette.background.paper,
            border: `1px solid ${theme.palette.grey[100]}`, // Very light border
          }}
        >
          <Typography
            variant="h6"
            fontWeight={700}
            gutterBottom
            color="text.primary"
          >
            📝 Arizalar Holati
          </Typography>
          {applicationItems.length > 0 ? (
  applicationItems.map((item, i) => (
    <Box
      key={i}
      sx={{
        bgcolor: theme.palette.grey[50],
        borderRadius: Number(theme.shape.borderRadius) * 1,
        p: theme.spacing(1.5),
        mb: theme.spacing(2),
        border: `1px solid ${theme.palette.grey[200]}`,
      }}
    >
      <Typography variant="body2">
        <strong>Ariza ID:</strong> {item.application}
      </Typography>
      <Typography variant="body2">
        <strong>Yo‘nalish:</strong> {item.title}
      </Typography>
      <Typography variant="body2">
        <strong>Komissiya izohi:</strong> {item.reviewer_comment || "Mavjud emas"}
      </Typography>
      {/* <Typography variant="body2">
        <strong>Tekshirgan vaqt:</strong>{" "}
        {item. ? new Date(item.reviewed_at).toLocaleString() : "—"}
      </Typography> */}
      <Typography variant="body2">
        <strong>Ball:</strong>{" "}
        {item.score ? (
          <Typography
            component="span"
            fontWeight={700}
            color={
              item.score.value > 0 ? "success.main" : "error.main"
            }
          >
            {item.score.value}
          </Typography>
        ) : (
          "—"
        )}
      </Typography>
    </Box>
  ))
) : (
  <Typography variant="body2" color="text.secondary" fontStyle="italic">
    Sizda hali baholangan yo‘nalishlar mavjud emas.
  </Typography>
)}

        </Card>
      </Box>
    </Box>
  );
};

export default AccountPage;
