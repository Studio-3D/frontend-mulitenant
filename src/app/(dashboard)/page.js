"use client";

import { useAuth } from "../../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Welcome {user?.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Properties</h2>
          <p className="text-3xl font-bold">12</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Active Contracts</h2>
          <p className="text-3xl font-bold">8</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Total Users</h2>
          <p className="text-3xl font-bold">24</p>
        </div>
      </div>
      <button 
        onClick={logout} 
        className="mt-8 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
}
