import React from "react";
import Home from "./components/Home";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/login";
import SignUp from "./components/signup";
import Tasker from "./components/tasker";
// import Navbar from "./components/Navbar";
import JobListing from "./components/joblisting";
import ReviewForm from "./components/reviewform";
import Services from "./components/services";
import ServiceDetails from "./components/ServiceDetails";
import { AuthProvider } from "./context/AuthContext";
import ProviderDashboard from "./components/provider/ProviderDashboard";
import CreateListingWrapper from "./components/provider/CreateListingWrapper";
import EditListingWrapper from "./components/provider/EditListingWrapper";
// Using the ProviderProfile from the provider folder
import ProviderProfile from "./components/provider/ProviderProfile";
import Appointments from "./components/appointments";
import BookingDetails from "./components/BookingDetails";
import AdminDashboard from './components/admin/Dashboard';
import AdminUsers from './components/admin/Users';
import AdminProviders from './components/admin/Providers';
import AdminListings from './components/admin/Listings';
import AdminBookings from './components/admin/Bookings';
import AdminCategories from './components/admin/Categories';
import CreateAdminUser from './components/admin/CreateAdminUser';
import ProviderMyBookingsWrapper from './components/provider/ProviderMyBookingsWrapper';
// Import the new components
import PaymentForm from './components/PaymentForm';
import ComplaintForm from './components/ComplaintForm';
import Reviews from './components/Reviews';
import ProviderBookings from './components/provider/ProviderBookings';
import ServiceManagement from './components/provider/ServiceManagement';
import AddService from './components/provider/AddService';
import EditService from './components/provider/EditService';
import Commissions from './components/admin/Commissions';
import Complaints from './components/admin/Complaints';

// Add this import
import ProtectedAdminRoute from './components/ProtectedAdminRoute';

// At the top of your file, add this import
import './styles/global.css';
import './styles/tailwind.css'; // Add this if you have a separate tailwind file

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/tasker" element={<Tasker />} />
          <Route path="/joblisting" element={<JobListing />} />
          <Route path="/reviewform" element={<ReviewForm />} />
          <Route path="/services" element={<Services />} />
          <Route path="/listing/:id" element={<ServiceDetails />} />
          <Route path="/provider/dashboard" element={<ProviderDashboard />} />
          <Route path="/provider/create-listing" element={<CreateListingWrapper />} />
          <Route path="/provider/edit-listing/:id" element={<EditListingWrapper />} />
          <Route path="/provider/profile" element={<ProviderProfile />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/booking/:id" element={<BookingDetails />} />

          {/* Admin routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={
            <ProtectedAdminRoute>
              <AdminUsers />
            </ProtectedAdminRoute>
          } />
          <Route path="/admin/users/create" element={
            <ProtectedAdminRoute>
              <CreateAdminUser />
            </ProtectedAdminRoute>
          } />
          <Route path="/admin/providers" element={<AdminProviders />} />
          <Route path="/admin/listings" element={<AdminListings />} />
          <Route path="/admin/bookings" element={<AdminBookings />} />
          <Route path="/admin/categories" element={<AdminCategories />} />

          {/* Customer routes */}
          <Route path="/bookings" element={<ProviderMyBookingsWrapper />} />
          <Route path="/review/:bookingId" element={<ReviewForm />} />
          <Route path="/payment/:bookingId" element={<PaymentForm />} />
          <Route path="/complaint/:bookingId" element={<ComplaintForm />} />
          <Route path="/provider/:providerId/reviews" element={<Reviews />} />
          {/* Service provider routes */}
          <Route path="/provider/bookings" element={<ProviderBookings />} />
          <Route path="/provider/services" element={<ServiceManagement />} />
          <Route path="/provider/services/new" element={<AddService />} />
          <Route path="/provider/services/edit/:serviceId" element={<EditService />} />

          {/* Admin routes */}
          <Route path="/admin/commissions" element={<Commissions />} />
          <Route path="/admin/complaints" element={<Complaints />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
