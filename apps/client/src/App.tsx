import { useState } from 'react'
import { postApiPlayersConnect } from './api/generated/player/player'
import type { ConnectRequest } from './api/generated/models'
import './App.css'

function App() {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Multi-Tenant Lobby System</h1>

      <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem' }}>Tenant ID:</label>
          <input
            type="text"
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem' }}>Player ID:</label>
          <input
            type="text"
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem' }}>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
      </div>

      <button
        onClick={handleConnect}
        disabled={loading}
        style={{
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          backgroundColor: loading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Connecting...' : 'Connect Player'}
      </button>

      {error && (
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fee', color: '#c00', borderRadius: '4px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#1e1e1e', color: '#d4d4d4', borderRadius: '4px' }}>
          <strong style={{ color: '#fff' }}>Response:</strong>
          <pre style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#d4d4d4' }}>
            {response}
          </pre>
        </div>
      )}
    </div>
  )
}

export default App
