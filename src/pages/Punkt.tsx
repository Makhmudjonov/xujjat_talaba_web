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
} from "@mui/material";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import SchoolIcon from "@mui/icons-material/School";
import WorkspacesIcon from "@mui/icons-material/Workspaces";

const API = "http://localhost:8000/api/student/application-types/";

interface ApplicationType {
  allowed_levels: any;
  id: number;
  key: string;
  name: string;
  subtitle: string;
  icon?: JSX.Element;
  can_apply: boolean;
  reason: string | null;
}

const ApplicationChoicePage: React.FC = () => {
  const [types, setTypes] = useState<ApplicationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [gpa, setGpa] = useState<number | null>(null);
  const [level, setLevel] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(API, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Application types fetch error");

        const data = await res.json();

        // Add icon and styling
        const withIcons = data.map((item: ApplicationType) => {
          let icon: JSX.Element;
          switch (item.key) {
            case "toliq_grant":
            case "toliq_bolmagan_grant":
              icon = <SchoolIcon sx={{ fontSize: 48, color: "#0288d1" }} />;
              break;
            case "qoshimcha_davlat_granti":
              icon = <WorkspacesIcon sx={{ fontSize: 48, color: "#8e24aa" }} />;
              break;
            case "oliy_talim_tashkiloti_granti":
              icon = <HowToRegIcon sx={{ fontSize: 48, color: "#fb8c00" }} />;
              break;
            default:
              icon = <SchoolIcon sx={{ fontSize: 48 }} />;
          }
          return { ...item, icon };
        });


        setTypes(withIcons);

        // GPA ni birinchi elementdan olish (hamma bir xil student uchun)
        if (data.length > 0 && typeof data[0].student_gpa === "number") {
          setGpa(data[0].student_gpa);
        }

        if (Array.isArray(data)) {
          if (typeof data[0].student_level === "string") {
            setLevel(data[0].student_level);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
        <CircularProgress />
      </Box>
    );
  }

  const handleSelect = (key: string, id: number) => {
    navigate(`/student/application-form/${id}`);
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} align="center" sx={{ mt: 4, mb: 1 }}>
        Ariza turini tanlang
      </Typography>

      {gpa !== null && (
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 1 }}>
          Sizning GPA ballingiz: <strong>{gpa}</strong>
        </Typography>
      )}

      {level && (
  <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 2 }}>
    Sizning kursingiz: <strong>{level}</strong>
  </Typography>
)}

      <Grid container spacing={3}>
        {types.map((opt) => (
          <Grid size={{xs:10, sm:6, md:4}} >
            <Card
              component={CardActionArea}
              onClick={() => handleSelect(opt.key, opt.id)}
              sx={{
                width: "100%",
                height: "100%",
                minHeight: 250,
                p: 3,
                textAlign: "center",
                borderRadius: 3,
                transition: "transform 0.25s, box-shadow 0.25s",
                '&:hover': {
                  transform: "translateY(-4px)",
                  boxShadow: 6,
                },
                opacity: opt.can_apply ? 1 : 0.5,
                pointerEvents: opt.can_apply ? "auto" : "none",
              }}
            >
              <Box>{opt.icon}</Box>
              <CardContent sx={{ pt: 1 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {opt.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {opt.subtitle}
                </Typography>
                <Divider sx={{ my: 2 }} />
                {opt.allowed_levels && opt.allowed_levels.length > 0 && (
                  <Typography variant="inherit" color="text.secondary">
                    Ruxsat etilgan kurslar: {opt.allowed_levels.join(", ")}
                  </Typography>
                )}                
                {!opt.can_apply && opt.reason && (
                  <Typography variant="caption" color="error">
                    {opt.reason}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box textAlign="center" mt={5}>
        <Button variant="contained" size="large" disabled sx={{ textTransform: "none" }}>
          Davom etish
        </Button>
        <Typography variant="caption" display="block" color="text.secondary" mt={1}>
          (Davom etish tugmasi tanlovdan so‘ng yoqiladi)
        </Typography>
      </Box>
    </Box>
  );
};

export default ApplicationChoicePage;