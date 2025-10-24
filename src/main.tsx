import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './index.scss'
import AppRoot from './app'
import "@/app/providers/i18n/i18n";


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRoot />
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      closeOnClick
      pauseOnHover
      draggable
      theme="light"
    />
  </StrictMode>,
)
