import React, { useState } from "react";
import Home from "./components/Home"; 
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/login";
import SignUp from "./components/signup";
import TaskerForm from "./components/tasker";
// import Navbar from "./components/Navbar";
import JobListing from "./components/joblisting";
import BookingForm from "./components/BookingForm";
import ReviewForm from "./components/reviewform";
import ReviewCard from "./components/review";
//hey devangii -- email id na name srkha rkhaii

function App() {
 
  return (
    <Router>
      {/* <Navbar /> */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/joblisting" element={<JobListing />} />
        <Route path="/BookingForm" element={<BookingForm />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/tasker" element={<TaskerForm />} />
        <Route path="/reviewform" element={<ReviewForm />} />
        <Route path="/review" element={<ReviewCard />} />
        
      </Routes>
    </Router>

  );
}

export default App;
