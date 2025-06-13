import { useState, useEffect, createContext, useContext } from "react";
import { useRouter } from "next/router";
import { jwtDecode } from "jwt-decode"; // Remember to install this package: npm install jwt-decode

// Import Layout and AuthGuard from the new components directory
import Layout from "../components/Layout"; // Import as default
import AuthGuard from "../components/AuthGuard"; // Import as default

// --- 1. Global Context for Authentication and User Roles ---
// This context will manage the user's authentication state and roles across the app.
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Stores user info if authenticated
  const [loading, setLoading] = useState(true); // Manages loading state during initial auth check

  useEffect(() => {
    // On mount, check if a token exists in localStorage
    const token = localStorage.getItem("jwt_token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Claims from .NET Core JWTs sometimes use full URI namespaces.
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
          // Check token expiration
          setUser({
            id: userIdClaim,
            username: usernameClaim,
            email: emailClaim,
            // Ensure roles are always an array for consistent handling (a user might have multiple roles)
            roles: Array.isArray(rolesClaim)
              ? rolesClaim
              : rolesClaim
              ? [rolesClaim]
              : [],
          });
        } else {
          // Token expired or invalid structure
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
      localStorage.setItem("jwt_token", data.token); // Store the JWT token

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
    window.location.href = "/login"; // Redirect to login page after logout
  };

  // Helper function to check if a user has a specific role
  const hasRole = (requiredRoles) => {
    if (!user || !user.roles) return false;
    const userRoles = Array.isArray(user.roles)
      ? user.roles
      : [String(user.roles)]; // Ensure user.roles is always an array of strings
    return requiredRoles.some((role) => userRoles.includes(role));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// This component should be the default export in `_app.js`
export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AuthProvider>
  );
}
