import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Fade,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { styled } from "@mui/material/styles";
import { fetchWithAuth } from "../utils/fetchWithAuth";

// Define type for styled components to ensure JSX compatibility
type StyledComponentProps<T extends React.JSXElementConstructor<any>> = React.ComponentProps<T>;

// Enhanced styled components with glassmorphism
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: "20px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  background: "rgba(255, 255, 255, 0.85)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  transition: "transform 0.4s ease, box-shadow 0.4s ease",
  "&:hover": {
    transform: "translateY(-10px)",
    boxShadow: "0 12px 48px rgba(0, 0, 0, 0.15)",
  },
  overflow: "hidden",
})) as React.FC<StyledComponentProps<typeof Card>>;

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(2.5), // Slightly reduced for compact cards
  "&:last-child": {
    paddingBottom: theme.spacing(2.5),
  },
})) as React.FC<StyledComponentProps<typeof CardContent>>;

const TitleTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 900,
  color: theme.palette.text.primary,
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  letterSpacing: "-0.03em",
  fontFamily: "'Inter', 'Roboto', sans-serif",
})) as React.FC<StyledComponentProps<typeof Typography>>;

const SubTitleTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  color: theme.palette.text.primary,
  letterSpacing: "-0.02em",
  marginBottom: theme.spacing(1.5),
  fontSize: "1.1rem",
  fontFamily: "'Inter', 'Roboto', sans-serif",
})) as React.FC<StyledComponentProps<typeof Typography>>;

const StatTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  fontSize: "0.9rem",
  fontWeight: 500,
  opacity: 1,
  fontFamily: "'Inter', 'Roboto', sans-serif",
})) as React.FC<StyledComponentProps<typeof Typography>>;

const AppTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: "1.5rem",
  fontWeight: 1000,
  opacity: 0.9,
  fontFamily: "'Inter', 'Roboto', sans-serif",
})) as React.FC<StyledComponentProps<typeof Typography>>;

const ValueTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  color: theme.palette.primary.main,
  fontSize: "1rem",
  lineHeight: 1.3,
  fontFamily: "'Inter', 'Roboto', sans-serif",
})) as React.FC<StyledComponentProps<typeof Typography>>;

const ListItemBox = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: theme.spacing(1.2),
  borderRadius: "8px",
  background: "linear-gradient(145deg, rgba(255,255,255,0.9), rgba(240,240,245,0.95))",
  transition: "background 0.3s, transform 0.3s",
  "&:hover": {
    background: "linear-gradient(145deg, rgba(255,255,255,1), rgba(230,240,255,1))",
    transform: "scale(1.03)",
  },
  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
})) as React.FC<StyledComponentProps<typeof Box>>;

// Enhanced color palette with vibrant gradients
const COLORS = [
  "url(#gradient1)",
  "url(#gradient2)",
  "url(#gradient3)",
  "url(#gradient4)",
  "url(#gradient5)",
];

const Dashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  fetchWithAuth("https://tanlov.medsfera.uz/api/stats/")
    .then((res) => res.json())
    .then((data) => {
      setData(data);
      setLoading(false);
    })
    .catch((err) => {
      console.error("Failed to load stats:", err);
      setLoading(false);
    });
}, []);

  if (loading || !data) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        bgcolor="background.default"
        sx={{
          // background: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
          position: "relative",
          "&:before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)",
            zIndex: 0,
          },
        }}
      >
        <CircularProgress
          size={70}
          thickness={5}
          sx={{ color: "primary.main", animation: "pulse 1.5s ease-in-out infinite" }}
        />
      </Box>
    );
  }

  return (
    <Box
      p={4}
      sx={{
        // background: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
        minHeight: "100vh",
        position: "relative",
        "&:before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)",
          zIndex: 0,
        },
        "&:after": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "180px",
          background: "linear-gradient(180deg, rgba(99, 102, 241, 0.2), transparent)",
          zIndex: 0,
        },
      }}
    >
      <Fade in timeout={1000}>
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            mb: 3,
            textAlign: "center",
            py: 2.5,
            borderRadius: "16px",
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 6px 24px rgba(0, 0, 0, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
          }}
        >
          <AppTitle>Platforma statistikasi</AppTitle>
        </Box>
      </Fade>
      <Grid container spacing={3}>
        {/* Gradient Definitions for Charts */}
        <svg style={{ position: "absolute", width: 0, height: 0 }}>
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: "#6366f1" }} />
              <stop offset="100%" style={{ stopColor: "#312e81" }} />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: "#34d399" }} />
              <stop offset="100%" style={{ stopColor: "#065f46" }} />
            </linearGradient>
            <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: "#fbbf24" }} />
              <stop offset="100%" style={{ stopColor: "#d97706" }} />
            </linearGradient>
            <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: "#f87171" }} />
              <stop offset="100%" style={{ stopColor: "#b91c1c" }} />
            </linearGradient>
            <linearGradient id="gradient5" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: "#2dd4bf" }} />
              <stop offset="100%" style={{ stopColor: "#0f766e" }} />
            </linearGradient>
          </defs>
        </svg>

        {/* --- Statistika kartalari --- */}
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <StyledCardContent>
              <StatTypography>Umumiy talabalar</StatTypography>
              <ValueTypography>{data.students.total}</ValueTypography>
            </StyledCardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <StyledCardContent>
              <StatTypography>GPA: 4+</StatTypography>
              <ValueTypography>{data.gpa_distribution["4+"]}</ValueTypography>
            </StyledCardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <StyledCardContent>
              <StatTypography>Test o‘rtacha</StatTypography>
              <ValueTypography>{data.application_items.avg_test_result}</ValueTypography>
            </StyledCardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <StyledCardContent>
              <StatTypography>Eng ko‘p ariza turi</StatTypography>
              <ValueTypography>
                {data.application_types.reduce((a: any, b: any) =>
                  a.count > b.count ? a : b
                ).application_type__name}
              </ValueTypography>
            </StyledCardContent>
          </StyledCard>
        </Grid>

        {/* --- Jins bo‘yicha Pie Chart --- */}
        <Grid item xs={12} md={3}>
          <StyledCard>
            <StyledCardContent>
              <SubTitleTypography variant="h6">
                Jins bo‘yicha taqsimot
              </SubTitleTypography>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={data.students.by_gender}
                    dataKey="count"
                    nameKey="gender"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) =>
                      `${name}: ${(percent ? percent * 100 : 0).toFixed(0)}%`
                    }
                    labelLine
                    style={{ fontSize: "12px", fontWeight: 500 }}
                    animationDuration={800}
                  >
                    {data.students.by_gender.map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "10px",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
                      background: "rgba(255, 255, 255, 0.95)",
                      border: "none",
                      fontSize: "12px",
                    }}
                    itemStyle={{ fontWeight: 500 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </StyledCardContent>
          </StyledCard>
        </Grid>

        {/* --- Kurslar bo‘yicha Bar Chart --- */}
        <Grid item xs={12} md={3}>
          <StyledCard>
            <StyledCardContent>
              <SubTitleTypography variant="h6">
                Kurs bo‘yicha taqsimot
              </SubTitleTypography>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={data.students.by_level}
                  margin={{ top: 10, right: 15, left: 5, bottom: 10 }}
                >
                  <XAxis
                    dataKey="level__name"
                    tick={{ fontSize: 11, fill: "#4b5e7a" }}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "#4b5e7a" }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "10px",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
                      background: "rgba(255, 255, 255, 0.95)",
                      border: "none",
                      fontSize: "12px",
                    }}
                    itemStyle={{ fontWeight: 500 }}
                  />
                  <Legend />
                  <Bar
                    dataKey="count"
                    fill={COLORS[1]}
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                    animationDuration={800}
                  />
                </BarChart>
              </ResponsiveContainer>
            </StyledCardContent>
          </StyledCard>
        </Grid>
        {/* --- GPA taqsimoti --- */}
        <Grid item xs={12} md={3}>
          <StyledCard>
            <StyledCardContent>
              <SubTitleTypography variant="h6">
                GPA oralig‘i bo‘yicha taqsimot
              </SubTitleTypography>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={Object.entries(data.gpa_distribution).map(
                    ([range, count]) => ({ range, count })
                  )}
                >
                  <XAxis
                    dataKey="range"
                    tick={{ fontSize: 11, fill: "#4b5e7a" }}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "#4b5e7a" }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "10px",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
                      background: "rgba(255, 255, 255, 0.95)",
                      border: "none",
                      fontSize: "12px",
                    }}
                    itemStyle={{ fontWeight: 500 }}
                  />
                  <Bar
                    dataKey="count"
                    fill={COLORS[2]}
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                    animationDuration={800}
                  />
                </BarChart>
              </ResponsiveContainer>
            </StyledCardContent>
          </StyledCard>
        </Grid>

        {/* --- Ariza turlari ro‘yxati --- */}
        <Grid item xs={12} md={3}>
          <StyledCard>
            <StyledCardContent>
              <SubTitleTypography variant="h6">
                Arizalar turlari bo‘yicha statistikasi
              </SubTitleTypography>
              <Box display="flex" flexDirection="column" gap={1.2}>
                {data.application_types.map((app: any, i: number) => (
                  <ListItemBox key={i}>
                    <Typography variant="body2" fontWeight={500}>
                      {app.application_type__name}
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      color="primary.main"
                    >
                      {app.count}
                    </Typography>
                  </ListItemBox>
                ))}
              </Box>
            </StyledCardContent>
          </StyledCard>
        </Grid>

        {/* --- Fakultetlar bo‘yicha bar chart --- */}
        <Grid item xs={12}>
          <StyledCard>
            <StyledCardContent>
              <SubTitleTypography variant="h6">
                Fakultet bo‘yicha taqsimot
              </SubTitleTypography>
              <ResponsiveContainer width="100%" height={650}>
                <BarChart
                  data={data.students.by_faculty.filter(
                    (f: any) => f.faculty__name !== null
                  )}
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 100, bottom: 10 }}
                >
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: "#4b5e7a" }}
                  />
                  <YAxis
                    dataKey="faculty__name"
                    type="category"
                    width={150}
                    tick={{ fontSize: 11, fill: "#4b5e7a" }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "10px",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
                      background: "rgba(255, 255, 255, 0.95)",
                      border: "none",
                      fontSize: "12px",
                    }}
                    itemStyle={{ fontWeight: 500 }}
                  />
                  <Bar
                    dataKey="count"
                    fill={COLORS[0]}
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                    animationDuration={800}
                  />
                </BarChart>
              </ResponsiveContainer>
            </StyledCardContent>
          </StyledCard>
        </Grid>

        

        {/* --- Universitet ro‘yxati --- */}
        <Grid item xs={12}>
          <StyledCard>
            <StyledCardContent>
              <SubTitleTypography variant="h6">
                Ariza topshirish uchun ro'yxatdan o'tgan talabalar soni 
              </SubTitleTypography>
              <Box display="flex" flexDirection="column" gap={1.2}>
                {data.students.by_university.map((u: any, i: number) => (
                  <ListItemBox key={i}>
                    <Typography variant="body2" fontWeight={500}>
                      {u.university}
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      color="primary.main"
                    >
                      {u.count}
                    </Typography>
                  </ListItemBox>
                ))}
              </Box>
            </StyledCardContent>
          </StyledCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;