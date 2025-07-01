import React, { useState } from 'react';
import { createNotification } from '../utils/ticketUtils';
import { getAuth } from 'firebase/auth';
import { toast } from 'react-toastify';

export default function DebugNotifications() {
  const [loading, setLoading] = useState(false);
  const auth = getAuth();

  const testCreateNotification = async () => {
    if (!auth.currentUser) {
      toast.error('Please log in first');
      return;
    }

    setLoading(true);
    try {
      console.log('🧪 Testing notification creation...');
      console.log('Current user:', auth.currentUser.uid);
      
      const result = await createNotification(
        auth.currentUser.uid,
        '🧪 TEST: New ticket created - Computer not working (IT Department, Floor 2)',
        'new_ticket'
      );
      
      console.log('🧪 Notification creation result:', result);
      
      if (result.success) {
        toast.success('✅ Test notification created successfully!');
      } else {
        toast.error('❌ Failed to create test notification');
      }
    } catch (error) {
      console.error('🧪 Error creating test notification:', error);
      toast.error('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const testCreateMultipleNotifications = async () => {
    if (!auth.currentUser) {
      toast.error('Please log in first');
      return;
    }

    setLoading(true);
    try {
      console.log('🧪 Testing multiple notification creation...');
      
      // Create 3 test notifications
      const promises = [
        createNotification(auth.currentUser.uid, '🧪 TEST 1: New ticket - Printer issue', 'new_ticket'),
        createNotification(auth.currentUser.uid, '🧪 TEST 2: New ticket - Network problem', 'new_ticket'),
        createNotification(auth.currentUser.uid, '🧪 TEST 3: New ticket - Software bug', 'new_ticket')
      ];
      
      const results = await Promise.all(promises);
      console.log('🧪 Multiple notification results:', results);
      
      const successCount = results.filter(r => r.success).length;
      toast.success(`✅ Created ${successCount}/3 test notifications`);
    } catch (error) {
      console.error('🧪 Error creating multiple notifications:', error);
      toast.error('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">🧪 Debug Notifications</h2>
      
      <div className="space-y-3">
        <button
          onClick={testCreateNotification}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
        >
          {loading ? 'Creating...' : 'Create Test Notification'}
        </button>

        <button
          onClick={testCreateMultipleNotifications}
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
        >
          {loading ? 'Creating...' : 'Create 3 Test Notifications'}
        </button>
      </div>

      <div className="mt-4 p-3 bg-gray-100 rounded">
        <p className="text-sm text-gray-600">
          <strong>User:</strong> {auth.currentUser?.uid || 'Not logged in'}
        </p>
        <p className="text-sm text-gray-600 mt-1">
          <strong>Purpose:</strong> Test notification creation and triggering
        </p>
      </div>
    </div>
  );
}
