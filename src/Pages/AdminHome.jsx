import React, { useState, useEffect } from 'react';
import { getUserTickets } from '../utils/ticketUtils';
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase';
import Ticket from '../Components/Ticket';
import TicketAnalytics from '../Components/TicketAnalytics';
import TechnicianPanel from '../Components/TechnicianPanel';
import ReportsSection from '../Components/ReportsSection';
import UserTable from '../Components/UserTable';
import TableFilter from '../Components/TableFilter';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import { FcCustomerSupport } from "react-icons/fc";
import NotificationBell from '../Components/NotificationBell';
import { updateProfile } from 'firebase/auth';

export default function AdminHome() {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'overview'); // Get activeTab from location state or default to 'overview'
  const [filter, setFilter] = useState('all'); // 'all', 'open', 'in-progress', 'resolved', 'closed'
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const auth = getAuth();
  const navigate = useNavigate();

  const fetchTickets = async () => {
    try {
      const result = await getUserTickets(auth.currentUser.uid, 'admin');
      if (result.success) {
        setTickets(result.tickets);
      } else {
        toast.error('Failed to fetch tickets');
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Error loading tickets');
    }
  };

  const fetchUsers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      const usersList = [];
      querySnapshot.forEach((doc) => {
        usersList.push({ id: doc.id, ...doc.data() });
      });
      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error loading users');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (auth.currentUser) {
        await Promise.all([fetchTickets(), fetchUsers()]);
        // Initialize profile data
        setProfileData({
          name: auth.currentUser.displayName || '',
          email: auth.currentUser.email || ''
        });
      }
      setLoading(false);
    };
    fetchData();
  }, [auth.currentUser]);

  const handleTicketUpdated = () => {
    fetchTickets();
  };

  const handleProfileEdit = () => {
    setEditingProfile(true);
  };

  const handleProfileSave = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error("Please sign in to update profile");
        return;
      }

      // Update display name in Firebase Auth
      if (user.displayName !== profileData.name) {
        await updateProfile(user, {
          displayName: profileData.name,
        });

        // Update name in Firestore
        const docRef = doc(db, "users", user.uid);
        await updateDoc(docRef, {
          name: profileData.name,
        });
      }

      setEditingProfile(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Could not update profile");
    }
  };

  const handleProfileCancel = () => {
    // Reset to original values
    setProfileData({
      name: auth.currentUser?.displayName || '',
      email: auth.currentUser?.email || ''
    });
    setEditingProfile(false);
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate('/');
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Error signing out");
    }
  };

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditUser = (user) => {
    // Edit functionality - could be expanded with a modal
    console.log('Edit user:', user);
    toast.info('User editing functionality can be expanded here');
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
      
      toast.success(`User ${newStatus === 'Active' ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Error updating user status');
    }
  };

  // Filter users based on search and role filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       user.department?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === 'all' || user.role?.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const filteredTickets = () => {
    if (filter === 'all') return tickets;
    return tickets.filter(ticket =>
      ticket.status.toLowerCase().replace(' ', '-') === filter
    );
  };

  const getTicketStats = () => {
    return {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'Open').length,
      inProgress: tickets.filter(t => t.status === 'In Progress').length,
      resolved: tickets.filter(t => t.status === 'Resolved').length,
      closed: tickets.filter(t => t.status === 'Closed').length,
    };
  };

  const getUserStats = () => {
    return {
      total: users.length,
      users: users.filter(u => u.role === 'user').length,
      technicians: users.filter(u => u.role === 'technician').length,
      admins: users.filter(u => u.role === 'admin').length,
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  const ticketStats = getTicketStats();
  const userStats = getUserStats();

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
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'overview'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'analytics'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'tickets'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Ticket Management
            </button>
            <button
              onClick={() => setActiveTab('technicians')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'technicians'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Technician Panel
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'users'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              User Management
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'reports'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Reports
            </button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell />
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${activeTab === 'profile'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </button>
              <button
                onClick={handleSignOut}
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

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Ticket Statistics */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Ticket Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-700">Total Tickets</h3>
                  <p className="text-3xl font-bold text-blue-600">{ticketStats.total}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-700">Open</h3>
                  <p className="text-3xl font-bold text-yellow-600">{ticketStats.open}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-700">In Progress</h3>
                  <p className="text-3xl font-bold text-blue-600">{ticketStats.inProgress}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-700">Resolved</h3>
                  <p className="text-3xl font-bold text-green-600">{ticketStats.resolved}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-700">Closed</h3>
                  <p className="text-3xl font-bold text-gray-600">{ticketStats.closed}</p>
                </div>
              </div>
            </div>

            {/* User Statistics */}
            <div>
              <h2 className="text-2xl font-bold mb-4">User Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
                  <p className="text-3xl font-bold text-purple-600">{userStats.total}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-700">Regular Users</h3>
                  <p className="text-3xl font-bold text-green-600">{userStats.users}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-700">Technicians</h3>
                  <p className="text-3xl font-bold text-blue-600">{userStats.technicians}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-700">Admins</h3>
                  <p className="text-3xl font-bold text-red-600">{userStats.admins}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('analytics')}
                  className="bg-blue-500 text-white p-6 rounded-lg hover:bg-blue-600 transition-colors text-left"
                >
                  <h3 className="text-lg font-semibold mb-2">View Analytics</h3>
                  <p className="text-blue-100">Detailed charts and insights</p>
                </button>
                <button
                  onClick={() => setActiveTab('technicians')}
                  className="bg-green-500 text-white p-6 rounded-lg hover:bg-green-600 transition-colors text-left"
                >
                  <h3 className="text-lg font-semibold mb-2">Manage Assignments</h3>
                  <p className="text-green-100">Assign tickets to technicians</p>
                </button>
                <button
                  onClick={() => setActiveTab('reports')}
                  className="bg-purple-500 text-white p-6 rounded-lg hover:bg-purple-600 transition-colors text-left"
                >
                  <h3 className="text-lg font-semibold mb-2">Generate Reports</h3>
                  <p className="text-purple-100">Comprehensive analytics reports</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <TicketAnalytics tickets={tickets} users={users} />
        )}

        {/* Ticket Management Tab */}
        {activeTab === 'tickets' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Ticket Management</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-md transition-colors ${filter === 'all'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('open')}
                  className={`px-4 py-2 rounded-md transition-colors ${filter === 'open'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  Open
                </button>
                <button
                  onClick={() => setFilter('in-progress')}
                  className={`px-4 py-2 rounded-md transition-colors ${filter === 'in-progress'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  In Progress
                </button>
                <button
                  onClick={() => setFilter('resolved')}
                  className={`px-4 py-2 rounded-md transition-colors ${filter === 'resolved'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  Resolved
                </button>
              </div>
            </div>

            {/* Enhanced Ticket Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500">
                    <option value="">All Priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Technician</label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500">
                    <option value="">All Technicians</option>
                    <option value="unassigned">Unassigned</option>
                    {users.filter(u => u.role === 'technician').map(tech => (
                      <option key={tech.id} value={tech.id}>
                        {tech.name || tech.fullName || tech.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500">
                    <option value="">All Departments</option>
                    <option value="IT">IT</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <input
                    type="text"
                    placeholder="Search tickets..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {filteredTickets().length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <div className="text-gray-400 text-6xl mb-4">📊</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No tickets found</h3>
                  <p className="text-gray-500">No tickets match the current filter</p>
                </div>
              ) : (
                filteredTickets().map(ticket => (
                  <Ticket
                    key={ticket.ticketId}
                    ticket={ticket}
                    userRole="admin"
                    onUpdate={handleTicketUpdated}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* Technician Assignment Panel */}
        {activeTab === 'technicians' && (
          <TechnicianPanel 
            tickets={tickets} 
            users={users} 
            onUpdate={handleTicketUpdated}
          />
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">User Management</h2>
              <p className="text-sm text-gray-600">
                Manage users, roles, and permissions across your IT ticketing system
              </p>
            </div>

            {/* User Statistics */}
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
                          {users.filter(u => u.status === 'Active' || !u.status).length}
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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
                users={filteredUsers.map(user => ({
                  ...user,
                  fullName: user.name || user.fullName || 'Unknown',
                  status: user.status || 'Active'
                }))}
                onEdit={handleEditUser}
                onDeactivate={handleDeactivateUser}
              />
            </div>

            {/* Results Summary */}
            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredUsers.length} of {users.length} users
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <ReportsSection tickets={tickets} users={users} />
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
              <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Admin Profile</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileInputChange}
                    className={`w-full px-4 py-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      editingProfile ? 'bg-white' : 'bg-gray-50'
                    }`}
                    readOnly={!editingProfile}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-md bg-gray-50"
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-md">
                    <span className="text-red-600 font-semibold text-lg">Administrator</span>
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  {editingProfile ? (
                    <>
                      <button 
                        onClick={handleProfileSave}
                        className="flex-1 px-4 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors font-medium"
                      >
                        Save Changes
                      </button>
                      <button 
                        onClick={handleProfileCancel}
                        className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={handleProfileEdit}
                        className="flex-1 px-4 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors font-medium"
                      >
                        Edit Profile
                      </button>
                      <button 
                        onClick={handleSignOut}
                        className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors font-medium"
                      >
                        Sign Out
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
