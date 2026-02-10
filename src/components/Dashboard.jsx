import React from "react";
import '../App.css';
import { Link } from "react-router-dom";    
import { Search } from "lucide-react";

function Dashboard() {


    return (
        <>
            <div className="nav-bar">
                <div className="logo-image-section">
                    <img src="/logo.png" alt="crop-detect-logo" className="logo-image"/>
                    <p className="logo">Crop Detect</p>
                </div>
                <div className="nav-links">
                    <a href="#about-section">About</a>
                    <Link to='/signin'>Sign In</Link>
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
            <div className="crop-diseases-section">
                <h2 className="crop-diseases">Crop Diseases</h2>
                <div className="images">
                    <img src="/crop-images/00a7c269-3476-4d25-b744-44d6353cd921___GCREC_Bact.Sp 5807.JPG" alt="Crop Diseases" className="image01"/>
                </div>
            </div>
        </>
    )
}

export default Dashboard;