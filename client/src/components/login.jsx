import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Navbar from "./Navbar";
import "./login.css";
import { useAuth } from "../context/authcontext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      console.log('Login Response:', response.data); // Debug log

      if (response.data.success) {
        const token = response.data.token;
        
        localStorage.setItem('authToken', token);

        // Fetch user details from /api/auth/me
        const userResponse = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const userData = userResponse.data.data || {};
        console.log('User Data:', userData); // Debug log

        login(userData, token);
        
        // Updated userType check
        if (userData.userType && userData.userType.toLowerCase() === 'admin') {
          navigate('/admin');
        } else if (userData.userType === 'service_provider') {
          navigate('/provider/dashboard');
        } else {
          navigate('/');
        }
      } else {
        setError(response.data.message || "Login failed");
      }
    } catch (err) {
      console.error('Login Error:', err.response?.data); // Debug log
      setError(err.response?.data?.message || "An error occurred during login");
    }
  };

  return (
    <div className="app-container">
      <Navbar />
      
      <div className="main-content">
        <div className="login-container">
          <h2>Login to Your Account</h2>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <button type="submit" className="login-button">Login</button>
          </form>
          
          <div className="login-footer">
            <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
            <p><Link to="/forgot-password">Forgot password?</Link></p>
          </div>
        </div>
      </div>
      
      <footer className="main-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <h3>Fixly</h3>
            <p>Your trusted platform for home services</p>
          </div>
          <div className="footer-links">
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/services">Services</Link></li>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>For Providers</h4>
              <ul>
                <li><Link to="/tasker">Become a Provider</Link></li>
                <li><Link to="/provider/dashboard">Provider Dashboard</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Fixly. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Login;
