import React, { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { FcCustomerSupport } from "react-icons/fc";
import UserTable from '../Components/UserTable';
import UserEditModal from '../Components/UserEditModal';
import TableFilter from '../Components/TableFilter';
import NotificationBell from '../Components/NotificationBell';

const UserManagementDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const auth = getAuth();
  const navigate = useNavigate();

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
    <div className="min-h-screen">
      {/* Fixed Navigation Tabs */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <FcCustomerSupport 
                size={60} 
                onClick={() => navigate('/admin-home')}
                className="cursor-pointer hover:opacity-80 transition-opacity duration-200"
              />
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => navigate('/admin-home')}
                  className="px-4 py-2 rounded-lg font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Overview
                </button>
                <button
                  onClick={() => navigate('/admin-home')}
                  className="px-4 py-2 rounded-lg font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Analytics
                </button>
                <button
                  onClick={() => navigate('/admin-home')}
                  className="px-4 py-2 rounded-lg font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Ticket Management
                </button>
                <button
                  onClick={() => navigate('/admin-home')}
                  className="px-4 py-2 rounded-lg font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Technician Panel
                </button>
                <button
                  className="px-4 py-2 rounded-lg font-medium transition-colors bg-red-500 text-white"
                >
                  User Management
                </button>
                <button
                  onClick={() => navigate('/admin-home')}
                  className="px-4 py-2 rounded-lg font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Reports
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell />
              <button
                onClick={() => navigate('/admin-home', { state: { activeTab: 'profile' } })}
                className="px-4 py-2 rounded-lg font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </button>
              <button
                onClick={() => auth.signOut()}
                className="px-4 py-2 rounded-lg font-medium transition-colors bg-red-500 text-white hover:bg-red-600 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with top padding to account for fixed navigation */}
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-8">
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
