import React, { useState } from 'react'
import AuthWrapper from './components/auth/AuthWrapper'
import { supabase } from './lib/supabase'
import './App.css'

function App() {
  const [value, setValue] = useState<string | null>(null)

  const fetchValue = async () => {
    try {
      const { data, error } = await supabase
        .from('test_table')
        .select('value')
        .single()
      
      if (error) throw error
      setValue(data?.value || null)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const callAIEndpoint = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/functions/v1/call-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ query: 'test' })
      })
      const data = await response.json()
      console.log('AI Response:', data)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <AuthWrapper>
      <div className="App">
        <header className="App-header">
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={fetchValue}>Get Value</button>
            <button onClick={callAIEndpoint}>Call AI</button>
          </div>
          {value && <p>Value: {value}</p>}
        </header>
      </div>
    </AuthWrapper>
  )
}

export default App
