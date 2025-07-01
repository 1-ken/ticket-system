import React, { useState, useEffect } from 'react';
import { getUserTickets } from '../utils/ticketUtils';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase';
import Ticket from '../Components/Ticket';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function AdminHome() {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'tickets', 'users'
  const [filter, setFilter] = useState('all'); // 'all', 'open', 'in-progress', 'resolved', 'closed'
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
      }
      setLoading(false);
    };
    fetchData();
  }, [auth.currentUser]);

  const handleTicketUpdated = () => {
    fetchTickets();
  };

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

    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg p-8 mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-lg opacity-90">
          Complete system overview and management
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-8">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === 'overview'
            ? 'bg-red-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === 'tickets'
            ? 'bg-red-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          All Tickets
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === 'users'
            ? 'bg-red-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          User Management
        </button>
      </div>

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
        </div>
      )}

      {/* Tickets Tab */}
      {activeTab === 'tickets' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">All Support Tickets</h2>
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

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">User Management</h2>
            <button
              onClick={() => navigate('/admin/user-management')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Advanced User Management
            </button>
          </div>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'admin' ? 'bg-red-100 text-red-800' :
                        user.role === 'technician' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
