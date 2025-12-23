import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Eksik CSS tanımlamaları varsa, global stil ekleyelim
const style = document.createElement('style');
style.textContent = `
  body, html {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    font-family: 'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif;
    background-color: #f8fafc;
  }
  
  #root {
    height: 100%;
    width: 100%;
  }
`;
document.head.appendChild(style);

// Sadece bir kez ReactDOM.createRoot() çağrısı yapıyoruz
const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  
  // Render işlemi
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  // Hata yakalama
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && typeof event.reason.message === 'string' && 
        event.reason.message.includes('The message port closed before a response was received')) {
      event.preventDefault();
      return true;
    }
    return false;
  });
}
