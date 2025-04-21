import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/authcontext';

function ProtectedAdminRoute({ children }) {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" />;
  }
  
  // Check userType from the nested data structure
  const userType = user.data?.userType || user.userType;
  if (!userType || userType.toLowerCase() !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return children;
}

export default ProtectedAdminRoute;