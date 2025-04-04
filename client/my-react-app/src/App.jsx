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

function App() {
 
  return (
    <Router>
      {/* <Navbar /> */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/joblisting" element={<JobListing />} />
        
        <Route path="/signup" element={<SignUp />} />
        <Route path="/tasker" element={<Tasker />} />
        <Route path="/reviewform" element={<ReviewForm />} />
        <Route path="/review" element={<ReviewCard />} />
        <Route path="/services" element={<Services />} />
        
      </Routes>
    </Router>

  );
}

export default App;
