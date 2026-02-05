import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useOffline } from '../../contexts/OfflineContext';
import { 
  Home, 
  FolderOpen, 
  Clock, 
  Users, 
  FileText, 
  User, 
  Menu, 
  X, 
  Camera,
  LogOut,
  Wifi,
  WifiOff
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const { isOnline } = useOffline();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Projekte', href: '/projects', icon: FolderOpen },
    { name: 'Zeiterfassung', href: '/time-tracking', icon: Clock },
    { name: 'Mitarbeiter', href: '/employees', icon: Users },
    { name: 'Formulare', href: '/projects', icon: FileText }, // Will be filtered by project
    { name: 'Profil', href: '/profile', icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (href) => {
    if (href === '/projects' && location.pathname.startsWith('/projects')) {
      return true;
    }
    return location.pathname === href;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <div className="flex items-center">
              <Camera className="w-8 h-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Handwerker</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    nav-link flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                    ${isActive(item.href) 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User info and logout */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || 'Benutzer'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.company || 'Firma'}
                </p>
              </div>
            </div>
            
            {/* Online status */}
            <div className="flex items-center text-xs text-gray-500 mb-3">
              {isOnline ? (
                <>
                  <Wifi className="w-4 h-4 text-green-500 mr-1" />
                  <span>Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-red-500 mr-1" />
                  <span>Offline</span>
                </>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Abmelden
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="flex-1" />
            
            {/* Offline indicator for mobile */}
            <div className="lg:hidden">
              {!isOnline && (
                <div className="flex items-center text-sm text-red-600">
                  <WifiOff className="w-4 h-4 mr-1" />
                  <span>Offline</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
