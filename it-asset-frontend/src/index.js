import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext'; // <-- Import เข้ามา
import './i18n'; 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* นำ AuthProvider มาครอบ App */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
