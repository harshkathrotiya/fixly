import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authcontext.jsx';
import { uploadToCloudinary } from '../utils/cloudinary';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Get user data from the auth endpoint
        const userResponse = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Log the user data to see what we're getting
        console.log('User data:', userResponse.data);
        
        // Get the user data
        const userData = userResponse.data.data || userResponse.data;
        
        // Extract all necessary information from the user data
        // The verification status might be in the user data already
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

    if (token) {
      fetchProfile();
    } else {
      navigate('/login');
    }
  }, [token, navigate, logout]);

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setLoading(true);
        // Upload to Cloudinary
        const imageUrl = await uploadToCloudinary(file);
        console.log('Image uploaded to Cloudinary:', imageUrl);
        
        // Update the user profile with the new image URL
        const response = await axios.put(
          'http://localhost:5000/api/auth/updateprofile', // Use the auth endpoint instead
          { profilePicture: imageUrl }, // Only send the profile picture field
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log('Profile update response:', response.data);
        
        // Update local state with the new image URL
        setProfile(prev => ({ ...prev, profilePicture: imageUrl }));
        setSuccessMessage('Profile image updated successfully');
      } catch (err) {
        console.error('Failed to upload profile image:', err);
        setError('Failed to upload profile image: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Update the user profile using the same endpoint as the image upload
      const response = await axios.put(
        'http://localhost:5000/api/auth/updateprofile',
        {
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
          businessName: profile.businessName,
          address: profile.businessAddress,
          description: profile.description,
          profilePicture: profile.profilePicture // Make sure to include the profile picture
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Full profile update response:', response.data);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => {
        navigate('/provider/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Profile update error:', err);
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      }
      setError('Failed to update profile: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="provider-profile">
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="profile-header">
          <h1>Provider Profile</h1>
          <button type="button" onClick={() => navigate('/provider/dashboard')}>Back to Dashboard</button>
        </div>

        <div className="profile-content">
          <div className="profile-image">
            {profile.profilePicture && (
              <img 
                src={profile.profilePicture} 
                alt="Profile" 
                className="profile-image"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleProfileImageUpload}
              className="image-upload-input"
            />
          </div>

          <div className="profile-form">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                value={profile.firstName}
                onChange={(e) => setProfile({...profile, firstName: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                value={profile.lastName}
                onChange={(e) => setProfile({...profile, lastName: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={profile.email}
                disabled
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({...profile, phone: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Business Name</label>
              <input
                type="text"
                value={profile.businessName}
                onChange={(e) => setProfile({...profile, businessName: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Business Address</label>
              <textarea
                value={profile.businessAddress}
                onChange={(e) => setProfile({...profile, businessAddress: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={profile.description}
                onChange={(e) => setProfile({...profile, description: e.target.value})}
              />
            </div>

            <div className="verification-status">
              <label>Verification Status:</label>
              <span className={`status ${profile.verificationStatus.toLowerCase()}`}>
                {profile.verificationStatus}
              </span>
            </div>

            <div className="form-actions">
              <button type="submit" className="save-button">Save Changes</button>
              <button type="button" onClick={() => navigate('/provider/dashboard')} className="cancel-button">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ProviderProfile;