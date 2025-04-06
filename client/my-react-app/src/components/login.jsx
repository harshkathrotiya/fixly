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
      console.log('Attempting to login...');
      
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      if (response.data.success) {
        const token = response.data.token;
        localStorage.setItem('authToken', token);
        
        // Dispatch auth change event
        window.dispatchEvent(new Event('auth-change'));
        console.log('Auth change event dispatched');
        
        // Use the login function from context
        if (login) {
          login(response.data.data || {}, token);
        }
        
        console.log('Login successful, token received:', token);
        
        // Get user details after successful login
        try {
          const decoded = jwtDecode(token);
          console.log('Decoded token:', decoded);
          
          // Fetch user details
          const userResponse = await axios.get('http://localhost:5000/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          console.log('User details:', userResponse.data);
          
          // Check userType from the response
          const userType = userResponse.data.userType || 
                          (userResponse.data.data && userResponse.data.data.userType);
          
          console.log('User type from API:', userType);
          
          // Navigate based on user type
          if (userType === 'service_provider') {
            navigate('/provider/dashboard');
          } else {
            navigate('/');
          }
        } catch (err) {
          console.error('Error getting user details:', err);
          navigate('/');
        }
      } else {
        setError(response.data.message || "Login failed");
      }
    } catch (err) {
      console.error('Login error:', err);
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
