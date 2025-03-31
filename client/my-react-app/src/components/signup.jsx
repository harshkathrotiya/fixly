import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./signup.css";

function SignUp() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [pincode, setPincode] = useState("");
  const [passward, setPassward] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("", {
        fullName,
        username,
        phone,
        email,
        address,
        district,
        pincode,
        passward,
      });

      if (response.data.success) {
        alert("Signup Successful! Please login.");
        navigate("/Home");
      } else {
        setError("Signup Failed. Please try again.");
      }
    } catch (error) {
      setError("Server error. Please try again later.");
    }
  };

  return (
    <div className="signup-container">
      <h2>Create Your Account</h2>
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSignup}>
      <label className='label'>Full Name</label>
        <input
          type="text"
          placeholder=""
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <label>Username</label>
        <input
          type="text"
          placeholder=""
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <label>Phone Number</label>
        <input
          type="tel"
          placeholder=""
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          pattern="[0-9]{10}"
          required
        />
        <label>Email</label>
        <input
          type="email"
          placeholder="abc@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label>Address</label>
        <input
          type="text"
          placeholder=""
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />
        <label>District</label>
        <input
          type="text"
          placeholder=""
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          required
        />
        <label>Pincode</label>
        <input
          type="text"
          placeholder=""
          value={pincode}
          onChange={(e) => setPincode(e.target.value)}
          pattern="[0-9]{6}"
          required
        />
        <label>Passward</label>
        <input
          type="password"
          placeholder=""
          value={passward}
          onChange={(e) => setPassward(e.target.value)}
          required
        />
        <button type="submit">Sign Up</button>
      </form>
      
      <div className="signup-footer">
        <p>Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}

export default SignUp;
