import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './CreateListing.css';

function CreateListing() {
  const navigate = useNavigate();

  return (
    <div className="create-listing-page">
      <Navbar />
      
      <div className="create-listing-container">
        <div className="create-listing-header">
          <h1>Create New Service Listing</h1>
          <p>Choose how you'd like to create your service listing</p>
        </div>

        <div className="create-options">
          <div className="option-card" onClick={() => navigate('/provider/services/new')}>
            <div className="option-icon">
              <i className="fas fa-plus-circle"></i>
            </div>
            <h3>Create New Service</h3>
            <p>Create a brand new service listing from scratch</p>
          </div>

          <div className="option-card" onClick={() => alert('Template feature coming soon!')}>
            <div className="option-icon">
              <i className="fas fa-copy"></i>
            </div>
            <h3>Use Template</h3>
            <p>Start with a pre-built template for common services</p>
          </div>

          <div className="option-card" onClick={() => alert('Import feature coming soon!')}>
            <div className="option-icon">
              <i className="fas fa-file-import"></i>
            </div>
            <h3>Import from File</h3>
            <p>Import multiple services from a CSV or Excel file</p>
          </div>
        </div>

        <div className="back-button-container">
          <button className="back-button" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left"></i> Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateListing;