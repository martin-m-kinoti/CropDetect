import React, { useState, useMemo, useCallback } from "react";
import "./Dashboard.css";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Phone,
  Mail,
  Microscope,
  Zap,
  Pill,
  BarChart2,
  Smartphone,
  Lock,
} from "lucide-react";


const SEARCHABLE_CONTENT = [
  { title: "Crop Diseases Gallery", description: "View crop diseases",             ref: "crop-diseases-gallery" },
  { title: "How It Works",          description: "Learn how to use the system",    ref: "how-it-works"          },
  { title: "System Features",       description: "Learn about system capabilities",ref: "features-section"      },
  { title: "Disease Library",       description: "Browse detectable diseases",     ref: "disease-library"       },
  { title: "AI Model",              description: "Upload crop image for detection",ref: "ai-model"              },
  { title: "Documentation",         description: "View system documentation",      ref: "documentation"         },
  { title: "Contacts",              description: "View contact info",              ref: "footer-contacts"       },
];

const CROP_IMAGES = [
  { src: "/crop-images/Bacterial Spot.JPG",         label: "Bacterial Spot"         },
  { src: "/crop-images/Early Blight.JPG",           label: "Early Blight"           },
  { src: "/crop-images/Healthy.JPG",                label: "Healthy"                },
  { src: "/crop-images/Late Blight.JPG",            label: "Late Blight"            },
  { src: "/crop-images/Leaf Mold.JPG",              label: "Leaf Mold"              },
  { src: "/crop-images/Mosaic Virus.JPG",           label: "Mosaic Virus"           },
  { src: "/crop-images/Septoria Leaf Spot.JPG",     label: "Septoria Leaf Spot"     },
  { src: "/crop-images/Spider Mites.JPG",           label: "Spider Mites"           },
  { src: "/crop-images/Target Spot.JPG",            label: "Target Spot"            },
  { src: "/crop-images/Yellow Leaf Curl Virus.JPG", label: "Yellow Leaf Curl Virus" },
];

/* Expanded 6-card feature set from LandingPage, using lucide icons */
const FEATURES = [
  {
    icon: <Microscope size={26} />,
    bg: "#e8f0e4",
    title: "AI-Powered Detection",
    text: "Our model, trained on 80,000+ images, identifies 10 major tomato diseases with over 90% accuracy.",
  },
  {
    icon: <Zap size={26} />,
    bg: "#fff9e6",
    title: "Instant Results",
    text: "Get your diagnosis and tailored treatment plan in under 5 seconds. No waiting, no lab visits.",
  },
  {
    icon: <Pill size={26} />,
    bg: "#fce8e6",
    title: "Treatment Recommendations",
    text: "Receive specific, actionable steps for each detected disease, from fungicides to cultural practices.",
  },
  {
    icon: <BarChart2 size={26} />,
    bg: "#e8f0e4",
    title: "Scan History",
    text: "Track the health of your crops over time with a full history of all your scans and outcomes.",
  },
  {
    icon: <Smartphone size={26} />,
    bg: "#fff9e6",
    title: "Works on Any Device",
    text: "Use Crop Detect from your phone in the field, your tablet in the greenhouse, or your desktop at home.",
  },
  {
    icon: <Lock size={26} />,
    bg: "#fce8e6",
    title: "Secure & Private",
    text: "Your farm data is yours. We never share your images or scan results with third parties.",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Take a Photo",
    text: "Photograph the affected leaves or stems on your tomato plant. Good lighting helps.",
  },
  {
    n: "2",
    title: "Upload & Analyze",
    text: "Upload the photo to Crop Detect. Our AI model processes it instantly.",
  },
  {
    n: "3",
    title: "Get Your Treatment Plan",
    text: "View your diagnosis, and a step-by-step treatment plan.",
  },
];

/* Disease tag strip */
const DISEASE_TAGS = [
  { name: "Early Blight",      note: "Alternaria solani"       },
  { name: "Late Blight",       note: "Phytophthora infestans"  },
  { name: "Leaf Mold",         note: "Passalora fulva"         },
  { name: "Bacterial Spot",    note: "Xanthomonas spp."        },
  { name: "Mosaic Virus",      note: "TMV / CMV"               },
  { name: "Septoria Spot",     note: "Septoria lycopersici"    },
  { name: "Spider Mites",      note: "Tetranychus urticae"    },
  { name: "Target Spot",       note: "Corynespora cassiicola"  },
  { name: "Yellow Curl Virus", note: "TYLCV"                   },
  { name: "Healthy Plant",     note: "No disease detected"      },
];

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll]         = useState(false);
  const navigate                      = useNavigate();

  const filteredResults = useMemo(
    () =>
      SEARCHABLE_CONTENT.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery]
  );

  const handleSearchClick = useCallback(
    (refId) => {
      if (refId === "ai-model" || refId === "documentation") {
        navigate(`/${refId}`);
      } else {
        document.getElementById(refId)?.scrollIntoView({ behavior: "smooth" });
      }
      setSearchQuery("");
    },
    [navigate]
  );

  const visibleImages = showAll ? CROP_IMAGES : CROP_IMAGES.slice(0, 3);

  return (
    <>
      {/* Navbar */}
      <nav className="db-navbar">
        <div className="db-nav-brand">
          <img src="/logo.png" alt="Crop Detect logo" className="db-nav-logo" />
          <span className="db-nav-wordmark">Crop<span> Detect</span></span>
        </div>

        <div className="db-nav-links">
          <Link to="/documentation">Documentation</Link>
          <Link to="/signin" className="db-nav-signin">Sign In</Link>
          <Link to="/ai-model" className="db-nav-cta">AI Model</Link>
        </div>

        <div className="db-search-wrap">
          <Search size={16} className="db-search-icon" />
          <input
            type="text"
            placeholder="Search…"
            className="db-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <div className="db-search-dropdown">
              {filteredResults.length > 0 ? (
                filteredResults.map((item, i) => (
                  <button
                    key={i}
                    className="db-search-item"
                    onClick={() => handleSearchClick(item.ref)}
                  >
                    <span className="db-search-item-title">{item.title}</span>
                    <span className="db-search-item-desc">{item.description}</span>
                  </button>
                ))
              ) : (
                <div className="db-search-item db-search-empty">No results found</div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="db-hero">
        <div className="db-hero-bg-pattern" />
        <div className="db-hero-glow-top" />
        <div className="db-hero-glow-bottom" />

        <div className="db-hero-content">
          <div className="db-hero-badge">AI-Powered Crop Health</div>

          <h1>
            Diagnose Crops Instantly
          </h1>

          <p className="db-hero-desc">
            AI-powered crop disease detection system built for small-scale farmers.
            Upload a photo, get an instant diagnosis, and protect your harvest
            before it's too late.
          </p>

          <div className="db-hero-ctas">
            <Link to="/ai-model" className="db-btn-primary">
              🔍 Try the AI Model
            </Link>
            <button
              className="db-btn-secondary"
              onClick={() =>
                document
                  .getElementById("crop-diseases-gallery")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              View Disease Gallery
            </button>
          </div>

          <div className="db-hero-stats">
            <div className="db-stat">
              <div className="db-stat-num">97%</div>
              <div className="db-stat-label">Detection Accuracy</div>
            </div>
            <div className="db-stat">
              <div className="db-stat-num">10+</div>
              <div className="db-stat-label">Diseases Detected</div>
            </div>
            <div className="db-stat">
              <div className="db-stat-num">&lt;5s</div>
              <div className="db-stat-label">Analysis Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Crop Disease Gallery*/}
      <section className="db-section db-gallery-section" id="crop-diseases-gallery">
        <div className="db-section-label">Disease Library</div>
        <h2 className="db-section-title">Crop Diseases Gallery</h2>
        <p className="db-section-sub">
          Browse real images of the diseases our model is trained to detect
          from bacterial infections to viral conditions affecting tomato crops.
        </p>

        <div className="db-image-grid">
          {visibleImages.map((img, i) => (
            <div key={i} className="db-image-card">
              <div className="db-image-frame">
                <img
                  src={img.src}
                  alt={img.label}
                  className="db-crop-img"
                  loading={i >= 6 ? "lazy" : "eager"}
                />
              </div>
              <div className="db-image-label">{img.label}</div>
            </div>
          ))}
        </div>

        {CROP_IMAGES.length > 6 && (
          <button
            className="db-view-toggle"
            onClick={() => setShowAll((prev) => !prev)}
          >
            {showAll ? "View Less ↑" : "View More ↓"}
          </button>
        )}
      </section>

      {/* How It Works  */}
      <section className="db-section db-how-section" id="how-it-works">
        <div className="db-section-label">How It Works</div>
        <h2 className="db-section-title">Three simple steps</h2>
        <p className="db-section-sub">
          No technical knowledge required. If you can take a photo, you can
          use Crop Detect.
        </p>

        <div className="db-steps">
          {STEPS.map((s, i) => (
            <div key={i} className="db-step">
              <div className="db-step-num">{s.n}</div>
              <h4>{s.title}</h4>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="db-section db-features-section" id="features-section">
        <div className="db-section-label">Why Crop Detect</div>
        <h2 className="db-section-title">Everything a tomato farmer needs</h2>
        <p className="db-section-sub">
          From early detection to treatment, we've built the tools to help you
          protect your crop before it's too late.
        </p>

        <div className="db-features-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="db-feature-card">
              <div className="db-feature-icon" style={{ background: f.bg }}>
                {f.icon}
              </div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Disease Tag Strip  */}
      <section className="db-section db-diseases-section" id="disease-library">
        <div className="db-section-label">What We Detect</div>
        <h2 className="db-section-title">Diseases we identify</h2>
        <p className="db-section-sub">
          Crop Detect is trained to identify the most common and economically
          damaging tomato diseases affecting small-scale farmers.
        </p>

        <div className="db-disease-grid">
          {DISEASE_TAGS.map((d, i) => (
            <div key={i} className="db-disease-tag">
              <div className="db-disease-icon">{d.icon}</div>
              <h5>{d.name}</h5>
              <p>{d.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="db-footer">
        <div className="db-footer-inner">
          <div className="db-footer-brand">
            <img src="/logo.png" alt="Crop Detect logo" className="db-footer-logo" />
            <span className="db-footer-wordmark">Crop<span> Detect</span></span>
            <p className="db-footer-tagline">
              AI-powered disease detection for small-scale farmers.
            </p>
          </div>

          <div className="db-footer-contacts" id="footer-contacts">
            <h4>Contact Us</h4>
            <p><MapPin size={14} /> Nairobi, Kenya</p>
            <p><Phone size={14} /> +254 793 002 282</p>
            <p><Mail size={14} /> support@cropdetect.ai</p>
          </div>

          <div className="db-footer-nav">
            <h4>Quick Links</h4>
            <Link to="/ai-model">AI Model</Link>
            <Link to="/documentation">Documentation</Link>
            <Link to="/signin">Sign In</Link>
          </div>
        </div>

        <div className="db-footer-bottom">
          <p>&copy; {new Date().getFullYear()} Crop Detect. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}