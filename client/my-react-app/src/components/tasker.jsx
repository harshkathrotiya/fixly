import React, { useEffect, useState } from 'react';
import axios from 'axios';

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

  useEffect(() => {
    axios.get('http://localhost:5000/api/categories/select')
      .then(res => setCategories(res.data))
      .catch(err => console.error('Failed to fetch categories:', err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      alert("Registration Successful!");
    } catch (err) {
      console.error('Registration failed:', err.response?.data || err.message);
      alert("Registration Failed.");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: 'auto' }}>
      <h2>Tasker Registration</h2>

      <input name="firstName" placeholder="First Name" onChange={handleChange} required />
      <input name="lastName" placeholder="Last Name" onChange={handleChange} required />
      <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
      <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
      <input name="phone" placeholder="Phone" onChange={handleChange} required />

      <textarea name="serviceDescription" placeholder="Service Description" onChange={handleChange} required />

      <select name="serviceCategory" onChange={handleChange} required>
        <option value="">Select Category</option>
        {categories.map((cat) => (
          <option key={cat._id} value={cat._id}>{cat.name}</option>
        ))}
      </select>

      <select name="availability" onChange={handleChange} required>
      <option value="">Select Availability</option>
      <option value="Weekdays">Weekdays</option>
      <option value="Weekends">Weekends</option>
      <option value="All Days">All Days</option>
      </select>
      <input name="accountName" placeholder="Account Name" onChange={handleChange} required />
      <input name="accountNumber" placeholder="Account Number" onChange={handleChange} required />
      <input name="bankName" placeholder="Bank Name" onChange={handleChange} required />
      <input name="ifscCode" placeholder="IFSC Code" onChange={handleChange} required />

      <input name="street" placeholder="Street" onChange={handleChange} required />
      <input name="city" placeholder="City" onChange={handleChange} required />
      <input name="state" placeholder="State" onChange={handleChange} required />
      <input name="zipCode" placeholder="ZIP Code" onChange={handleChange} required />
      <input name="country" placeholder="Country" onChange={handleChange} required />

      <input name="experience" placeholder="Experience (in years)" onChange={handleChange} required />
      <input name="qualifications" placeholder="Qualifications" onChange={handleChange} required />
      <input name="certifications" placeholder="Certifications" onChange={handleChange} required />

      <button type="submit">Register</button>
    </form>
  );
};

export default Tasker;
