import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Floating Viewport Container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-md w-full pointer-events-none px-4">
        {toasts.map((toast) => {
          let bg = 'bg-white border-gray-150 shadow-xl';
          let icon = 'info';
          let iconColor = 'text-blue-500';

          if (toast.type === 'success') {
            bg = 'bg-white border-emerald-100 shadow-xl text-gray-800';
            icon = 'check_circle';
            iconColor = 'text-emerald-500';
          } else if (toast.type === 'error') {
            bg = 'bg-white border-red-100 shadow-xl text-gray-800';
            icon = 'error';
            iconColor = 'text-red-500';
          }

          return (
            <div
              key={toast.id}
              className={`flex items-center gap-3.5 p-4 rounded-2xl border pointer-events-auto animate-slide-in transition-all duration-300 bg-white ${bg}`}
              style={{
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
              }}
            >
              <span className={`material-symbols-outlined select-none text-2xl ${iconColor}`}>
                {icon}
              </span>
              <div className="flex-1 text-xs font-semibold text-gray-700 text-left leading-relaxed">
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded-md hover:bg-gray-50 focus:outline-none"
              >
                <span className="material-symbols-outlined text-lg select-none">close</span>
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
