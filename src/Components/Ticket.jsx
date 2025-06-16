import React, { useState } from 'react';
import { updateTicketStatus, addTicketComment, assignTicket } from '../utils/ticketUtils';
import { getAuth } from 'firebase/auth';
import { toast } from 'react-toastify';

export default function Ticket({ ticket, userRole, onUpdate }) {
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = getAuth();

  const statusColors = {
    'Open': 'bg-yellow-100 text-yellow-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    'Resolved': 'bg-green-100 text-green-800',
    'Closed': 'bg-gray-100 text-gray-800'
  };

  const priorityColors = {
    'Low': 'bg-gray-100 text-gray-800',
    'Medium': 'bg-orange-100 text-orange-800',
    'High': 'bg-red-100 text-red-800'
  };

  const handleStatusChange = async (newStatus) => {
    setLoading(true);
    try {
      const result = await updateTicketStatus(ticket.ticketId, newStatus, auth.currentUser.uid);
      if (result.success) {
        toast.success(`Ticket status updated to ${newStatus}`);
        if (onUpdate) onUpdate();
      } else {
        toast.error('Failed to update ticket status');
      }
    } catch (error) {
      toast.error('Error updating ticket status');
      console.error(error);
    }
    setLoading(false);
  };

  const handleAssign = async () => {
    setLoading(true);
    try {
      const result = await assignTicket(ticket.ticketId, auth.currentUser.uid);
      if (result.success) {
        toast.success('Ticket assigned successfully');
        if (onUpdate) onUpdate();
      } else {
        toast.error('Failed to assign ticket');
      }
    } catch (error) {
      toast.error('Error assigning ticket');
      console.error(error);
    }
    setLoading(false);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setLoading(true);
    try {
      const result = await addTicketComment(ticket.ticketId, auth.currentUser.uid, comment);
      if (result.success) {
        toast.success('Comment added successfully');
        setComment('');
        setShowCommentInput(false);
        if (onUpdate) onUpdate();
      } else {
        toast.error('Failed to add comment');
      }
    } catch (error) {
      toast.error('Error adding comment');
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">{ticket.title}</h3>
          <p className="text-gray-600 mb-2">{ticket.description}</p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[ticket.status]}`}>
            {ticket.status}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityColors[ticket.priority]}`}>
            {ticket.priority}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
          {ticket.category}
        </span>
        <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
          ID: {ticket.ticketId}
        </span>
        {ticket.department && (
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
            📍 {ticket.department}
          </span>
        )}
        {ticket.floor && ticket.officeNumber && (
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
            🏢 {ticket.floor}, Office {ticket.officeNumber}
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {/* Status Update Buttons - Visible to technicians and admins */}
        {(userRole === 'technician' || userRole === 'admin') && (
          <div className="flex flex-wrap gap-2">
            {ticket.status !== 'Closed' && (
              <>
                {ticket.status !== 'In Progress' && (
                  <button
                    onClick={() => handleStatusChange('In Progress')}
                    disabled={loading}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    Mark In Progress
                  </button>
                )}
                {ticket.status !== 'Resolved' && (
                  <button
                    onClick={() => handleStatusChange('Resolved')}
                    disabled={loading}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    Mark Resolved
                  </button>
                )}
                <button
                  onClick={() => handleStatusChange('Closed')}
                  disabled={loading}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50"
                >
                  Close Ticket
                </button>
              </>
            )}
          </div>
        )}

        {/* Assign Button - Visible to unassigned tickets for technicians */}
        {userRole === 'technician' && !ticket.assignedTo && ticket.status === 'Open' && (
          <button
            onClick={handleAssign}
            disabled={loading}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
          >
            Assign to Me
          </button>
        )}

        {/* Comment Button - Visible to all */}
        <button
          onClick={() => setShowCommentInput(!showCommentInput)}
          className="bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200"
        >
          Add Comment
        </button>
      </div>

      {/* Comment Input Form */}
      {showCommentInput && (
        <form onSubmit={handleCommentSubmit} className="mt-4">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Type your comment here..."
            className="w-full p-2 border rounded-lg mb-2"
            rows="3"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCommentInput(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !comment.trim()}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Submit Comment
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
