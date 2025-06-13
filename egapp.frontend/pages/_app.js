import { useState, useEffect, createContext, useContext } from "react";
import { useRouter } from "next/router";
import { jwtDecode } from "jwt-decode";

import Layout from "../components/Layout";
import AuthGuard from "../components/AuthGuard";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const usernameClaim =
          decoded.sub ||
          decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
        const rolesClaim =
          decoded[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ];
        const emailClaim =
          decoded[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
          ];
        const userIdClaim =
          decoded[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
          ];

        if (decoded.exp * 1000 > Date.now()) {
          setUser({
            id: userIdClaim,
            username: usernameClaim,
            email: emailClaim,
            roles: Array.isArray(rolesClaim)
              ? rolesClaim
              : rolesClaim
              ? [rolesClaim]
              : [],
          });
        } else {
          console.log("JWT token expired or invalid. Logging out.");
          localStorage.removeItem("jwt_token");
          setUser(null);
        }
      } catch (e) {
        console.error("Failed to decode token or token is invalid:", e);
        localStorage.removeItem("jwt_token");
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

      const response = await fetch(`${backendBaseUrl}/api/Auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();
      localStorage.setItem("jwt_token", data.token);

      const decoded = jwtDecode(data.token);
      const usernameClaim =
        decoded.sub ||
        decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
      const rolesClaim =
        decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      const emailClaim =
        decoded[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
        ];
      const userIdClaim =
        decoded[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ];

      setUser({
        id: userIdClaim,
        username: usernameClaim,
        email: emailClaim,
        roles: Array.isArray(rolesClaim)
          ? rolesClaim
          : rolesClaim
          ? [rolesClaim]
          : [],
      });
      return true;
    } catch (error) {
      console.error("Login error:", error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("jwt_token");
    setUser(null);
    window.location.href = "/login";
  };

  const hasRole = (requiredRoles) => {
    if (!user || !user.roles) return false;
    const userRoles = Array.isArray(user.roles)
      ? user.roles
      : [String(user.roles)];
    return requiredRoles.some((role) => userRoles.includes(role));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AuthProvider>
  );
}
