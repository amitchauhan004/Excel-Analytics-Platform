import React from "react";

const AdminUserTable = ({ users, onDelete }) => {
  if (!users || users.length === 0) return <div>No users found.</div>;

  return (
    <div className="w-full max-w-3xl bg-white rounded-lg shadow p-6 mt-6">
      <h2 className="text-xl font-semibold mb-4">User Management</h2>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b">
            <th className="py-2">Name</th>
            <th className="py-2">Email</th>
            <th className="py-2">Role</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id} className="border-b hover:bg-gray-50">
              <td className="py-2">{user.name}</td>
              <td className="py-2">{user.email}</td>
              <td className="py-2">{user.role || "user"}</td>
              <td className="py-2">
                <button
                  onClick={() => onDelete(user._id)}
                  className="text-red-500 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUserTable;