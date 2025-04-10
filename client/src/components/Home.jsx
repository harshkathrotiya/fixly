import React, { useState, useEffect, useRef } from "react";
import "./Home.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
// Using Font Awesome icons instead of images
import ReviewCard from "./review";
import Navbar from "./Navbar";
import { motion } from 'framer-motion';
import Flickity from 'flickity';
const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  // Popular service categories with Font Awesome icons
  const serviceCategories = [
    { name: "Painting", icon: "fa-paint-roller", description: "Professional painting for your home" },
    { name: "Cleaning", icon: "fa-broom", description: "Deep cleaning by certified experts" },
    { name: "Plumbing", icon: "fa-faucet", description: "Fix leaks and plumbing issues" },
    { name: "Carpentry", icon: "fa-hammer", description: "Custom furniture and repairs" },
    { name: "Electrical", icon: "fa-bolt", description: "Safe and reliable electrical work" }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/services?search=${searchTerm}`);
  };

  const navigateToService = (serviceName) => {
    navigate(`/services?category=${serviceName.toLowerCase()}`);
  };

  // Hero slider reference
  const flickityRef = useRef(null);

  // Updated hero slides with better images and content
  const heroSlides = [
    {
      title: "Your Home Services Solution",
      description: "Find trusted professionals for all your home maintenance and improvement needs. Quality service guaranteed.",
      image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1920&q=80",
      ctaText: "Get Started",
      ctaLink: "/services",
      color: "#4a90e2"
    },
    {
      title: "Professional Services On Demand",
      description: "Expert electricians, plumbers, and more at your fingertips. Book services with verified professionals.",
      image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1920&q=80",
      ctaText: "Book Now",
      ctaLink: "/services",
      color: "#2d9cdb"
    },
    {
      title: "Transform Your Space",
      description: "From painting to renovation, bring your vision to life with our skilled professionals.",
      image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1920&q=80",
      ctaText: "Explore Services",
      ctaLink: "/services",
      color: "#27ae60"
    }
  ];

  // Initialize Flickity with enhanced options
  useEffect(() => {
    if (!flickityRef.current) {
      setTimeout(() => {
        flickityRef.current = new Flickity('.hero-carousel', {
          cellAlign: 'left',
          contain: true,
          wrapAround: true,
          autoPlay: 5000,
          pauseAutoPlayOnHover: true,
          selectedAttraction: 0.015,
          friction: 0.25,
          prevNextButtons: true,
          pageDots: true,
          adaptiveHeight: true,
          fade: true
        });
      }, 100);
    }
    return () => {
      if (flickityRef.current) {
        flickityRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="main">
      <Navbar />

      {/* Enhanced Hero Section */}
      <section className="hero-section">
        <div className="hero-carousel">
          {heroSlides.map((slide, index) => (
            <div key={index} className="carousel-cell">
              <div
                className="parallax-bg"
                style={{ backgroundImage: `url(${slide.image})` }}
              />
              <div className="carousel-content">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <h1>{slide.title}</h1>
                  <p>{slide.description}</p>
                  <div className="hero-buttons">
                    <Link
                      to={slide.ctaLink}
                      className="primary-button"
                      style={{ backgroundColor: slide.color }}
                    >
                      {slide.ctaText}
                    </Link>
                    <Link
                      to="/services"
                      className="secondary-button"
                    >
                      Browse Services
                    </Link>
                  </div>
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="services">
        <div className="section-header">
          <h2>Our Professional Services</h2>
          <p>Find the perfect service for your home needs</p>
        </div>

        <div className="services-grid">
          {serviceCategories.map((service, index) => (
            <motion.div
              key={index}
              className="service-card"
              onClick={() => navigateToService(service.name)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
            >
              <div className="service-icon">
                <i className={`fas ${service.icon}`}></i>
              </div>
              <h3>{service.name}</h3>
              <p className="service-desc">{service.description}</p>
              <button className="view-service-btn">View Services</button>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="view-all-services"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/services" className="view-all-btn">View All Services</Link>
        </motion.div>

        <div className="how-it-works">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Easy steps to get your service done</p>
          </div>

          <div className="steps-container">
            <motion.div
              className="step"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
            >
              <div className="step-icon">
                <i className="fas fa-search"></i>
              </div>
              <div className="step-number">1</div>
              <h3>Choose a Service</h3>
              <p>Browse through our wide range of professional services</p>
            </motion.div>
            <motion.div
              className="step"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
            >
              <div className="step-icon">
                <i className="fas fa-calendar-check"></i>
              </div>
              <div className="step-number">2</div>
              <h3>Book an Appointment</h3>
              <p>Select your preferred date and time for the service</p>
            </motion.div>
            <motion.div
              className="step"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
            >
              <div className="step-icon">
                <i className="fas fa-tools"></i>
              </div>
              <div className="step-number">3</div>
              <h3>Get it Done</h3>
              <p>Our verified professional will arrive and complete the task</p>
            </motion.div>
          </div>
        </div>

        <div className="review-section">
          <div className="section-header">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              What Our Happy Customers Say
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Trusted by thousands of satisfied customers
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <ReviewCard />
          </motion.div>
        </div>

       </div>

      <footer>
        <div className="footer-content">
          <div className="footer-section">
            <h4>About Fixly</h4>
            <p>We connect skilled professionals with customers looking for quality home services.</p>
            <div className="social-icons">
              <a href="#" aria-label="Facebook"><i className="fab fa-facebook"></i></a>
              <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
              <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
              <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin"></i></a>
            </div>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/tasker">Become a Provider</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Services</h4>
            <ul>
              {serviceCategories.map((service, index) => (
                <li key={index}>
                  <Link to={`/services?category=${service.name.toLowerCase()}`}>
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact Us</h4>
            <p><i className="fas fa-envelope"></i> support@fixly.com</p>
            <p><i className="fas fa-phone"></i> +91 9876543210</p>
            <p><i className="fas fa-map-marker-alt"></i> 123 Main Street, Mumbai, India</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>Made with <span role="img" aria-label="love">❤️</span> For India | © {new Date().getFullYear()} Fixly. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
