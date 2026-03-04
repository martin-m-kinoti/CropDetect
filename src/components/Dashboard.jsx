import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import "./Dashboard.css";
import { Link, useNavigate } from "react-router-dom";
import {
  Search, MapPin, Phone, Mail,
  Microscope, Zap, Pill, BarChart2, Smartphone, Lock,
  ChevronDown, ArrowUpRight, Leaf, ShieldCheck,
} from "lucide-react";

const CROPS = [
  {
    id: "tomato",
    label: "Tomato",
    emoji: "🍅",
    accent: "#e05c3a",
    accentRgb: "224,92,58",
    heroImage: "/crop-images/Early Blight.JPG",
    heroDisease: "Early Blight",
    heroConfidence: 94,
    tagline: "Kenya's most-grown smallholder crop",
    diseases: [
      { name: "Early Blight",       note: "Alternaria solani",       severity: "high"   },
      { name: "Late Blight",        note: "Phytophthora infestans",  severity: "high"   },
      { name: "Leaf Mold",          note: "Passalora fulva",         severity: "medium" },
      { name: "Bacterial Spot",     note: "Xanthomonas spp.",        severity: "medium" },
      { name: "Mosaic Virus",       note: "TMV / CMV",               severity: "high"   },
      { name: "Septoria Spot",      note: "Septoria lycopersici",    severity: "medium" },
      { name: "Spider Mites",       note: "Tetranychus urticae",     severity: "low"    },
      { name: "Target Spot",        note: "Corynespora cassiicola",  severity: "medium" },
      { name: "Yellow Curl Virus",  note: "TYLCV",                   severity: "high"   },
      { name: "Healthy Plant",      note: "No disease detected",     severity: "none"   },
    ],
    gallery: [
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
    ],
  },
  {
    id: "maize",
    label: "Maize",
    emoji: "🌽",
    accent: "#d4a020",
    accentRgb: "212,160,32",
    heroImage: "/crop-images/Maize Streak Virus.JPG",
    heroDisease: "Maize Streak Virus",
    heroConfidence: 91,
    tagline: "Kenya's staple food crop",
    diseases: [
      { name: "Fall Armyworm",         note: "Spodoptera frugiperda",  severity: "high"   },
      { name: "Maize Streak Virus",    note: "MSV (Mastrevirus)",      severity: "high"   },
      { name: "Grey Leaf Spot",        note: "Cercospora zeae-maydis", severity: "medium" },
      { name: "Northern Leaf Blight",  note: "Exserohilum turcicum",   severity: "high"   },
      { name: "Common Rust",           note: "Puccinia sorghi",        severity: "medium" },
      { name: "Banded Leaf Spot",      note: "Rhizoctonia solani",     severity: "medium" },
      { name: "Smut",                  note: "Ustilago maydis",        severity: "low"    },
      { name: "Healthy Plant",         note: "No disease detected",    severity: "none"   },
    ],
    gallery: [
      { src: "/crop-images/Fall Armyworm.JPG",         label: "Fall Armyworm"         },
      { src: "/crop-images/Maize Streak Virus.JPG",    label: "Maize Streak Virus"    },
      { src: "/crop-images/Grey Leaf Spot.JPG",        label: "Grey Leaf Spot"        },
      { src: "/crop-images/Northern Leaf Blight.JPG",  label: "Northern Leaf Blight"  },
      { src: "/crop-images/Common Rust.JPG",           label: "Common Rust"           },
      { src: "/crop-images/Maize Smut.JPG",            label: "Smut"                  },
    ],
  },
  {
    id: "potato",
    label: "Potato",
    emoji: "🥔",
    accent: "#8a7650",
    accentRgb: "138,118,80",
    heroImage: "/crop-images/Potato Late Blight.JPG",
    heroDisease: "Potato Late Blight",
    heroConfidence: 89,
    tagline: "High-value crop across Kenya's highlands",
    diseases: [
      { name: "Late Blight",       note: "Phytophthora infestans",  severity: "high"   },
      { name: "Early Blight",      note: "Alternaria solani",       severity: "medium" },
      { name: "Black Scurf",       note: "Rhizoctonia solani",      severity: "medium" },
      { name: "Common Scab",       note: "Streptomyces scabiei",    severity: "low"    },
      { name: "Bacterial Wilt",    note: "Ralstonia solanacearum",  severity: "high"   },
      { name: "Mosaic Virus",      note: "PVX / PVY",               severity: "medium" },
      { name: "Leaf Roll Virus",   note: "PLRV",                    severity: "high"   },
      { name: "Healthy Plant",     note: "No disease detected",     severity: "none"   },
    ],
    gallery: [
      { src: "/crop-images/Potato Late Blight.JPG",  label: "Late Blight"   },
      { src: "/crop-images/Potato Early Blight.JPG", label: "Early Blight"  },
      { src: "/crop-images/Black Scurf.JPG",         label: "Black Scurf"   },
      { src: "/crop-images/Bacterial Wilt.JPG",      label: "Bacterial Wilt"},
      { src: "/crop-images/Potato Mosaic.JPG",       label: "Mosaic Virus"  },
      { src: "/crop-images/Leaf Roll Virus.JPG",     label: "Leaf Roll Virus"},
    ],
  },
];

const SEARCHABLE_CONTENT = [
  { title: "Crop Diseases Gallery", description: "View crop diseases",              ref: "crop-diseases-gallery" },
  { title: "Supported Crops",       description: "View all supported crop models",  ref: "supported-crops"       },
  { title: "How It Works",          description: "Learn how to use the system",     ref: "how-it-works"          },
  { title: "System Features",       description: "Learn about system capabilities", ref: "features-section"      },
  { title: "Disease Library",       description: "Browse detectable diseases",      ref: "disease-library"       },
  { title: "AI Model",              description: "Upload crop image for detection", ref: "ai-model"              },
  { title: "Documentation",         description: "View system documentation",       ref: "documentation"         },
  { title: "Contacts",              description: "View contact info",               ref: "footer-contacts"       },
];

const FEATURES = [
  { icon: <Microscope size={22} />, accent: "var(--moss)",  title: "AI-Powered Detection",     text: "Three dedicated models, trained on 80,000+ images across tomato, maize, and potato crops — achieving over 90% accuracy."        },
  { icon: <Zap size={22} />,        accent: "var(--gold)",  title: "Instant Results",           text: "Get your diagnosis and tailored treatment plan in under 5 seconds. No waiting, no lab visits."                                    },
  { icon: <Pill size={22} />,       accent: "var(--rust)",  title: "Treatment Recommendations", text: "Receive specific, actionable steps for each detected disease — from fungicides to cultural practices."                           },
  { icon: <BarChart2 size={22} />,  accent: "var(--moss)",  title: "Scan History",              text: "Track the health of all your crops over time with a full history of scans and outcomes."                                         },
  { icon: <Smartphone size={22} />, accent: "var(--gold)",  title: "Works on Any Device",       text: "Use Crop Detect from your phone in the field, your tablet in the greenhouse, or your desktop at home."                           },
  { icon: <Lock size={22} />,       accent: "var(--rust)",  title: "Secure & Private",          text: "Your farm data is yours. We never share your images or scan results with third parties."                                         },
];

const STEPS = [
  { n: "01", icon: "📸", title: "Take a Photo",            text: "Photograph the affected leaves or stems on your crop. Good natural lighting helps accuracy."       },
  { n: "02", icon: "🧠", title: "Select Crop & Analyze",   text: "Choose your crop type — tomato, maize, or potato — upload the photo, and our AI processes it."     },
  { n: "03", icon: "💊", title: "Get Your Treatment Plan", text: "View your diagnosis, severity rating, and a step-by-step treatment plan tailored to your crop."     },
];

function AnimatedStat({ target, suffix = "", label }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const num = parseFloat(target);
      const isDecimal = String(target).includes(".");
      let start = 0;
      const duration = 1600;
      const step = (ts) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        const e = 1 - Math.pow(1 - p, 3);
        setCount(isDecimal ? (e * num).toFixed(1) : Math.floor(e * num));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.5 });
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

function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${visible ? "revealed" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export default function Dashboard() {
  const [searchQuery, setSearchQuery]   = useState("");
  const [showAll, setShowAll]           = useState(false);
  const [scrolled, setScrolled]         = useState(false);
  const [activeCropId, setActiveCropId] = useState("tomato");
  const navigate                        = useNavigate();

  const activeCrop    = CROPS.find(c => c.id === activeCropId);
  const visibleImages = showAll ? activeCrop.gallery : activeCrop.gallery.slice(0, 6);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setShowAll(false); }, [activeCropId]);

  const filteredResults = useMemo(() =>
    SEARCHABLE_CONTENT.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    ), [searchQuery]);

  const handleSearchClick = useCallback((refId) => {
    if (refId === "ai-model" || refId === "documentation") {
      navigate(`/${refId}`);
    } else {
      document.getElementById(refId)?.scrollIntoView({ behavior: "smooth" });
    }
    setSearchQuery("");
  }, [navigate]);

  const selectCrop = useCallback((id) => setActiveCropId(id), []);

  return (
    <>
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
            onChange={e => setSearchQuery(e.target.value)}
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

      <section className="db-hero" style={{ "--hero-accent-rgb": activeCrop.accentRgb }}>
        <div className="db-hero-blob db-hero-blob--1" />
        <div className="db-hero-blob db-hero-blob--2" />
        <div className="db-hero-blob db-hero-blob--3" />
        <div className="db-hero-grid" />

        <div className="db-hero-content">
          <div className="db-hero-eyebrow">
            <Leaf size={12} />
            <span>AI-Powered Crop Health · Kenya</span>
            <ShieldCheck size={12} />
          </div>

          <h1 className="db-hero-title">
            Diagnose Your<br />
            <em>Kenyan Crops</em><br />
            Instantly
          </h1>

          <p className="db-hero-desc">
            Built for small-scale farmers across Kenya. Select your crop, upload a photo,
            and get an AI-powered diagnosis in seconds — protecting your harvest before diseases spread.
          </p>

          <div className="db-crop-selector">
            {CROPS.map(crop => (
              <button
                key={crop.id}
                className={`db-crop-tab ${activeCropId === crop.id ? "db-crop-tab--active" : ""}`}
                style={{ "--tab-accent": crop.accent, "--tab-accent-rgb": crop.accentRgb }}
                onClick={() => selectCrop(crop.id)}
              >
                <span className="db-crop-tab-emoji">{crop.emoji}</span>
                {crop.label}
              </button>
            ))}
          </div>

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
            <AnimatedStat target="90" suffix="%" label="Detection Accuracy" />
            <div className="db-stat-divider" />
            <AnimatedStat target="3"  suffix=""  label="Crop Models" />
            <div className="db-stat-divider" />
            <AnimatedStat target="26" suffix="+" label="Diseases Covered" />
            <div className="db-stat-divider" />
            <AnimatedStat target="5"  suffix="s" label="Analysis Time" />
          </div>
        </div>

        <div className="db-hero-visual">
          <div className="db-hero-card" key={activeCropId}>
            <div className="db-hero-card-header">
              <div className="db-hero-card-dot db-hero-card-dot--red" />
              <div className="db-hero-card-dot db-hero-card-dot--yellow" />
              <div className="db-hero-card-dot db-hero-card-dot--green" />
              <span className="db-hero-card-title">crop-scan-result.ai</span>
            </div>
            <div className="db-hero-card-accent" style={{ background: activeCrop.accent }} />
            <div className="db-hero-card-body">
              <div className="db-hero-scan-img">
                <img src={activeCrop.heroImage} alt={`${activeCrop.label} scan`} />
                <div className="db-hero-scan-overlay" />
                <div
                  className="db-hero-scan-badge"
                  style={{ color: activeCrop.accent, borderColor: `rgba(${activeCrop.accentRgb},0.45)` }}
                >
                  {activeCrop.emoji} {activeCrop.label}
                </div>
                <div className="db-hero-scan-line" style={{ "--line-color": activeCrop.accent }} />
              </div>
              <div className="db-hero-result">
                <div className="db-hero-result-label">Detection Result</div>
                <div className="db-hero-result-disease">{activeCrop.heroDisease}</div>
                <div className="db-hero-result-confidence">
                  <span>Confidence</span>
                  <div className="db-confidence-bar">
                    <div
                      className="db-confidence-fill"
                      style={{ width: `${activeCrop.heroConfidence}%`, background: `linear-gradient(90deg, var(--fern), ${activeCrop.accent})` }}
                    />
                  </div>
                  <span className="db-confidence-pct" style={{ color: activeCrop.accent }}>
                    {activeCrop.heroConfidence}%
                  </span>
                </div>
                <div className="db-hero-result-tag" style={{ color: activeCrop.accent, borderColor: `rgba(${activeCrop.accentRgb},0.4)`, background: `rgba(${activeCrop.accentRgb},0.12)` }}>
                  ⚠ Treatment needed
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="db-section db-crops-section" id="supported-crops">
        <Reveal>
          <div className="db-section-label db-section-label--light">What We Support</div>
          <h2 className="db-section-title db-section-title--light">Three crops. One platform.</h2>
          <p className="db-section-sub db-section-sub--light">
            Crop Detect covers Kenya's most economically important smallholder crops
            with dedicated AI models trained on locally relevant disease data.
          </p>
        </Reveal>

        <div className="db-crop-cards">
          {CROPS.map((crop, i) => (
            <Reveal key={crop.id} delay={i * 110}>
              <div
                className={`db-crop-card ${activeCropId === crop.id ? "db-crop-card--active" : ""}`}
                style={{ "--card-accent": crop.accent, "--card-accent-rgb": crop.accentRgb }}
                onClick={() => {
                  selectCrop(crop.id);
                  document.getElementById("crop-diseases-gallery")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <div className="db-crop-card-bar" />
                <div className="db-crop-card-top">
                  <span className="db-crop-card-emoji">{crop.emoji}</span>
                  <span className="db-crop-card-count">{crop.diseases.length} diseases</span>
                </div>
                <h3>{crop.label}</h3>
                <p className="db-crop-card-tagline">{crop.tagline}</p>
                <ul className="db-crop-card-list">
                  {crop.diseases.slice(0, 4).map((d, j) => (
                    <li key={j}>
                      <span className={`db-dot db-dot--${d.severity}`} />
                      {d.name}
                    </li>
                  ))}
                  {crop.diseases.length > 4 && (
                    <li className="db-crop-card-more">+{crop.diseases.length - 4} more</li>
                  )}
                </ul>
                <div className="db-crop-card-cta">
                  Explore model <ArrowUpRight size={13} />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="db-section db-gallery-section" id="crop-diseases-gallery">
        <Reveal>
          <div className="db-section-label">Disease Library</div>
          <h2 className="db-section-title">Crop Diseases Gallery</h2>
          <p className="db-section-sub">
            Browse real images the model is trained on. Switch crops to explore each model's disease library.
          </p>
        </Reveal>

        <div className="db-tab-row">
          {CROPS.map(crop => (
            <button
              key={crop.id}
              className={`db-tab-pill ${activeCropId === crop.id ? "db-tab-pill--active" : ""}`}
              style={{ "--pill-accent": crop.accent, "--pill-accent-rgb": crop.accentRgb }}
              onClick={() => selectCrop(crop.id)}
            >
              {crop.emoji} {crop.label}
            </button>
          ))}
        </div>

        <div className="db-image-grid" key={`gallery-${activeCropId}`}>
          {visibleImages.map((img, i) => (
            <Reveal key={i} delay={i * 55} className="db-image-card">
              <div className="db-image-frame">
                <img src={img.src} alt={img.label} className="db-crop-img" loading={i >= 6 ? "lazy" : "eager"} />
                <div className="db-image-overlay">
                  <span>View Details</span>
                  <ArrowUpRight size={14} />
                </div>
              </div>
              <div className="db-image-label">
                <span>{img.label}</span>
                <div className="db-image-dot" style={{ background: activeCrop.accent }} />
              </div>
            </Reveal>
          ))}
        </div>

        {activeCrop.gallery.length > 6 && (
          <button className="db-view-toggle" onClick={() => setShowAll(p => !p)}>
            {showAll ? "Show Less" : "Load More"}
            <ChevronDown size={14} style={{ transform: showAll ? "rotate(180deg)" : "none", transition: "transform 0.25s" }} />
          </button>
        )}
      </section>

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

      <section className="db-section db-features-section" id="features-section">
        <Reveal>
          <div className="db-section-label">Why Crop Detect</div>
          <h2 className="db-section-title">Everything a Kenyan farmer needs</h2>
          <p className="db-section-sub">
            From early detection to treatment — built to protect your tomato, maize,
            and potato crops before it's too late.
          </p>
        </Reveal>
        <div className="db-features-grid">
          {FEATURES.map((f, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="db-feature-card">
                <div className="db-feature-icon" style={{ "--accent": f.accent }}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
                <div className="db-feature-bar" style={{ background: f.accent }} />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="db-section db-diseases-section" id="disease-library">
        <Reveal>
          <div className="db-section-label">What We Detect</div>
          <h2 className="db-section-title">Diseases we identify</h2>
          <p className="db-section-sub">
            Trained on the most common and economically damaging diseases affecting
            Kenyan smallholder farmers across all three crops.
          </p>
        </Reveal>

        <div className="db-tab-row">
          {CROPS.map(crop => (
            <button
              key={crop.id}
              className={`db-tab-pill ${activeCropId === crop.id ? "db-tab-pill--active" : ""}`}
              style={{ "--pill-accent": crop.accent, "--pill-accent-rgb": crop.accentRgb }}
              onClick={() => selectCrop(crop.id)}
            >
              {crop.emoji} {crop.label}
            </button>
          ))}
        </div>

        <div className="db-disease-grid" key={`diseases-${activeCropId}`}>
          {activeCrop.diseases.map((d, i) => (
            <Reveal key={i} delay={i * 50}>
              <div className={`db-disease-tag db-disease-tag--${d.severity}`}>
                <div className={`db-disease-severity db-disease-severity--${d.severity}`} />
                <h5>{d.name}</h5>
                <p>{d.note}</p>
                <span className={`db-severity-pill db-severity-pill--${d.severity}`}>
                  {d.severity === "none" ? "Healthy" : d.severity}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="db-cta-banner">
        <div className="db-cta-blob" />
        <Reveal>
          <div className="db-cta-inner">
            <div className="db-cta-crops">
              {CROPS.map((c, i) => (
                <span key={c.id} className="db-cta-crop-icon" style={{ animationDelay: `${i * 0.55}s` }}>
                  {c.emoji}
                </span>
              ))}
            </div>
            <h2>Ready to protect your harvest?</h2>
            <p>
              Join farmers across Kenya using AI to detect and treat tomato,
              maize, and potato diseases before they spread.
            </p>
            <Link to="/ai-model" className="db-btn-primary db-btn-primary--light">
              <span className="db-btn-icon">🔬</span>
              Start Your Free Scan
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </Reveal>
      </section>

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
              <span className="db-footer-badge">🍅🌽🥔 3 Crops</span>
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