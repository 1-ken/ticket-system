import React, { useState } from 'react';
import UserTable from '../Components/UserTable';
import UserEditModal from '../Components/UserEditModal';
import TableFilter from '../Components/TableFilter';

const UserManagementDemo = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Enhanced mock data for demonstration
  const [users, setUsers] = useState([
    { id: 1, fullName: 'John Doe', email: 'john.doe@company.com', role: 'Admin', department: 'IT', status: 'Active' },
    { id: 2, fullName: 'Jane Smith', email: 'jane.smith@company.com', role: 'Technician', department: 'Support', status: 'Active' },
    { id: 3, fullName: 'Mike Johnson', email: 'mike.johnson@company.com', role: 'User', department: 'Sales', status: 'Active' },
    { id: 4, fullName: 'Sarah Wilson', email: 'sarah.wilson@company.com', role: 'Technician', department: 'IT', status: 'Inactive' },
    { id: 5, fullName: 'David Brown', email: 'david.brown@company.com', role: 'User', department: 'Marketing', status: 'Active' },
    { id: 6, fullName: 'Lisa Davis', email: 'lisa.davis@company.com', role: 'Admin', department: 'HR', status: 'Active' },
    { id: 7, fullName: 'Tom Anderson', email: 'tom.anderson@company.com', role: 'User', department: 'Finance', status: 'Active' },
    { id: 8, fullName: 'Emily Taylor', email: 'emily.taylor@company.com', role: 'Technician', department: 'Support', status: 'Active' },
    { id: 9, fullName: 'Robert Garcia', email: 'robert.garcia@company.com', role: 'User', department: 'Operations', status: 'Active' },
    { id: 10, fullName: 'Maria Rodriguez', email: 'maria.rodriguez@company.com', role: 'Technician', department: 'IT', status: 'Inactive' },
  ]);

  // Filter users based on search and role filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleResetPassword = (userId) => {
    const user = users.find(u => u.id === userId);
    // Actually update the user's password in the data
    const updatedUsers = users.map(u => 
      u.id === userId 
        ? { ...u, password: 'empower-it-123' }
        : u
    );
    setUsers(updatedUsers);
    alert(`Password has been reset to "empower-it-123" for ${user.fullName} (${user.email})`);
  };

  const handleDeactivateUser = (userId) => {
    const updatedUsers = users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'Active' ? 'Inactive' : 'Active' }
        : user
    );
    setUsers(updatedUsers);
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleSaveUser = (userData) => {
    if (userData.id) {
      // Update existing user
      const updatedUsers = users.map(user => 
        user.id === userData.id ? userData : user
      );
      setUsers(updatedUsers);
      alert(`User ${userData.fullName} has been updated successfully!`);
    } else {
      // Add new user with default password
      const newUser = {
        ...userData,
        id: Math.max(...users.map(u => u.id)) + 1,
        status: 'Active',
        password: 'empower-it-123' // Set default password for new users
      };
      setUsers([...users, newUser]);
      alert(`User ${userData.fullName} has been added successfully with default password "empower-it-123"`);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-800">IT Ticketing System</h1>
              </div>
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-4">
                  <span className="text-teal-600 px-3 py-2 rounded-md text-sm font-medium">User Management</span>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-500">Admin Dashboard</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex">
        {/* Content Area */}
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">User Management Dashboard</h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage users, roles, and permissions across your IT ticketing system
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white overflow-hidden shadow-lg rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                        <dd className="text-lg font-medium text-gray-900">{users.length}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow-lg rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Active Users</dt>
                        <dd className="text-lg font-medium text-gray-900">{users.filter(u => u.status === 'Active').length}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow-lg rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Technicians</dt>
                        <dd className="text-lg font-medium text-gray-900">{users.filter(u => u.role === 'Technician').length}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow-lg rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Admins</dt>
                        <dd className="text-lg font-medium text-gray-900">{users.filter(u => u.role === 'Admin').length}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter and Search */}
            <TableFilter 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              roleFilter={roleFilter}
              setRoleFilter={setRoleFilter}
              onAddUser={handleAddUser}
            />

            {/* User Table */}
            <div className="mt-6">
              <UserTable 
                users={filteredUsers}
                onEdit={handleEditUser}
                onDeactivate={handleDeactivateUser}
                onResetPassword={handleResetPassword}
              />
            </div>

            {/* Results Summary */}
            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredUsers.length} of {users.length} users
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <UserEditModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
        onSave={handleSaveUser}
      />
    </div>
  );
};

export default UserManagementDemo;
