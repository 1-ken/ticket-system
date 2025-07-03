import React, { useState, useEffect, useCallback } from 'react';
import { getUserTickets } from '../utils/ticketUtils';
import { getAuth } from 'firebase/auth';
import Ticket from '../Components/Ticket';
import { toast } from 'react-toastify';

export default function TechnicianHome() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'assigned', 'unassigned'
  const auth = getAuth();

  const fetchTickets = useCallback(async () => {
    if (!auth.currentUser) {
      console.warn('No authenticated user found');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const result = await getUserTickets(auth.currentUser.uid, 'technician');
      if (result.success) {
        setTickets(result.tickets);
      } else {
        console.error('Failed to fetch tickets:', result.error);
        toast.error('Failed to load tickets. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Error loading tickets. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, [auth.currentUser]);

  useEffect(() => {
    if (auth.currentUser) {
      fetchTickets();
    }
  }, [auth.currentUser, fetchTickets]);

  const handleTicketUpdated = () => {
    fetchTickets();
  };

  const filteredTickets = () => {
    switch (filter) {
      case 'assigned':
        return tickets.filter(ticket => ticket.assignedTo === auth.currentUser.uid);
      case 'unassigned':
        return tickets.filter(ticket => !ticket.assignedTo);
      default:
        return tickets;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (

    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg p-8 mb-8">
        <h1 className="text-3xl font-bold mb-2">Technician Dashboard</h1>
        <p className="text-lg opacity-90">
          Manage and resolve support tickets
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Total Available</h3>
          <p className="text-3xl font-bold text-blue-600">{tickets.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Assigned to Me</h3>
          <p className="text-3xl font-bold text-purple-600">
            {tickets.filter(t => t.assignedTo === auth.currentUser.uid).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Unassigned</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {tickets.filter(t => !t.assignedTo).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Resolved</h3>
          <p className="text-3xl font-bold text-green-600">
            {tickets.filter(t => t.status === 'Resolved' && t.assignedTo === auth.currentUser.uid).length}
          </p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Support Tickets</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md transition-colors ${filter === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            All Tickets
          </button>
          <button
            onClick={() => setFilter('assigned')}
            className={`px-4 py-2 rounded-md transition-colors ${filter === 'assigned'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            My Tickets
          </button>
          <button
            onClick={() => setFilter('unassigned')}
            className={`px-4 py-2 rounded-md transition-colors ${filter === 'unassigned'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            Unassigned
          </button>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets().length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-gray-400 text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No tickets found</h3>
            <p className="text-gray-500">
              {filter === 'assigned'
                ? "You haven't been assigned any tickets yet"
                : filter === 'unassigned'
                  ? "No unassigned tickets available"
                  : "No tickets available at the moment"}
            </p>
          </div>
        ) : (
          filteredTickets().map(ticket => (
            <Ticket
              key={ticket.ticketId}
              ticket={ticket}
              userRole="technician"
              onUpdate={handleTicketUpdated}
            />
          ))
        )}
      </div>
    </div>
  );
}
