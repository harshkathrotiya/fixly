import React, { useState, useRef, useEffect } from "react";
import "./Home.css";
import { Link, useNavigate } from "react-router-dom";
import ReviewCard from "./review";
import Navbar from "./Navbar";
import { motion } from 'framer-motion';
import { useAuth } from "../context/AuthContext";

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

  // Hero slider image data with modern home service images
const sliderImages = [
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80", // Plumbing
  "https://images.unsplash.com/photo-1590959651373-a3db0f38a961?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80", // Electrical
  "https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80", // Cleaning
  "https://media.istockphoto.com/id/1313432202/photo/a-worker-installs-windows.webp?s=1024x1024&w=is&k=20&c=h3vOx1uzePhiiI3xpg9LaPDyZ9t_40SrUevhM4LDqbs=", // Carpentry
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80", // Painting
  "https://media.istockphoto.com/id/1186963521/photo/man-is-repairing-radiator-battery-in-the-room-maintenance-repair-works-renovation-in-the-flat.webp?a=1&b=1&s=612x612&w=0&k=20&c=5VDFAJdePfR037xt5b6NtZFb9iv_t55hgB1j1m44igA=", // HVAC
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80", // Landscaping
  "https://images.unsplash.com/photo-1662845851419-9b727124f29c?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGFwcGxpYW5jZSUyMHJlcGFpcnxlbnwwfHwwfHx8MA%3D%3D", // Appliance Repair
  "https://images.unsplash.com/photo-1600566752355-35792bedcfea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80", // Roofing
  "https://plus.unsplash.com/premium_photo-1743759708778-69f746d2bacc?q=80&w=3174&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"  // General Handyman
];


  return (
    <div className="main">
      <Navbar />

      {/* New 3D Carousel Hero Section */}
      <div className="banner">
        <div className="slider" style={{ "--quantity": sliderImages.length }}>
          {sliderImages.map((img, index) => (
            <div key={index} className="item" style={{ "--position": index + 1 }}>
              <img src={img} alt={`Home service ${index + 1}`} />
            </div>
          ))}
        </div>
        <div className="content">
          <h1 data-content="FIXLY">
            FIXLY
          </h1>
          <div className="author">
            <h2>HOME SERVICES</h2>
            <p><b>Professional & Reliable</b></p>
            <p>
              Find trusted professionals for all your home maintenance needs
            </p>
          </div>
          <div className="model"></div>
        </div>
      </div>

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
            <p><i className="fas fa-phone"></i> +91 9726988872</p>
            <p><i className="fas fa-map-marker-alt"></i> DAU, Gandhinagar</p>
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
