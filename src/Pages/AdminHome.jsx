import React from 'react';

export default function AdminHome() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">System Settings</h2>
          <p className="text-gray-600">Configure system-wide settings</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Analytics</h2>
          <p className="text-gray-600">View system analytics and reports</p>
        </div>
      </div>
    </div>
  );
}
