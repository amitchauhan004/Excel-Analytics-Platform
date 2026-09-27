import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import './index.css';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

// Register Service Worker for PWA / App Download support
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((reg) => {
        console.log('XcelFlow Service Worker registered:', reg.scope);
      })
      .catch((err) => {
        console.log('XcelFlow Service Worker registration failed:', err);
      });
  });
}

