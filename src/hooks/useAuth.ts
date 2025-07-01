// hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';


export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    if (token) {
      try {
        const decoded: any = jwtDecode(token);

        const now = Date.now() / 1000;

        if (decoded.exp < now) {
          logout(); // Token eskirgan bo‘lsa avtomatik logout
        } else {
          setIsAuthenticated(true); // Token ishlayotgan bo‘lsa holatni o‘zgartiramiz
        }
      } catch (e) {
        logout(); // Agar JWT xato bo‘lsa, ham logout qilamiz
      }
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  };

  return { isAuthenticated, logout };
};
