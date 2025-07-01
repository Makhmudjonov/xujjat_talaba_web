// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CForm, CFormInput, CButton, CAlert, CContainer } from '@coreui/react';

const LoginPage = () => {
  const [username, setUsername] = useState('');  // login => username
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/komissiya/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),  // username sifatida yuboriladi
      });

      if (response.ok) {
        const data = await response.json();

        // 🔐 Token va foydalanuvchi ma'lumotlarini saqlash
        localStorage.setItem('accessToken', data.access);
        localStorage.setItem('refreshToken', data.refresh);
        localStorage.setItem('fullName', data.user.full_name);
        localStorage.setItem('role', data.role);

        // Masalan, admin dashboard yoki bosh sahifaga yo'naltirish
        navigate('/admin');  // kerakli sahifaga yo'naltiring
      } else {
        const errData = await response.json();
        setError(errData.detail || "Login yoki parol noto‘g‘ri");
      }
    } catch (err) {
      setError('❌ Server bilan bog‘lanishda xatolik.');
    }
  };

  return (
    <CContainer className="d-flex justify-content-center align-items-center vh-100">
      <div style={{ width: 400 }}>
        <h2 className="text-center mb-4">🔐 Tizimga kirish</h2>

        {error && <CAlert color="danger">{error}</CAlert>}

        <CForm onSubmit={handleLogin}>
          <CFormInput
            type="text"
            placeholder="Login"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mb-3"
            required
          />
          <CFormInput
            type="password"
            placeholder="Parol"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4"
            required
          />
          <CButton type="submit" color="primary" className="w-100">
            Kirish
          </CButton>
        </CForm>
      </div>
    </CContainer>
  );
};

export default LoginPage;
