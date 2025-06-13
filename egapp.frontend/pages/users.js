import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../pages/_app";
import AuthGuard from "../components/AuthGuard";

export default function Users() {
  const { user, hasRole } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formUsername, setFormUsername] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formConfirmPassword, setFormConfirmPassword] = useState("");
  const [formRole, setFormRole] = useState("User");
  const [editingUserId, setEditingUserId] = useState(null);
  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

  const API_BASE_URL = `${backendBaseUrl}/api/Users`;

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    const token = localStorage.getItem("jwt_token");

    try {
      const response = await fetch(API_BASE_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401)
          setError("Unauthorized: Please log in again.");
        else if (response.status === 403)
          setError("Forbidden: You do not have permission to view users.");
        else setError(`Failed to fetch users: ${response.statusText}`);
        setUsers([]);
      } else {
        const data = await response.json();
        setUsers(data);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Network error or API is unreachable.");
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission for Add/Update User
  const handleSaveUser = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const token = localStorage.getItem("jwt_token");
    if (!token) {
      setError("No authentication token found.");
      return;
    }

    // Client-side validation for form
    if (!formUsername || !formEmail || !formRole) {
      setError("Username, Email, and Role are required.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formEmail)) {
      setError("Invalid email format.");
      return;
    }

    let userData = {
      username: formUsername,
      email: formEmail,
      role: formRole,
    };

    let response;
    if (editingUserId) {
      // Update User (PUT)
      userData.id = editingUserId; // Include ID for PUT
      response = await fetch(`${API_BASE_URL}/${editingUserId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });
    } else {
      // Create New User (POST)
      if (!formPassword || formPassword.length < 6) {
        setError(
          "Password is required and must be at least 6 characters long for new users."
        );
        return;
      }
      if (formPassword !== formConfirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      userData.password = formPassword; // This 'password' field is for the DTO
      response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        // Backend might return different error structures, try to parse
        setError(
          errorData.message ||
            errorData.detail ||
            errorData.title ||
            "Operation failed"
        );
      } catch {
        setError(errorText || "Operation failed due to an unknown error.");
      }
    } else {
      setSuccess(
        editingUserId
          ? "User updated successfully!"
          : "User created successfully!"
      );
      resetForm(); // Clear form fields
      fetchUsers(); // Refresh the list
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (id) => {
    setError("");
    setSuccess("");
    const token = localStorage.getItem("jwt_token");
    if (!token) {
      setError("No authentication token found.");
      return;
    }

    // Confirmation dialog
    if (
      !window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401)
          setError("Unauthorized: Please log in again.");
        else if (response.status === 403)
          setError("Forbidden: You do not have permission to delete users.");
        else setError(`Failed to delete user: ${response.statusText}`);
      } else {
        setSuccess("User deleted successfully!");
        fetchUsers(); // Refresh list after deletion
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("Network error or API is unreachable.");
    }
  };

  // Populate form fields when 'Edit' button is clicked
  const handleEditClick = (userToEdit) => {
    setEditingUserId(userToEdit.id);
    setFormUsername(userToEdit.username);
    setFormEmail(userToEdit.email);
    setFormRole(userToEdit.role);
    setFormPassword(""); // Passwords are not directly edited via this form
    setFormConfirmPassword("");
    setSuccess("");
    setError("");
  };

  // Reset form fields and editing state
  const resetForm = () => {
    setEditingUserId(null);
    setFormUsername("");
    setFormEmail("");
    setFormPassword("");
    setFormConfirmPassword("");
    setFormRole("User"); // Reset default role
    setError("");
    setSuccess("");
  };

  // Fetch users when the component mounts or user/roles change
  useEffect(() => {
    if (user && hasRole(["Admin"])) {
      fetchUsers();
    } else if (user && !hasRole(["Admin"])) {
      // User is logged in but not an Admin, show access denied
      setError("You do not have administrative privileges to view this page.");
      setLoading(false);
    }
  }, [user, hasRole]); // Dependencies: user object and hasRole function

  // If user is not admin, display unauthorized message
  if (!hasRole(["Admin"])) {
    // This AuthGuard ensures that if roles are not met, it will redirect.
    // The outer div is just a fallback display in case of immediate render before redirect.
    return (
      <AuthGuard roles={["Admin"]}>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-2xl text-center">
            <h1 className="text-4xl font-bold text-red-700 mb-6">
              Access Denied!
            </h1>
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
      </AuthGuard>
    );
  }

  return (
    <AuthGuard roles={["Admin"]}>
      {" "}
      {/* Only Admin can access this page */}
      <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-6">
          User Management (Admin)
        </h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}

        {/* User Add/Edit Form */}
        <div className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
          <h2 className="text-2xl font-semibold text-blue-600 mb-4">
            {editingUserId ? "Edit User" : "Add New User"}
          </h2>
          <form
            onSubmit={handleSaveUser}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label
                htmlFor="formUsername"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                type="text"
                id="formUsername"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={formUsername}
                onChange={(e) => setFormUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label
                htmlFor="formEmail"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="formEmail"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                required
              />
            </div>
            {!editingUserId && ( // Only show password fields for new user creation
              <>
                <div>
                  <label
                    htmlFor="formPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="formPassword"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    required={!editingUserId} // Required only for new users
                  />
                </div>
                <div>
                  <label
                    htmlFor="formConfirmPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="formConfirmPassword"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    value={formConfirmPassword}
                    onChange={(e) => setFormConfirmPassword(e.target.value)}
                    required={!editingUserId} // Required only for new users
                  />
                </div>
              </>
            )}
            <div>
              <label
                htmlFor="formRole"
                className="block text-sm font-medium text-gray-700"
              >
                Role
              </label>
              <select
                id="formRole"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={formRole}
                onChange={(e) => setFormRole(e.target.value)}
                required
              >
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div className="md:col-span-2 flex justify-end space-x-3">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                {editingUserId ? "Update User" : "Add User"}
              </button>
              {editingUserId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        {/* User List */}
        <h2 className="text-2xl font-semibold text-blue-600 mb-4">
          Existing Users
        </h2>
        {loading ? (
          <p>Loading users...</p>
        ) : users.length === 0 ? (
          <p className="text-gray-600">No users found.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl shadow-md">
            <table className="min-w-full bg-white border-collapse">
              <thead className="bg-blue-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider rounded-tl-lg">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider rounded-tr-lg">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((userItem) => (
                  <tr key={userItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {userItem.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {userItem.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {userItem.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {userItem.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditClick(userItem)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(userItem.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
