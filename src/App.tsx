import React, { useState } from 'react'
import { supabase } from './lib/supabase'
import './App.css'

const apiUrl = process.env.REACT_APP_API_URL
if (!apiUrl) {
  throw new Error('API URL not configured')
}

function App() {
  const [value, setValue] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [aiResponse, setAiResponse] = useState<string | null>(null)

  const fetchValue = async () => {
    try {
      const { data, error } = await supabase
        .from('test_table')
        .select('value')
        .limit(1)
        .single()

      if (error) throw error
      setValue(data.value)
      setError(null)
    } catch (error) {
      console.error('Error:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
      setValue(null)
    }
  }

  const callAIEndpoint = async () => {
    try {
      const response = await fetch(`${apiUrl}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: value || 'No value available' }),
      })

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`)
      }

      const data = await response.json()
      setAiResponse(data.response)
      setError(null)
    } catch (error) {
      console.error('Error:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
      setAiResponse(null)
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={fetchValue}>Get Value</button>
            <button onClick={callAIEndpoint}>Call AI</button>
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {value && <p>Value: {value}</p>}
          {aiResponse && <p>AI Response: {aiResponse}</p>}
        </div>
      </header>
    </div>
  )
}

export default App
