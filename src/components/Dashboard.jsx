import React, { useState } from "react";
import '../App.css';
import { Link } from "react-router-dom";    
import { Search, MousePointerClick, Target, Clock, BookOpen, MapPin, Phone, Mail } from "lucide-react";

function Dashboard() {
    // Handle image viewing
    const [showAll, setShowAll] = useState(false);
    const images = [...Array(9)];
    const visibleImages = showAll? images : images.slice(0,6);

    const features = [
    {
      icon: <MousePointerClick size={40} className="feature-icon" />,
      title: "Ease of Use",
      description:
        "The interface of the system is made simple and easy to use so that farmers can upload crop pictures or choose the symptoms easily. It has clear navigation, responsive design and step-by-step instructions, making it easy to use by users with minimum technical experience and have easy time interacting with it on desktop and mobile.",
    },
    {
      icon: <Target size={40} className="feature-icon" />,
      title: "Accuracy in Detection",
      description:
        "The system is based on the AI-driven model that allows distinguishing the types of crop diseases with precision, referring to the visible symptoms. It applies image recognition and machine learning models, which have been trained on a variety of datasets, to obtain credible answers, minimizes guesses, and helps make decisions, which are appropriate and timely in crop disease management using the obtained information.",
    },
    {
      icon: <Clock size={40} className="feature-icon" />,
      title: "Real-Time Feedback",
      description:
        "By posting an image, farmers are provided with immediate information on potential crop diseases. The system takes a short time to process input information and show likely diseases with the respective control strategies. This short-term response is effective in stopping the spread of diseases, so that, the loss of crops in real farming conditions is reduced.",
    },
    {
      icon: <BookOpen size={40} className="feature-icon" />,
      title: "Educational Support",
      description:
        "The system offers some educational material on how to prevent, control and the causes of diseases. It also incorporates elaborate descriptions, photos, and good farming suggestions and this will give farmers all the information to prevent in the future. This is a continuous learning strategy that facilitates agricultural resilience and long-term productivity.",
    },
    
  ];

    return (
        <>
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

                {/*Search bar*/ }
                <div className="search-bar-section">
                    <Search className="search-icon" size={18}></Search>
                    <input 
                    type="text"
                    placeholder="Search..."
                    className="search-bar" 
                    />
                </div>

            </div>
            <div className="header-section">
                <div className="heading">
                    <h1 className="main-heading">Crop Detect <span className="highlight">Online</span></h1> 
                </div>
                <div className="header-desc">
                    <p>
                        This system empowers small-scale farmers to detect and manage crop diseases effectively. 
                        By analyzing visible symptoms, it provides timely diagnostic guidance that promotes early 
                        intervention, healthier crops, and sustainable farming practices for improved food security.
                        Identify crop diseases quickly and accurately with our AI-powered diagnostic tool.
                    </p>
                </div>
            </div>
            <div className="crop-images">
                <h1 className="crop-image-types">Crop Diseases</h1>
                <div className="image-group-container">
                {visibleImages.map((_, index) => (
                    <img
                    key={index}
                    className="image-group"
                    src="/crop-images/00a7c269-3476-4d25-b744-44d6353cd921___GCREC_Bact.Sp 5807.JPG"
                    alt={`crop-image-${index + 1}`}
                    />
                ))}
                </div>
                {images.length > 6 && (
                    <button
                        className="view-more-btn"
                        onClick={() => setShowAll(!showAll)}>
                        {showAll ? "View Less" : "View More"}
                    </button>
                )}
            </div>

            <div className="features-section">
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
            <footer className="footer-section">
                <div className="footer-container">
                    <div className="logo-image-section">
                        <img src="/logo.png" alt="crop-detect-logo" className="logo-image"/>
                        <p className="logo">Crop Detect</p>
                    </div>
                    <div className="footer-description">
                        <p className="desc">
                            AI-Powered crop disease detection platform helping farmers improve productivity and protect yields.
                        </p>
                    </div>
                    <div className="footer-contacts">
                        <p><MapPin size={16} /> Nairobi, Kenya</p>
                        <p><Phone size={16} /> +254 725 000 004</p>
                        <p><Mail size={16} /> support@cropdetect.ai</p>
                    </div>
                </div>
                <div className="resources">
                    <Link to="/documentation">Documentation</Link>
                    <Link to="/ai-model">AI Model</Link>
                </div>
                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} Crop Detect. All rights reserved.</p>
                </div>
            </footer>
            </>
    )
}

export default Dashboard;