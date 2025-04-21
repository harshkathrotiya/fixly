import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authcontext';
import AdminLayout from './AdminLayout';
import Button from './shared/Button';
import { cardStyles, formStyles, alertStyles } from './shared/adminStyles';

function CreateAdminUser() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'admin'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/register',
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          userType: 'admin',
          sendEmail: true // Flag to send welcome email with credentials
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSuccess('Admin user created successfully! An email with login credentials has been sent.');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        userType: 'admin'
      });

      // Redirect to admin users list after 2 seconds
      setTimeout(() => {
        navigate('/admin/users');
      }, 2000);
    } catch (err) {
      console.error('Error creating admin user:', err);
      setError(err.response?.data?.message || 'Failed to create admin user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout title="Create Admin User">
      <div className="max-w-2xl mx-auto">
        <div className={cardStyles.container}>
          <div className={cardStyles.header}>
            <h2 className={cardStyles.title}>Create New Admin User</h2>
          </div>

          <div className={cardStyles.body}>
            {error && (
              <div className={`${alertStyles.base} ${alertStyles.error} mb-6`} role="alert">
                <p className={alertStyles.messageError}>{error}</p>
              </div>
            )}

            {success && (
              <div className={`${alertStyles.base} ${alertStyles.success} mb-6`} role="alert">
                <p className={alertStyles.messageSuccess}>{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className={formStyles.group}>
                  <label htmlFor="firstName" className={formStyles.label}>
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={formStyles.input}
                    required
                  />
                </div>

                <div className={formStyles.group}>
                  <label htmlFor="lastName" className={formStyles.label}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={formStyles.input}
                    required
                  />
                </div>
              </div>

              <div className={formStyles.group}>
                <label htmlFor="email" className={formStyles.label}>
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={formStyles.input}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className={formStyles.group}>
                  <label htmlFor="password" className={formStyles.label}>
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={formStyles.input}
                    required
                    minLength="6"
                  />
                </div>

                <div className={formStyles.group}>
                  <label htmlFor="confirmPassword" className={formStyles.label}>
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={formStyles.input}
                    required
                    minLength="6"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => navigate('/admin/users')}
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  isLoading={isLoading}
                >
                  Create Admin User
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default CreateAdminUser;