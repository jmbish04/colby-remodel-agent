
"use client";

import React, { useState, useEffect, useRef } from 'react';

interface NotificationsClientProps {
  id: string; // Unique identifier for the WebSocket connection (e.g., project ID, user ID)
}

const NotificationsClient: React.FC<NotificationsClientProps> = ({ id }) => {
  const [notifications, setNotifications] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/notifications/${id}/websocket`;
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WebSocket connection established');
      setNotifications(prev => [...prev, 'Connection established!']);
    };

    ws.current.onmessage = (event) => {
      setNotifications(prev => [...prev, event.data]);
    };

    ws.current.onclose = () => {
      console.log('WebSocket connection closed');
      setNotifications(prev => [...prev, 'Connection closed.']);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.current?.close();
    };
  }, [id]);

  const sendMessage = async () => {
    if (message.trim() && ws.current?.readyState === WebSocket.OPEN) {
      // In a real app, you'd likely send structured data
      // Here we also call the POST endpoint to trigger a broadcast
      await fetch(`/api/notifications/${id}`, {
        method: 'POST',
        body: `Message from client: ${message}`,
      });
      setMessage('');
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Real-time Notifications</h2>
      <div className="mb-4">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border p-2 mr-2"
          placeholder="Type a message to broadcast..."
        />
        <button onClick={sendMessage} className="bg-blue-500 text-white p-2 rounded">
          Send Notification
        </button>
      </div>
      <div className="space-y-2">
        <h3 className="font-semibold">Received Messages:</h3>
        <ul className="list-disc list-inside bg-gray-100 p-4 rounded-md h-64 overflow-y-auto">
          {notifications.map((note, index) => (
            <li key={index}>{note}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NotificationsClient;
