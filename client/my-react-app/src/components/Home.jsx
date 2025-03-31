import { useState } from "react";
import "./Home.css";
import { Link } from "react-router-dom";
import heroimg from "./images/Designer.png";
import PainterImg from "./images/painter.png";
import PlumberImg from "./images/plumbing.png";
import CarpenterImg from "./images/carpentary.png";
import ElectricalImg from "./images/electrical.png";
import CleanerImg from "./images/cleaning.png";
import ReviewCard from "./review";
import { useNavigate } from "react-router-dom";


const Home = () => {
    return(
      <>
      <div className="navbar">
      <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
        <h1>Fixly</h1>
      </Link>
      <div className="nav-links">
        {location.pathname !== '/' && (
          <Link to="/" className="btn home">Home</Link>
        )}
        {!location.pathname.includes('/login') && (
          <Link to="/login" className="btn login">Login</Link>
        )}
        {!location.pathname.includes('/signup') && (
          <Link to="/signup" className="btn signup">Sign up</Link>
        )}
        {!location.pathname.includes('/tasker') && (
          <Link to="/tasker" className="btn tasker">Become a Tasker</Link>
        )}
      </div>
    </div>
    
    <div className="main">
      <div className="hero">
        <div className="hero-text">
          <h1>Book Trusted Professionals for Home Services</h1>
          <p>Quality service providers at your doorstep. Book verified experts for all your home needs.</p>
          <Link to="/Login" className="book-now">Book Now</Link>
        </div>
        <img src={heroimg} alt="Home services illustration" />
      </div>
    </div>


    <div className="services">
      <div>
        <h3>Our Professional Services</h3>
      </div>

      <div className="box">
        <div className="box1">
          <img src={PainterImg} alt="Painting services" />
          <p>Painting</p>
          <span className="service-desc">Professional painting for your home</span>
        </div>
        <div className="box1">
          <img src={CleanerImg} alt="Cleaning services" />
          <p>Cleaning</p>
          <span className="service-desc">Deep cleaning by certified experts</span>
        </div>
        <div className="box1">
          <img src={PlumberImg} alt="Plumbing services" />
          <p>Plumbing</p>
          <span className="service-desc">Fix leaks and plumbing issues</span>
        </div>
        <div className="box1">
          <img src={CarpenterImg} alt="Carpentry services" />
          <p>Carpentry</p>
          <span className="service-desc">Custom furniture and repairs</span>
        </div>
        <div className="box1">
          <img src={ElectricalImg} alt="Electrical services" />
          <p>Electrical</p>
          <span className="service-desc">Safe and reliable electrical work</span>
        </div>
      </div> 


      <div className="review">
        <div>
          <h3>What Our Happy Customers Say</h3>
        </div>

        <ReviewCard />
      </div>

      <footer>
        <div className="footer-content">
          <div className="footer-section">
            <h4>About Us</h4>
            <p>We connect skilled professionals with customers looking for quality home services.</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/">Services</Link></li>
              <li><Link to="/tasker">Become a Tasker</Link></li>
              <li><Link to="/login">Login</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact Us</h4>
            <p>Email: support@fixly.com</p>
            <p>Phone: +91 9876543210</p>
          </div>
        </div>
        <div className="last">
          <p>Made with {"\u2764\uFE0F"} For India | © 2025 Fixly</p>
        </div>
      </footer>



    </div>

      
      </>
    )

};


export default Home;
