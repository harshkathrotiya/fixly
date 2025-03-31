import React, {useState} from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./login.css"

function Login() {
    const[email, setEmail] = useState("");
    const[passward, setPassward] = useState("");
    const[error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = (e) => {
      e.preventDefault();
      localStorage.setItem("token", "dummy-token"); // Simulating authentication
      navigate("/joblisting"); // Redirect to Job Listings
  };
  

    // const handleLogin = async(e) =>{
    //     e.preventDefault();
    //     setError("");

    //     try{
    //         const response = await axios.post("", {email, passward });

    //         if(response.data.success){
    //             navigate("/Home");
    //         }else{
    //             setError("Invalid email or passward");
    //         }
    //     }catch(error){
    //         setError("Error connecting to server");
    //     }
    // };

    return (
        <div className="login-container">
          <h2>Welcome Back</h2>
          {error ? <p className="error">{error}</p> : null}

          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required/>
            <input
              type="password"
              placeholder="Password"
              value={passward}
              onChange={(e) => setPassward(e.target.value)}
              required />
            <button type="submit">Sign In</button>

          </form>
          
          <div className="login-footer">
            <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
          </div>
        </div>
      );
}

export default Login;
