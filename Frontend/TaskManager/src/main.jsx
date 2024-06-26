import React from 'react'
import 'whatwg-fetch';
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import env from 'react-dotenv';
// import './fetchInterceptor'
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
