import Link from "next/link";

// This component should be the default export in `unauthorized.js`
export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-2xl text-center">
        <h1 className="text-4xl font-bold text-red-700 mb-6">Access Denied!</h1>
        <p className="text-lg text-gray-700 mb-8">
          You do not have the necessary permissions to view this page.
        </p>
        <Link
          href="/"
          className="text-blue-500 hover:underline text-lg font-medium"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
}
