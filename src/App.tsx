import React, { useState } from 'react'
import './App.css'

function App() {
  const [value, setValue] = useState<string | null>(null)

  const fetchValue = async () => {
    try {
      // Temporarily disable Supabase call until configured
      console.log('Fetch value clicked')
    } catch (error) {
      console.error('Error:', error)
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
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={fetchValue}>Get Value</button>
          <button onClick={callAIEndpoint}>Call AI</button>
        </div>
        {value && <p>Value: {value}</p>}
      </header>
    </div>
  )
}

export default App
