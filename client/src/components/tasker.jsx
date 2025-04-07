import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './tasker.css'; // We'll create this CSS file
import Navbar from './Navbar'; // Import Navbar for consistent layout

const Tasker = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    serviceDescription: '',
    serviceCategory: '',
    availability: 'Weekdays',
    accountName: '',
    accountNumber: '',
    bankName: '',
    ifscCode: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    experience: '',
    qualifications: '',
    certifications: ''
  });

  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState({ message: '', type: '' });

  useEffect(() => {
    axios.get('http://localhost:5000/api/categories')
      .then(res => {
        // Make sure we're accessing the data array from the response
        setCategories(res.data.data || []);
      })
      .catch(err => {
        console.error('Failed to fetch categories:', err);
        setCategories([]); // Set empty array on error
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormStatus({ message: '', type: '' });

    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      serviceDescription: formData.serviceDescription,
      serviceCategory: [formData.serviceCategory],
      availability: formData.availability,
      bankDetails: {
        accountName: formData.accountName,
        accountNumber: formData.accountNumber,
        bankName: formData.bankName,
        ifscCode: formData.ifscCode
      },
      address: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country
      },
      experience: formData.experience,
      qualifications: formData.qualifications,
      certifications: [formData.certifications]
    };

    try {
      const response = await axios.post('http://localhost:5000/api/providers/register', payload);
      console.log('Registration success:', response.data);
      setFormStatus({ 
        message: "Registration Successful! You'll be contacted for verification.", 
        type: 'success' 
      });
      // Reset form after successful submission
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        serviceDescription: '',
        serviceCategory: '',
        availability: 'Weekdays',
        accountName: '',
        accountNumber: '',
        bankName: '',
        ifscCode: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        experience: '',
        qualifications: '',
        certifications: ''
      });
    } catch (err) {
      console.error('Registration failed:', err.response?.data || err.message);
      setFormStatus({ 
        message: err.response?.data?.message || "Registration Failed. Please try again.", 
        type: 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="tasker-page">
      <Navbar />
      
      <div className="tasker-container">
        <div className="form-header">
          <h1>Become a Service Provider</h1>
          <p>Join our network of professionals and grow your business</p>
        </div>

        {formStatus.message && (
          <div className={`form-message ${formStatus.type}`}>
            {formStatus.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="tasker-form">
          <div className="form-section">
            <h2>Personal Information</h2>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input 
                  id="firstName"
                  name="firstName" 
                  value={formData.firstName}
                  placeholder="First Name" 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input 
                  id="lastName"
                  name="lastName" 
                  value={formData.lastName}
                  placeholder="Last Name" 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input 
                  id="email"
                  name="email" 
                  type="email" 
                  value={formData.email}
                  placeholder="Email" 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input 
                  id="password"
                  name="password" 
                  type="password" 
                  value={formData.password}
                  placeholder="Password" 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input 
                id="phone"
                name="phone" 
                value={formData.phone}
                placeholder="Phone" 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          <div className="form-section">
            <h2>Service Details</h2>
            <div className="form-group">
              <label htmlFor="serviceCategory">Service Category</label>
              <select 
                id="serviceCategory"
                name="serviceCategory" 
                value={formData.serviceCategory}
                onChange={handleChange} 
                required
              >
                <option value="">Select Category</option>
                {Array.isArray(categories) && categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.categoryName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="serviceDescription">Service Description</label>
              <textarea 
                id="serviceDescription"
                name="serviceDescription" 
                value={formData.serviceDescription}
                placeholder="Describe the services you offer" 
                onChange={handleChange} 
                required 
                rows="4"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="experience">Experience (years)</label>
                <input 
                  id="experience"
                  name="experience" 
                  value={formData.experience}
                  placeholder="Years of experience" 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="availability">Availability</label>
                <select 
                  id="availability"
                  name="availability" 
                  value={formData.availability}
                  onChange={handleChange} 
                  required
                >
                  <option value="">Select Availability</option>
                  <option value="Weekdays">Weekdays</option>
                  <option value="Weekends">Weekends</option>
                  <option value="All Days">All Days</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="qualifications">Qualifications</label>
                <input 
                  id="qualifications"
                  name="qualifications" 
                  value={formData.qualifications}
                  placeholder="Your qualifications" 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="certifications">Certifications</label>
                <input 
                  id="certifications"
                  name="certifications" 
                  value={formData.certifications}
                  placeholder="Relevant certifications" 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Address Information</h2>
            <div className="form-group">
              <label htmlFor="street">Street Address</label>
              <input 
                id="street"
                name="street" 
                value={formData.street}
                placeholder="Street" 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input 
                  id="city"
                  name="city" 
                  value={formData.city}
                  placeholder="City" 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="state">State</label>
                <input 
                  id="state"
                  name="state" 
                  value={formData.state}
                  placeholder="State" 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="zipCode">ZIP Code</label>
                <input 
                  id="zipCode"
                  name="zipCode" 
                  value={formData.zipCode}
                  placeholder="ZIP Code" 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="country">Country</label>
                <input 
                  id="country"
                  name="country" 
                  value={formData.country}
                  placeholder="Country" 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Bank Details</h2>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="accountName">Account Holder Name</label>
                <input 
                  id="accountName"
                  name="accountName" 
                  value={formData.accountName}
                  placeholder="Account Name" 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="accountNumber">Account Number</label>
                <input 
                  id="accountNumber"
                  name="accountNumber" 
                  value={formData.accountNumber}
                  placeholder="Account Number" 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="bankName">Bank Name</label>
                <input 
                  id="bankName"
                  name="bankName" 
                  value={formData.bankName}
                  placeholder="Bank Name" 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="ifscCode">IFSC Code</label>
                <input 
                  id="ifscCode"
                  name="ifscCode" 
                  value={formData.ifscCode}
                  placeholder="IFSC Code" 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Register as Service Provider'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Tasker;
