import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom"; // Add Link import


export default function Appointments() {
  const [appointments, setAppointments] = useState([]);

  const navigate = useNavigate();

const handleLogout = () => {
  localStorage.removeItem("token");
  navigate("/"); // Redirect to home page
};


  useEffect(() => {
    axios
      .get("https://doorstepservice.onrender.com/bookings")
      .then((response) => {
        setAppointments(response.data);
      })
      .catch((error) => console.error("Error fetching appointments:", error));
  }, []);

  const cancelAppointment = (id) => {
    axios
      .delete(`https://doorstepservice.onrender.com/bookings/${id}`)
      .then(() => {
        alert("Appointment canceled successfully!");
        setAppointments(appointments.filter((appointment) => appointment.id !== id));
      })
      .catch((error) => console.error("Error canceling appointment:", error));
  };

  const markAsDone = (appointment) => {
    navigate("/reviewform", { state: { appointment } }); // Pass appointment data to Review Page
  };


  return (
    <>
       <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 2rem", background: "#333", color: "#fff", fontSize: "1.2rem" }}>
        <h2>Fixly</h2>
        <div>
          <Link to="/home2" style={{ marginRight: "15px", color: "white" }}>Home</Link>
          <Link to="/joblisting" style={{ marginRight: "15px", color: "white" }}>Services</Link>
          <Link to="/appointments" style={{ marginRight: "15px", color: "white" }}>Appointments</Link>
          <button onClick={handleLogout} style={{ background: "red", color: "white", border: "none", padding: "5px 10px", cursor: "pointer" }}>
            Logout
          </button>

        </div>
      </nav>
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Your Appointments</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", justifyContent: "center" }}>
        {appointments.length > 0 ? (
          appointments.map((appointment, id) => (
            <div
              key={id}
              style={{
                border: "1px solid #ddd",
                padding: "15px",
                width: "300px",
                borderRadius: "10px",
                boxShadow: "0px 0px 10px rgba(0,0,0,0.1)",
              }}
            >
              <p>Date: {appointment.date}</p>
              <p>Person Name: {appointment.personName}</p>
              <p>Budget: Rs.{appointment.budget}</p>
              <p>Description: {appointment.issueDescription}</p>

              
              <button onClick={() => cancelAppointment(appointment.id)} style={{ background: "red", color: "white", border: "none", padding: "5px 10px", marginRight: "10px", cursor: "pointer" }}>
                  Cancel
                </button>
                
                <button onClick={() => markAsDone(appointment)} style={{ background: "green", color: "white", border: "none", padding: "5px 10px", cursor: "pointer" }}>
                  Done
                </button>
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
