// src/theme.ts
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // A common Material-UI blue
    },
    secondary: {
      main: '#dc004e', // A common Material-UI red
    },
    error: {
      main: '#d32f2f', // A common Material-UI red for errors
    },
    // You can add more colors here if needed
  },
  shape: {
    borderRadius: 4, // Default Material-UI border radius unit (in pixels)
  },
  typography: {
    // Define your typography if needed
    h4: {
      fontWeight: 600,
    },
  },
  spacing: 8, // Default Material-UI spacing unit (in pixels)
});

export default theme;