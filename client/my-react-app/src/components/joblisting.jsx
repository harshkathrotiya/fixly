// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Link } from "react-router-dom";

// export default function JobListing() {
//   const token = localStorage.getItem("token");
//   console.log("Token:", token);

//   const [jobdata, setJobdata] = useState([]);
//   const [cities, setCities] = useState([]);

//   // Fixed categories
//   const categories = ["Plumbing", "Painting", "Cleaning", "Carpentry", "Gardening", "Washing"];

//   const [data, setData] = useState({
//     category: "",
//     city: "",
//   });

//   useEffect(() => {
//     axios
//       .get("https://doorstepservice.onrender.com/cities")
//       .then((response) => setCities(response.data))
//       .catch((error) => console.error("Error fetching cities:", error));
//   }, []);

//   const inputChange = (event) => {
//     const { name, value } = event.target;
//     setData({ ...data, [name]: value });
//   };

//   const submit = (e) => {
//     e.preventDefault();
//     console.log("Submit data:", data);

//     axios
//       .post("https://doorstepservice.onrender.com/jobs", data)
//       .then((response) => {
//         console.log("Response:", response);
//         setJobdata(response.data.data);
//       })
//       .catch((error) => console.error("Error fetching job listings:", error));
//   };

//   return (
//     <>
//       {/* Navbar */}
//       <nav
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           padding: "1rem",
//           background: "#333",
//           color: "#fff",
//         }}
//       >
//         <h2>Fixly</h2>
//         <div>
//           <Link to="/" style={{ marginRight: "15px", color: "white" }}>
//             Home
//           </Link>
//           <Link to="/services" style={{ marginRight: "15px", color: "white" }}>
//             Services
//           </Link>
//           <Link to="/appointments" style={{ marginRight: "15px", color: "white" }}>
//             Appointments
//           </Link>
//           <button
//             onClick={() => localStorage.removeItem("token")}
//             style={{
//               background: "red",
//               color: "white",
//               border: "none",
//               padding: "5px 10px",
//               cursor: "pointer",
//             }}
//           >
//             Logout
//           </button>
//         </div>
//       </nav>

//       {/* Search Form */}
//       <div style={{ padding: "20px", textAlign: "center" }}>
//         <form onSubmit={submit}>
//           <select name="city" value={data.city} onChange={inputChange} required>
//             <option value="">Select City</option>
//             {cities.map((city, index) => (
//               <option key={index} value={city}>
//                 {city}
//               </option>
//             ))}
//           </select>

//           <select name="category" value={data.category} onChange={inputChange} required>
//             <option value="">Select Category</option>
//             {categories.map((category, index) => (
//               <option key={index} value={category}>
//                 {category}
//               </option>
//             ))}
//           </select>

//           <button type="submit">Search</button>
//         </form>
//       </div>

//       {/* Display Job Listings in Box Structure */}
//       <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", padding: "20px", justifyContent: "center" }}>
//         {jobdata.length > 0 ? (
//           jobdata.map((job, index) => (
//             <div
//               key={index}
//               style={{
//                 border: "1px solid #ddd",
//                 padding: "15px",
//                 width: "300px",
//                 borderRadius: "10px",
//                 boxShadow: "0px 0px 10px rgba(0,0,0,0.1)",
//               }}
//             >
//               <h3>{job.jobtitle}</h3>
//               <p>
//                 <strong>Person Name:</strong> {job.person_name}
//               </p>
//               <p>
//                 <strong>Budget:</strong> ${job.budget}
//               </p>
//               <p>
//                 <strong>Description:</strong> {job.description}
//               </p>
//               <p>
//                 <strong>Location:</strong> {job.city}
//               </p>
//             </div>
//           ))
//         ) : (
//           <p>No jobs found</p>
//         )}
//       </div>
//     </>
//   );
// }

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./joblisting.css";

export default function JobListing() {
  const navigate = useNavigate();
  const [jobdata, setJobdata] = useState([]);
  const [cities, setCities] = useState([]);
  const [data, setData] = useState({ category: "", city: "" });

  const categories = ["Plumbing", "Painting", "Cleaning", "Carpentry", "Gardening", "Washing"];

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch("https://indian-cities-api-nocbegfhqg.now.sh/cities?state=Gujarat");
        
        if (!response.ok) {
          throw new Error("Failed to fetch cities");
        }

        const cityData = await response.json();
        setCities(cityData.map(city => city.city)); // Extract city names
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    };

    fetchCities();
  }, []);

  const inputChange = (event) => {
    const { name, value } = event.target;
    setData({ ...data, [name]: value });
  };

  const submit = (e) => {
    e.preventDefault();
    axios.post("https://doorstepservice.onrender.com/jobs", data)
      .then((response) => setJobdata(response.data.data))
      .catch((error) => console.error("Error fetching job listings:", error));
  };


  const openBookingForm = (job) => {
    navigate("/BookingForm", { state: { job } }); // Navigate to Booking Page
  };

  return (
    <>
     <nav className="navbar">
            <h2>Fixly</h2>
            <div className="nav-links">
              <Link to="/home2">Home</Link>
              <Link to="/joblisting">Services</Link>
              <Link to="/appointments">Appointments</Link>
              <button onClick={() => { localStorage.removeItem("token"); navigate("/"); }} className="logout-btn">
                Logout
              </button>
            </div>
      </nav>


          <div className="search-container">
            <form onSubmit={submit}>
              <select name="city" value={data.city} onChange={inputChange} required>
                <option value="">Select City</option>
                {cities.map((city, index) => (
                  <option key={index} value={city}>{city}</option>
                ))}
              </select>

              <select name="category" value={data.category} onChange={inputChange} required>
                <option value="">Select Category</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </select>

              <button type="submit">Search</button>
            </form>
          </div>


            <div className="jobs-container">
            {jobdata.length > 0 ? (
              jobdata.map((job, index) => (
                <div key={index} className="job-card">
                  <h3>{job.jobtitle}</h3>
                  <p>Person Name: {job.person_name}</p>
                  <p>Budget: Rs.{job.budget}</p>
                  <p>Description: {job.description}</p>
                  <p>Location: {job.city}</p>
                  <button onClick={() => openBookingForm(job)} className="book-btn">Book</button>
                </div>
              ))
            ) : (
              <p>No Data found</p>
            )}
          </div>

    </>
  );
}
