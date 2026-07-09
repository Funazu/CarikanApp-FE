import React from 'react';
import { createPortal } from 'react-dom';

const NotificationDrawer = ({ isOpen, onClose, notifications = [], onMarkAsRead }) => {
  if (!isOpen) return null;

  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const unreadCount = safeNotifications.filter(n => !n.is_read).length;

  const drawerContent = (
    <div className="fixed inset-0 z-[9999] overflow-hidden font-inter pointer-events-auto">
      {/* Dark backdrop overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity cursor-pointer" 
        onClick={onClose}
      />
      
      {/* Drawer Container */}
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        {/* Slide-in Panel */}
        <div className="w-screen sm:w-96 bg-white shadow-2xl flex flex-col h-full animate-slide-in">
          
          {/* Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-2xl select-none">notifications</span>
              <h2 className="text-lg font-bold text-gray-900 font-outfit">Notifikasi</h2>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full">
                  {unreadCount} Baru
                </span>
              )}
            </div>
            
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-xl hover:bg-gray-50 flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-2xl select-none">close</span>
            </button>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50/30">
            {safeNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <span className="material-symbols-outlined text-gray-300 text-6xl mb-3 select-none">notifications_off</span>
                <p className="text-gray-500 text-sm">Belum ada notifikasi untuk Anda.</p>
              </div>
            ) : (
              safeNotifications.map((notif) => (
                <div 
                  key={notif.id}
                  onClick={() => {
                    if (!notif.is_read && onMarkAsRead) {
                      onMarkAsRead(notif.id);
                    }
                  }}
                  className={`p-4 rounded-2xl border transition-all duration-200 text-left relative cursor-pointer ${
                    notif.is_read 
                      ? 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-xs' 
                      : 'bg-purple-50/50 border-purple-100/80 hover:bg-purple-50/80 shadow-xs'
                  }`}
                >
                  {!notif.is_read && (
                    <span className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                  
                  <h3 className="font-bold text-gray-900 font-outfit text-sm mb-1">
                    {notif.title}
                  </h3>
                  
                  <p className="text-gray-600 text-xs leading-relaxed pr-3">
                    {notif.message}
                  </p>
                  
                  <span className="text-[10px] text-gray-400 mt-2 block font-semibold">
                    {new Date(notif.created_at).toLocaleString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );

  return createPortal(drawerContent, document.body);
};

export default NotificationDrawer;
