import React from "react";
import { useNavigate } from "react-router-dom";

function AuthChoice() {
  const navigate = useNavigate();

  return (
    
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "400px",
      }}
    >
      <div
        style={{
          width: "300px",
          padding: "20px",
          textAlign: "center",
          border: "2px solid grey",
          borderRadius: "10px",
          backgroundColor: "#f5f5f5",
          height: "250px",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h2 style={{ fontSize: "24px", color: "#333", marginBottom: "20px" }}>
          Fixly
        </h2>
        <button
          style={{
            width: "80%",
            padding: "10px",
            marginBottom: "10px",
            margin: "10px",
            fontSize: "16px",
            backgroundColor: "#1F2938",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={() => navigate("/login")}
        >
          Login
        </button>
        <button
          style={{
            width: "80%",
            padding: "10px",
            fontSize: "16px",
            backgroundColor: "#1F2938",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            margin: "10px",
          }}
          onClick={() => navigate("/signup")}
        >
          Sign up
        </button>
        <p style={{paddingTop:"20px"}}>By signing up you agree to our Terms of Use and Privacy Policy.</p>
      </div>
    </div>
   
  );
}

export default AuthChoice;
