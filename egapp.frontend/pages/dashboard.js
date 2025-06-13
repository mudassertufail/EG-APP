import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../pages/_app";
import AuthGuard from "../components/AuthGuard";

export default function Dashboard() {
  const { user, hasRole } = useAuth();
  const [dashboardMessage, setDashboardMessage] = useState(
    "Loading dashboard content..."
  );
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardContent = async () => {
      setError("");
      const token = localStorage.getItem("jwt_token");
      if (!token) {
        setError("No authentication token found. Please log in.");
        return;
      }

      try {
        const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

        const response = await fetch(`${backendBaseUrl}/api/Dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401)
            setError("Unauthorized: Please log in again.");
          else if (response.status === 403)
            setError("Forbidden: You do not have access to the dashboard.");
          else setError(`Failed to fetch dashboard: ${response.statusText}`);
          setDashboardMessage("Could not load dashboard content.");
        } else {
          const data = await response.json();
          setDashboardMessage(data.message);
        }
      } catch (err) {
        console.error("Error fetching dashboard:", err);
        setError("Network error or API is unreachable.");
      }
    };

    if (user) {
      fetchDashboardContent();
    }
  }, [user]);

  return (
    <AuthGuard roles={["Admin", "User"]}>
      {" "}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-2xl text-center">
          <h1 className="text-4xl font-bold text-blue-700 mb-6">Dashboard</h1>
          {error ? (
            <p className="text-red-500 text-lg mb-4">{error}</p>
          ) : (
            <p className="text-xl font-medium text-gray-700 mb-8">
              {dashboardMessage}
            </p>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
