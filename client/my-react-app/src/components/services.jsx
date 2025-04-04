import React, { useState } from "react";
import "./services.css";
import PlumberImg from "./images/plumbing.png";
import { useNavigate } from "react-router-dom";

const services = {
  Plumbing: [
    { title: "Pipe Repair", description: "Fix broken or leaking pipes efficiently and affordably.", image: PlumberImg },
    { title: "Leak Fixing", description: "Detect and repair leaks to prevent water damage and save costs.", image: PlumberImg },
    { title: "Drain Cleaning", description: "Unclog and clean drains for a smooth and hassle-free plumbing system.", image: PlumberImg },
    { title: "Water Heater Installation", description: "Install and maintain water heaters for reliable hot water supply.", image: PlumberImg },
    { title: "Toilet Repair", description: "Fix running, leaking, or clogged toilets with expert solutions.", image: PlumberImg },
  ],
  Cleaning: [
    { title: "Home Deep Cleaning", description: "Thorough cleaning for every corner of your home, ensuring freshness.", image: PlumberImg },
    { title: "Carpet Cleaning", description: "Remove stains, dirt, and allergens for a fresh and clean carpet.", image: PlumberImg },
    { title: "Window Washing", description: "Streak-free and spotless windows with professional washing services.", image: PlumberImg },
    { title: "Office Cleaning", description: "Keep your workspace tidy and hygienic for better productivity.", image: PlumberImg },
    { title: "Bathroom Sanitization", description: "Deep clean and disinfect bathrooms for a germ-free environment.", image: PlumberImg },
  ],
  Painting: [
    { title: "Interior Painting", description: "Transform your interiors with high-quality paints and expert painters.", image: PlumberImg },
    { title: "Exterior Painting", description: "Durable and weather-resistant paintwork for your home's exterior.", image: PlumberImg },
    { title: "Wallpaper Installation", description: "Upgrade your walls with stylish and seamless wallpaper installation.", image: PlumberImg },
    { title: "Furniture Painting", description: "Give your furniture a fresh, vibrant look with professional painting.", image: PlumberImg },
    { title: "Wall Art & Murals", description: "Custom murals and artistic designs for personalized wall decor.", image: PlumberImg },
  ],
  Carpentry: [
    { title: "Furniture Assembly", description: "Assemble desks, bookcases, and more quickly and efficiently.", image: PlumberImg },
    { title: "Custom Shelving", description: "Design and install shelves tailored to your space and needs.", image: PlumberImg },
    { title: "Door Repairs", description: "Fix misaligned or broken doors for smooth functionality.", image: PlumberImg },
    { title: "Wooden Flooring", description: "Install and maintain stylish wooden flooring for a premium look.", image: PlumberImg },
    { title: "Cabinet Installation", description: "Upgrade your kitchen or storage with expertly fitted cabinets.", image: PlumberImg },
  ],
  Electrical: [
    { title: "Light Fixture Installation", description: "Install elegant lighting solutions to brighten up your space.", image: PlumberImg },
    { title: "Wiring Repair", description: "Fix faulty wiring to ensure safety and prevent electrical hazards.", image: PlumberImg },
    { title: "Outlet Installation", description: "Install new power outlets for convenient electrical access.", image: PlumberImg },
    { title: "Ceiling Fan Installation", description: "Expertly mount and wire ceiling fans for comfort and efficiency.", image: PlumberImg },
    { title: "Electric Panel Upgrade", description: "Upgrade your home's electrical panel for improved performance.", image: PlumberImg },
  ],
  Gardening: [
    { title: "Lawn Mowing", description: "Keep your lawn neat and healthy with professional mowing services.", image: PlumberImg },
    { title: "Hedge Trimming", description: "Shape and maintain your hedges for a well-manicured garden.", image: PlumberImg },
    { title: "Garden Design", description: "Create a beautiful and sustainable garden with expert design.", image: PlumberImg },
    { title: "Tree Pruning", description: "Trim trees properly to promote healthy growth and aesthetics.", image: PlumberImg },
    { title: "Irrigation System Setup", description: "Install efficient irrigation for a thriving and water-efficient garden.", image: PlumberImg },
  ],
};

const majorCategories = ["Plumbing", "Cleaning", "Painting", "Carpentry", "Electrical", "Gardening"];

const Services = () => {
  const [selectedCategory, setSelectedCategory] = useState("Plumbing");

  const navigate = useNavigate();

const handleBookNow = (category) => {
  navigate(`/service-providers?category=${category}`);
};


  return (
    <div className="service-container">
      <h1>Choose a Service Category</h1>
      <div className="major-category-section">
        <select onChange={(e) => setSelectedCategory(e.target.value)}>
          {majorCategories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>
      <div className="service-list rectangle">
        {services[selectedCategory].map((service, index) => (
          <div key={index} className="service-card">
            <img src={service.image} alt={service.title} className="service-image" />
            <h3>{service.title}</h3>
            <p>{service.description}</p>
            <button className="book-now" onClick={() => handleBookNow(selectedCategory)}>
           Book Now
              </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Services;