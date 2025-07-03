import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Grid,
  Button,
  CircularProgress,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import SchoolIcon from "@mui/icons-material/School";
import WorkspacesIcon from "@mui/icons-material/Workspaces";

/** --------------------------------------------------------------------
 *  ApplicationChoicePage
 *  -------------------------------------------------
 *  • If the student **has NOT** submitted an application yet →
 *    show 3 elegant option‑cards ("Talaba almashinuvi", "Ilmiy grant", 
 *    "Ixtisoslashtirilgan amaliyot").
 *    Each card is clickable (CardActionArea) and triggers onSelect(optionKey).
 *  • If **already submitted** → show a confirmation illustration with
 *    minimal info.
 *  • The API for these points isn’t ready yet, so the option list is
 *    hard‑coded for design purposes.
 * ------------------------------------------------------------------- */

const API = "http://localhost:8000/api";

interface StudentApplicationStatus {
  hasSubmitted: boolean;
  submittedOption?: string; // e.g. "talaba_almashinuvi"
}

const options = [
  // ✅ Yangi 4 punkt
  {
    key: "toliq_grant",
    title: "To'liq ta'lim granti",
    desc: "O‘qish xarajatlari to‘liq qoplanadi.",
    icon: <SchoolIcon sx={{ fontSize: 48, color: "#0288d1" }} />,
  },
  {
    key: "toliq_bolmagan_grant",
    title: "To'liq bo'lmagan ta'lim granti",
    desc: "O‘qish xarajatlari qisman qoplanadi.",
    icon: <SchoolIcon sx={{ fontSize: 48, color: "#0288d1" }} />,
  },
  {
    key: "qoshimcha_davlat_granti",
    title: "Qo'shimcha davlat granti",
    desc: "Davlat tomonidan ajratiladigan qo‘shimcha moliyaviy yordam.",
    icon: <WorkspacesIcon sx={{ fontSize: 48, color: "#8e24aa" }} />,
  },
  {
    key: "oliy_talim_tashkiloti_granti",
    title: "Oliy ta'lim tashkiloti granti",
    desc: "Universitet yoki institut homiyligidagi grant.",
    icon: <HowToRegIcon sx={{ fontSize: 48, color: "#fb8c00" }} />,
  },

  // Mavjud 3 punkt (avvalgi kodingizdan)
  // {
  //   key: "talaba_almashinuvi",
  //   title: "Talaba almashinuvi",
  //   desc: "Xorij universitetida semestr davomida o‘qish imkoniyati.",
  //   icon: <SchoolIcon sx={{ fontSize: 48, color: "#0288d1" }} />,
  // },
  // {
  //   key: "ilmiy_grant",
  //   title: "Ilmiy grant",
  //   desc: "Tadqiqot loyihalari uchun moliyaviy qo‘llab‑quvvatlash.",
  //   icon: <WorkspacesIcon sx={{ fontSize: 48, color: "#8e24aa" }} />,
  // },
  // {
  //   key: "amaliyot",
  //   title: "Ixtisoslashtirilgan amaliyot",
  //   desc: "Yetakchi kompaniyalarda amaliy tajriba.",
  //   icon: <HowToRegIcon sx={{ fontSize: 48, color: "#fb8c00" }} />,
  // },
];


const ApplicationChoicePage: React.FC = () => {
  const [status, setStatus] = useState<StudentApplicationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // 🔖 MOCK: The real GET should be to `${API}/application-status/`
        // For design demo we pretend there is no submission yet.
        const mock: StudentApplicationStatus = {
          hasSubmitted: false,
        };
        setStatus(mock);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading || !status) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
        <CircularProgress />
      </Box>
    );
  }

  // ------------------------------------------------------------------
  // 1) Already submitted – show illustration
  // ------------------------------------------------------------------
  if (status.hasSubmitted) {
    return (
      <Box textAlign="center" mt={8}>
        <CheckCircleOutlineIcon sx={{ fontSize: 120, color: "#4caf50" }} />
        <Typography variant="h4" fontWeight={700} mt={2}>
          Arizangiz yuborilgan!
        </Typography>
        <Typography variant="body1" mt={1} color="text.secondary">
          Bizning jamoa arizangizni ko‘rib chiqmoqda. Natija haqida emailingizga
          xabar beramiz.
        </Typography>
      </Box>
    );
  }

  // ------------------------------------------------------------------
  // 2) No submission yet – show option list
  // ------------------------------------------------------------------
  const handleSelect = (key: string) => {
    // TODO: Navigate to application form or open dialog
    alert(`Tanlangan: ${key}`);
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} align="center" sx={{ mt: 4, mb: 4 }}>
        Ariza turini tanlang
      </Typography>

      <Grid container spacing={3}>
        {options.map((opt) => (
          <Grid size={{xs:12, sm:6, md:4}} key={opt.key}>
            <Card
              component={CardActionArea}
              onClick={() => handleSelect(opt.key)}
              sx={{
                p: 3,
                textAlign: "center",
                borderRadius: 3,
                transition: "transform 0.25s, box-shadow 0.25s",
                '&:hover': {
                  transform: "translateY(-4px)",
                  boxShadow: 6,
                },
              }}
            >
              {opt.icon}
              <CardContent sx={{ pt: 2 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {opt.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {opt.desc}
                </Typography>
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
