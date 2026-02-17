import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Signin.css"; // Using original Signin CSS

import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

import { auth, googleProvider } from "../firebase";

function Signin() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError("");
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/ai-model");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isSignUp) {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

        await updateProfile(userCredential.user, {
          displayName: formData.fullName,
        });

        navigate("/ai-model");
      } catch (err) {
        setError(err.message);
      }
    } else {
      try {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        navigate("/ai-model");
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="signin-page">
      <div className="signin-container">
        <h2>{isSignUp ? "Create Account" : "Welcome Back"}</h2>
        <p className="signin-subtitle">
          {isSignUp
            ? "Join Crop Detect and protect your crops with AI."
            : "Sign in to continue using Crop Detect."}
        </p>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit} className="signin-form">
          {isSignUp && (
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          )}

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

          {isSignUp && (
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          )}

          {!isSignUp && (
            <div className="signin-options">
              <label>
                <input type="checkbox" />
                Remember me
              </label>

              <span className="forgot-link">Forgot password?</span>
            </div>
          )}

          <button type="submit" className="signin-btn">
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>

          <button
            type="button"
            className="google-signin"
            onClick={handleGoogleLogin}
          >
            Sign in with Google
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signin;
