import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { FcCustomerSupport } from "react-icons/fc";
import UserTable from '../Components/UserTable';
import TableFilter from '../Components/TableFilter';
import NotificationBell from '../Components/NotificationBell';

const UserManagementFirebase = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const navigate = useNavigate();

  // Fetch users from Firebase
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        const usersList = snapshot.docs.map(doc => ({
          id: doc.id,
          fullName: doc.data().name || doc.data().fullName || 'Unknown',
          email: doc.data().email || '',
          role: doc.data().role || 'User',
          department: doc.data().department || 'General',
          status: doc.data().status || 'Active'
        }));
        setUsers(usersList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search and role filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       user.department?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === 'all' || user.role?.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const handleEditUser = (user) => {
    // Edit functionality removed as it was tied to the modal
    console.log('Edit user functionality has been removed');
  };

  const handleDeactivateUser = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const user = users.find(u => u.id === userId);
      const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
      
      await updateDoc(userRef, {
        status: newStatus
      });

      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users from Firebase...</p>
        </div>
      </div>
    );
  }

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
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">User Management Dashboard</h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage users, roles, and permissions across your IT ticketing system (Firebase Data)
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
                        <dd className="text-lg font-medium text-gray-900">
                          {users.filter(u => u.status === 'Active').length}
                        </dd>
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
                        <dd className="text-lg font-medium text-gray-900">
                          {users.filter(u => u.role?.toLowerCase() === 'technician').length}
                        </dd>
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
                        <dd className="text-lg font-medium text-gray-900">
                          {users.filter(u => u.role?.toLowerCase() === 'admin').length}
                        </dd>
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
            />

            {/* User Table */}
            <div className="mt-6">
              <UserTable 
                users={filteredUsers}
                onEdit={handleEditUser}
                onDeactivate={handleDeactivateUser}
              />
            </div>

            {/* Results Summary */}
            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredUsers.length} of {users.length} users
            </div>
          </div>
    </div>
  );
};

export default UserManagementFirebase;
