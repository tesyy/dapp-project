import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'; // Optional: if you have a CSS file
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);