import React, { useState } from "react";
import Home from "./components/Home"; 
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/login";
import SignUp from "./components/signup";
import Tasker from "./components/tasker";
// import Navbar from "./components/Navbar";
import JobListing from "./components/joblisting";

import ReviewForm from "./components/reviewform";
import ReviewCard from "./components/review";
import Services from "./components/services";
import ProviderDashboard from './components/ProviderDashboard';
import CreateListing from './components/CreateListing';
import EditListing from './components/EditListing';
import ListingDetails from './components/ListingDetails';
import BookingDetails from './components/BookingDetails';

// Add this import at the top
import ProviderProfile from './components/ProviderProfile';
import { AuthProvider } from './context/AuthContext.jsx';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          
          {/* Provider routes */}
          <Route path="/provider/dashboard" element={<ProviderDashboard />} />
          <Route path="/provider/create-listing" element={<CreateListing />} />
          <Route path="/provider/edit-listing/:id" element={<EditListing />} />
          <Route path="/provider/listing/:id" element={<ListingDetails />} />
          <Route path="/provider/booking/:id" element={<BookingDetails />} />
          
          <Route path="/joblisting" element={<JobListing />} />
          <Route path="/tasker" element={<Tasker />} />
          <Route path="/reviewform" element={<ReviewForm />} />
          <Route path="/review" element={<ReviewCard />} />
          <Route path="/services" element={<Services />} />
          
          // Add this route in your Routes component
          <Route path="/provider/profile" element={<ProviderProfile />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
