import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getUserNotifications, markNotificationAsRead } from '../utils/ticketUtils';
import { getAuth } from 'firebase/auth';
import { toast } from 'react-toastify';
import { doc, getDoc, collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const auth = getAuth();
  
  // Refs for notification sound
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const prevUnreadCountRef = useRef(0);
  const [userRole, setUserRole] = useState(null);

  // Function to play fallback beep using Web Audio API
  const playBeep = useCallback((duration = 200) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.value = 800;
      gainNode.gain.value = 0.1;
      
      oscillator.start();
      setTimeout(() => oscillator.stop(), duration);
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }, []);

  // Initialize audio on component mount with absolute path
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        // Create new Audio object with absolute path
        const audio = new Audio(`${window.location.origin}/notification-sound.mp3`);
        
        // Configure audio element
        audio.preload = 'auto';
        
        // Add error handler
        audio.onerror = (e) => {
          console.error('🔊 Audio load error:', e);
        };
        
        // Store in ref
        audioRef.current = audio;
        
        // Pre-load the audio
        await audio.load();
        
        // Test if audio loaded successfully
        if (audio.readyState >= 2) {
          console.log('🔊 Audio initialized successfully');
        } else {
          console.warn('🔊 Audio not fully loaded');
        }
      } catch (error) {
        console.error('🔊 Failed to initialize audio:', error);
      }
    };

    initializeAudio();

    // Cleanup function
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Function to play notification sound with retry logic
  const playNotificationSound = useCallback(async (duration = 15000) => {
    console.log('🔊 Attempting to play notification sound...');
    
    // First try to use Web Audio API to generate a tone
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const context = audioContextRef.current;
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      // Create a more attention-grabbing sound pattern
      oscillator.type = 'square';
      oscillator.frequency.value = 800;
      gainNode.gain.value = 0.3;
      
      // Create a pulsing effect
      const now = context.currentTime;
      const pulseInterval = 0.5; // Pulse every 500ms
      const totalDuration = Math.min(duration / 1000, 15); // Max 15 seconds
      
      for (let i = 0; i < totalDuration; i += pulseInterval * 2) {
        gainNode.gain.setValueAtTime(0.3, now + i);
        gainNode.gain.setValueAtTime(0, now + i + pulseInterval);
      }
      
      oscillator.start(now);
      oscillator.stop(now + totalDuration);
      
      console.log('🔊 Successfully started playing Web Audio notification sound');
      return;
      
    } catch (webAudioError) {
      console.warn('🔊 Web Audio API failed, trying MP3 file:', webAudioError);
      
      // Fallback to MP3 file with different approach
      try {
        // Try without range requests by creating a simple audio element
        const audio = document.createElement('audio');
        audio.src = '/notification-sound.mp3';
        audio.volume = 1.0;
        audio.preload = 'none'; // Don't preload to avoid range issues
        
        // Simple play without waiting for full load
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          await playPromise;
          console.log('🔊 Successfully started playing MP3 sound');
          
          // Stop after duration
          setTimeout(() => {
            audio.pause();
            audio.currentTime = 0;
          }, Math.min(duration, 15000));
        }
        
      } catch (mp3Error) {
        console.error('🔊 MP3 playback failed:', mp3Error);
        // Final fallback to simple beep
        playBeep(Math.min(duration, 2000));
      }
    }
  }, [playBeep]);

  const fetchNotifications = useCallback(async (retryCount = 0) => {
    if (!auth.currentUser) return;

    setLoading(true);
    try {
      const result = await getUserNotifications(auth.currentUser.uid);
      if (result.success) {
        setNotifications(result.notifications);
      } else {
        console.error('Failed to fetch notifications:', result.error);
        if (retryCount === 0) {
          console.warn('Notification fetch failed, will retry in background');
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      
      if (retryCount < 2 && (
        error.message.includes('ERR_QUIC_PROTOCOL_ERROR') ||
        error.message.includes('network') ||
        error.message.includes('connection')
      )) {
        console.log(`Retrying notification fetch (attempt ${retryCount + 1})`);
        setTimeout(() => {
          fetchNotifications(retryCount + 1);
        }, 2000 * (retryCount + 1));
        return;
      }
    } finally {
      setLoading(false);
    }
  }, [auth.currentUser]);

  // Memoize functions to prevent unnecessary re-renders and fix dependency warnings
  const memoizedGetUserRole = useCallback(async () => {
    if (!auth.currentUser) {
      console.log('No authenticated user found');
      return;
    }
    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        const role = userDoc.data().role;
        console.log('User role fetched:', role);
        setUserRole(role);
      } else {
        console.warn('User document does not exist');
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      toast.error('Error loading user role');
    }
  }, [auth.currentUser]);

  // Effect for authentication and role
  useEffect(() => {
    console.log('Auth state changed:', auth.currentUser?.uid);
    if (auth.currentUser) {
      memoizedGetUserRole();
    } else {
      setUserRole(null);
    }
  }, [auth.currentUser, memoizedGetUserRole]);

  // Effect for notifications
  useEffect(() => {
    if (!auth.currentUser) {
      console.log('No authenticated user for notifications');
      return;
    }

    console.log('Setting up notification listener for:', auth.currentUser.uid);
    
    const q = query(
      collection(db, 'notifications'),
      where('uid', '==', auth.currentUser.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifications = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data && data.uid && data.message !== undefined) {
          newNotifications.push({ id: doc.id, ...data });
        }
      });
      
      const newUnreadCount = newNotifications.filter(n => !n.read).length;
      const previousUnreadCount = prevUnreadCountRef.current;
      
      console.log('Notification update:', { 
        newUnreadCount, 
        previousUnreadCount, 
        userRole,
        hasNewNotifications: newUnreadCount > previousUnreadCount
      });
      
      if (newUnreadCount > previousUnreadCount && userRole) {
        console.log('🔊 NEW NOTIFICATION DETECTED! Playing sound for role:', userRole);
        
        const currentTime = Date.now();
        const newlyAddedNotifications = newNotifications.filter(notification => {
          const notificationTime = notification.timestamp?.toDate?.()?.getTime() || currentTime;
          const isRecent = (currentTime - notificationTime) <= 5000;
          return isRecent && !notification.read;
        });

        console.log('🔊 Found new notifications:', newlyAddedNotifications.length);
        
        const hasNewTicketNotification = newlyAddedNotifications.some(n => 
          n.type === 'new_ticket' || 
          (n.message && n.message.toLowerCase().includes('new ticket created'))
        );
        
        if (userRole === 'technician' && hasNewTicketNotification) {
          console.log('🔊 TECHNICIAN ALERT: New ticket notification detected');
          
          // Try to play the sound multiple times if it fails
          const maxAttempts = 3;
          let attempt = 0;
          const tryPlaySound = async () => {
            try {
              await playNotificationSound(15000); // 15 seconds for technicians
              console.log('🔊 Successfully played notification sound');
            } catch (error) {
              attempt++;
              console.warn(`🔊 Attempt ${attempt} failed:`, error);
              if (attempt < maxAttempts) {
                console.log(`🔊 Retrying... (${attempt}/${maxAttempts})`);
                setTimeout(tryPlaySound, 1000);
              }
            }
          };
          
          tryPlaySound();
          
          toast.success('🚨 NEW TICKET CREATED - 15 second alert for technician!', {
            autoClose: 10000,
            position: "top-center",
            style: {
              backgroundColor: '#dc2626',
              color: 'white',
              fontWeight: 'bold'
            }
          });
        } else if (userRole !== 'technician') {
          console.log('🔊 USER ALERT: Playing short beep');
          playNotificationSound(200); // Short beep for users
          toast.info('New notification received');
        }
      }
      
      prevUnreadCountRef.current = newUnreadCount;
      setNotifications(newNotifications);
    }, (error) => {
      console.error('Error in notification listener:', error);
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 2000);
      return () => clearInterval(interval);
    });

    return () => unsubscribe();
  }, [auth.currentUser, userRole, playNotificationSound, fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      const result = await markNotificationAsRead(notificationId);
      if (result.success) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-700">Notifications</h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50' : ''
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {notification.timestamp?.toDate?.()?.toLocaleString() || 'Just now'}
                      </p>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="ml-2 text-xs text-blue-600 hover:text-blue-800"
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
      )}
    </div>
  );
}
