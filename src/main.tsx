import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/ui/tokens.css'
import '@/features/practice/modes/register-all'
import App from '@/app/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
