import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./Login.css";

const Login = () => {
  const [user, setuser] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    console.log(user,password);
    try {
       const response = await fetch('https://cube-backend-service.onrender.com/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ "user":user, "password":password }),
    });

    const result = await response.json();
      if (response.ok && result.success) {
        navigate("/home"); 
      } else {
        setError(result.message || "Login failed. Try again.");
      }
    } catch (err) {
      setError("Server error. Please try later.");
    }
  };

  return (
    <div className="container">
      <form className="signin-form" onSubmit={handleSignIn}>
        <h2>Sign In</h2>
        <label htmlFor="user">Enter Employee ID</label>
        <input
          id="user"
          type="text"
          value={user}
          onChange={(e) => setuser(e.target.value)}
          placeholder="1234567"
          required
        />
        <label htmlFor="password">Enter Password</label>
        <div className="password-wrapper">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button
            type="button"
            className="toggle-visibility"
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
            style={{ cursor: "pointer",border : "none", background: "transparent", outline: "none" }}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <FaEyeSlash />  : <FaEye />   }
          </button>
        </div>
        <button type="submit" className="signin-btn">
          Sign In
        </button>
        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
};

export default Login;
