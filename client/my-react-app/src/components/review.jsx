// import React, { useState } from "react";
// import "./review.css";

// const ReviewCard = () =>{
//     const initialReviews = [
//         { name: "Piyush Jha", text: "Vitalii assembled the IKEA Norli drawer chest for me..." },
//         { name: "Devangi Patel", text: "David did an awesome job assembling crib and dresser for nursery..." },
//         { name: "Anant Shah", text: "I hired Joe to patch 2 holes on my wall and 1 hole on my ceiling..."},
//         { name: "Aarav Sharma", text: "Aleksandr was fantastic! He came with all the equipment to do the job..."},
//         { name: "Nilesh khunt", text: "Michael did a great job helping us install frameless glass hinged shower doors..."},
//         { name: "Dhruv Pansuriya", text: "Jose fixed my AC drain line which was clogging my master bathroom sink..."},
//       ];

      
//         const[reviews, setReviews] = useState(initialReviews);

//         const addReview = (newReview) =>{
//             const updateReviews = [...reviews, newReview];

//             if(updateReviews.length > 7){
//                 updateReviews.shift();
//             }

//             setReviews(updateReviews);
//        };

//        return (
//             <div>
//                 <div className="reviewbox">
//                     {reviews.map((review, index) =>(
//                         <div key={index} className="review-card">
//                             <h2 className="name">{review.name}</h2>
//                             <p>{review.text}</p>
//                         </div>
//                     ))}
//                 </div>
//           </div>
        
//     );
      
    
// };

// export default ReviewCard;


import React, { useEffect, useState } from "react";
import axios from "axios";
import "./review.css";

const ReviewCard = () => {
  const [reviews, setReviews] = useState([]);

  // Fetch latest reviews from backend
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/reviews");
        setReviews(response.data.slice(-6)); // Keep latest 6 reviews
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
  }, []);

  return (
    <div className="reviewbox">
      {reviews.map((review, index) => (
        <div key={index} className="review-card">
          <h2 className="name">{review.name}</h2>
          <p>{review.text}</p>
        </div>
      ))}
    </div>
  );
};

export default ReviewCard;

