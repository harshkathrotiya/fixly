import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function home2(){
    return(
        <>
            <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 2rem", background: "#333", color: "#fff", fontSize: "1.2rem" }}>
                    <h2>Fixly</h2>
                    <div>
                      <Link to="/" style={{ marginRight: "15px", color: "white" }}>Home</Link>
                      <Link to="/joblisting" style={{ marginRight: "15px", color: "white" }}>Services</Link>
                      <Link to="/appointments" style={{ marginRight: "15px", color: "white" }}>Appointments</Link>
                      <button onClick={handleLogout} style={{ background: "red", color: "white", border: "none", padding: "5px 10px", cursor: "pointer" }}>
                        Logout
                      </button>
                    </div>
            </nav>
        </>
    )
}