import React, { use, useState } from "react";
import { Link } from "react-router-dom";
import './Signin.css';

function SignIn() {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Login data:", formData);
    };

    return (
        <div className="signin-page">
      <div className="signin-container">

        <h2>Welcome Back</h2>
        <p className="signin-subtitle">
          Sign in to continue using Crop Detect.
        </p>

        <form onSubmit={handleSubmit} className="signin-form">

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

          <div className="signin-options">
            <label>
              <input type="checkbox" />
              Remember me
            </label>

            <Link to="/forgot-password" className="forgot-link">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="signin-btn">
            Sign In
          </button>
        </form>

        <p className="signup-link">
          Don't have an account? <Link to="/signup">Create one</Link>
        </p>

      </div>
    </div>
    );
}

export default SignIn;