// src/utils/fetchWithAuth.ts

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("accessToken");
  const refresh = localStorage.getItem("refreshToken");

  let res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  if (res.status === 401 && refresh) {
    const refreshRes = await fetch("https://tanlov.medsfera.uz/api/token/refresh/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (refreshRes.ok) {
      const data = await refreshRes.json();
      localStorage.setItem("accessToken", data.access);

      // retry request
      res = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${data.access}`,
        },
      });
    } else {
      alert("Sessiya muddati tugagan. Qayta kiring.");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login"; // logout yoki redirect
    }
  }

  return res;
};
