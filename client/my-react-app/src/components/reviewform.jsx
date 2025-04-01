import React, { useState } from "react";
import axios from "axios";

const ReviewForm = ({ onReviewSubmit }) => {
  const [name, setName] = useState("");
  const [text, setText] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newReview = { name, text };

    try {
      const response = await axios.post("http://localhost:5000/api/reviews", newReview);
      
      if (response.status === 201) {
        onReviewSubmit(newReview); // Update UI
        setName("");
        setText("");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="review-form">
      <input 
        type="text" 
        placeholder="Your Name" 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
        required 
      />
      <textarea 
        placeholder="Write your review..." 
        value={text} 
        onChange={(e) => setText(e.target.value)} 
        required 
      />
      <button type="submit">Submit Review</button>
    </form>
  );
};

export default ReviewForm;
