// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CForm, CFormInput, CButton, CAlert, CContainer } from '@coreui/react';

const LoginPage = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/students/login/', {
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
  localStorage.setItem('role', data.role); // 👈 role ni saqlaymiz

  // 🧭 Rol asosida yo‘naltiramiz
  switch (data.role) {
    case 'admin':
      navigate('/admin');
      break;
    case 'dekan':
      navigate('/admin');
      break;
    case 'kichik_admin':
      navigate('/admin');
      break;
    default:
      navigate('/account');
  }
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
            value={login}
            onChange={(e) => setLogin(e.target.value)}
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
