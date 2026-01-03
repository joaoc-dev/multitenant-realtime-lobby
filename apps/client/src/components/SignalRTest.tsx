import { useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import { postApiPlayersTestPush } from '../api/generated/player/player';
import type { TestPushRequest } from '../api/generated/models';
import { Button } from './ui/button';

export function SignalRTest() {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    // Set up event handler when connection is created
    if (connection) {
      connection.on('TestMessage', (message: string) => {
        setMessages(prev => [...prev, `📨 ${message}`]);
        console.log('Received message:', message);
      });

      connection.on('ReceiveMessage', (user: string, message: string) => {
        setMessages(prev => [...prev, `💬 ${user}: ${message}`]);
        console.log('Received message from', user, ':', message);
      });

      // Handle connection state changes
      connection.onclose(() => {
        setIsConnected(false);
        console.log('SignalR connection closed');
      });

      connection.onreconnecting(() => {
        setIsConnected(false);
        console.log('SignalR reconnecting...');
      });

      connection.onreconnected(() => {
        setIsConnected(true);
        setConnectionError(null);
        console.log('SignalR reconnected!');
      });
    }

    // Cleanup on unmount
    return () => {
      if (connection) {
        connection.stop();
      }
    };
  }, [connection]);

  const handleConnect = async () => {
    if (connection && isConnected) {
      return; // Already connected
    }

    setIsConnecting(true);
    setConnectionError(null);

    try {
      // Create connection if it doesn't exist
      let newConnection = connection;
      if (!newConnection) {
        newConnection = new signalR.HubConnectionBuilder()
          .withUrl('http://localhost:5046/hubs/lobby')
          .withAutomaticReconnect()
          .build();
        setConnection(newConnection);
      }

      // Start connection
      await newConnection.start();
      setIsConnected(true);
      setIsConnecting(false);
      console.log('Connected to SignalR!');
    } catch (err) {
      setIsConnecting(false);
      setIsConnected(false);
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to SignalR';
      setConnectionError(errorMessage);
      console.error('SignalR connection error:', err);
    }
  };

  const handleDisconnect = async () => {
    if (connection) {
      try {
        await connection.stop();
        setIsConnected(false);
        setConnection(null);
        setConnectionError(null);
        console.log('Disconnected from SignalR');
      } catch (err) {
        console.error('Error disconnecting:', err);
      }
    }
  };

  const sendViaHub = async () => {
    if (connection && isConnected) {
      try {
        // Direct Hub invocation approach
        await connection.invoke('SendMessage', 'Client User', `Direct Hub: ${new Date().toLocaleTimeString()}`);
        console.log('Message sent via direct Hub invocation');
      } catch (err) {
        console.error('Error sending via Hub:', err);
        setConnectionError(err instanceof Error ? err.message : 'Failed to send via Hub');
      }
    }
  };

  const sendViaApi = async () => {
    try {
      // REST API approach (Controller + HubContext) - using type-safe Orval client
      const request: TestPushRequest = {
        message: `REST API: ${new Date().toLocaleTimeString()}`,
      };

      const result = await postApiPlayersTestPush(request);
      console.log('Message sent via REST API:', result);
    } catch (err) {
      console.error('Error sending via API:', err);
      setConnectionError(err instanceof Error ? err.message : 'Failed to send via API');
    }
  };

  return (
    <div style={{ padding: '1rem', border: '1px solid #ccc', margin: '1rem' }}>
      <h3>SignalR Test</h3>
      <p>Status: {isConnected ? '✅ Connected' : '❌ Disconnected'}</p>

      {connectionError && (
        <p style={{ color: 'red' }}>Error: {connectionError}</p>
      )}

      <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
        {!isConnected ? (
          <Button
            onClick={handleConnect}
            disabled={isConnecting}
            style={{ marginRight: '0.5rem' }}
          >
            {isConnecting ? 'Connecting...' : 'Connect'}
          </Button>
        ) : (
          <Button
            onClick={handleDisconnect}
            variant="outline"
            style={{ marginRight: '0.5rem' }}
          >
            Disconnect
          </Button>
        )}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Button
            onClick={sendViaHub}
            disabled={!isConnected}
            variant="default"
          >
            Send via Hub (Direct)
          </Button>
          <Button
            onClick={sendViaApi}
            variant="default"
          >
            Send via API (REST)
          </Button>
        </div>
      </div>

      <div>
        <h4>Messages Received:</h4>
        {messages.length === 0 ? (
          <p>No messages yet. Try the buttons above to send messages via Hub or API!</p>
        ) : (
          <ul>
            {messages.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}