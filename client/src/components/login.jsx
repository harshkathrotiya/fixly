import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import "./login.css";
import { useAuth } from "../context/AuthContext";
import Button from "./admin/shared/Button";

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

        // Login will return false if user is inactive
        const loginSuccess = login(userData, token);

        if (!loginSuccess) {
          setError("Your account has been deactivated. Please contact support.");
          return;
        }

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

      // Handle inactive account error specifically
      if (err.response?.status === 401 && err.response?.data?.message?.includes('deactivated')) {
        setError("Your account has been deactivated. Please contact support.");
      } else {
        setError(err.response?.data?.message || "An error occurred during login");
      }

      // Clear any stored token if login fails
      localStorage.removeItem('authToken');
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


          <div className="login-footer">
            <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
            <p><Link to="/forgot-password">Forgot password?</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
