import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { getArtwork } from './artworks/index.jsx'

const hostname  = window.location.hostname.replace(/^www\./, '');
const Artwork   = getArtwork(hostname);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {Artwork ? <Artwork /> : (
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )}
  </StrictMode>,
)
