import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import './login.css';
import './PasswordReset.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email');
      return;
    }

    try {
      setLoading(true);
      console.log('Sending forgot password request for email:', email); // Debug log
      const res = await axios.post('http://localhost:5000/api/auth/forgotpassword', { email });

      if (res.data.success) {
        setSuccess(true);
        setError('');
      } else {
        setError(res.data.message || 'Failed to process your request');
      }
    } catch (err) {
      console.error('Forgot password error:', err.response?.data || err.message); // Debug log
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        (err.response?.status === 500 ? 'Email service is currently unavailable. Please try again later.' : 'Failed to process your request. Please try again later.')
      );
      console.error('Email sending failed:', err.response?.data || err.message);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar />

      <div className="main-content">
        <div className="login-container">
          <h2>Forgot Password</h2>

          {error && <div className="error-message">{error}</div>}

          {success ? (
            <div className="success-message">
              <p>Password reset link has been sent to your email</p>
              <div className="login-footer">
                <p><Link to="/login">Return to Login</Link></p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <div className="login-footer">
                <p>Remember your password? <Link to="/login">Login</Link></p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;