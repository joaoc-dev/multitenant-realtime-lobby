import { useState } from 'react'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import { Sun, Moon, Loader2, AlertCircle } from 'lucide-react'
import { postApiPlayersConnect } from './api/generated/player/player'
import type { ConnectRequest } from './api/generated/models'
import './App.css'
import { SignalRTest } from './components/SignalRTest'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Alert, AlertDescription, AlertTitle } from './components/ui/alert'
import { Label } from './components/ui/label'

function App() {
  const { theme, setTheme } = useTheme()
  const [tenantId, setTenantId] = useState('epic-games-123')
  const [playerId, setPlayerId] = useState('alice-123')
  const [name, setName] = useState('Alice')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleConnect = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      const request: ConnectRequest = {
        tenantId,
        playerId,
        name,
      }

      const result = await postApiPlayersConnect(request)

      setResponse(JSON.stringify(result.data, null, 2))
      toast.success('Player connected successfully!', {
        description: `${name} (${playerId}) has been connected.`,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect'
      setError(errorMessage)
      toast.error('Connection failed', {
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Multi-Tenant Lobby System</h1>
          <Button
            variant="outline"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="gap-2"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="size-4" />
                Light
              </>
            ) : (
              <>
                <Moon className="size-4" />
                Dark
              </>
            )}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Connect Player</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tenant-id">Tenant ID</Label>
              <Input
                id="tenant-id"
                type="text"
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="player-id">Player ID</Label>
              <Input
                id="player-id"
                type="text"
                value={playerId}
                onChange={(e) => setPlayerId(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <Button
              onClick={handleConnect}
              disabled={loading}
              className="gap-2 w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect Player'
              )}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {response && (
          <Card>
            <CardHeader>
              <CardTitle>Response</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs font-mono whitespace-pre-wrap break-words overflow-x-auto">
                {response}
              </pre>
            </CardContent>
          </Card>
        )}

        <SignalRTest />
      </div>
    </div>
  )
}

export default App
