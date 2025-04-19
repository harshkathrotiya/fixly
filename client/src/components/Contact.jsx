import React, { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import './services.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for contacting us! We will get back to you soon.');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <>
      <Navbar />
      <main className="services-page" style={{ padding: '4rem 1rem' }}>
        <div className="services-container" style={{ maxWidth: '600px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1.5rem', color: 'var(--gray-800)' }}>
            Contact Us
          </h1>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <label style={{ fontWeight: '600', color: 'var(--gray-700)' }}>
              Name
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  borderRadius: '8px',
                  border: '1px solid var(--gray-300)',
                  fontSize: '1rem',
                  marginTop: '0.5rem'
                }}
              />
            </label>
            <label style={{ fontWeight: '600', color: 'var(--gray-700)' }}>
              Email
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  borderRadius: '8px',
                  border: '1px solid var(--gray-300)',
                  fontSize: '1rem',
                  marginTop: '0.5rem'
                }}
              />
            </label>
            <label style={{ fontWeight: '600', color: 'var(--gray-700)' }}>
              Message
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="5"
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  borderRadius: '8px',
                  border: '1px solid var(--gray-300)',
                  fontSize: '1rem',
                  marginTop: '0.5rem',
                  resize: 'vertical'
                }}
              />
            </label>
            <button
              type="submit"
              style={{
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                padding: '0.8rem 1.5rem',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '1rem',
                cursor: 'pointer',
                border: 'none',
                boxShadow: '0 4px 12px rgba(74, 128, 240, 0.3)',
                transition: 'background-color 0.3s ease'
              }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--primary-dark)'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--primary-color)'}
            >
              Send Message
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Contact;
