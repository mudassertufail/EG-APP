import Link from "next/link";
import { useAuth } from "../pages/_app";

export default function Index() {
  const { user } = useAuth();
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-2xl text-center">
        <h1 className="text-4xl font-bold text-blue-700 mb-6">
          Welcome to the EGApp!
        </h1>
        {user ? (
          <p className="text-xl font-medium text-green-600">
            You are logged in as {user.username} with role(s):
            {Array.isArray(user.roles)
              ? user.roles.join(", ")
              : String(user.roles)}
            . Explore the{" "}
            <Link href="/dashboard" className="text-blue-500 hover:underline">
              Dashboard page
            </Link>
            !
          </p>
        ) : (
          <p className="text-xl font-medium text-red-600">
            Please{" "}
            <Link href="/login" className="text-blue-500 hover:underline">
              log in
            </Link>{" "}
            or{" "}
            <Link href="/register" className="text-blue-500 hover:underline">
              register
            </Link>{" "}
            to access protected content.
          </p>
        )}
      </div>
    </div>
  );
}
