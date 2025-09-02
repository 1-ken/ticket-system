import React, { useState } from 'react';
import UserTable from '../Components/UserTable';
import UserEditModal from '../Components/UserEditModal';
import TableFilter from '../Components/TableFilter';

const UserManagementDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Mock data - replace with actual data fetching
  const [users] = useState([
    { id: 1, fullName: 'John Doe', email: 'john.doe@company.com', role: 'Admin', department: 'IT', status: 'Active' },
    { id: 2, fullName: 'Jane Smith', email: 'jane.smith@company.com', role: 'Technician', department: 'Support', status: 'Active' },
    { id: 3, fullName: 'Mike Johnson', email: 'mike.johnson@company.com', role: 'User', department: 'Sales', status: 'Active' },
    { id: 4, fullName: 'Sarah Wilson', email: 'sarah.wilson@company.com', role: 'Technician', department: 'IT', status: 'Inactive' },
    { id: 5, fullName: 'David Brown', email: 'david.brown@company.com', role: 'User', department: 'Marketing', status: 'Active' },
    { id: 6, fullName: 'Lisa Davis', email: 'lisa.davis@company.com', role: 'Admin', department: 'HR', status: 'Active' },
    { id: 7, fullName: 'Tom Anderson', email: 'tom.anderson@company.com', role: 'User', department: 'Finance', status: 'Active' },
    { id: 8, fullName: 'Emily Taylor', email: 'emily.taylor@company.com', role: 'Technician', department: 'Support', status: 'Active' },
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-semibold text-gray-800">User Management</h1>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col fixed h-full bg-gray-800">
          <div className="flex-1 flex flex-col min-h-0">
            <nav className="flex-1 px-2 py-4 space-y-1">
              <a href="#" className="text-gray-300 hover:bg-gray-700 hover:text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                Dashboard
              </a>
              <a href="#" className="bg-gray-900 text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                User Management
              </a>
              <a href="#" className="text-gray-300 hover:bg-gray-700 hover:text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                Settings
              </a>
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="md:ml-64 flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <TableFilter 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              roleFilter={roleFilter}
              setRoleFilter={setRoleFilter}
            />
            <div className="mt-4">
              <UserTable 
                users={filteredUsers}
                onEdit={handleEditUser}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <UserEditModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
      />
    </div>
  );
};

export default UserManagementDashboard;
