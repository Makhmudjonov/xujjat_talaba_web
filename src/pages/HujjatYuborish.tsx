import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Collapse,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";

import { motion, AnimatePresence } from "framer-motion";
import { styled } from "@mui/system";
import SaveIcon from "@mui/icons-material/Save";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CancelIcon from "@mui/icons-material/Cancel";

/**
 *  ------------------------------------------------------------------
 *   HujjatYuborishAllDirections (fixed)
 *   ✨  Yangi arizalarni (mavjud bo'lmaganlarini) bitta so'rovda
 *       POST /submit-all-applications/ ga yuboradi.
 *   ✔  FormData endi indeks‑asoslangan `applications[0]`, `applications[1]` …
 *      ko'rinishida tuziladi – backend ko'p hollarda shunday formatni kutadi.
 *   ✔  Bo'sh (izoh va faylsiz) yo‘nalishlar filtrlanadi.
 *   ✔  Har bir yo‘nalish kartasi 2 ustunda chiqadi (`xs=12`, `sm=6`).
 *   ✔  Pending arizalar tahrirlab, PATCH orqali alohida saqlanadi.
 *  ------------------------------------------------------------------
 */

const API = "http://localhost:8000/api";

type DirectionStatus = "pending" | "reviewed" | "accepted" | "rejected";

type Score = { id: number; value: number; note?: string };

type File = { id: number; file_url: string; comment: string; section: number };

type Direction = {
  id: number;
  name: string;
  require_file: boolean;
  min_score: number;
  max_score: number;
  section: { id: number; name: string };
};

type Application = {
  id: number;
  student: number;
  direction: Direction;
  submitted_at: string;
  status: DirectionStatus;
  comment: string;
  scores?: Score[];
  files?: File[];
};

interface LocalFormState {
  comment: string;
  file: File | null;
  isSaving: boolean;
  saveMessage: string;
}

// ------------------------------------------------------------------
//  Styled helper
// ------------------------------------------------------------------
const SectionCard = styled(motion.div)(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderRadius: "12px",
  background: "linear-gradient(135deg,#fff,#f3f7fa)",
  border: "1px solid #e0e7f0",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  marginBottom: theme.spacing(2.5),
  transition: "transform 0.3s ease,box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
  },
}));

const Stepper = ({ status }: { status: DirectionStatus }) => {
  const steps = [
    { label: "Yuborildi", icon: <HourglassEmptyIcon fontSize="small" /> },
    { label: "Ko‘rib chiqildi", icon: <HourglassEmptyIcon fontSize="small" /> },
    {
      label: status === "rejected" ? "Rad etildi" : "Qaror",
      icon:
        status === "rejected" ? (
          <CancelIcon fontSize="small" />
        ) : (
          <CheckCircleOutlineIcon fontSize="small" />
        ),
    },
  ];
  const idx = status === "pending" ? 0 : status === "reviewed" ? 1 : 2;

  return (
    <Box display="flex" justifyContent="space-between" mb={2} mt={1}>
      {steps.map((step, i) => (
        <Box key={i} sx={{ textAlign: "center", flex: 1, position: "relative" }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              bgcolor: i <= idx ? "#60a5fa" : "#d1d5db",
              mx: "auto",
              mb: 0.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {i <= idx && step.icon}
          </Box>
          <Typography
            variant="caption"
            sx={{
              fontWeight: i === idx ? 600 : 400,
              color: i <= idx ? "#1e40af" : "#9ca3af",
              fontSize: "0.75rem",
              lineHeight: "1.2",
            }}
          >
            {step.label}
          </Typography>
          {i < steps.length - 1 && (
            <Box
              sx={{
                position: "absolute",
                top: 5,
                left: "50%",
                width: "100%",
                height: 2,
                bgcolor: i < idx ? "#60a5fa" : "#e5e7eb",
                zIndex: -1,
                transform: "translateX(0%)",
              }}
            />
          )}
        </Box>
      ))}
    </Box>
  );
};

// ------------------------------------------------------------------
//  Main component
// ------------------------------------------------------------------
const HujjatYuborishAllDirections = () => {
  const token = localStorage.getItem("accessToken");

  const [directions, setDirections] = useState<Direction[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [formStates, setFormStates] = useState<Record<number, LocalFormState>>({});
  const [editModes, setEditModes] = useState<Record<number, boolean>>({});
  const [globalMessage, setGlobalMessage] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const [isSubmittingAllNew, setIsSubmittingAllNew] = useState(false);

  // --------------------------------------------------
  //  Initial load
  // --------------------------------------------------
  useEffect(() => {
    if (!token) {
      setGlobalMessage("Token topilmadi. Qayta kiring.");
      return;
    }

    (async () => {
      try {
        const [dirsRes, appsRes] = await Promise.all([
          fetch(`${API}/directions/`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/applications/`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (!dirsRes.ok) throw new Error("Yo‘nalishlar olinmadi");
        if (!appsRes.ok) throw new Error("Arizalar olinmadi");

        const dirs: Direction[] = await dirsRes.json();
        const apps: Application[] = await appsRes.json();
        setDirections(dirs);
        setApplications(apps);

        // Init formStates
        const init: Record<number, LocalFormState> = {};
        dirs.forEach((d) => {
          const existing = apps.find((a) => a.direction.id === d.id);
          init[d.id] = {
            comment: existing?.comment ?? "",
            file: null,
            isSaving: false,
            saveMessage: "",
          };
          if (existing && existing.status !== "pending")
            setEditModes((p) => ({ ...p, [existing.id]: false }));
        });
        setFormStates(init);
      } catch (e: any) {
        setGlobalMessage(`❌ Xatolik: ${e.message}`);
        console.error(e);
      }
    })();
  }, [token]);

  // --------------------------------------------------
  //  Helpers
  // --------------------------------------------------
  const handleLocalChange = useCallback((dirId: number, field: keyof LocalFormState, value: any) => {
    setFormStates((prev) => ({
      ...prev,
      [dirId]: {
        ...prev[dirId],
        [field]: value,
        ...(field !== "isSaving" && field !== "saveMessage" ? { saveMessage: "" } : {}),
      },
    }));
  }, []);

  const toggleEdit = (appId: number) => {
    setEditModes((p) => ({ ...p, [appId]: !p[appId] }));
  };

  // --------------------------------------------------
  //  SUBMIT ALL NEW APPLICATIONS
  // --------------------------------------------------
 const handleSubmitAllNew = async () => {
  if (!token) {
    setGlobalMessage("Token topilmadi. Qayta kiring.");
    return;
  }

  setIsSubmittingAllNew(true);
  setGlobalMessage("");

  // 1) Filter only directions WITHOUT existing application
  const toSubmit = directions.filter((d) => !applications.some((a) => a.direction.id === d.id));
  console.log("🟡 Yuboriladigan yo‘nalishlar soni:", toSubmit.length);

  if (toSubmit.length === 0) {
    setGlobalMessage("ℹ️ Yuboriladigan yangi ariza topilmadi.");
    setIsSubmittingAllNew(false);
    return;
  }

  const fd = new FormData();
  let idx = 0;
  for (const dir of toSubmit) {
    const state = formStates[dir.id];

    console.log(`📦 Yo‘nalish: ${dir.name}`);
    console.log("    - comment:", state?.comment);
    console.log("    - file:", state?.file);
    console.log("    - require_file:", dir.require_file);

    if (!state || !state.comment.trim() || (dir.require_file && !state.file)) {
      setGlobalMessage(`❌ "${dir.name}" bo‘yicha ma'lumot to‘liq emas.`);
      setIsSubmittingAllNew(false);
      return;
    }

    const prefix = `applications[${idx}]`;
    fd.append(`${prefix}[direction]`, dir.id.toString());
    fd.append(`${prefix}[comment]`, state.comment);
    if (state.file) fd.append(`${prefix}[file]`, state.file as unknown as Blob);
    idx++;
  }

  // Debug: FormData'ni tekshiramiz
  // console.log("📤 Yuborilayotgan FormData:");
  // for (const pair of fd.entries()) {
  //   console.log(pair[0], "=>", pair[1]);
  // }

  try {
    const res = await fetch(`${API}/submit-all-applications/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    if (!res.ok) throw new Error(await res.text());

    const newApps: Application[] = await res.json();
    setApplications((p) => [...p, ...newApps]);
    setGlobalMessage(`✅ ${newApps.length} ta yangi ariza yuborildi!`);

    // Clear local form for submitted directions
    setFormStates((prev) => {
      const ns = { ...prev };
      toSubmit.forEach((d) => {
        ns[d.id] = { ...ns[d.id], comment: "", file: null };
      });
      return ns;
    });
    setResetKey((k) => k + 1);
  } catch (e: any) {
    setGlobalMessage(`❌ Yuborishda xato: ${e.message}`);
    console.error("❌ POST xatoligi:", e.message);
  } finally {
    setIsSubmittingAllNew(false);
  }
};


  // --------------------------------------------------
  //  SUBMIT SINGLE (pending) APPLICATION
  // --------------------------------------------------
  const handleSingleSubmit = async (dirId: number) => {
    const app = applications.find((a) => a.direction.id === dirId);
    if (!app) return; // only for existing pending ones

    handleLocalChange(dirId, "isSaving", true);
    try {
      const state = formStates[dirId];
      if (!state.comment.trim()) throw new Error("Izoh majburiy");
      const fd = new FormData();
      fd.append("comment", state.comment);
      if (state.file) fd.append("file", state.file as unknown as Blob);

      const res = await fetch(`${API}/applications/${app.id}/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error(await res.text());
      const updated: Application = await res.json();

      setApplications((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      setEditModes((prev) => ({ ...prev, [updated.id]: false }));
      handleLocalChange(dirId, "saveMessage", "✅ Saqlandi");
      handleLocalChange(dirId, "file", null);
    } catch (e: any) {
      handleLocalChange(dirId, "saveMessage", `❌ ${e.message}`);
      console.error(e);
    } finally {
      handleLocalChange(dirId, "isSaving", false);
    }
  };

  // helpers
  const getAppByDir = (dirId: number) => applications.find((a) => a.direction.id === dirId);

  const grouped = directions.reduce<Record<number, Direction[]>>((acc, d) => {
    if (!acc[d.section.id]) acc[d.section.id] = []; acc[d.section.id].push(d); return acc;
  }, {} as Record<number, Direction[]>);

  const hasNewToSubmit = directions.some((d) => !applications.some((a) => a.direction.id === d.id));

  return (
    <Box maxWidth={950} mx="auto" py={5} px={3} sx={{ fontFamily: "Roboto, sans-serif", backgroundColor: "#f9fafb" }}>
      <Typography variant="h3" align="center" gutterBottom fontWeight={700} color="#1e40af" sx={{ mb: 5, letterSpacing: "1px", borderBottom: "3px solid #60a5fa", pb: 1, textTransform: "uppercase" }}>
        Barcha Yo‘nalishlar Bo‘yicha Arizalar
      </Typography>

      {/* Global message */}
      <AnimatePresence>
        {globalMessage && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
            <Alert severity={globalMessage.startsWith("✅") ? "success" : globalMessage.startsWith("ℹ️") ? "info" : "error"} sx={{ mb: 3 }}>{globalMessage}</Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sections */}
      {Object.values(grouped).map((dirs) => (
        <Box key={dirs[0].section.id} mb={4}>
          <Typography variant="h5" fontWeight={600} color="#1e40af" sx={{ mb: 3, borderLeft: "5px solid #facc15", pl: 1.5, backgroundColor: "#f1f5f9", py: 1, borderRadius: "6px" }}>
            {dirs[0].section.name}
          </Typography>

          <Grid container spacing={3}>
            {dirs.map((dir) => {
              const app = getAppByDir(dir.id);
              const pending = app?.status === "pending";
              const editing = (!app && true) || (pending && editModes[app.id]);
              const local = formStates[dir.id];
              const hasFile = !!app?.files?.length;

              return (
                <Grid container spacing={3}>
                  <SectionCard>
                    {/* Header */}
                    <Box display="flex" justifyContent="space-between" mb={2}>
                      <Typography variant="h6" fontWeight={600}>{dir.name}</Typography>
                      {app && (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                          {new Date(app.submitted_at).toLocaleString()}
                        </Typography>
                      )}
                    </Box>

                    {/* Status / badge */}
                    {app ? <Stepper status={app.status} /> : <BadgeNew />}

                    {/* Comment display */}
                    {app?.comment && !editing && (
                      <DisplayComment text={app.comment} />
                    )}

                    {/* Scores */}
                    {app?.scores?.length && !editing && (
                      <Typography variant="body2" fontWeight={500} mt={2}>
                        Ballar: {app.scores.map((s) => s.value).join(", ")}
                      </Typography>
                    )}

                    {/* File link */}
                    {app?.files?.length && !editing && (
                      <FileLink url={app.files[0].file_url} />
                    )}

                    {/* EDIT / NEW FORM */}
                    <Collapse in={editing} timeout="auto" unmountOnExit>
                      <Box mt={2}>
                        <TextField
                          label="Izohingiz"
                          fullWidth
                          multiline
                          rows={2}
                          required
                          value={local?.comment || ""}
                          onChange={(e) => handleLocalChange(dir.id, "comment", e.target.value)}
                          margin="dense"
                          size="small"
                        />
                        <input
                          key={`${resetKey}_${dir.id}`}
                          type="file"
                          onChange={(e) => handleLocalChange(dir.id, "file", e.target.files?.[0] || null)}
                          required={dir.require_file && !hasFile && !local?.file}
                          style={{ marginTop: 12, marginBottom: 12 }}
                        />

                        {/* SAVE BUTTON for existing pending */}
                        {app && pending && (
                          <Button variant="contained" size="small" startIcon={<SaveIcon />} disabled={local.isSaving} onClick={() => handleSingleSubmit(dir.id)} sx={{ textTransform: "none" }}>
                            {local.isSaving ? "Saqlanmoqda..." : "Saqlash"}
                          </Button>
                        )}
                      </Box>
                    </Collapse>

                    {/* Edit toggle for pending */}
                    {app && pending && !editing && (
                      <Button variant="outlined" size="small" sx={{ mt: 1 }} onClick={() => toggleEdit(app.id)}>
                        Tahrirlash
                      </Button>
                    )}

                    {/* Info text for locked */}
                    {app && !pending && (
                      <Typography variant="body2" color="error" mt={2} fontStyle="italic">
                        Bu ariza tahrirlanmaydi (status: {app.status}).
                      </Typography>
                    )}

                    {/* local save msg */}
                    {local?.saveMessage && (
                      <Typography variant="body2" color={local.saveMessage.startsWith("✅") ? "success.main" : "error.main"} mt={1}>
                        {local.saveMessage}
                      </Typography>
                    )}
                  </SectionCard>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      ))}

      {/* SUBMIT ALL NEW */}
      {hasNewToSubmit && (
        <Box textAlign="center" mt={4}>
          <Button variant="contained" size="large" startIcon={<SendIcon />} disabled={isSubmittingAllNew} onClick={handleSubmitAllNew} sx={{ textTransform: "none" }}>
            {isSubmittingAllNew ? "Yuborilmoqda..." : "Yangi arizalarni yuborish"}
          </Button>
        </Box>
      )}
    </Box>
  );
};

// ------------------------------------------------------------------
//  Tiny sub‑components
// ------------------------------------------------------------------
const BadgeNew = () => (
  <Typography variant="body2" sx={{ px: 1.5, py: 0.5, mb: 2, display: "inline-block", backgroundColor: "#dbeafe", borderRadius: "6px", color: "#1e40af", fontWeight: 500 }}>Yangi ariza</Typography>
);

const DisplayComment = ({ text }: { text: string }) => (
  <Typography variant="body2" color="#4b5563" mt={2} sx={{ borderLeft: "3px solid #60a5fa", pl: 1.5, py: 0.5, backgroundColor: "#eff6ff", borderRadius: "4px" }}>{text}</Typography>
);

const FileLink = ({ url }: { url: string }) => (
  <Typography variant="body2" mt={1} color="#1e40af" sx={{ fontWeight: 500 }}>
    Fayl: {" "}
    <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: "#1e40af", textDecoration: "underline" }}>
      Yuklab olish
    </a>
  </Typography>
);

export default HujjatYuborishAllDirections;
