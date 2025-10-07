import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/"); // Redirect to home page
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get("http://localhost:5000/api/bookings/my-bookings", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setAppointments(response.data.data || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setError("Failed to load appointments. Please try again later.");
        setLoading(false);
        
        // If it's an auth error, redirect to login
        if (error.response?.status === 401) {
          localStorage.removeItem("authToken");
          navigate("/login");
        }
      }
    };

    fetchAppointments();
  }, [navigate]);

  const cancelAppointment = async (id) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.put(`http://localhost:5000/api/bookings/${id}/status`, 
        { status: "Cancelled" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setAppointments(appointments.map(apt => 
        apt._id === id ? { ...apt, bookingStatus: "Cancelled" } : apt
      ));
      
      alert("Appointment canceled successfully!");
    } catch (error) {
      console.error("Error canceling appointment:", error);
      alert("Failed to cancel appointment. Please try again.");
    }
  };

  const markAsDone = (appointment) => {
    // Navigate to review form with booking ID
    navigate(`/review/${appointment._id}`);
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={{ padding: "20px", textAlign: "center" }}>
          <p>Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div style={{ padding: "20px", textAlign: "center" }}>
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2>Your Appointments</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", justifyContent: "center" }}>
          {appointments.length > 0 ? (
            appointments.map((appointment) => (
              <div
                key={appointment._id}
                style={{
                  border: "1px solid #ddd",
                  padding: "15px",
                  width: "300px",
                  borderRadius: "10px",
                  boxShadow: "0px 0px 10px rgba(0,0,0,0.1)",
                }}
              >
                <p><strong>Date:</strong> {new Date(appointment.serviceDateTime).toLocaleDateString()}</p>
                <p><strong>Service:</strong> {appointment.serviceListingId?.serviceTitle || 'Service'}</p>
                <p><strong>Provider:</strong> {appointment.serviceProviderId?.userId?.firstName || 'Provider'}</p>
                <p><strong>Amount:</strong> ₹{appointment.totalAmount || 0}</p>
                <p><strong>Status:</strong> {appointment.bookingStatus || 'Pending'}</p>

                {appointment.bookingStatus === 'Confirmed' && (
                  <>
                    <button 
                      onClick={() => cancelAppointment(appointment._id)} 
                      style={{ 
                        background: "red", 
                        color: "white", 
                        border: "none", 
                        padding: "5px 10px", 
                        marginRight: "10px", 
                        cursor: "pointer" 
                      }}
                    >
                      Cancel
                    </button>
                    
                    <button 
                      onClick={() => markAsDone(appointment)} 
                      style={{ 
                        background: "green", 
                        color: "white", 
                        border: "none", 
                        padding: "5px 10px", 
                        cursor: "pointer" 
                      }}
                    >
                      Mark as Done
                    </button>
                  </>
                )}
                
                {appointment.bookingStatus === 'Completed' && !appointment.isReviewed && (
                  <button 
                    onClick={() => markAsDone(appointment)} 
                    style={{ 
                      background: "#007bff", 
                      color: "white", 
                      border: "none", 
                      padding: "5px 10px", 
                      cursor: "pointer" 
                    }}
                  >
                    Leave Review
                  </button>
                )}
              </div>
            ))
          ) : (
            <p>No appointments found</p>
          )}
        </div>
      </div>
    </>
  );
}