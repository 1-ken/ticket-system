import React, { useState } from 'react';
import { createTicket } from '../utils/ticketUtils';
import { getAuth } from 'firebase/auth';
import { toast } from 'react-toastify';
import { useAuthstatus } from '../hooks/useAuthstatus';

export default function CreateTicket({ onTicketCreated }) {
  const [loading, setLoading] = useState(false);
  const { userRole } = useAuthstatus();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Hardware',
    priority: 'Low',
    department: '',
    floor: '',
    officeNumber: ''
  });

  const categories = ['Hardware', 'Software', 'Network', 'Other'];
  const priorities = ['Low', 'Medium', 'High'];
  const auth = getAuth();

  // If user role is not allowed, show message
  if (!userRole) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <p className="text-red-500">Loading user permissions...</p>
      </div>
    );
  }

  if (userRole !== 'user' && userRole !== 'admin') {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <p className="text-red-500">You do not have permission to create tickets. Only users and administrators can create tickets.</p>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Double-check permissions before submitting
    if (!userRole || (userRole !== 'user' && userRole !== 'admin')) {
      toast.error('You do not have permission to create tickets');
      return;
    }

    setLoading(true);

    try {
      const result = await createTicket(formData, auth.currentUser.uid);
      
      if (result.success) {
        toast.success('Ticket created successfully!');
        setFormData({
          title: '',
          description: '',
          category: 'Hardware',
          priority: 'Low',
          department: '',
          floor: '',
          officeNumber: ''
        });
        if (onTicketCreated) {
          onTicketCreated();
        }
      } else {
        toast.error('Failed to create ticket');
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Error creating ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-6">Create New Ticket</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title Input */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Brief description of the issue"
          />
        </div>

        {/* Description Input */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Detailed description of the issue"
          />
        </div>

        {/* Category Selection */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Selection */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {priorities.map(priority => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>

        {/* Location Information */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Location Information</h3>
          
          {/* Department */}
          <div className="mb-4">
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <input
              type="text"
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., IT, HR, Finance, Marketing"
            />
          </div>

          {/* Floor and Office Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="floor" className="block text-sm font-medium text-gray-700 mb-1">
                Floor
              </label>
              <input
                type="text"
                id="floor"
                name="floor"
                value={formData.floor}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 1st Floor, Ground Floor, B1"
              />
            </div>
            
            <div>
              <label htmlFor="officeNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Office Number
              </label>
              <input
                type="text"
                id="officeNumber"
                name="officeNumber"
                value={formData.officeNumber}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 101, A-205, Conference Room 1"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 text-white font-medium rounded-md ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Creating...' : 'Create Ticket'}
          </button>
        </div>
      </form>
    </div>
  );
}
