import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { getTechnicianWorkload, getUnassignedTickets } from '../utils/analyticsUtils';
import { assignTicket } from '../utils/ticketUtils';
import { toast } from 'react-toastify';

const TechnicianPanel = ({ tickets, users, onUpdate }) => {
  const [unassignedTickets, setUnassignedTickets] = useState([]);
  const [technicianWorkload, setTechnicianWorkload] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedTechnician, setSelectedTechnician] = useState('');

  useEffect(() => {
    fetchData();
  }, [tickets, users]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [unassigned, workload] = await Promise.all([
        getUnassignedTickets(),
        getTechnicianWorkload(users)
      ]);
      
      setUnassignedTickets(unassigned);
      setTechnicianWorkload(workload);
    } catch (error) {
      console.error('Error fetching technician panel data:', error);
      toast.error('Failed to load technician data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTicket = async (ticketId, technicianId) => {
    try {
      const result = await assignTicket(ticketId, technicianId);
      if (result.success) {
        toast.success('Ticket assigned successfully');
        fetchData(); // Refresh data
        if (onUpdate) onUpdate();
      } else {
        toast.error('Failed to assign ticket');
      }
    } catch (error) {
      console.error('Error assigning ticket:', error);
      toast.error('Error assigning ticket');
    }
  };

  const handleBulkAssign = async () => {
    if (!selectedTicket || !selectedTechnician) {
      toast.error('Please select both a ticket and technician');
      return;
    }

    await handleAssignTicket(selectedTicket, selectedTechnician);
    setSelectedTicket(null);
    setSelectedTechnician('');
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in progress':
        return 'bg-purple-100 text-purple-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const technicians = users.filter(user => user.role === 'technician');

  return (
    <div className="space-y-8">
      {/* Technician Workload Overview */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Technician Workload</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {technicianWorkload.map((tech) => (
            <div key={tech.technicianId} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-700">{tech.name}</h3>
              <p className="text-3xl font-bold text-blue-600">{tech.openTickets}</p>
              <p className="text-sm text-gray-500">Open Tickets</p>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      tech.openTickets > 10 ? 'bg-red-500' : 
                      tech.openTickets > 5 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min((tech.openTickets / 15) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {tech.openTickets > 10 ? 'High Load' : 
                   tech.openTickets > 5 ? 'Medium Load' : 'Light Load'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bulk Assignment */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Quick Assignment</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Ticket
            </label>
            <select
              value={selectedTicket || ''}
              onChange={(e) => setSelectedTicket(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a ticket...</option>
              {unassignedTickets.map((ticket) => (
                <option key={ticket.ticketId} value={ticket.ticketId}>
                  {ticket.ticketId} - {ticket.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Technician
            </label>
            <select
              value={selectedTechnician}
              onChange={(e) => setSelectedTechnician(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a technician...</option>
              {technicians.map((tech) => (
                <option key={tech.id} value={tech.id}>
                  {tech.name || tech.fullName || tech.email}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleBulkAssign}
              disabled={!selectedTicket || !selectedTechnician}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Assign Ticket
            </button>
          </div>
        </div>
      </div>

      {/* Unassigned Tickets */}
      <div>
        <h2 className="text-2xl font-bold mb-4">
          Unassigned Tickets ({unassignedTickets.length})
        </h2>
        
        {unassignedTickets.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-gray-400 text-6xl mb-4">✅</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">All tickets assigned!</h3>
            <p className="text-gray-500">No unassigned tickets at the moment</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {unassignedTickets.map((ticket) => (
                  <tr key={ticket.ticketId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {ticket.ticketId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="max-w-xs truncate">{ticket.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ticket.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAssignTicket(ticket.ticketId, e.target.value);
                            e.target.value = ''; // Reset select
                          }
                        }}
                        className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Assign to...</option>
                        {technicians.map((tech) => (
                          <option key={tech.id} value={tech.id}>
                            {tech.name || tech.fullName || tech.email}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TechnicianPanel;
