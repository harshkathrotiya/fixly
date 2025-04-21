import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { uploadToCloudinary } from '../../utils/cloudinary';
import AdminLayout from './AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import './AdminProfile.css';

function AdminProfile() {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    profilePicture: ''
  });
  const [originalProfile, setOriginalProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  
  const navigate = useNavigate();
  const { token, logout, user } = useAuth();

  // Fetch user profile
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setErrors({});

      const response = await axios.get('http://localhost:5000/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const userData = response.data.data;
      
      const profileData = {
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        profilePicture: userData.profilePicture || ''
      };
      
      setProfile(profileData);
      setOriginalProfile(profileData);
      setIsDirty(false);
      
    } catch (err) {
      console.error('Profile fetch error:', err);
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      }
      setNotification({ 
        type: 'error', 
        message: 'Failed to load profile. Please try again later.' 
      });
    } finally {
      setLoading(false);
    }
  }, [token, logout, navigate]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Check if form has been modified
  useEffect(() => {
    if (Object.keys(originalProfile).length > 0) {
      const formChanged = 
        profile.firstName !== originalProfile.firstName ||
        profile.lastName !== originalProfile.lastName ||
        profile.phone !== originalProfile.phone;
      
      setIsDirty(formChanged);
    }
  }, [profile, originalProfile]);

  // Form field validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!profile.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (profile.firstName.length > 50) {
      newErrors.firstName = 'First name cannot exceed 50 characters';
    }
    
    if (!profile.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (profile.lastName.length > 50) {
      newErrors.lastName = 'Last name cannot exceed 50 characters';
    }
    
    if (!profile.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\d\s\+\-\(\)]{10,15}$/.test(profile.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setImageLoading(true);
        setErrors({});
        
        // Validate file type and size
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB
        
        if (!validTypes.includes(file.type)) {
          throw new Error('Please upload a valid image file (JPEG, PNG)');
        }
        
        if (file.size > maxSize) {
          throw new Error('Image size should not exceed 5MB');
        }

        setNotification({ type: 'info', message: 'Uploading image...' });

        // Upload to Cloudinary
        const imageUrl = await uploadToCloudinary(file);

        if (!imageUrl) {
          throw new Error('Failed to upload image. Please try again.');
        }

        // Update profile with new image URL
        const response = await axios.put(
          'http://localhost:5000/api/auth/updateprofile',
          { profilePicture: imageUrl },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          // Update profile state and localStorage
          setProfile(prev => ({
            ...prev,
            profilePicture: imageUrl
          }));
          
          const userData = JSON.parse(localStorage.getItem('userData') || '{}');
          userData.profilePicture = imageUrl;
          localStorage.setItem('userData', JSON.stringify(userData));

          setNotification({ 
            type: 'success', 
            message: 'Profile image updated successfully!' 
          });
          
          // Clear notification after 3 seconds
          setTimeout(() => {
            setNotification({ type: '', message: '' });
          }, 3000);
        } else {
          throw new Error(response.data.message || 'Failed to update profile image');
        }
      } catch (err) {
        console.error('Failed to upload profile image:', err);
        setNotification({ 
          type: 'error', 
          message: err.message || 'Failed to upload profile image' 
        });
      } finally {
        setImageLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      setSaveLoading(true);
      setErrors({});
      setNotification({ type: 'info', message: 'Saving changes...' });

      // Prepare the update data
      const updateData = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        profilePicture: profile.profilePicture
      };

      // Update the user profile
      const response = await axios.put(
        'http://localhost:5000/api/auth/updateprofile',
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        // Update the userData in localStorage
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const updatedUserData = { ...userData, ...updateData };
        localStorage.setItem('userData', JSON.stringify(updatedUserData));

        setNotification({ 
          type: 'success', 
          message: 'Profile updated successfully!' 
        });
        
        setOriginalProfile(profile);
        setIsDirty(false);
        
        // Redirect after showing success message
        setTimeout(() => {
          navigate('/admin');
        }, 1500);
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      }
      setNotification({ 
        type: 'error', 
        message: err.message || 'Failed to update profile' 
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      setShowConfirmDialog(true);
    } else {
      navigate('/admin');
    }
  };

  const confirmCancel = () => {
    setShowConfirmDialog(false);
    navigate('/admin');
  };

  const dismissConfirmDialog = () => {
    setShowConfirmDialog(false);
  };

  // Main loading skeleton
  if (loading && !profile.firstName) {
    return (
      <AdminLayout>
        <div className="admin-profile-container">
          <div className="profile-skeleton">
            <div className="skeleton-header">
              <div className="skeleton-title"></div>
              <div className="skeleton-subtitle"></div>
            </div>
            <div className="skeleton-content">
              <div className="skeleton-sidebar">
                <div className="skeleton-avatar"></div>
                <div className="skeleton-badge"></div>
              </div>
              <div className="skeleton-form">
                <div className="skeleton-section">
                  <div className="skeleton-section-header"></div>
                  <div className="skeleton-input"></div>
                  <div className="skeleton-input"></div>
                  <div className="skeleton-input"></div>
                </div>
                <div className="skeleton-actions">
                  <div className="skeleton-button"></div>
                  <div className="skeleton-button"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-profile-container">
        <motion.div 
          className="admin-profile-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1>My Profile</h1>
          <p>Manage your personal information and account settings</p>
        </motion.div>

        <AnimatePresence>
          {notification.message && (
            <motion.div
              className={`notification ${notification.type}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="notification-icon">
                {notification.type === 'success' && <i className="fas fa-check-circle"></i>}
                {notification.type === 'error' && <i className="fas fa-exclamation-circle"></i>}
                {notification.type === 'info' && <i className="fas fa-info-circle"></i>}
              </div>
              <p>{notification.message}</p>
              <button 
                className="notification-close"
                onClick={() => setNotification({ type: '', message: '' })}
              >
                <i className="fas fa-times"></i>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit}>
          <motion.div 
            className="profile-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="profile-sidebar">
              <div className="profile-image-wrapper">
                <div className={`profile-image-container ${imageLoading ? 'loading' : ''}`}>
                  {imageLoading && (
                    <div className="image-loading-overlay">
                      <div className="spinner"></div>
                    </div>
                  )}
                  {profile.profilePicture ? (
                    <img
                      src={profile.profilePicture}
                      alt={`${profile.firstName} ${profile.lastName}`}
                      className="profile-image"
                    />
                  ) : (
                    <div className="profile-image-placeholder">
                      <span>{profile.firstName && profile.lastName ? 
                        `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}` : 
                        <i className="fas fa-user"></i>}
                      </span>
                    </div>
                  )}
                </div>
                <div className="image-upload-wrapper">
                  <label htmlFor="profile-image-upload" className="image-upload-label">
                    <i className="fas fa-camera"></i> Change Photo
                  </label>
                  <input
                    id="profile-image-upload"
                    type="file"
                    accept="image/jpeg, image/png, image/jpg, image/webp"
                    onChange={handleProfileImageUpload}
                    className="image-upload-input"
                    disabled={imageLoading}
                  />
                </div>
              </div>

              <div className="profile-stats">
                <div className="status-badge admin">
                  <i className="fas fa-shield-alt"></i> Administrator
                </div>
                <div className="joined-date">
                  <i className="fas fa-calendar-alt"></i> Joined April 2023
                </div>
              </div>
              
              <div className="profile-sidebar-actions">
                <button type="button" className="action-button change-password">
                  <i className="fas fa-lock"></i> Change Password
                </button>
              </div>
            </div>

            <div className="profile-form">
              <div className="form-section personal-info">
                <h2><i className="fas fa-user-circle"></i> Personal Information</h2>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <div className="input-container">
                      <i className="fas fa-user input-icon"></i>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={profile.firstName}
                        onChange={handleChange}
                        className={errors.firstName ? 'error' : ''}
                        placeholder="Enter your first name"
                      />
                    </div>
                    {errors.firstName && <span className="error-text">{errors.firstName}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <div className="input-container">
                      <i className="fas fa-user input-icon"></i>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={profile.lastName}
                        onChange={handleChange}
                        className={errors.lastName ? 'error' : ''}
                        placeholder="Enter your last name"
                      />
                    </div>
                    {errors.lastName && <span className="error-text">{errors.lastName}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <div className="input-container">
                      <i className="fas fa-envelope input-icon"></i>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={profile.email}
                        disabled
                        className="disabled-input"
                      />
                    </div>
                    <small className="input-hint">Email address cannot be changed</small>
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <div className="input-container">
                      <i className="fas fa-phone-alt input-icon"></i>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={profile.phone}
                        onChange={handleChange}
                        className={errors.phone ? 'error' : ''}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    {errors.phone ? (
                      <span className="error-text">{errors.phone}</span>
                    ) : (
                      <small className="input-hint">Format: +1 (555) 123-4567</small>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-actions">
                {isDirty && (
                  <div className="unsaved-changes-warning">
                    <i className="fas fa-exclamation-triangle"></i>
                    <span>You have unsaved changes</span>
                  </div>
                )}
                <button
                  type="button"
                  className="cancel-button"
                  onClick={handleCancel}
                  disabled={saveLoading}
                >
                  <i className="fas fa-times"></i> Cancel
                </button>
                <button
                  type="submit"
                  className={`save-button ${!isDirty ? 'disabled' : ''}`}
                  disabled={saveLoading || !isDirty}
                >
                  {saveLoading ? (
                    <>
                      <div className="button-spinner"></div> Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i> Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </form>

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="confirmation-overlay">
            <motion.div 
              className="confirmation-dialog"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <div className="confirmation-header">
                <i className="fas fa-exclamation-triangle"></i>
                <h3>Discard Changes?</h3>
              </div>
              <p>You have unsaved changes that will be lost. Are you sure you want to leave this page?</p>
              <div className="confirmation-actions">
                <button className="cancel-action" onClick={dismissConfirmDialog}>
                  <i className="fas fa-arrow-left"></i> Continue Editing
                </button>
                <button className="confirm-action" onClick={confirmCancel}>
                  <i className="fas fa-check"></i> Discard Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminProfile;
