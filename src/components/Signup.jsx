import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Signup.css";


function SignUp() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <div className="signup-page">
      <div className="signup-container">

        <h2>Create Account</h2>
        <p className="signup-subtitle">
          Join Crop Detect and protect your crops with AI.
        </p>

        <form onSubmit={handleSubmit} className="signup-form">

          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <button type="submit" className="signup-btn">
            Sign Up
          </button>
        </form>

        <p className="signin-link">
          Already have an account? <Link to="/signin">Sign In</Link>
        </p>

      </div>
    </div>
  );
}

export default SignUp;