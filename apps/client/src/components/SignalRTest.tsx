import { useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import { toast } from 'sonner';
import { Wifi, WifiOff, Loader2, Send, MessageSquare, AlertCircle } from 'lucide-react';
import { postApiPlayersTestPush } from '../api/generated/player/player';
import type { TestPushRequest } from '../api/generated/models';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Separator } from './ui/separator';

type Message = 
  | { type: 'test'; content: string; timestamp: Date }
  | { type: 'chat'; user: string; content: string; timestamp: Date };

export function SignalRTest() {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    // Set up event handler when connection is created
    if (connection) {
      connection.on('TestMessage', (message: string) => {
        setMessages(prev => [...prev, { type: 'test', content: message, timestamp: new Date() }]);
        console.log('Received message:', message);
      });

      connection.on('ReceiveMessage', (user: string, message: string) => {
        setMessages(prev => [...prev, { type: 'chat', user, content: message, timestamp: new Date() }]);
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
      toast.success('Connected to SignalR', {
        description: 'Real-time connection established successfully.',
      });
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
        toast.info('Disconnected from SignalR', {
          description: 'Connection closed successfully.',
        });
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
        toast.success('Message sent', {
          description: 'Message sent via Hub (Direct)',
        });
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
      toast.success('Message sent', {
        description: 'Message sent via API (REST)',
      });
    } catch (err) {
      console.error('Error sending via API:', err);
      setConnectionError(err instanceof Error ? err.message : 'Failed to send via API');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle>SignalR Connection</CardTitle>
        <div className="flex items-center gap-2">
          {isConnecting && (
            <Badge variant="secondary" className="gap-1.5">
              <Loader2 className="size-3 animate-spin" />
              Connecting
            </Badge>
          )}
          <Badge variant={isConnected ? 'default' : 'outline'} className="gap-1.5">
            {isConnected ? (
              <>
                <Wifi className="size-3" />
                Connected
              </>
            ) : (
              <>
                <WifiOff className="size-3" />
                Disconnected
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {connectionError && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>{connectionError}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            {!isConnected ? (
              <Button
                onClick={handleConnect}
                disabled={isConnecting}
                className="gap-2 w-full"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wifi className="size-4" />
                    Connect
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleDisconnect}
                variant="outline"
                className="gap-2 w-full"
              >
                <WifiOff className="size-4" />
                Disconnect
              </Button>
            )}
          </div>
          <div className="flex gap-2 flex-1">
            <Button
              onClick={sendViaHub}
              disabled={!isConnected}
              variant="default"
              className="gap-2 flex-1"
            >
              <Send className="size-4" />
              Send via Hub
            </Button>
            <Button
              onClick={sendViaApi}
              disabled={!isConnected}
              variant="default"
              className="gap-2 flex-1"
            >
              <Send className="size-4" />
              Send via API
            </Button>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="size-4" />
            <h4 className="text-sm font-medium">Messages</h4>
          </div>
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground">No messages yet. Send a message to test the connection.</p>
          ) : (
            <div className="h-[300px] overflow-y-auto border rounded-md p-4 space-y-3 bg-muted/30">
              {messages.map((msg, i) => (
                <div key={i} className="text-sm">
                  {msg.type === 'test' ? (
                    <div className="flex items-start gap-2.5">
                      <MessageSquare className="size-3.5 mt-0.5 text-muted-foreground shrink-0" />
                      <span className="flex-1">{msg.content}</span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {msg.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2.5">
                      <MessageSquare className="size-3.5 mt-0.5 text-muted-foreground shrink-0" />
                      <span className="font-medium shrink-0">{msg.user}:</span>
                      <span className="flex-1">{msg.content}</span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {msg.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}