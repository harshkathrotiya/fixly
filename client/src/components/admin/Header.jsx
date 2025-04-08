import React from 'react';
import { useAuth } from '../../context/authcontext';

function Header({ title }) {
  const { user, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
        
        <div className="flex items-center">
          <div className="relative group">
            <button className="flex items-center space-x-3 bg-gray-100 rounded-lg py-2 px-4 hover:bg-gray-200">
              <span className="text-sm font-medium text-gray-700">{user?.firstName || 'Admin'}</span>
              <img 
                className="h-8 w-8 rounded-full object-cover"
                src={user?.profileImage || 'https://via.placeholder.com/40'} 
                alt="User avatar" 
              />
            </button>
            
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 hidden group-hover:block">
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;