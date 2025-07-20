// components/ResultDialog.tsx
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
} from "@mui/material";

interface ResultDialogProps {
  open: boolean;
  onClose: () => void;
  result: {
    score: number;
    correct: number;
    total: number;
  } | null;
}

const ResultDialog: React.FC<ResultDialogProps> = ({ open, onClose, result }) => {
  if (!result) return null;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>✅ Test natijasi</DialogTitle>
      <DialogContent>
        <Box mb={2}>
          <Typography>
            <strong>To‘g‘ri javoblar:</strong> {result.correct} / {result.total}
          </Typography>
          <Typography>
            <strong>Umumiy ball:</strong> {result.score}%
          </Typography>
        </Box>
        <Typography color="text.secondary">
          Tabriklaymiz! Siz ushbu testni yakunladingiz.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">
          Yopish
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResultDialog;
