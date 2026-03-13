import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Signin.css";

import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";

import { auth, googleProvider } from "../firebase";

const ADMIN_EMAILS = ["admin@cropdetect.ai"];

const IconEye = ({ off }) => off ? (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
) : (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const IconGoogle = () => (
  <svg viewBox="0 0 24 24" width="18" height="18">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const IconShield = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

/* Error messages  */
function friendlyError(code) {
  const map = {
    "auth/user-not-found":         "No account found with this email address.",
    "auth/wrong-password":         "Incorrect password. Please try again.",
    "auth/invalid-credential":     "Incorrect email or password.",
    "auth/email-already-in-use":   "This email is already registered. Try signing in instead.",
    "auth/weak-password":          "Password must be at least 6 characters.",
    "auth/invalid-email":          "Please enter a valid email address.",
    "auth/too-many-requests":      "Too many attempts. Please wait a moment and try again.",
    "auth/popup-closed-by-user":   "Google sign-in was cancelled.",
    "auth/network-request-failed": "Network error. Check your connection and try again.",
    "admin/not-authorized":        "This account does not have admin privileges.",
  };
  return map[code] || "Something went wrong. Please try again.";
}

/* Component */
export default function Signin() {
  const navigate = useNavigate();

  // "signin" | "signup" | "admin"
  const [tab,      setTab]      = useState("signin");
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const [formData, setFormData] = useState({
    fullName: "", email: "", password: "", confirmPassword: "",
  });

  const [adminEmail,    setAdminEmail]    = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminPass, setShowAdminPass] = useState(false);

  const handleChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const switchTab = (id) => { setTab(id); setError(""); };

  const isAdmin  = tab === "admin";
  const isSignUp = tab === "signup";

  /* Google sign-in (user only) */
  const handleGoogleLogin = async () => {
    setLoading(true); setError("");
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      // Block Google sign-in for admin email — admins must use password
      if (ADMIN_EMAILS.includes(cred.user.email)) {
        await signOut(auth);
        setError("Admin accounts must sign in with email and password.");
        setLoading(false);
        return;
      }
      navigate("/ai-model");
    } catch (err) {
      setError(friendlyError(err.code));
    }
    setLoading(false);
  };

  /* User sign-in / sign-up */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (isSignUp && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match."); return;
    }
    setLoading(true);
    try {
      if (isSignUp) {
        const cred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        await updateProfile(cred.user, { displayName: formData.fullName });
      } else {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
      }
      navigate("/ai-model");
    } catch (err) {
      setError(friendlyError(err.code));
    }
    setLoading(false);
  };

  /* Admin sign-in */
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);

      if (!ADMIN_EMAILS.includes(cred.user.email)) {
        await signOut(auth);
        setError(friendlyError("admin/not-authorized"));
        setLoading(false);
        return;
      }

      navigate("/admin");
    } catch (err) {
      setError(friendlyError(err.code));
    }
    setLoading(false);
  };

  /* Render */
  return (
    <div className="si-page">
      <div className="si-form-panel">
        <div className="si-card">

          {/* 3-tab toggle */}
          <div className={`si-mode-toggle ${isAdmin ? "si-mode-toggle--admin-active" : ""}`}>
            <button
              type="button"
              className={`si-mode-btn ${tab === "signin" ? "si-mode-btn--active" : ""}`}
              onClick={() => switchTab("signin")}
            >Sign In</button>

            <button
              type="button"
              className={`si-mode-btn ${tab === "signup" ? "si-mode-btn--active" : ""}`}
              onClick={() => switchTab("signup")}
            >Create Account</button>

            <button
              type="button"
              className={`si-mode-btn si-mode-btn--admin-tab ${tab === "admin" ? "si-mode-btn--admin-tab-active" : ""}`}
              onClick={() => switchTab("admin")}
            >
              <span className="si-tab-shield"><IconShield /></span>
              Admin
            </button>
          </div>

          {/* Heading */}
          <h1 className="si-heading">
            {isAdmin  ? "Admin Portal"    :
             isSignUp ? "Join CropDetect" : "Welcome back"}
          </h1>
          <p className="si-sub">
            {isAdmin  ? "Restricted access. Authorised administrators only."  :
             isSignUp ? "Create your account to start protecting your crops." :
                        "Sign in to your account to continue."}
          </p>

          {/* Admin trust badge */}
          {isAdmin && (
            <div className="si-admin-badge">
              <IconShield />
              <span>Access is restricted to authorised admin accounts only.</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className={`si-error ${isAdmin ? "si-error--admin-variant" : ""}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Admin form */}
          {isAdmin && (
            <form onSubmit={handleAdminLogin} className="si-form" noValidate>
              <div className="si-field">
                <label htmlFor="adminEmail">Admin Email</label>
                <input
                  id="adminEmail"
                  type="email"
                  placeholder="admin@cropdetect.ai"
                  value={adminEmail}
                  onChange={e => setAdminEmail(e.target.value)}
                  required
                  autoComplete="username"
                  className="si-input--admin"
                />
              </div>

              <div className="si-field">
                <label htmlFor="adminPassword">Admin Password</label>
                <div className="si-pass-wrap">
                  <input
                    id="adminPassword"
                    type={showAdminPass ? "text" : "password"}
                    placeholder="••••••••"
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="si-input--admin"
                  />
                  <button
                    type="button"
                    className="si-pass-toggle"
                    onClick={() => setShowAdminPass(p => !p)}
                    aria-label={showAdminPass ? "Hide password" : "Show password"}
                  >
                    <IconEye off={showAdminPass} />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className={`si-submit si-submit--admin ${loading ? "si-submit--loading" : ""}`}
                disabled={loading}
              >
                {loading
                  ? <><span className="si-spinner si-spinner--light" /> Verifying…</>
                  : <><IconShield /> Access Admin Dashboard</>
                }
              </button>
            </form>
          )}

          {/* User sign-in / sign-up forms */}
          {!isAdmin && (
            <>
              <form onSubmit={handleSubmit} className="si-form" noValidate>
                {isSignUp && (
                  <div className="si-field">
                    <label htmlFor="fullName">Full Name</label>
                    <input
                      id="fullName" type="text" name="fullName"
                      placeholder="e.g. James Mwangi"
                      value={formData.fullName} onChange={handleChange}
                      required autoComplete="name"
                    />
                  </div>
                )}

                <div className="si-field">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email" type="email" name="email"
                    placeholder="you@example.com"
                    value={formData.email} onChange={handleChange}
                    required autoComplete="email"
                  />
                </div>

                <div className="si-field">
                  <label htmlFor="password">Password</label>
                  <div className="si-pass-wrap">
                    <input
                      id="password"
                      type={showPass ? "text" : "password"}
                      name="password" placeholder="••••••••"
                      value={formData.password} onChange={handleChange}
                      required autoComplete={isSignUp ? "new-password" : "current-password"}
                    />
                    <button
                      type="button" className="si-pass-toggle"
                      onClick={() => setShowPass(p => !p)}
                      aria-label={showPass ? "Hide password" : "Show password"}
                    >
                      <IconEye off={showPass} />
                    </button>
                  </div>
                </div>

                {isSignUp && (
                  <div className="si-field">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <div className="si-pass-wrap">
                      <input
                        id="confirmPassword"
                        type={showConf ? "text" : "password"}
                        name="confirmPassword" placeholder="••••••••"
                        value={formData.confirmPassword} onChange={handleChange}
                        required autoComplete="new-password"
                      />
                      <button
                        type="button" className="si-pass-toggle"
                        onClick={() => setShowConf(p => !p)}
                        aria-label={showConf ? "Hide password" : "Show password"}
                      >
                        <IconEye off={showConf} />
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className={`si-submit ${loading ? "si-submit--loading" : ""}`}
                  disabled={loading}
                >
                  {loading
                    ? <><span className="si-spinner" /> {isSignUp ? "Creating account…" : "Signing in…"}</>
                    : isSignUp ? "Create Account" : "Sign In"
                  }
                </button>
              </form>

              <div className="si-divider"><span>or continue with</span></div>

              <button
                type="button"
                className="si-google"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <IconGoogle />
                <span>Sign in with Google</span>
              </button>

              <p className="si-footer-toggle">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}
                {" "}
                <button
                  type="button"
                  className="si-toggle-link"
                  onClick={() => switchTab(isSignUp ? "signin" : "signup")}
                >
                  {isSignUp ? "Sign In" : "Create one"}
                </button>
              </p>
            </>
          )}

        </div>
      </div>
    </div>
  );
}