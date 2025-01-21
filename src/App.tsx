import React, { useState } from 'react'
import { supabase } from './lib/supabase'
import './App.css'

function App() {
  const [value, setValue] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

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
      // Temporarily disable AI call until configured
      console.log('AI endpoint called')
    } catch (error) {
      console.error('Error:', error)
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
        </div>
      </header>
    </div>
  )
}

export default App
