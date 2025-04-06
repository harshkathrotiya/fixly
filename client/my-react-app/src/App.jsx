import React, { useState } from "react";
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
import { AuthProvider } from "./context/authcontext";
import ProviderDashboard from "./components/ProviderDashboard";
import CreateListing from "./components/CreateListing";
import EditListing from "./components/EditListing";
import ProviderProfile from "./components/ProviderProfile";
import Appointments from "./components/appointments";
import BookingDetails from "./components/BookingDetails";

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
          <Route path="/provider/create-listing" element={<CreateListing />} />
          <Route path="/provider/edit-listing/:id" element={<EditListing />} />
          <Route path="/provider/profile" element={<ProviderProfile />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/booking/:id" element={<BookingDetails />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
