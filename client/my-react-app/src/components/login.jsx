// import React, { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import axios from "axios";
// import "./login.css";

// function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");  
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError("");

//     try {
//       const response = await axios.post("http://localhost:5000/api/auth/login", { 
//         email, 
//         password   
//       });

//       if (response.data.success) {
//         navigate("/joblisting");
//       } else {
//         setError(response.data.message || "Invalid email or password");
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || "Error connecting to server");
//     }
//   };

//   return (
//     <div className="login-container">
//       <h2>Welcome Back</h2>
//       {error && <p className="error">{error}</p>}

//       <form onSubmit={handleLogin}>
//         <input
//           type="email"
//           placeholder="Email Address"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           required
//         />
//         <input
//           type="password"
//           placeholder="Password"
//           value={password}   
//           onChange={(e) => setPassword(e.target.value)}
//           required
//         />
//         <button type="submit">Sign In</button>
//       </form>

//       <div className="login-footer">
//         <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
//       </div>
//     </div>
//   );
// }

// export default Login;


import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      if (response.data.success) {
        const token = response.data.token;

        // Save token to localStorage
        localStorage.setItem("authToken", token);

        // Navigate to protected route
        navigate("/services");
      } else {
        setError(response.data.message || "Invalid email or password");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error connecting to server");
    }
  };

  return (
    <div className="login-container">
      <h2>Welcome Back</h2>
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Sign In</button>
      </form>

      <div className="login-footer">
        <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
      </div>
    </div>
  );
}

export default Login;
