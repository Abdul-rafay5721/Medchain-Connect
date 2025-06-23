import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { ThirdwebProvider } from '@thirdweb-dev/react'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <ThirdwebProvider
      activeChain="mumbai"
      clientId={import.meta.env.VITE_THIRDWEB_CLIENT_ID}>
      <App />
    </ThirdwebProvider>
    </BrowserRouter>
  </StrictMode>,
)
