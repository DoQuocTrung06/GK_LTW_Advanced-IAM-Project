import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom' // BƯỚC 1: Import cái này vào

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* BƯỚC 2: Bọc thẻ BrowserRouter bên ngoài thẻ App */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)