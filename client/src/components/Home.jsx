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

  // Hero slides data
  const heroSlides = [
    {
      title: "Expert Home Services at Your Doorstep",
      description: "Connect with skilled professionals for all your home repair and maintenance needs. Fast, reliable, and affordable.",
      image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
      ctaText: "Book Now",
      ctaLink: "/services",
      color: "#4a90e2"
    },
    {
      title: "Quality Electrical & Plumbing Services",
      description: "From minor repairs to major installations, our verified experts deliver top-notch service with guaranteed workmanship.",
      image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
      ctaText: "Find Experts",
      ctaLink: "/services",
      color: "#2d9cdb"
    },
    {
      title: "Transform Your Living Space",
      description: "Professional painting, renovation, and interior design services to make your home beautiful and comfortable.",
      image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1769&q=80",
      ctaText: "Explore Services",
      ctaLink: "/services",
      color: "#27ae60"
    }
  ];

  // Initialize Flickity slider
  useEffect(() => {
    // Initialize Flickity on hero slider
    if (!flickityRef.current) {
      // Initialize with a slight delay to ensure DOM is ready
      setTimeout(() => {
        flickityRef.current = new Flickity('.hero-carousel', {
          cellAlign: 'left',
          contain: false,
          wrapAround: true,
          autoPlay: 6000,
          pauseAutoPlayOnHover: true,
          prevNextButtons: true,
          pageDots: true,
          draggable: true,
          fade: true,
          adaptiveHeight: false,
          fullscreen: false,
          selectedAttraction: 0.1,
          friction: 0.6,
          imagesLoaded: true,
          arrowShape: {
            x0: 10,
            x1: 60, y1: 50,
            x2: 65, y2: 45,
            x3: 20
          }
        });

        // Initialize Flickity events after it's created
        flickityRef.current.on('change', (index) => {
          // Animate progress bar
          const progressBar = document.querySelector('.progress-bar');
          if (progressBar) {
            progressBar.style.width = '0%';
            progressBar.style.transition = 'none';
            setTimeout(() => {
              progressBar.style.width = '100%';
              progressBar.style.transition = 'width 6000ms linear';
            }, 50);
          }
        });

        // Start progress bar animation
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
          progressBar.style.width = '100%';
          progressBar.style.transition = 'width 6000ms linear';
        }
      }, 100);
    }

    // Cleanup function
    return () => {
      if (flickityRef.current) {
        flickityRef.current.destroy();
        flickityRef.current = null;
      }
    };
  }, []);

  // Replace the existing hero section with this:
  return (
    <>
      <Navbar />
      <div className="main">
        {/* Hero Section with Flickity Carousel */}
        <div className="hero-section">
          <div className="hero-carousel">
            <div className="progress-bar-container">
              <div className="progress-bar"></div>
            </div>
            {heroSlides.map((slide, index) => (
              <div className="carousel-cell" key={index}>
                <div className="slide-background" style={{
                  backgroundImage: `url(${slide.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}></div>
                <div className="overlay" style={{
                  background: `linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 100%)`
                }}></div>
                <div className="carousel-content">
                  <div className="slide-accent" style={{ backgroundColor: slide.color }}></div>
                  <div className="hero-text">
                    <motion.h1
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.6 }}
                    >
                      {slide.title}
                    </motion.h1>
                    <motion.p
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    >
                      {slide.description}
                    </motion.p>

                    <motion.form
                      className="search-form"
                      onSubmit={handleSearch}
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                    >
                      <div className="search-container">
                        <input
                          type="text"
                          placeholder="What service do you need?"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="search-input"
                        />
                        <button type="submit" className="search-button">
                          <i className="fas fa-search"></i> Search
                        </button>
                      </div>
                    </motion.form>

                    <motion.div
                      className="cta-container"
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                    >
                      {!user ? (
                        <div className="cta-buttons">
                          <Link to="/login" className="book-now" style={{ backgroundColor: slide.color }}>Book Now</Link>
                          <Link to="/tasker" className="become-provider">Become a Provider</Link>
                        </div>
                      ) : (
                        <Link to={slide.ctaLink} className="book-now" style={{ backgroundColor: slide.color }}>{slide.ctaText}</Link>
                      )}
                    </motion.div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
            <p><i className="fas fa-phone"></i> +91 9876543210</p>
            <p><i className="fas fa-map-marker-alt"></i> 123 Main Street, Mumbai, India</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>Made with <span role="img" aria-label="love">❤️</span> For India | © {new Date().getFullYear()} Fixly. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
};

export default Home;
