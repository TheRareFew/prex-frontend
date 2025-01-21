import { Amplify } from 'aws-amplify'
import { withAuthenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import awsconfig from '../../aws-exports'

Amplify.configure(awsconfig)

interface AuthWrapperProps {
  children: React.ReactNode
}

function AuthWrapper({ children }: AuthWrapperProps) {
  return <>{children}</>
}

// Only wrap with authentication in production
export default awsconfig.isProduction ? withAuthenticator(AuthWrapper) : AuthWrapper 