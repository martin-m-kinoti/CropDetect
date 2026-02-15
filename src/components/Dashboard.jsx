import React, { useState, useMemo, useCallback } from "react";
import '../App.css';
import { Link } from "react-router-dom";    
import { Search, MousePointerClick, Target, Clock, BookOpen, MapPin, Phone, Mail } from "lucide-react";

function Dashboard() {

    /* ---------------- SEARCH LOGIC ---------------- */

    const SEARCHABLE_CONTENT = [
        { title: "Crop Diseases Gallery", description: "View crop diseases", ref: "crop-diseases-gallery" },
        { title: "System Features", description: "Learn about system capabilities", ref: "features-section" },
        { title: "AI Model", description: "Upload crop image for detection", ref: "ai-model" },
        { title: "Documentation", description: "View system documentation", ref: "documentation" },
        { title: "Contacts", description: "View contact info", ref: "footer-contacts" }
    ];

    const [searchQuery, setSearchQuery] = useState("");

    const filteredResults = useMemo(() =>
        SEARCHABLE_CONTENT.filter(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase())
        ),
    [searchQuery]);

    const handleSearchClick = useCallback((refId) => {
        if (refId === "ai-model" || refId === "documentation") {
            window.location.href = `/${refId}`;
            return;
        }

        const element = document.getElementById(refId);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }

        setSearchQuery("");
    }, []);

    /* ---------------- IMAGE GALLERY LOGIC ---------------- */

    const CROP_IMAGES = [
        { src: "/crop-images/Bacterial Spot.JPG", label: "Bacterial Spot" },
        { src: "/crop-images/Early Blight.JPG", label: "Early Blight" },
        { src: "/crop-images/Healthy.JPG", label: "Healthy" },
        { src: "/crop-images/Late Blight.JPG", label: "Late Blight" },
        { src: "/crop-images/Leaf Mold.JPG", label: "Leaf Mold" },
        { src: "/crop-images/Mosaic Virus.JPG", label: "Mosaic Virus" },
        { src: "/crop-images/Septoria Leaf Spot.JPG", label: "Septoria Leaf Spot" },
        { src: "/crop-images/Spider Mites.JPG", label: "Spider Mites" },
        { src: "/crop-images/Target Spot.JPG", label: "Target Spot" },
        { src: "/crop-images/Yellow Leaf Curl Virus.JPG", label: "Yellow Leaf Curl Virus" }
    ];

    const [showAll, setShowAll] = useState(false);
    const visibleImages = showAll ? CROP_IMAGES : CROP_IMAGES.slice(0, 6);

    /* ---------------- ORIGINAL FEATURES ---------------- */

    const features = [
        {
          icon: <MousePointerClick size={40} className="feature-icon" />,
          title: "Ease of Use",
          description:
            "The interface of the system is made simple and easy to use so that farmers can upload crop pictures or choose the symptoms easily."
        },
        {
          icon: <Target size={40} className="feature-icon" />,
          title: "Accuracy in Detection",
          description:
            "AI-driven model trained on diverse datasets to ensure reliable classification."
        },
        {
          icon: <Clock size={40} className="feature-icon" />,
          title: "Real-Time Feedback",
          description:
            "Instant disease detection results with control strategies."
        },
        {
          icon: <BookOpen size={40} className="feature-icon" />,
          title: "Educational Support",
          description:
            "Provides prevention strategies and disease management guidance."
        },
    ];

    return (
        <>
            {/* ---------------- NAVBAR ---------------- */}
            <div className="nav-bar">
                <div className="logo-image-section">
                    <img src="/logo.png" alt="crop-detect-logo" className="logo-image"/>
                    <p className="logo">Crop Detect</p>
                </div>

                <div className="nav-links">
                    <Link to="documentation">Documentation</Link>
                    <Link to='/signup'>Sign Up</Link>
                    <Link to="/ai-model">AI Model</Link>
                </div>

                {/* -------- UPDATED SEARCH BAR -------- */}
                <div className="search-bar-section">
                    <Search className="search-icon" size={18} />
                    <input 
                        type="text"
                        placeholder="Search..."
                        className="search-bar"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    {searchQuery && (
                        <div className="search-results">
                            {filteredResults.length > 0 ? (
                                filteredResults.map((item, index) => (
                                    <div
                                        key={index}
                                        className="search-item"
                                        onClick={() => handleSearchClick(item.ref)}
                                    >
                                        <div className="search-title">{item.title}</div>
                                        <div className="search-desc">{item.description}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="search-item">No results found</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ---------------- HEADER ---------------- */}
            <div className="header-section">
                <div className="heading">
                    <h1 className="main-heading">
                        Crop Detect <span className="highlight">Online</span>
                    </h1> 
                </div>
                <div className="header-desc">
                    <p>
                        AI-powered crop disease detection system for small-scale farmers.
                    </p>
                </div>
            </div>

            {/* -------- UPDATED IMAGE GALLERY -------- */}
            <div 
                className="crop-images" 
                id="crop-diseases-gallery"
            >
                <h1 className="crop-image-types">Crop Diseases</h1>

                <div className="image-group-container">
                    {visibleImages.map((img, index) => (
                        <div key={index} className="image-wrapper">
                            <img
                                className="image-group"
                                src={img.src}
                                alt={img.label}
                                loading={index >= 6 ? "lazy" : "eager"}
                            />
                            <div className="image-label">{img.label}</div>
                        </div>
                    ))}
                </div>

                {CROP_IMAGES.length > 6 && (
                    <button
                        className="view-more-btn"
                        onClick={() => setShowAll(!showAll)}
                    >
                        {showAll ? "View Less" : "View More"}
                    </button>
                )}
            </div>

            {/* ---------------- FEATURES ---------------- */}
            <div className="features-section" id="features-section">
                <h2 className="features-title">System Features</h2>
                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div key={index} className="feature-card">
                            {feature.icon}
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ---------------- FOOTER ---------------- */}
            <footer className="footer-section">
                <div className="footer-container">
                    <div className="logo-image-section">
                        <img src="/logo.png" alt="crop-detect-logo" className="logo-image"/>
                        <p className="logo">Crop Detect</p>
                    </div>

                    <div className="footer-contacts" id="footer-contacts">
                        <p><MapPin size={16} /> Nairobi, Kenya</p>
                        <p><Phone size={16} /> +254 725 000 004</p>
                        <p><Mail size={16} /> support@cropdetect.ai</p>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} Crop Detect. All rights reserved.</p>
                </div>
            </footer>
        </>
    );
}

export default Dashboard;