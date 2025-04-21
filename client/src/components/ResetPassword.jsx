import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import './login.css';
import './PasswordReset.css';

function ResetPassword() {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Log the token when component mounts
  useEffect(() => {
    console.log('Reset password component mounted with token:', token);
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Resetting password with token:', token);
      const response = await axios.put(`http://localhost:5000/api/auth/resetpassword/${token}`, {
        password: newPassword
      });
      console.log('Reset password response:', response.data);

      if (response.data.success) {
        setIsSubmitted(true);
      } else {
        setError(response.data.message || 'Failed to reset password');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      console.error('Response data:', err.response?.data);
      console.error('Status code:', err.response?.status);
      setError(err.response?.data?.message || 'An error occurred while resetting password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar />

      <div className="main-content">
        <div className="login-container">
          <h2>Reset Your Password</h2>

          {isSubmitted ? (
            <div className="success-message">
              <p>Your password has been successfully reset!</p>
              <div className="login-footer">
                <p><Link to="/login">Return to Login</Link></p>
              </div>
            </div>
          ) : (
            <>
              {error && <div className="error-message">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <button
                  type="submit"
                  className="login-button"
                  disabled={isLoading}
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>

              <div className="login-footer">
                <p>Remember your password? <Link to="/login">Login</Link></p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;