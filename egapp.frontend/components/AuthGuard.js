import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../pages/_app";

const AuthGuard = ({ children, roles }) => {
  const { user, loading, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (roles && !hasRole(roles)) {
        router.push("/unauthorized");
      }
    }
  }, [user, loading, roles, router, hasRole]);

  if (
    loading ||
    (!user &&
      !router.asPath.includes("/login") &&
      !router.asPath.includes("/register"))
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-700">Loading...</p>
      </div>
    );
  }
  if (
    user &&
    roles &&
    !hasRole(roles) &&
    !router.asPath.includes("/unauthorized")
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-700">Access Denied. Redirecting...</p>
      </div>
    );
  }

  return children;
};

export default AuthGuard;
