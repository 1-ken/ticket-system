import React from 'react';
import Honeybadger from '@honeybadger-io/js';
import { toast } from 'react-toastify';

export default function TestErrorButton({ label = 'Send test error' }) {
  const handleClick = () => {
    try {
      const err = new Error('Test error from UI');
      Honeybadger.notify(err, { context: { source: 'TestErrorButton' } });
      toast.success('Test error sent to Honeybadger');
    } catch (e) {
      console.error('Failed to send test error', e);
      toast.error('Failed to send test error');
    }
  };

  return (
    <button
      onClick={handleClick}
      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
      title="Send a test error to Honeybadger"
    >
      {label}
    </button>
  );
}
