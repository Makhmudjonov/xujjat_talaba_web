import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CForm, CFormInput, CButton, CAlert, CContainer } from '@coreui/react';
import { fetchWithAuth } from '../../utils/fetchWithAuth';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetchWithAuth('https://tanlov.medsfera.uz/api/admin/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();

        // 🔐 Token va foydalanuvchi ma'lumotlarini saqlash
        localStorage.setItem('accessToken', data.access);
        localStorage.setItem('refreshToken', data.refresh);
        localStorage.setItem('fullName', data.user.full_name);
        localStorage.setItem('role', data.user.role || 'admin');

        // 🔁 Admin sahifaga yo‘naltirish
        navigate('/admin');
        window.location.reload()
      } else {
        const errData = await response.json();
        setError(errData.detail || 'Login yoki parol noto‘g‘ri');
      }
    } catch (err) {
      setError('❌ Server bilan bog‘lanishda xatolik.');
    }
  };

  return (
    <CContainer className="d-flex justify-content-center align-items-center vh-100">
      <div style={{ width: 400 }}>
        <h2 className="text-center mb-4">🛡️ Admin panelga kirish</h2>

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

export default AdminLogin;
