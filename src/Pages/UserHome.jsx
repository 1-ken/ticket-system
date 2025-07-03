import React, { useState, useEffect, useCallback } from 'react';
import { getUserTickets } from '../utils/ticketUtils';
import { getAuth } from 'firebase/auth';
import CreateTicket from '../Components/CreateTicket';
import Ticket from '../Components/Ticket';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function UserHome() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const auth = getAuth();

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getUserTickets(auth.currentUser.uid, 'user');
      if (result.success) {
        setTickets(result.tickets);
      } else {
        toast.error('Failed to fetch tickets');
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Error loading tickets');
    } finally {
      setLoading(false);
    }
  }, [auth.currentUser]);

  useEffect(() => {
    if (auth.currentUser) {
      fetchTickets();
    }
  }, [auth.currentUser, fetchTickets]);

  const handleTicketCreated = () => {
    fetchTickets();
    setShowCreateTicket(false);
  };

  const handleTicketUpdated = () => {
    fetchTickets();
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
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-8 mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to Your Dashboard</h1>
        <p className="text-lg opacity-90">
          Submit support tickets and track their progress
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Total Tickets</h3>
          <p className="text-3xl font-bold text-blue-600">{tickets.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Open</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {tickets.filter(t => t.status === 'Open').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">In Progress</h3>
          <p className="text-3xl font-bold text-blue-600">
            {tickets.filter(t => t.status === 'In Progress').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Resolved</h3>
          <p className="text-3xl font-bold text-green-600">
            {tickets.filter(t => t.status === 'Resolved').length}
          </p>
        </div>
      </div>

      {/* Create Ticket Section */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Support Tickets</h2>
        <button
          onClick={() => setShowCreateTicket(!showCreateTicket)}
          className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          {showCreateTicket ? 'Hide Form' : 'Create New Ticket'}
        </button>
      </div>

      {/* Create Ticket Form */}
      {showCreateTicket && (
        <CreateTicket onTicketCreated={handleTicketCreated} />
      )}

      {/* Tickets List */}
      <div className="space-y-4">
        {tickets.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No tickets yet</h3>
            <p className="text-gray-500 mb-4">
              Create your first support ticket to get help with any issues
            </p>
            <button
              onClick={() => setShowCreateTicket(true)}
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              Create Your First Ticket
            </button>
          </div>
        ) : (
          tickets.map(ticket => (
            <Ticket
              key={ticket.ticketId}
              ticket={ticket}
              userRole="user"
              onUpdate={handleTicketUpdated}
            />
          ))
        )}
      </div>
    </div>
  );
}
