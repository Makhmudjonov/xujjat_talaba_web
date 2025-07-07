import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Grid,
  Button,
  Divider,
  CircularProgress,
  Container, // Import Container for better layout control
  useTheme, // Import useTheme for theme access
} from "@mui/material";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import SchoolIcon from "@mui/icons-material/School";
import WorkspacesIcon from "@mui/icons-material/Workspaces";
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'; // New icon for university grant
import StarIcon from '@mui/icons-material/Star'; // New icon for full grant
import GradeIcon from '@mui/icons-material/Grade'; // New icon for partial grant
import { fetchWithAuth } from "../utils/fetchWithAuth"; // to‘g‘ri path yozing


const API = "https://tanlov.medsfera.uz/api/student/application-types/";

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

const ApplicationChoicePage: React.FC = () => {
  const [types, setTypes] = useState<ApplicationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [gpa, setGpa] = useState<number | null>(null);
  const [level, setLevel] = useState<string | null>(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null); // State to track selected card

  const navigate = useNavigate();
  const theme = useTheme(); // Access the theme for consistent styling

  useEffect(() => {
    const fetchApplicationTypes = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          throw new Error("Tizimga kirilmagan. Iltimos, qayta kiring.");
        }

        const res = await fetchWithAuth(API);

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.detail || "Ariza turlarini yuklashda xatolik yuz berdi.");
        }

        const data: ApplicationType[] = await res.json();

        // Add icon and styling based on 'key'
        const withIcons = data.map((item: ApplicationType) => {
          let icon: JSX.Element;
          // Define a primary color for icons, consistent with the app's theme
          const iconColor = theme.palette.primary.main;
          const iconSize = 48;

          switch (item.key) {
            case "toliq_grant":
              icon = <StarIcon sx={{ fontSize: iconSize, color: iconColor }} />;
              break;
            case "toliq_bolmagan_grant":
              icon = <GradeIcon sx={{ fontSize: iconSize, color: iconColor }} />;
              break;
            case "qoshimcha_davlat_granti":
              icon = <WorkspacesIcon sx={{ fontSize: iconSize, color: iconColor }} />;
              break;
            case "oliy_talim_tashkiloti_granti":
              icon = <AccountBalanceIcon sx={{ fontSize: iconSize, color: iconColor }} />;
              break;
            default:
              icon = <SchoolIcon sx={{ fontSize: iconSize, color: iconColor }} />;
          }
          return { ...item, icon };
        });

        setTypes(withIcons);

        // Extract GPA and Level from the first item if available
        if (data.length > 0) {
          if (typeof data[0].student_gpa === "number") {
            setGpa(data[0].student_gpa);
          }
          if (typeof data[0].student_level === "string") {
            setLevel(data[0].student_level);
          }
        }
      } catch (e) {
        console.error("Failed to fetch application types:", e);
        // You might want to set an error state here and display an Alert
      } finally {
        setLoading(false);
      }
    };
    fetchApplicationTypes();
  }, [theme]); // Depend on theme to ensure icon colors update if theme changes

  const handleSelect = (id: number) => {
    setSelectedApplicationId(id);
  };

  const handleContinue = () => {
    if (selectedApplicationId !== null) {
      navigate(`/student/application-form/${selectedApplicationId}`);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} color="primary" />
        <Typography variant="h6" color="text.secondary" ml={2}>
          Ma'lumotlar yuklanmoqda...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: theme.spacing(4) }}>
      <Typography variant="h4" fontWeight={700} align="center" sx={{ mt: 2, mb: 1, color: theme.palette.primary.dark }}>
        Ariza turini tanlang
      </Typography>

      {gpa !== null && (
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 1 }}>
          Sizning GPA ballingiz: <Typography component="span" fontWeight={700} color={theme.palette.info.main}>{gpa}</Typography>
        </Typography>
      )}

      {level && (
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: theme.spacing(4) }}>
          Sizning kursingiz: <Typography component="span" fontWeight={700} color={theme.palette.info.main}>{level}</Typography>
        </Typography>
      )}

      <Grid container spacing={theme.spacing(3)} justifyContent="center">
        {types.map((opt) => (
          <Grid size={{xs:12, sm:6, md:4}} key={opt.id}> {/* Use 'item' prop for Grid children */}
            <Card
              component={CardActionArea}
              onClick={() => opt.can_apply && handleSelect(opt.id)} // Only allow selection if can_apply is true
              sx={{
                width: "100%",
                height: "100%",
                minHeight: 250,
                p: theme.spacing(3),
                textAlign: "center",
                // borderRadius: theme.shape.borderRadius * 2, // More rounded corners
                boxShadow: theme.shadows[1], // Soft initial shadow
                transition: "transform 0.25s, box-shadow 0.25s, background-color 0.25s",
                "&:hover": {
                  transform: opt.can_apply ? "translateY(-4px)" : "none", // Only lift on hover if can_apply
                  boxShadow: opt.can_apply ? theme.shadows[4] : theme.shadows[1], // Stronger shadow on hover if can_apply
                },
                opacity: opt.can_apply ? 1 : 0.6, // Dim disabled cards more clearly
                cursor: opt.can_apply ? "pointer" : "not-allowed", // Change cursor for disabled cards
                border: selectedApplicationId === opt.id ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`, // Highlight selected card
                backgroundColor: selectedApplicationId === opt.id ? theme.palette.action.selected : theme.palette.background.paper, // Subtle background for selected
              }}
            >
              <Box sx={{ mb: theme.spacing(2) }}>{opt.icon}</Box>
              <CardContent sx={{ pt: 1, pb: 0 }}> {/* Adjust padding for content */}
                <Typography variant="h6" fontWeight={600} gutterBottom color="text.primary">
                  {opt.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ minHeight: theme.spacing(4) }}> {/* Add minHeight for consistent card size */}
                  {opt.subtitle}
                </Typography>
                <Divider sx={{ my: theme.spacing(2) }} />
                {opt.allowed_levels && opt.allowed_levels.length > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    Ruxsat etilgan kurslar: <strong>{opt.allowed_levels.join(", ")}</strong>
                  </Typography>
                )}
                {!opt.can_apply && opt.reason && (
                  <Typography variant="body2" color="error" sx={{ mt: theme.spacing(1), fontWeight: 500 }}>
                    {opt.reason}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      ---

      <Box textAlign="center" mt={theme.spacing(5)} mb={theme.spacing(2)}>
        <Button
          variant="contained"
          size="large"
          onClick={handleContinue}
          disabled={selectedApplicationId === null} // Enable only when a card is selected
          sx={{
            textTransform: "none",
            py: theme.spacing(1.5),
            px: theme.spacing(4),
            // borderRadius: theme.shape.borderRadius * 1.5,
            bgcolor: theme.palette.primary.main,
            "&:hover": {
              bgcolor: theme.palette.primary.dark,
            },
            "&:disabled": {
              bgcolor: theme.palette.action.disabledBackground,
              color: theme.palette.action.disabled,
            },
          }}
        >
          Davom etish
        </Button>
        <Typography variant="caption" display="block" color="text.secondary" mt={theme.spacing(1)}>
          (Davom etish tugmasi ariza turini tanlaganingizdan so‘ng faol bo‘ladi)
        </Typography>
      </Box>
    </Container>
  );
};

export default ApplicationChoicePage;