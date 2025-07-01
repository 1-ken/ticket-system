import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import technicianNotificationSound from './technician_notification.mp4';

export default function NotificationTest() {
  const [userRole, setUserRole] = useState('user');
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const audioContextRef = useRef(null);

  // Function to play fallback beep using Web Audio API
  const playBeep = (duration = 200) => {
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
      
      toast.success(`Played ${duration}ms beep sound for ${userRole}`);
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
      toast.error('Web Audio API not supported');
    }
  };

  // Function to play prolonged sound for technicians
  const playProlongedSound = () => {
    try {
      if (videoRef.current) {
        videoRef.current.volume = 1.0;
        videoRef.current.currentTime = 0;
        const playPromise = videoRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise.then(() => {
            toast.success('Playing 15-second technician MP4 sound');
            
            // Stop after 15 seconds
            setTimeout(() => {
              if (videoRef.current) {
                videoRef.current.pause();
                videoRef.current.currentTime = 0;
              }
            }, 15000);
          }).catch((e) => {
            console.warn('Technician MP4 play prevented, using Web Audio API:', e);
            playBeep(15000); // 15 seconds beep
          });
        }
      } else {
        console.warn('Video ref not available, using beep fallback');
        playBeep(15000); // 15 seconds beep
      }
    } catch (error) {
      console.error('Failed to play technician notification MP4:', error);
      playBeep(15000); // 15 seconds beep
    }
  };

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    console.log('Role changed to:', newRole);
    setUserRole(newRole);
    // Force re-render to update the display
    setTimeout(() => {
      console.log('Role state updated to:', newRole);
    }, 100);
  };

  const testNotificationSound = () => {
    console.log('Testing notification sound for role:', userRole);
    
    if (userRole === 'technician') {
      console.log('🔊 Testing 15-second technician alert');
      playProlongedSound();
    } else {
      console.log('🔊 Testing short user beep');
      if (audioRef.current) {
        audioRef.current.play().then(() => {
          toast.success('Playing short sound for user');
        }).catch((e) => {
          console.warn('Audio element play prevented, trying Web Audio API fallback:', e);
          playBeep();
        });
      } else {
        playBeep();
      }
    }
  };

  const testWebAudioAPI = () => {
    playBeep(1000); // 1 second beep
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Notification System Test</h2>
      
      {/* Audio elements for notification sounds */}
      <audio
        ref={audioRef}
        src="/notification-sound.mp3"
        preload="auto"
      />

      {/* Hidden video element for technician notifications */}
      <video
        ref={videoRef}
        src={technicianNotificationSound}
        preload="metadata"
        style={{ display: 'none' }}
      />

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select User Role:
        </label>
        <select
          value={userRole}
          onChange={handleRoleChange}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="user">User</option>
          <option value="technician">Technician</option>
        </select>
      </div>

      <div className="space-y-3">
        <button
          onClick={testNotificationSound}
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Test Role-Based Notification Sound
        </button>

        <button
          onClick={testWebAudioAPI}
          className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Test Web Audio API Fallback
        </button>

        <button
          onClick={() => toast.info('Test notification message')}
          className="w-full bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
        >
          Test Toast Notification
        </button>
      </div>

      <div className="mt-4 p-3 bg-gray-100 rounded">
        <p className="text-sm text-gray-600">
          <strong>Current Role:</strong> {userRole}
        </p>
        <p className="text-sm text-gray-600 mt-1">
          <strong>Expected Sound:</strong> {userRole === 'technician' ? '15-second alert' : 'Short beep'}
        </p>
        <p className="text-sm text-gray-600 mt-1">
          <strong>Debug:</strong> Role state = "{userRole}"
        </p>
      </div>
    </div>
  );
}
