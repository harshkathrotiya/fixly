import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { uploadToCloudinary } from '../utils/cloudinary';
import ProviderLayout from './provider/ProviderLayout';
import './ProviderProfile.css';

function ProviderProfile() {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    businessName: '',
    businessAddress: '',
    description: '',
    profilePicture: '',
    verificationStatus: 'pending'
  });
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [error, setError] = useState('');
  const [servicesError, setServicesError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // First, check if we have user data in localStorage
        const cachedUserData = localStorage.getItem('userData');
        let userData = null;

        if (cachedUserData) {
          userData = JSON.parse(cachedUserData);
          console.log('Using cached user data:', userData);

          // Set profile from cached data while we fetch the latest
          setProfile({
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            phone: userData.phone || '',
            businessName: userData.businessName || '',
            businessAddress: userData.address || '',
            description: userData.description || '',
            profilePicture: userData.profilePicture || '',
            verificationStatus: userData.verificationStatus || userData.isVerified ? 'verified' : 'pending'
          });
        }

        // Get fresh user data from the auth endpoint
        const userResponse = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Log the user data to see what we're getting
        console.log('Fresh user data from API:', userResponse.data);

        // Get the user data
        userData = userResponse.data.data || userResponse.data;

        // Store the user data in localStorage for persistence
        localStorage.setItem('userData', JSON.stringify(userData));

        // Extract all necessary information from the user data
        setProfile({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          businessName: userData.businessName || '',
          businessAddress: userData.address || '',
          description: userData.description || '',
          profilePicture: userData.profilePicture || '',
          // Check if verification status is available in user data
          verificationStatus: userData.verificationStatus || userData.isVerified ? 'verified' : 'pending'
        });

        setLoading(false);
      } catch (err) {
        console.error('Profile fetch error:', err);
        if (err.response?.status === 401) {
          logout();
          navigate('/login');
        }
        setError('Failed to load profile');
        setLoading(false);
      }
    };

    // Fetch provider services
    const fetchServices = async () => {
      setServicesLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/providers/me/listings', {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Provider services:', response.data);
        setServices(response.data.data || []);
      } catch (err) {
        console.error('Error fetching services:', err);
        setServicesError('Failed to load your services. Please try again.');
      } finally {
        setServicesLoading(false);
      }
    };

    if (token) {
      fetchProfile();
      fetchServices();
    } else {
      navigate('/login');
    }
  }, [token, navigate, logout]);

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setLoading(true);
        setError('');

        // Show uploading message
        setSuccessMessage('Uploading image...');

        // Upload to Cloudinary
        const imageUrl = await uploadToCloudinary(file);
        console.log('Image uploaded to Cloudinary:', imageUrl);

        if (!imageUrl) {
          throw new Error('Failed to get image URL from Cloudinary');
        }

        // Update the user profile with the new image URL
        const response = await axios.put(
          'http://localhost:5000/api/auth/updateprofile',
          { profilePicture: imageUrl }, // Only send the profile picture field
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('Profile update response:', response.data);

        if (response.data.success) {
          // Update local state with the new image URL
          setProfile(prev => ({ ...prev, profilePicture: imageUrl }));

          // Update the profile picture in localStorage to persist across refreshes
          const userData = JSON.parse(localStorage.getItem('userData') || '{}');
          userData.profilePicture = imageUrl;
          localStorage.setItem('userData', JSON.stringify(userData));

          setSuccessMessage('Profile image updated successfully');
        } else {
          throw new Error('Failed to update profile on server');
        }
      } catch (err) {
        console.error('Failed to upload profile image:', err);
        setError('Failed to upload profile image: ' + (err.response?.data?.message || err.message));
        setSuccessMessage('');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setSuccessMessage('Saving changes...');

      // Prepare the update data
      const updateData = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        businessName: profile.businessName,
        address: profile.businessAddress,
        description: profile.description,
        profilePicture: profile.profilePicture // Make sure to include the profile picture
      };

      // Update the user profile using the same endpoint as the image upload
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

      console.log('Full profile update response:', response.data);

      if (response.data.success) {
        // Update the userData in localStorage
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const updatedUserData = { ...userData, ...updateData };
        localStorage.setItem('userData', JSON.stringify(updatedUserData));

        setSuccessMessage('Profile updated successfully!');
        setTimeout(() => {
          navigate('/provider/dashboard');
        }, 1500);
      } else {
        throw new Error('Failed to update profile on server');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      }
      setError('Failed to update profile: ' + (err.response?.data?.message || err.message));
      setSuccessMessage('');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProviderLayout>
        <div className="loading">Loading your profile information...</div>
      </ProviderLayout>
    );
  }

  return (
    <ProviderLayout>
      <div className="provider-profile">
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        <form onSubmit={handleSubmit}>

          <div className="profile-content">
            <div className="profile-sidebar">
              <div className="profile-image-container">
                {profile.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt="Profile"
                    className="profile-image"
                  />
                ) : (
                  <div className="profile-image-placeholder">
                    <i className="fas fa-user"></i>
                  </div>
                )}
                <div className="image-upload-wrapper">
                  <label htmlFor="profile-image-upload" className="image-upload-label">
                    <i className="fas fa-camera"></i> Change Photo
                  </label>
                  <input
                    id="profile-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageUpload}
                    className="image-upload-input"
                  />
                </div>
              </div>

              <div className="profile-sidebar-info">
                <h3>{profile.firstName} {profile.lastName}</h3>
                <p className="profile-email">{profile.email}</p>
                <div className="verification-status">
                  <span className={`status-badge ${profile.verificationStatus.toLowerCase()}`}>
                    <i className={`fas ${profile.verificationStatus === 'verified' ? 'fa-check-circle' : 'fa-clock'}`}></i>
                    {profile.verificationStatus === 'verified' ? 'Verified Account' : 'Verification Pending'}
                  </span>
                </div>
              </div>
            </div>

            <div className="profile-form">
              <h2>Personal Information</h2>

              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                    placeholder="Enter your first name"
                  />
                </div>

                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="disabled-input"
                  />
                  <small>Email cannot be changed</small>
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <h2>Business Information</h2>

              <div className="form-group">
                <label>Business Name</label>
                <input
                  type="text"
                  value={profile.businessName}
                  onChange={(e) => setProfile({...profile, businessName: e.target.value})}
                  placeholder="Enter your business name"
                />
              </div>

              <div className="form-group">
                <label>Business Address</label>
                <textarea
                  value={profile.businessAddress}
                  onChange={(e) => setProfile({...profile, businessAddress: e.target.value})}
                  placeholder="Enter your business address"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Business Description</label>
                <textarea
                  value={profile.description}
                  onChange={(e) => setProfile({...profile, description: e.target.value})}
                  placeholder="Describe your business and services"
                  rows="5"
                />
                <small>This description will be visible to potential customers</small>
              </div>

              <div className="form-actions">
                <button type="submit" className="save-button">
                  <i className="fas fa-save"></i> Save Changes
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </ProviderLayout>
  );
}

export default ProviderProfile;