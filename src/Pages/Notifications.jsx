import React, { useState, useEffect } from 'react';
import { getUserNotifications, markNotificationAsRead } from '../utils/ticketUtils';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FcCustomerSupport } from "react-icons/fc";
import NotificationBell from '../Components/NotificationBell';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [userRole, setUserRole] = useState('');
  const auth = getAuth();
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const result = await getUserNotifications(auth.currentUser.uid);
      if (result.success) {
        setNotifications(result.notifications);
      } else {
        toast.error('Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Error loading notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserRole = async () => {
      if (auth.currentUser) {
        try {
          const docRef = doc(db, "users", auth.currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUserRole(userData.role || 'user');
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          setUserRole('user');
        }
        fetchNotifications();
      }
    };
    
    fetchUserRole();
  }, [auth.currentUser]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      const result = await markNotificationAsRead(notificationId);
      if (result.success) {
        toast.success('Notification marked as read');
        fetchNotifications();
      } else {
        toast.error('Failed to mark notification as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Error updating notification');
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    
    try {
      await Promise.all(
        unreadNotifications.map(notification => 
          markNotificationAsRead(notification.id)
        )
      );
      toast.success('All notifications marked as read');
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Error updating notifications');
    }
  };

  const filteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.read);
      case 'read':
        return notifications.filter(n => n.read);
      default:
        return notifications;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Admin Navigation - Show only for admin users */}
      {userRole === 'admin' && (
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
                    onClick={() => {
                      navigate('/admin-home');
                      // You can add state or URL params here to set the active tab to 'overview'
                    }}
                    className="px-4 py-2 rounded-lg font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => {
                      navigate('/admin-home');
                      // You can add state or URL params here to set the active tab to 'analytics'
                    }}
                    className="px-4 py-2 rounded-lg font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Analytics
                  </button>
                  <button
                    onClick={() => {
                      navigate('/admin-home');
                      // You can add state or URL params here to set the active tab to 'tickets'
                    }}
                    className="px-4 py-2 rounded-lg font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Ticket Management
                  </button>
                  <button
                    onClick={() => {
                      navigate('/admin-home');
                      // You can add state or URL params here to set the active tab to 'technicians'
                    }}
                    className="px-4 py-2 rounded-lg font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Technician Panel
                  </button>
                  <button
                    onClick={() => {
                      navigate('/admin-home');
                      // You can add state or URL params here to set the active tab to 'users'
                    }}
                    className="px-4 py-2 rounded-lg font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    User Management
                  </button>
                  <button
                    onClick={() => {
                      navigate('/admin-home');
                      // You can add state or URL params here to set the active tab to 'reports'
                    }}
                    className="px-4 py-2 rounded-lg font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Reports
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <NotificationBell />
                <button
                  className="px-4 py-2 rounded-lg font-medium transition-colors bg-red-500 text-white"
                >
                  Notifications
                </button>
                <button
                  onClick={() => navigate('/profile')}
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
      )}

      <div className={`max-w-4xl mx-auto px-4 py-8 ${userRole === 'admin' ? 'pt-24' : ''}`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              Mark All as Read
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'read'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Read ({notifications.length - unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-2">
          {filteredNotifications().length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <div className="text-gray-400 text-6xl mb-4">🔔</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {filter === 'unread' ? 'No unread notifications' :
                 filter === 'read' ? 'No read notifications' :
                 'No notifications yet'}
              </h3>
              <p className="text-gray-500">
                {filter === 'all' 
                  ? "You'll receive notifications about your ticket updates here"
                  : `Switch to another tab to see ${filter === 'unread' ? 'read' : 'unread'} notifications`}
              </p>
            </div>
          ) : (
            filteredNotifications().map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow p-6 transition-colors ${
                  !notification.read ? 'border-l-4 border-blue-500 bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      {!notification.read && (
                        <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      )}
                      <p className="text-gray-800 font-medium">{notification.message}</p>
                    </div>
                    <p className="text-sm text-gray-500">
                      {notification.timestamp?.toDate?.()?.toLocaleString() || 'Just now'}
                    </p>
                  </div>
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="ml-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
