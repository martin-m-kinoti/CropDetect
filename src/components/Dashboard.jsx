import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import "./Dashboard.css";
import { Link, useNavigate } from "react-router-dom";
import {
  Search, MapPin, Phone, Mail, Microscope, Zap, Pill,
  BarChart2, Smartphone, Lock, ChevronDown, ArrowUpRight,
  Leaf, ShieldCheck,
} from "lucide-react";

/* ─── Data ──────────────────────────────────────────────────────────── */
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

const FEATURES = [
  {
    icon: <Microscope size={22} />, accent: "var(--moss)",
    title: "AI-Powered Detection",
    text: "Our model, trained on 80,000+ images, identifies 10 major tomato diseases with over 90% accuracy.",
  },
  {
    icon: <Zap size={22} />, accent: "var(--gold)",
    title: "Instant Results",
    text: "Get your diagnosis and tailored treatment plan in under 5 seconds. No waiting, no lab visits.",
  },
  {
    icon: <Pill size={22} />, accent: "var(--rust)",
    title: "Treatment Recommendations",
    text: "Receive specific, actionable steps for each detected disease, from fungicides to cultural practices.",
  },
  {
    icon: <BarChart2 size={22} />, accent: "var(--moss)",
    title: "Scan History",
    text: "Track the health of your crops over time with a full history of all your scans and outcomes.",
  },
  {
    icon: <Smartphone size={22} />, accent: "var(--gold)",
    title: "Works on Any Device",
    text: "Use Crop Detect from your phone in the field, your tablet in the greenhouse, or your desktop at home.",
  },
  {
    icon: <Lock size={22} />, accent: "var(--rust)",
    title: "Secure & Private",
    text: "Your farm data is yours. We never share your images or scan results with third parties.",
  },
];

const STEPS = [
  {
    n: "01", icon: "📸",
    title: "Take a Photo",
    text: "Photograph the affected leaves or stems on your tomato plant. Good lighting helps.",
  },
  {
    n: "02", icon: "🧠",
    title: "Upload & Analyze",
    text: "Upload the photo to Crop Detect. Our AI model processes it instantly.",
  },
  {
    n: "03", icon: "💊",
    title: "Get Your Treatment Plan",
    text: "View your diagnosis and a step-by-step treatment plan tailored to your crop.",
  },
];

const DISEASE_TAGS = [
  { name: "Early Blight",      note: "Alternaria solani",      severity: "high"   },
  { name: "Late Blight",       note: "Phytophthora infestans", severity: "high"   },
  { name: "Leaf Mold",         note: "Passalora fulva",        severity: "medium" },
  { name: "Bacterial Spot",    note: "Xanthomonas spp.",       severity: "medium" },
  { name: "Mosaic Virus",      note: "TMV / CMV",              severity: "high"   },
  { name: "Septoria Spot",     note: "Septoria lycopersici",   severity: "medium" },
  { name: "Spider Mites",      note: "Tetranychus urticae",    severity: "low"    },
  { name: "Target Spot",       note: "Corynespora cassiicola", severity: "medium" },
  { name: "Yellow Curl Virus", note: "TYLCV",                  severity: "high"   },
  { name: "Healthy Plant",     note: "No disease detected",    severity: "none"   },
];

/* ─── Animated counter ───────────────────────────────────────────────── */
function AnimatedStat({ target, suffix = "", label }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const num = parseFloat(target);
        const isDecimal = target.includes(".");
        let start = 0;
        const duration = 1600;
        const step = (timestamp) => {
          if (!start) start = timestamp;
          const progress = Math.min((timestamp - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(isDecimal ? (eased * num).toFixed(1) : Math.floor(eased * num));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div className="db-stat" ref={ref}>
      <div className="db-stat-num">{count}{suffix}</div>
      <div className="db-stat-label">{label}</div>
    </div>
  );
}

/* ─── Scroll-reveal wrapper ──────────────────────────────────────────── */
function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.12 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "revealed" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────── */
export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll]         = useState(false);
  const [scrolled, setScrolled]       = useState(false);
  const navigate                      = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const filteredResults = useMemo(
    () => SEARCHABLE_CONTENT.filter(
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

  const visibleImages = showAll ? CROP_IMAGES : CROP_IMAGES.slice(0, 6);

  return (
    <>
      {/* ── Navbar ──────────────────────────────────────── */}
      <nav className={`db-navbar ${scrolled ? "db-navbar--scrolled" : ""}`}>
        <div className="db-nav-brand">
          <div className="db-nav-logo-ring">
            <img src="/logo.png" alt="Crop Detect logo" className="db-nav-logo" />
          </div>
          <span className="db-nav-wordmark">Crop<span>Detect</span></span>
        </div>

        <div className="db-nav-links">
          <Link to="/documentation">Documentation</Link>
          <Link to="/signin" className="db-nav-signin">Sign In</Link>
          <Link to="/ai-model" className="db-nav-cta">
            Try AI Model <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="db-search-wrap">
          <Search size={15} className="db-search-icon" />
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
                  <button key={i} className="db-search-item" onClick={() => handleSearchClick(item.ref)}>
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

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="db-hero">
        {/* organic blob shapes */}
        <div className="db-hero-blob db-hero-blob--1" />
        <div className="db-hero-blob db-hero-blob--2" />
        <div className="db-hero-blob db-hero-blob--3" />
        <div className="db-hero-grid" />

        <div className="db-hero-content">
          <div className="db-hero-eyebrow">
            <Leaf size={12} />
            <span>AI-Powered Crop Health</span>
            <ShieldCheck size={12} />
          </div>

          <h1 className="db-hero-title">
            Diagnose Your<br />
            <em>Tomato Crops</em><br />
            Instantly
          </h1>

          <p className="db-hero-desc">
            Built for small-scale farmers. Upload a photo, get an instant 
            diagnosis, and protect your harvest before it's too late.
          </p>

          <div className="db-hero-ctas">
            <Link to="/ai-model" className="db-btn-primary">
              <span className="db-btn-icon">🔬</span>
              Try the AI Model
              <ArrowUpRight size={16} />
            </Link>
            <button
              className="db-btn-ghost"
              onClick={() => document.getElementById("crop-diseases-gallery")?.scrollIntoView({ behavior: "smooth" })}
            >
              View Disease Gallery
              <ChevronDown size={15} />
            </button>
          </div>

          <div className="db-hero-stats">
            <AnimatedStat target="97" suffix="%" label="Detection Accuracy" />
            <div className="db-stat-divider" />
            <AnimatedStat target="10" suffix="+" label="Diseases Detected" />
            <div className="db-stat-divider" />
            <AnimatedStat target="5" suffix="s" label="Analysis Time" />
          </div>
        </div>

        <div className="db-hero-visual">
          <div className="db-hero-card">
            <div className="db-hero-card-header">
              <div className="db-hero-card-dot db-hero-card-dot--red" />
              <div className="db-hero-card-dot db-hero-card-dot--yellow" />
              <div className="db-hero-card-dot db-hero-card-dot--green" />
              <span className="db-hero-card-title">crop-scan-result.ai</span>
            </div>
            <div className="db-hero-card-body">
              <div className="db-hero-scan-img">
                <img src="/crop-images/Early Blight.JPG" alt="Scan preview" />
                <div className="db-hero-scan-overlay">
                  <div className="db-hero-scan-line" />
                </div>
              </div>
              <div className="db-hero-result">
                <div className="db-hero-result-label">Detection Result</div>
                <div className="db-hero-result-disease">Early Blight</div>
                <div className="db-hero-result-confidence">
                  <span>Confidence</span>
                  <div className="db-confidence-bar">
                    <div className="db-confidence-fill" style={{ width: "94%" }} />
                  </div>
                  <span className="db-confidence-pct">94%</span>
                </div>
                <div className="db-hero-result-tag">⚠ Treatment needed</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Gallery ─────────────────────────────────────── */}
      <section className="db-section db-gallery-section" id="crop-diseases-gallery">
        <Reveal>
          <div className="db-section-label">Disease Library</div>
          <h2 className="db-section-title">Crop Diseases Gallery</h2>
          <p className="db-section-sub">
            Browse real images of the diseases our model is trained to detect —
            from bacterial infections to viral conditions affecting tomato crops.
          </p>
        </Reveal>

        <div className="db-image-grid">
          {visibleImages.map((img, i) => (
            <Reveal key={i} delay={i * 60} className="db-image-card">
              <div className="db-image-frame">
                <img src={img.src} alt={img.label} className="db-crop-img" loading={i >= 6 ? "lazy" : "eager"} />
                <div className="db-image-overlay">
                  <span>View Details</span>
                  <ArrowUpRight size={14} />
                </div>
              </div>
              <div className="db-image-label">
                <span>{img.label}</span>
                <div className="db-image-dot" />
              </div>
            </Reveal>
          ))}
        </div>

        {CROP_IMAGES.length > 6 && (
          <button className="db-view-toggle" onClick={() => setShowAll((p) => !p)}>
            {showAll ? "Show Less" : "Load More"}
            <ChevronDown size={14} style={{ transform: showAll ? "rotate(180deg)" : "none", transition: "0.25s" }} />
          </button>
        )}
      </section>

      {/* ── How It Works ────────────────────────────────── */}
      <section className="db-section db-how-section" id="how-it-works">
        <div className="db-how-inner">
          <Reveal>
            <div className="db-section-label">How It Works</div>
            <h2 className="db-section-title">Three simple steps</h2>
            <p className="db-section-sub">
              No technical knowledge required. If you can take a photo, you can use Crop Detect.
            </p>
          </Reveal>

          <div className="db-steps">
            {STEPS.map((s, i) => (
              <Reveal key={i} delay={i * 120}>
                <div className="db-step">
                  <div className="db-step-num">{s.n}</div>
                  <div className="db-step-icon">{s.icon}</div>
                  <h4>{s.title}</h4>
                  <p>{s.text}</p>
                </div>
                {i < STEPS.length - 1 && <div className="db-step-connector" />}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────── */}
      <section className="db-section db-features-section" id="features-section">
        <Reveal>
          <div className="db-section-label">Why Crop Detect</div>
          <h2 className="db-section-title">Everything a tomato farmer needs</h2>
          <p className="db-section-sub">
            From early detection to treatment, we've built the tools to help you
            protect your crop before it's too late.
          </p>
        </Reveal>

        <div className="db-features-grid">
          {FEATURES.map((f, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="db-feature-card">
                <div className="db-feature-icon" style={{ "--accent": f.accent }}>
                  {f.icon}
                </div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
                <div className="db-feature-bar" style={{ background: f.accent }} />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Disease Library ─────────────────────────────── */}
      <section className="db-section db-diseases-section" id="disease-library">
        <Reveal>
          <div className="db-section-label">What We Detect</div>
          <h2 className="db-section-title">Diseases we identify</h2>
          <p className="db-section-sub">
            Trained to identify the most common and economically damaging tomato
            diseases affecting small-scale farmers in East Africa and beyond.
          </p>
        </Reveal>

        <div className="db-disease-grid">
          {DISEASE_TAGS.map((d, i) => (
            <Reveal key={i} delay={i * 50}>
              <div className={`db-disease-tag db-disease-tag--${d.severity}`}>
                <div className={`db-disease-severity db-disease-severity--${d.severity}`} />
                <h5>{d.name}</h5>
                <p>{d.note}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────── */}
      <section className="db-cta-banner">
        <div className="db-cta-blob" />
        <Reveal>
          <div className="db-cta-inner">
            <h2>Ready to protect your harvest?</h2>
            <p>Join farmers using AI to detect and treat crop diseases before they spread.</p>
            <Link to="/ai-model" className="db-btn-primary db-btn-primary--light">
              <span className="db-btn-icon">🔬</span>
              Start Your Free Scan
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="db-footer">
        <div className="db-footer-inner">
          <div className="db-footer-brand">
            <div className="db-footer-logo-wrap">
              <img src="/logo.png" alt="Crop Detect logo" className="db-footer-logo" />
            </div>
            <span className="db-footer-wordmark">Crop<span>Detect</span></span>
            <p className="db-footer-tagline">
              AI-powered disease detection for small-scale farmers.
              Built with care for African agriculture.
            </p>
            <div className="db-footer-badges">
              <span className="db-footer-badge">🇰🇪 Made in Kenya</span>
              <span className="db-footer-badge">🌱 For Farmers</span>
            </div>
          </div>

          <div className="db-footer-contacts" id="footer-contacts">
            <h4>Contact Us</h4>
            <a className="db-footer-contact-item" href="https://maps.google.com" target="_blank" rel="noopener noreferrer">
              <MapPin size={14} /> <span>Nairobi, Kenya</span>
            </a>
            <a className="db-footer-contact-item" href="tel:+254793002282">
              <Phone size={14} /> <span>+254 793 002 282</span>
            </a>
            <a className="db-footer-contact-item" href="mailto:support@cropdetect.ai">
              <Mail size={14} /> <span>support@cropdetect.ai</span>
            </a>
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
          <div className="db-footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </footer>
    </>
  );
}