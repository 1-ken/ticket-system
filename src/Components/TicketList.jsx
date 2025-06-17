import React, { useState, useEffect } from 'react';
import { getUserTickets } from '../utils/ticketUtils';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Ticket from './Ticket';
import CreateTicket from './CreateTicket';
import { toast } from 'react-toastify';

export default function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const auth = getAuth();

  const fetchUserRole = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data().role;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user role:', error);
      return null;
    }
  };

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const role = await fetchUserRole(auth.currentUser.uid);
      setUserRole(role);

      const result = await getUserTickets(auth.currentUser.uid, role);
      if (result.success) {
        setTickets(result.tickets);
      } 
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Error loading tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth.currentUser) {
      fetchTickets();
    }
  }, [auth.currentUser]);

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {userRole === 'admin' ? 'All Tickets' :
            userRole === 'technician' ? 'Available & Assigned Tickets' :
              'My Tickets'}
        </h1>

        {/* Only show Create Ticket button for regular users */}
        {userRole === 'user' && (
          <button
            onClick={() => setShowCreateTicket(!showCreateTicket)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            {showCreateTicket ? 'Hide Form' : 'Create New Ticket'}
          </button>
        )}
      </div>

      {/* Create Ticket Form */}
      {showCreateTicket && userRole === 'user' && (
        <CreateTicket onTicketCreated={handleTicketCreated} />
      )}

      {/* Tickets List */}
      <div className="space-y-4">
        {tickets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">
              {userRole === 'user' ?
                "You haven't created any tickets yet." :
                "No tickets available."}
            </p>
          </div>
        ) : (
          tickets.map(ticket => (
            <Ticket
              key={ticket.ticketId}
              ticket={ticket}
              userRole={userRole}
              onUpdate={handleTicketUpdated}
            />
          ))
        )}
      </div>
    </div>
  );
}
