import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { OfflineProvider } from './contexts/OfflineContext';
import { AuthProvider } from './contexts/AuthContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <OfflineProvider>
        <App />
      </OfflineProvider>
    </AuthProvider>
  </React.StrictMode>
);
