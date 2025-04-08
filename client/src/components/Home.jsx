import React, { useState, useEffect } from "react";
import "./Home.css";
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authcontext";
import heroimg from "./images/Designer.png";
import PainterImg from "./images/painter.png";
import PlumberImg from "./images/plumbing.png";
import CarpenterImg from "./images/carpentary.png";
import ElectricalImg from "./images/electrical.png";
import CleanerImg from "./images/cleaning.png";
import ReviewCard from "./review";
import Navbar from "./Navbar";

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Popular service categories with their images
  const serviceCategories = [
    { name: "Painting", image: PainterImg, description: "Professional painting for your home" },
    { name: "Cleaning", image: CleanerImg, description: "Deep cleaning by certified experts" },
    { name: "Plumbing", image: PlumberImg, description: "Fix leaks and plumbing issues" },
    { name: "Carpentry", image: CarpenterImg, description: "Custom furniture and repairs" },
    { name: "Electrical", image: ElectricalImg, description: "Safe and reliable electrical work" }
  ];
  
  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/services?search=${searchTerm}`);
  };
  
  const navigateToService = (serviceName) => {
    navigate(`/services?category=${serviceName.toLowerCase()}`);
  };
  
  return (
    <>
      <Navbar />
      
      <div className="main">
        <div className="hero">
          <div className="hero-text">
            <h1>Book Trusted Professionals for Home Services</h1>
            <p>Quality service providers at your doorstep. Book verified experts for all your home needs.</p>
            
            {/* Search bar for services */}
            <form className="search-form" onSubmit={handleSearch}>
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
            </form>
            
            {!user ? (
              <div className="cta-buttons">
                <Link to="/login" className="book-now">Book Now</Link>
                <Link to="/tasker" className="become-provider">Become a Provider</Link>
              </div>
            ) : (
              <Link to="/services" className="book-now">Explore Services</Link>
            )}
          </div>
          <img src={heroimg} alt="Home services illustration" className="hero-image" />
        </div>
      </div>

      <div className="services">
        <div className="section-header">
          <h2>Our Professional Services</h2>
          <p>Find the perfect service for your home needs</p>
        </div>

        <div className="box">
          {serviceCategories.map((service, index) => (
            <div 
              key={index} 
              className="box1" 
              onClick={() => navigateToService(service.name)}
            >
              <div className="service-icon">
                <img src={service.image} alt={`${service.name} services`} />
              </div>
              <h3>{service.name}</h3>
              <span className="service-desc">{service.description}</span>
              <button className="view-service-btn">View Services</button>
            </div>
          ))}
        </div>
        
        <div className="view-all-services">
          <Link to="/services" className="view-all-btn">View All Services</Link>
        </div>
        
        <div className="how-it-works">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Easy steps to get your service done</p>
          </div>
          
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Choose a Service</h3>
              <p>Browse through our wide range of professional services</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Book an Appointment</h3>
              <p>Select your preferred date and time for the service</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Get it Done</h3>
              <p>Our verified professional will arrive and complete the task</p>
            </div>
          </div>
        </div>

        <div className="review">
          <div className="section-header">
            <h2>What Our Happy Customers Say</h2>
            <p>Trusted by thousands of satisfied customers</p>
          </div>

          <ReviewCard />
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
