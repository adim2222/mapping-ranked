import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5047";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken);
    }
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);

    if (searchParams.has("code")) {
      const code = searchParams.get("code");
      const state = searchParams.get("state");

      window.history.replaceState({}, "", window.location.pathname);

      fetch(`${API_URL}/authorize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, state }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.token) {
            localStorage.setItem("token", data.token);
            setToken(data.token);
            fetchUser(data.token);
          }
        })
        .catch(err => console.error("Token exchange failed:", err));
    }
  }, []);

  const fetchUser = (jwt) => {
    fetch(`${API_URL}/me`, {
      headers: { "Authorization": `Bearer ${jwt}` },
    })
      .then(res => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(data => setUser(data))
      .catch(() => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
