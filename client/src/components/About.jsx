import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import './services.css';
import './StyledHeading.css';

const About = () => {
  return (
    <>
      <Navbar />
      <main className="services-page" style={{ padding: '4rem 1rem' }}>
        <div className="services-container">
          <h1 className="styled-heading" data-content="ABOUT US">
            ABOUT US
          </h1>
          <p style={{ fontSize: '1.2rem', lineHeight: '1.6', color: 'var(--gray-700)', maxWidth: '800px' }}>
            Welcome to our platform! We are dedicated to connecting you with the best services available. Our mission is to provide a seamless and enjoyable experience for both service providers and customers.
          </p>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: 'var(--gray-600)', maxWidth: '800px', marginTop: '1rem' }}>
            Our team works tirelessly to ensure quality, reliability, and satisfaction. Thank you for choosing us as your trusted service marketplace.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default About;
