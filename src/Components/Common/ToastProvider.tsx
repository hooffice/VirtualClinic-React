import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/**
 * ToastProvider Component
 * Wraps the ToastContainer with default settings
 * Add this to App.tsx for global toast notifications
 */
const ToastProvider: React.FC = () => {
  return (
    <ToastContainer
      position="top-right"
      autoClose={4000}
      hideProgressBar={false}
      newestOnTop={true}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"
      limit={3}
    />
  );
};

export default ToastProvider;
