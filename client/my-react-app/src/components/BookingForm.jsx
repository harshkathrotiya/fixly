import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export default function BookingForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedJob = location.state?.job; // Get job details from state

  const [bookingData, setBookingData] = useState({
    name: "",
    address: "",
    issueDescription: "",
    date: "",
    city: selectedJob?.city || "",
    category: selectedJob?.category || "",
    personName: selectedJob?.person_name || "",
    jobTitle: selectedJob?.jobtitle || "",
    budget: selectedJob?.budget || "",
  });

  const bookingInputChange = (event) => {
    const { name, value } = event.target;
    setBookingData({ ...bookingData, [name]: value });
  };

  const submitBooking = (e) => {
    e.preventDefault();
    axios
      .post("https://doorstepservice.onrender.com/bookings", bookingData)
      .then((response) => {
        alert("Booking submitted successfully!");
        console.log("Booking ID:", response.data.id); // Ensure backend returns the ID
        navigate("/joblisting");
      })
      .catch((error) => {
        console.error("Error submitting booking:", error);
        alert("Failed to submit booking. Please try again.");
      });
  };
  

  return (
    <div style={{ padding: "20px", width: "400px", margin: "auto", border: "1px solid #ddd", borderRadius: "10px", boxShadow: "0px 0px 10px rgba(0,0,0,0.1)", background: "white" }}>
      <h3>Book Service</h3>
      {selectedJob ? (
        <>
          <p><strong>Job Title:</strong> {selectedJob.jobtitle}</p>
          <p><strong>Person Name:</strong> {selectedJob.person_name}</p>
          <p><strong>Budget:</strong> Rs.{selectedJob.budget}</p>
          <p><strong>Category:</strong> {selectedJob.category}</p>

          <form onSubmit={submitBooking}>
            <input type="text" name="name" value={bookingData.name} onChange={bookingInputChange} placeholder="Your Name" required />
            <input type="text" name="address" value={bookingData.address} onChange={bookingInputChange} placeholder="Address" required />
            <input type="date" name="date" value={bookingData.date} onChange={bookingInputChange} required />
            <textarea name="issueDescription" value={bookingData.issueDescription} onChange={bookingInputChange} placeholder="Describe your issue" required />

            <button type="submit" onClick={() => navigate("/home2")}>Confirm Booking</button>
          </form>
        </>
      ) : (
        <p>No job selected for booking.</p>
      )}
    </div>
  );
}
