import Head from "next/head";
import Link from "next/link";
import { useAuth } from "../pages/_app";
import { useState } from "react";

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 font-sans antialiased text-gray-800">
      <Head>
        <title>EGApp</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="https://cdn.tailwindcss.com"></script>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <style>{`body { font-family: 'Inter', sans-serif; }`}</style>
      </Head>

      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 shadow-lg rounded-b-lg">
        <nav className="container mx-auto flex flex-wrap justify-between items-center">
          <div className="flex justify-between w-full md:w-auto">
            <Link
              href="/"
              className="text-2xl font-bold rounded-md px-3 py-1 hover:bg-blue-700 transition duration-300"
            >
              EGApp
            </Link>
            <button
              className="md:hidden text-white focus:outline-none"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle Menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {menuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          <ul
            className={`${
              menuOpen ? "block" : "hidden"
            } md:flex md:items-center md:space-x-6 w-full md:w-auto mt-4 md:mt-0 space-y-2 md:space-y-0`}
          >
            <li>
              <Link
                href="/"
                className="block hover:text-blue-200 transition duration-300 rounded-md px-3 py-1 hover:bg-blue-700"
              >
                Home
              </Link>
            </li>
            {user && (
              <li>
                <Link
                  href="/dashboard"
                  className="block hover:text-blue-200 transition duration-300 rounded-md px-3 py-1 hover:bg-blue-700"
                >
                  Dashboard
                </Link>
              </li>
            )}
            {user ? (
              <>
                <li className="text-blue-200 text-sm px-3 py-1">
                  Welcome, {user.username} (
                  {Array.isArray(user.roles)
                    ? user.roles.join(", ")
                    : String(user.roles)}
                  )
                </li>
                <li>
                  <button
                    onClick={logout}
                    className="block w-full md:w-auto bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-4 rounded-md shadow-md transition duration-300"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    href="/login"
                    className="block w-full md:w-auto bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-4 rounded-md shadow-md transition duration-300 text-center"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="block w-full md:w-auto bg-purple-500 hover:bg-purple-600 text-white font-semibold py-1 px-4 rounded-md shadow-md transition duration-300 text-center"
                  >
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </header>

      <main className="container mx-auto p-4 sm:p-6">{children}</main>

      <footer className="bg-gray-800 text-white p-4 text-center mt-8 rounded-t-lg">
        <p>&copy; 2025 MT. All rights reserved by MT&#174;</p>
      </footer>
    </div>
  );
};

export default Layout;
