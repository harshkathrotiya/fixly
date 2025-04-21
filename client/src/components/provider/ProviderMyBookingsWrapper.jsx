import React from 'react';
import { useAuth } from '../../context/AuthContext';
import MyBookings from '../MyBookings';
import ProviderLayout from './ProviderLayout';

function ProviderMyBookingsWrapper() {
  const { user } = useAuth();

  // Only wrap with ProviderLayout if the user is a service provider
  if (user?.role === 'service_provider') {
    return (
      <ProviderLayout>
        <div className="provider-bookings-wrapper">
          <MyBookings hideNavbar={true} />
        </div>
      </ProviderLayout>
    );
  }

  // Otherwise, render the regular MyBookings component
  return <MyBookings />;
}

export default ProviderMyBookingsWrapper;
