// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  Paper, // For the form's background
  useTheme, // To access theme for consistent styling
} from '@mui/material';
import { fetchWithAuth } from '../utils/fetchWithAuth'; // Assuming this utility is still needed

const LoginPage = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state for button
  const navigate = useNavigate();
  const theme = useTheme(); // Access the theme

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true); // Set loading to true when login starts

    try {
      const response = await fetchWithAuth('https://tanlov.medsfera.uz/api/students/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login, password }),
      });

      if (response.ok) {
        const data = await response.json();

        // 🔐 Token va foydalanuvchi ma'lumotlarini saqlaymiz
        localStorage.setItem('accessToken', data.token.access);
        localStorage.setItem('refreshToken', data.token.refresh);
        localStorage.setItem('studentId', data.student_id.toString());
        localStorage.setItem('fullName', data.full_name);
        localStorage.setItem('role', data.role);

        // 🧭 Rol asosida yo‘naltiramiz
        switch (data.role) {
          case 'admin':
          case 'dekan':
          case 'kichik_admin':
            navigate('/admin');
            break;
          case 'student': // Assuming 'student' is the role for non-admins
            navigate('/account');
            break;
          default:
            // Handle unexpected roles, maybe navigate to a default landing page or show an error
            setError('Noma’lum foydalanuvchi roli.');
            localStorage.clear(); // Clear invalid credentials
        }
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Foydalanuvchi nomi yoki parol xato.'); // Display specific error from backend
      }
    } catch (err) {
      console.error("Login API call error:", err); // Log the actual error for debugging
      setError('❌ Server bilan bog‘lanishda xatolik. Iltimos, keyinroq urinib ko‘ring.');
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <Container
      component="main" // Semantically represents the main content
      maxWidth="xs" // Limits the width of the container for a better centered look
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh', // Centers content vertically
        backgroundColor: theme.palette.background.default, // Use theme's background color
        p: theme.spacing(3), // Add some padding around the container
      }}
    >
      <Paper
        elevation={6} // Adds a nice shadow
        sx={{
          padding: theme.spacing(4), // Generous padding inside the form card
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%', // Ensure it takes full width up to maxWidth="xs"
          // borderRadius: theme.shape.borderRadius * 2, // More rounded corners
        }}
      >
        <Typography variant="h5" component="h2" sx={{ mb: theme.spacing(3), fontWeight: 600, color: theme.palette.primary.main }}>
          🔐 Tizimga kirish
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: theme.spacing(2) }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleLogin} sx={{ width: '100%' }}>
          <TextField
            margin="normal" // Adds default top/bottom margin
            required
            fullWidth // Makes the input take full width
            id="login"
            label="Login"
            name="login"
            autoComplete="username"
            autoFocus
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            variant="outlined" // Gives a clear border
            sx={{ mb: theme.spacing(2) }} // Custom bottom margin
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Parol"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            variant="outlined"
            sx={{ mb: theme.spacing(3) }} // Custom bottom margin
          />
          <Button
            type="submit"
            fullWidth
            variant="contained" // Solid background color
            color="primary"
            disabled={loading} // Disable button while loading
            sx={{
              py: theme.spacing(1.5), // Increase button height
              fontSize: '1rem', // Larger font size for button text
            }}
          >
            {loading ? 'Kirilmoqda...' : 'Kirish'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;