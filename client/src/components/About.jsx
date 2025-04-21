import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { motion } from 'framer-motion';
import './About.css';
import './StyledHeading.css';

const About = () => {
  const navigate = useNavigate();
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  // Removed unused itemVariants

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
        delay: 0.2
      }
    }
  };

  return (
    <>
      <Navbar />
      <main className="about-page">
        <div className="about-container">
          <motion.div
            className="about-header"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <h1 className="styled-heading" data-content="ABOUT US">
              ABOUT US
            </h1>
          </motion.div>

          <motion.div
            className="about-content-wrapper"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div className="about-card" variants={cardVariants}>
              <div className="card-inner">
                <div className="card-front">
                  <h2>Our Mission</h2>
                  <p>
                    Welcome to our platform! We are dedicated to connecting you with the best services available. Our mission is to provide a seamless and enjoyable experience for both service providers and customers.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div className="about-card" variants={cardVariants}>
              <div className="card-inner">
                <div className="card-front">
                  <h2>Our Team</h2>
                  <p>
                    Our team works tirelessly to ensure quality, reliability, and satisfaction. Thank you for choosing us as your trusted service marketplace.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div className="about-card" variants={cardVariants}>
              <div className="card-inner">
                <div className="card-front">
                  <h2>Our Values</h2>
                  <p>
                    We believe in transparency, quality, and customer satisfaction. Every service provider on our platform is vetted to ensure they meet our high standards.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="about-parallax-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <div className="parallax-layer layer-1"></div>
            <div className="parallax-layer layer-2"></div>
            <div className="parallax-content">
              <motion.h2
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                Join Our Community
              </motion.h2>
              <motion.p
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                Be part of our growing network of service providers and customers.
              </motion.p>
              <motion.button
                className="cta-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                onClick={() => navigate('/services')}
              >
                Explore Services
              </motion.button>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default About;
