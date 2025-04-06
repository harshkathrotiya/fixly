import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";  // Changed import syntax
import "./login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

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
        
        // Add this log to debug token
        console.log('Login successful, token received:', token);
        
        // Get user details after successful login
        try {
          const userResponse = await axios.get("http://localhost:5000/api/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          console.log('User details:', userResponse.data);
          
          if (userResponse.data.data.userType === 'service_provider') {
            console.log('Redirecting to provider dashboard...');
            navigate("/provider/dashboard");
          } else {
            console.log('Redirecting to services...');
            navigate("/services");
          }
        } catch (userError) {
          console.error('Error fetching user details:', userError);
          navigate("/services"); // Default redirect if user details fetch fails
        }
      } else {
        setError(response.data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error('Login error:', err);
      
      if (err.response) {
        setError(err.response.data.message || "Login failed");
      } else if (err.request) {
        setError("Cannot connect to server. Please check your internet connection.");
      } else {
        setError("An error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="login-container">
      <h2>Welcome Back</h2>
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Sign In</button>
      </form>

      <div className="login-footer">
        <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
      </div>
    </div>
  );
}

export default Login;
