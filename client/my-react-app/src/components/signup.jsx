import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./signup.css";

function SignUp() {
  const [userType, setUserType] = useState("user");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    const signupData = {
      userType,
      username,
      password,
      firstName,
      lastName,
      email,
      phone,
      address: {
        street,
        city,
        state,
        zipCode,
        country,
      },
    };

    console.log("Sending data:", signupData);

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupData),
      });

      const data = await response.json();

      if (response.status === 201 && data.success) {
        localStorage.setItem("token", data.token);
        alert("Signup Successful! Please login.");
        navigate("/login");
      } else {
        setError(data.message || "Signup Failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during signup:", error);
      setError("Server error. Please try again later.");
    }
  };

  return (
    <div className="signup-container">
      <h2>Create Your Account</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSignup}>
        <label>User Type</label>
        <select value={userType} onChange={(e) => setUserType(e.target.value)}>
          <option value="user">User</option>
        </select>
        <label>First Name</label>
        <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        <label>Last Name</label>
        <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        <label>Username</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <label>Phone Number</label>
        <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} pattern="[0-9]{10}" required />
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label>Street</label>
        <input type="text" value={street} onChange={(e) => setStreet(e.target.value)} required />
        <label>City</label>
        <input type="text" value={city} onChange={(e) => setCity(e.target.value)} required />
        <label>State</label>
        <input type="text" value={state} onChange={(e) => setState(e.target.value)} required />
        <label>Zip Code</label>
        <input type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)} pattern="[0-9]{5}" required />
        <label>Country</label>
        <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} required />
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Sign Up</button>
      </form>
      <div className="signup-footer">
        <p>Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}

export default SignUp;

