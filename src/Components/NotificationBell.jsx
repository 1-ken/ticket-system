import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getUserNotifications, markNotificationAsRead } from '../utils/ticketUtils';
import { getAuth } from 'firebase/auth';
import { toast } from 'react-toastify';
import { doc, getDoc, collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import technicianNotificationSound from './technician_notification.mp4';

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
  const videoRef = useRef(null);
  const [userRole, setUserRole] = useState(null);
  const lastToastIdRef = useRef(null);

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
  const playNotificationSound = useCallback(async (duration = 15000, isTechnician = false) => {
    console.log('🔊 Attempting to play notification sound...', {
      duration,
      isTechnician,
      hasVideoRef: !!videoRef.current,
      videoSrc: videoRef.current?.src
    });
    
    if (isTechnician) {
      try {
        if (videoRef.current) {
          videoRef.current.volume = 1.0;
          videoRef.current.currentTime = 0;
          console.log('🔊 Video element state:', {
            readyState: videoRef.current.readyState,
            paused: videoRef.current.paused,
            volume: videoRef.current.volume,
            src: videoRef.current.src,
            error: videoRef.current.error
          });
          
          const playPromise = videoRef.current.play();
          
          if (playPromise !== undefined) {
            await playPromise;
            console.log('🔊 Successfully started playing technician MP4 sound');
            setTimeout(() => {
              if (videoRef.current) {
                videoRef.current.pause();
                videoRef.current.currentTime = 0;
              }
            }, Math.min(duration, 15000));
          }
        } else {
          console.warn('🔊 Video ref not available, playing beep fallback');
          playBeep(Math.min(duration, 2000));
        }
      } catch (error) {
        console.error('🔊 Technician notification playback failed:', error);
        playBeep(Math.min(duration, 2000));
      }
      return;
    }
    
    // For non-technician notifications, use the original sound
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const context = audioContextRef.current;
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      oscillator.type = 'square';
      oscillator.frequency.value = 800;
      gainNode.gain.value = 0.3;
      
      const now = context.currentTime;
      oscillator.start(now);
      oscillator.stop(now + (duration / 1000));
      
      console.log('🔊 Successfully started playing regular notification sound');
      return;
      
    } catch (error) {
      console.warn('🔊 Regular notification sound failed:', error);
      playBeep(200); // Short beep for regular notifications
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
    
    // Create query based on user role
    let q;
    if (userRole === 'technician') {
      // Technicians see both their personal notifications and broadcast notifications
      q = query(
        collection(db, 'notifications'),
        where('uid', 'in', [auth.currentUser.uid, 'technicians']),
        orderBy('timestamp', 'desc')
      );
    } else {
      // Regular users only see their personal notifications
      q = query(
        collection(db, 'notifications'),
        where('uid', '==', auth.currentUser.uid),
        orderBy('timestamp', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('🔄 Notification snapshot update received');
      
      const newNotifications = [];
      let hasNewNotification = false;
      
      snapshot.docChanges().forEach((change) => {
        const data = change.doc.data();
        console.log('📄 Document change:', { 
          type: change.type, 
          id: change.doc.id,
          data: {
            message: data.message,
            type: data.type,
            timestamp: data.timestamp?.toDate?.()?.toLocaleString()
          }
        });
        
        if (change.type === 'added' && data.timestamp) {
          // Check if this is a truly new notification (within last 30 seconds)
          const notificationTime = data.timestamp.toDate().getTime();
          const currentTime = Date.now();
          const isRecent = (currentTime - notificationTime) <= 30000; // 30 seconds
          
          if (isRecent) {
            console.log('🆕 New notification detected:', data.message);
            hasNewNotification = true;
          }
        }
      });
      
      // Get all current notifications
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data && data.uid && data.message !== undefined) {
          newNotifications.push({ id: doc.id, ...data });
        }
      });
      
      const newUnreadCount = newNotifications.filter(n => !n.read).length;
      const previousUnreadCount = prevUnreadCountRef.current;
      
      console.log('📊 Notification counts:', {
        total: newNotifications.length,
        unread: newUnreadCount,
        previous: previousUnreadCount,
        hasNew: hasNewNotification
      });
      
      // Trigger sound if there's a new notification
      if (hasNewNotification && userRole) {
        console.log('🔊 NEW NOTIFICATION DETECTED! Playing sound for role:', userRole);
        
        // Filter for new notifications to check type
        const recentNotifications = newNotifications.filter(notification => {
          const notificationTime = notification.timestamp?.toDate?.()?.getTime() || Date.now();
          const currentTime = Date.now();
          const isRecent = (currentTime - notificationTime) <= 30000;
          const isUnread = !notification.read;
          return isRecent && isUnread;
        });

        console.log('🔊 Recent notifications:', recentNotifications.map(n => ({
          id: n.id,
          type: n.type,
          message: n.message,
          timestamp: n.timestamp?.toDate?.()?.toLocaleString()
        })));
        
        // Check for new ticket notifications
        const hasNewTicketNotification = recentNotifications.some(n => {
          console.log('🔍 Checking notification for new ticket:', {
            type: n.type,
            message: n.message,
            timestamp: n.timestamp?.toDate?.()?.toLocaleString()
          });
          
          const isNewTicketType = n.type === 'new_ticket';
          const hasNewTicketMessage = n.message && (
            n.message.toLowerCase().includes('new ticket created') ||
            n.message.toLowerCase().includes('ticket created') ||
            n.message.toLowerCase().includes('created a ticket') ||
            n.message.includes('🎫 NEW TICKET CREATED') ||
            n.message.includes('NEW TICKET CREATED')
          );
          
          const result = isNewTicketType || hasNewTicketMessage;
          console.log('🔍 New ticket check result:', { isNewTicketType, hasNewTicketMessage, result });
          
          return result;
        });

        // Check for comment notifications
        const hasTicketCommentNotification = recentNotifications.some(n =>
          n.type === 'ticket_comment' ||
          (n.message && n.message.toLowerCase().includes('commented on ticket'))
        );
        
        console.log('Notification check results:', {
          hasNewTicketNotification,
          hasTicketCommentNotification,
          userRole,
          notificationMessages: recentNotifications.map(n => n.message)
        });
        
        if (userRole === 'technician' && (hasNewTicketNotification || hasTicketCommentNotification)) {
          const notificationType = hasNewTicketNotification ? 'New ticket created' : 'New comment on ticket';
          console.log('🔊 TECHNICIAN ALERT:', notificationType);
          
          // Play sound for technician notifications
          console.log('🔊 Playing technician notification sound...');
          const playSound = async () => {
            try {
              await playNotificationSound(15000, true); // 15 seconds for technicians
              console.log('🔊 Successfully played technician notification sound');
            } catch (error) {
              console.error('🔊 Failed to play notification sound:', error);
              // Retry once after a short delay
              setTimeout(async () => {
                try {
                  await playNotificationSound(15000, true);
                } catch (retryError) {
                  console.error('🔊 Retry failed:', retryError);
                }
              }, 1000);
            }
          };
          
          playSound();
          
          // Generate stable toast ID based on notification content
          const notificationContent = recentNotifications
            .map(n => `${n.type}-${n.message}`)
            .join('-');
          const toastId = `technician-alert-${notificationContent}`;
          
          // Only show toast if it's different from the last one
          if (toastId !== lastToastIdRef.current) {
            lastToastIdRef.current = toastId;
            toast.success(`🚨 ${notificationType.toUpperCase()} - 15 second alert for technician!`, {
              toastId,
              autoClose: 10000,
              position: "top-center",
              style: {
                backgroundColor: '#dc2626',
                color: 'white',
                fontWeight: 'bold'
              }
            });
          }
        } else if (userRole !== 'technician') {
          console.log('🔊 USER ALERT: Playing short beep');
          playNotificationSound(200); // Short beep for users
          
          // Generate stable toast ID for user notifications
          const notificationContent = recentNotifications
            .map(n => `${n.type}-${n.message}`)
            .join('-');
          const toastId = `user-alert-${notificationContent}`;
          
          // Only show toast if it's different from the last one
          if (toastId !== lastToastIdRef.current) {
            lastToastIdRef.current = toastId;
            toast.info('New notification received', {
              toastId
            });
          }
        }
      }
      
      // Update the previous count and notifications
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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      // Reset the last toast ID when component unmounts
      lastToastIdRef.current = null;
    };
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
      {/* Hidden video element for technician notifications */}
      <video
        ref={videoRef}
        src={technicianNotificationSound}
        preload="metadata"
        style={{ display: 'none' }}
      />
    </div>
  );
}
