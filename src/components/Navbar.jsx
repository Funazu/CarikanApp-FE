import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationDrawer from './NotificationDrawer';
import api from '../services/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  const dropdownRef = useRef(null);

  // Close dropdown on outside clicks
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Close mobile menu on page transitions
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Fetch notifications if user is authenticated
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 font-inter px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo & Mobile Toggle */}
        <div className="flex items-center gap-3">
          {/* Hamburger Mobile Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center p-2 text-gray-500 hover:text-secondary hover:bg-purple-50 rounded-xl transition-all-200"
          >
            <span className="material-symbols-outlined text-2xl select-none">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>

          <Link to="/" className="flex items-center gap-2 group">
            <span className="material-symbols-outlined text-secondary text-3xl font-bold transition-all duration-200 group-hover:scale-105 select-none">
              travel_explore
            </span>
            <span className="font-outfit text-2xl font-bold tracking-tight text-primary">
              Cari<span className="text-secondary font-semibold">kan.</span>
            </span>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link 
            to="/" 
            className={`text-sm font-semibold transition-colors duration-200 ${
              location.pathname === '/' ? 'text-secondary' : 'text-gray-600 hover:text-secondary'
            }`}
          >
            Beranda
          </Link>
          
          {user && (
            <Link 
              to="/dashboard" 
              className={`text-sm font-semibold transition-colors duration-200 ${
                location.pathname === '/dashboard' ? 'text-secondary' : 'text-gray-600 hover:text-secondary'
              }`}
            >
              Dashboard
            </Link>
          )}

          {user && user.role === 'ADMIN' && (
            <Link 
              to="/admin" 
              className={`text-sm font-semibold transition-colors duration-200 ${
                location.pathname.startsWith('/admin') ? 'text-secondary' : 'text-gray-600 hover:text-secondary'
              }`}
            >
              Admin Panel
            </Link>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {/* Notification Button */}
              <button 
                onClick={() => setDrawerOpen(true)}
                className="relative p-2 text-gray-500 hover:text-secondary hover:bg-purple-50 rounded-full transition-all duration-200"
              >
                <span className="material-symbols-outlined text-2xl select-none">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-[9px] font-bold text-white rounded-full flex items-center justify-center border border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 focus:outline-none hover:opacity-90"
                >
                  {user.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      alt={user.name} 
                      className="w-9 h-9 rounded-full object-cover border border-purple-200"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-secondary text-white font-bold flex items-center justify-center text-sm shadow-xs font-outfit uppercase">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <span className="hidden sm:inline text-sm font-semibold text-gray-700 max-w-[120px] truncate">
                    {user.name}
                  </span>
                  <span className="material-symbols-outlined text-gray-400 text-lg transition-transform duration-200 select-none">
                    {dropdownOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                  </span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 divide-y divide-gray-50 origin-top-right">
                    <div className="px-4 py-3 text-left">
                      <p className="text-xs text-gray-400 font-medium">Masuk Sebagai</p>
                      <p className="text-sm font-bold text-gray-900 truncate font-outfit">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <Link 
                        to="/dashboard" 
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-secondary text-left w-full"
                      >
                        <span className="material-symbols-outlined text-lg select-none">dashboard</span>
                        Dashboard
                      </Link>
                      
                      <Link 
                        to="/dashboard?tab=settings" 
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-secondary text-left w-full"
                      >
                        <span className="material-symbols-outlined text-lg select-none">settings</span>
                        Pengaturan Profil
                      </Link>
                    </div>

                    <div className="py-1">
                      <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left w-full"
                      >
                        <span className="material-symbols-outlined text-lg select-none">logout</span>
                        Keluar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link 
              to="/login"
              className="inline-flex items-center gap-2 bg-secondary text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-secondary-container hover:text-primary transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <span className="material-symbols-outlined text-lg select-none">login</span>
              Masuk / Daftar
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2 animate-slide-in text-left">
          <Link 
            to="/" 
            className={`text-sm font-bold px-4 py-3 rounded-xl transition-colors ${
              location.pathname === '/' ? 'bg-purple-50 text-secondary' : 'text-gray-600 hover:bg-purple-50/50'
            }`}
          >
            Beranda
          </Link>
          
          {user && (
            <Link 
              to="/dashboard" 
              className={`text-sm font-bold px-4 py-3 rounded-xl transition-colors ${
                location.pathname === '/dashboard' ? 'bg-purple-50 text-secondary' : 'text-gray-600 hover:bg-purple-50/50'
              }`}
            >
              Dashboard
            </Link>
          )}

          {user && user.role === 'ADMIN' && (
            <Link 
              to="/admin" 
              className={`text-sm font-bold px-4 py-3 rounded-xl transition-colors ${
                location.pathname.startsWith('/admin') ? 'bg-purple-50 text-secondary' : 'text-gray-600 hover:bg-purple-50/50'
              }`}
            >
              Admin Panel
            </Link>
          )}
        </div>
      )}

      {/* Drawer */}
      <NotificationDrawer 
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
      />
    </nav>
  );
};

export default Navbar;
