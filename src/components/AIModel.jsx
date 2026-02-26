import React, { useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import "./AIModel.css";

/* ─────────────────────────────────────────────────────────────────────
   FARM CONTEXT RECOMMENDATION ENGINE
   Synthesises: detected disease + soil type + live weather + other crops
   ───────────────────────────────────────────────────────────────────── */

const SOLANACEOUS_CROPS = ["potato", "pepper", "eggplant", "aubergine", "tobacco"];

const COMPANION_BENEFITS = {
  maize:  "Maize as a windbreak can reduce fungal spore dispersal by up to 40%. Plant on the upwind side of tomato rows.",
  basil:  "Basil repels aphids that vector mosaic virus. Intercrop between tomato rows.",
  garlic: "Garlic has antifungal properties — plant near tomato rows for natural disease suppression.",
  onion:  "Onions deter soil-borne pests relevant to bacterial diseases. Excellent border crop.",
};

const WEATHER_RULES = {
  spray_blocked_rainfall: 2,
  spray_blocked_wind: 8,
  high_humidity_cloud: 75,
  fungal_temp_min: 18,
  fungal_temp_max: 28,
  bacterial_temp_min: 24,
};

const SOIL_NOTES = {
  clay: {
    fungal: "Clay soil retains excess moisture — dig drainage channels urgently to limit fungal spread.",
    bacterial: "Waterlogged clay is ideal for bacterial spread. Switch to raised beds where possible.",
    general: "Avoid overhead irrigation on clay. Drip irrigation reduces leaf wetness significantly.",
  },
  sandy: {
    fungal: "Sandy soil drains quickly — risk of drought stress which weakens plant immunity.",
    bacterial: "Sandy soils dry fast; bacterial diseases spread less through soil but monitor leaf contact.",
    general: "Apply organic mulch to retain moisture and buffer temperature swings.",
  },
  loam: {
    fungal: "Loam is well-balanced — standard fungicide schedules apply without modification.",
    bacterial: "Good drainage in loam limits bacterial persistence in soil. Focus on foliar hygiene.",
    general: "Ideal soil type. Maintain organic matter above 3% for best disease resistance.",
  },
  volcanic: {
    fungal: "Volcanic soils retain moisture in pockets — inspect low-lying areas of the farm first.",
    bacterial: "High mineral content may support beneficial soil microbes. Consider biocontrol agents.",
    general: "Rich in potassium which boosts tomato cell wall strength and natural disease resistance.",
  },
};

function getSoilCategory(soilType = "") {
  const s = soilType.toLowerCase();
  if (s.includes("clay")) return "clay";
  if (s.includes("sand")) return "sandy";
  if (s.includes("loam") || s.includes("silt")) return "loam";
  if (s.includes("volcanic") || s.includes("andosol")) return "volcanic";
  return "loam";
}

function getDiseaseCategory(disease = "") {
  const d = disease.toLowerCase();
  if (d.includes("blight") || d.includes("mold") || d.includes("mites") ||
      d.includes("septoria") || d.includes("target")) return "fungal";
  if (d.includes("bacterial") || d.includes("spot")) return "bacterial";
  if (d.includes("virus") || d.includes("mosaic") || d.includes("curl")) return "viral";
  if (d.includes("healthy")) return "healthy";
  return "fungal";
}

function buildContextualRecommendations({ disease, soilType, weather, otherCrops }) {
  const diseaseCategory = getDiseaseCategory(disease);
  const soilCat  = getSoilCategory(soilType);
  const soilNote = SOIL_NOTES[soilCat] || SOIL_NOTES.loam;

  const recs = {
    immediate: [], treatment: [], farming_practice: [],
    other_crops_advice: [], weather_warnings: [], risk_score: 0,
  };

  if (diseaseCategory === "healthy") {
    recs.immediate.push("✅ Your tomato plant appears healthy. Maintain current practices.");
    recs.treatment.push("No treatment required. Continue regular monitoring every 3–5 days.");
    recs.riskLabel = "Low";
    return recs;
  }

  /* Weather warnings */
  if (weather) {
    if (weather.rainfall > WEATHER_RULES.spray_blocked_rainfall) {
      recs.weather_warnings.push("🌧 Active rainfall detected — do NOT apply sprays now. Rain washes off treatments entirely. Reschedule for a dry morning window.");
      recs.risk_score += 2;
    }
    if (weather.wind_speed > WEATHER_RULES.spray_blocked_wind) {
      recs.weather_warnings.push(`💨 High winds (${weather.wind_speed} m/s) will cause spray drift onto neighbouring crops. Wait for wind below 8 m/s — ideally early morning.`);
    }
    if (weather.cloud_cover > WEATHER_RULES.high_humidity_cloud) {
      recs.weather_warnings.push("☁️ Heavy cloud cover = high humidity. Prime conditions for fungal spread. Apply preventive copper-based sprays once weather clears.");
      if (diseaseCategory === "fungal") recs.risk_score += 2;
    }
    if (weather.temperature >= WEATHER_RULES.fungal_temp_min && weather.temperature <= WEATHER_RULES.fungal_temp_max && diseaseCategory === "fungal") {
      recs.weather_warnings.push(`🌡 Temperature (${weather.temperature}°C) is in the ideal range for fungal spread. Act within 24–48 hours.`);
      recs.risk_score += 1;
    }
    if (weather.temperature >= WEATHER_RULES.bacterial_temp_min && diseaseCategory === "bacterial") {
      recs.weather_warnings.push(`🌡 High temperature (${weather.temperature}°C) accelerates bacterial multiplication. Reduce plant stress with consistent irrigation.`);
      recs.risk_score += 1;
    }
    if (weather.rainfall === 0 && diseaseCategory !== "viral") {
      recs.immediate.push("🕗 Dry conditions detected — optimal spray window right now. Apply treatments within the next 6 hours if possible.");
    }
  }

  /* Immediate actions */
  recs.immediate.push(`Remove and destroy (do not compost) visibly infected ${disease.toLowerCase()} leaves immediately to reduce inoculum load.`);
  if (diseaseCategory === "fungal")   recs.immediate.push("Prune lower leaves touching the soil and space plants to improve airflow between rows.");
  if (diseaseCategory === "bacterial") recs.immediate.push("Sanitise all pruning tools with 70% alcohol or 10% bleach solution between each plant.");
  if (diseaseCategory === "viral")    recs.immediate.push("Control whiteflies and aphids immediately — they are the primary vectors for this virus. Remove heavily infected plants.");

  /* Treatment (weather-aware) */
  const sprayBlocked = weather && weather.rainfall > WEATHER_RULES.spray_blocked_rainfall;
  if (!sprayBlocked) {
    if (diseaseCategory === "fungal") {
      recs.treatment.push("Chemical: Mancozeb (2g/L) or Chlorothalonil — spray every 7–10 days, ensuring full leaf coverage including undersides.");
      recs.treatment.push("Organic: Copper oxychloride (2.5g/L) — effective and less disruptive to soil biology. Safe near waterways.");
      recs.treatment.push("Biofungicide: Trichoderma-based soil drench reduces re-infection from the root zone and builds long-term soil health.");
    }
    if (diseaseCategory === "bacterial") {
      recs.treatment.push("Chemical: Copper hydroxide (Kocide) at 2g/L — spray foliage thoroughly, including leaf undersides.");
      recs.treatment.push("Organic: Neem oil (5ml/L) + copper soap mix — reduces spread without chemical residue, safe for pollinators.");
      recs.treatment.push("Avoid excess nitrogen fertiliser — it produces lush, disease-susceptible growth. Reduce N application by 20–30%.");
    }
    if (diseaseCategory === "viral") {
      recs.treatment.push("No curative treatment exists for viral infections. Remove severely infected plants promptly to protect the rest.");
      recs.treatment.push("Chemical vector control: Imidacloprid or Thiamethoxam to eliminate whiteflies and aphids that spread the virus.");
      recs.treatment.push("Organic vector control: Yellow sticky traps + neem oil (3ml/L) every 5 days. Inspect new growth daily.");
    }
  } else {
    recs.treatment.push("⏸ All spray treatments are on hold due to current rainfall. Prepare materials now and apply once it has been dry for at least 2 hours.");
  }

  /* Soil-specific practices */
  recs.farming_practice.push(soilNote[diseaseCategory] || soilNote.general);
  recs.farming_practice.push(soilNote.general);
  recs.farming_practice.push("Mulch around plant bases to prevent soil splash-back during rain — a primary disease transmission pathway.");
  if (diseaseCategory === "fungal") {
    recs.farming_practice.push("Switch to drip irrigation if currently using overhead sprinklers. Prolonged wet foliage is the #1 driver of fungal spread.");
  }

  /* Other crops advice */
  const normalised = otherCrops.map(c => c.trim().toLowerCase()).filter(Boolean);
  if (normalised.length === 0) {
    recs.other_crops_advice.push("No other crops declared. Add your other farm crops above to receive cross-crop disease and intercropping advice.");
  }

  normalised.forEach((crop) => {
    const isSolan = SOLANACEOUS_CROPS.some(s => crop.includes(s));
    const companion = Object.entries(COMPANION_BENEFITS).find(([k]) => crop.includes(k));

    if (isSolan) {
      recs.other_crops_advice.push(
        `⚠️ ${crop.charAt(0).toUpperCase() + crop.slice(1)} is in the Solanaceae family (same as tomato). The detected ${disease} can spread to your ${crop} plants. Maintain 10m+ separation and inspect them immediately.`
      );
      if (diseaseCategory === "fungal") {
        recs.other_crops_advice.push(`Apply the same fungicide schedule to ${crop} as a precaution — do not wait for visible symptoms.`);
      }
    } else if (companion) {
      recs.other_crops_advice.push(`✅ ${companion[0].charAt(0).toUpperCase() + companion[0].slice(1)}: ${companion[1]}`);
    } else if (crop.includes("maize") || crop.includes("corn")) {
      recs.other_crops_advice.push("🌽 Maize: Not susceptible to tomato diseases. Position maize rows on the upwind side as a natural windbreak to reduce spore dispersal onto tomato rows.");
    } else if (crop.includes("bean") || crop.includes("legume")) {
      recs.other_crops_advice.push(`✅ ${crop.charAt(0).toUpperCase() + crop.slice(1)}: Legumes fix atmospheric nitrogen, benefiting neighbouring tomatoes. Low cross-infection risk — safe to intercrop with 60cm+ row spacing.`);
    } else {
      recs.other_crops_advice.push(`${crop.charAt(0).toUpperCase() + crop.slice(1)}: No known cross-infection risk with ${disease}. Monitor for general pest pressure and maintain separation.`);
    }
  });

  if (normalised.length > 1) {
    recs.other_crops_advice.push("🌿 Mixed-farm note: Crop diversity generally reduces overall disease pressure. Ensure row spacing allows adequate airflow between crop zones.");
  }

  recs.riskLabel = recs.risk_score >= 4 ? "High" : recs.risk_score >= 2 ? "Moderate" : "Low";
  return recs;
}

/* ── Inline SVG Icons ── */
const Icon = {
  Upload: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
      <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/>
    </svg>
  ),
  Camera: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/>
    </svg>
  ),
  Scan: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
    </svg>
  ),
  Pin: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Leaf: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 014.36 7.36c2.14.11 5.03.97 7.64 3.64.69.73 1.29 1.52 1.77 2.32C15.05 10.5 17.37 8.7 20 8c0 7.5-5 12-9 12z"/>
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
    </svg>
  ),
  Alert: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  Home: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  Logout: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  X: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
};

/* ── Result Tabs Component ── */
function ResultTabs({ prediction, confidence, details, recs, weather, soilType }) {
  const [tab, setTab] = useState("diagnosis");
  const TABS = [
    { id: "diagnosis", label: "Diagnosis"    },
    { id: "treatment", label: "Treatment"    },
    { id: "farm",      label: "Farm Context" },
    { id: "crops",     label: "Your Crops"   },
  ];

  return (
    <div className="ai-results">
      <div className="ai-result-header">
        <div className="ai-result-meta">
          <div className={`ai-risk-badge ai-risk-badge--${(recs.riskLabel || "low").toLowerCase()}`}>
            {recs.riskLabel || "Low"} Risk
          </div>
          <h2 className="ai-result-disease">{prediction}</h2>
          <p className="ai-result-sub">Scan complete · Context-aware analysis</p>
        </div>
        <div className="ai-confidence-ring">
          <svg viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="17" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3.5"/>
            <circle
              cx="20" cy="20" r="17" fill="none"
              stroke="var(--sprout)" strokeWidth="3.5"
              strokeDasharray={`${(parseFloat(confidence) || 0) * 106.8 / 100} 106.8`}
              strokeLinecap="round"
              transform="rotate(-90 20 20)"
            />
          </svg>
          <div className="ai-confidence-inner">
            <span className="ai-confidence-pct">{confidence}</span>
            <span className="ai-confidence-lbl">conf.</span>
          </div>
        </div>
      </div>

      <div className="ai-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`ai-tab ${tab === t.id ? "ai-tab--active" : ""}`}
            onClick={() => setTab(t.id)}
          >{t.label}</button>
        ))}
      </div>

      <div className="ai-tab-content">

        {tab === "diagnosis" && (
          <>
            {recs.weather_warnings.length > 0 && (
              <div className="ai-alert-block">
                <div className="ai-alert-title"><Icon.Alert /> Live Weather Alerts</div>
                {recs.weather_warnings.map((w, i) => <p key={i}>{w}</p>)}
              </div>
            )}
            {details?.description && (
              <div className="ai-info-block">
                <h4>About this disease</h4>
                <p>{details.description}</p>
              </div>
            )}
            {details?.symptoms && (
              <div className="ai-info-block">
                <h4>Symptoms</h4>
                <ul>{details.symptoms.map((s, i) => <li key={i}>{s}</li>)}</ul>
              </div>
            )}
            {recs.immediate.length > 0 && (
              <div className="ai-info-block ai-info-block--urgent">
                <h4>⚡ Immediate Actions</h4>
                <ul>{recs.immediate.map((a, i) => <li key={i}>{a}</li>)}</ul>
              </div>
            )}
            {details?.confidence_note && <p className="ai-note">{details.confidence_note}</p>}
          </>
        )}

        {tab === "treatment" && (
          <>
            <div className="ai-info-block">
              <h4>Treatment Plan</h4>
              <p className="ai-block-sub">Adapted to current weather conditions at your location.</p>
              <ul>{recs.treatment.map((t, i) => <li key={i}>{t}</li>)}</ul>
            </div>
            {details?.prevention && (
              <div className="ai-info-block">
                <h4>Prevention for next season</h4>
                <ul>{details.prevention.map((p, i) => <li key={i}>{p}</li>)}</ul>
              </div>
            )}
          </>
        )}

        {tab === "farm" && (
          <>
            <div className="ai-condition-chips">
              {weather && <>
                <div className="ai-chip">🌡 {weather.temperature}°C</div>
                <div className="ai-chip">🌧 {weather.rainfall}mm</div>
                <div className="ai-chip">💨 {weather.wind_speed}m/s</div>
                <div className="ai-chip">☁️ {weather.cloud_cover}%</div>
              </>}
              {soilType && <div className="ai-chip">🌱 {soilType}</div>}
            </div>
            <div className="ai-info-block">
              <h4>Soil &amp; Farming Practice</h4>
              <p className="ai-block-sub">Recommendations adjusted for your soil type.</p>
              <ul>{recs.farming_practice.map((f, i) => <li key={i}>{f}</li>)}</ul>
            </div>
          </>
        )}

        {tab === "crops" && (
          <div className="ai-info-block">
            <h4>Cross-Farm Advice</h4>
            <p className="ai-block-sub">Based on your declared crops and the detected disease. Mixed farming risks and companion benefits included.</p>
            <ul>{recs.other_crops_advice.map((a, i) => <li key={i}>{a}</li>)}</ul>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main Export ── */
export default function AIModel({ onImageSelect }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen]         = useState(false);
  const fileInputRef                    = useRef(null);
  const cameraInputRef                  = useRef(null);
  const cropInputRef                    = useRef(null);

  const [preview, setPreview]           = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [prediction, setPrediction]     = useState("");
  const [confidence, setConfidence]     = useState("");
  const [details, setDetails]           = useState(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [contextualRecs, setContextualRecs] = useState(null);

  const [locationAccepted, setLocationAccepted] = useState(false);
  const [soilType, setSoilType]                 = useState("");
  const [weather, setWeather]                   = useState(null);
  const [otherCrops, setOtherCrops]             = useState([]);
  const [cropInput, setCropInput]               = useState("");
  const [dragOver, setDragOver]                 = useState(false);

  const handleLogout = async () => {
    try { await signOut(auth); navigate("/signin"); }
    catch (e) { console.error("Logout:", e); }
  };

  const handleFile = useCallback((file) => {
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    onImageSelect?.(file);
  }, [onImageSelect]);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) handleFile(file);
  }, [handleFile]);

  const requestLocation = () => {
    if (!("geolocation" in navigator)) { alert("Geolocation not supported."); return; }
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        setLocationAccepted(true);
        fetchFarmData(latitude, longitude);
      },
      (err) => {
        const msgs = { 1: "Location access denied — enable it in browser settings.", 2: "Location unavailable. Try again.", 3: "Location timed out. Check signal." };
        alert(msgs[err.code] || "Unknown location error.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const fetchFarmData = async (lat, lon) => {
    try {
      const res  = await fetch(`http://127.0.0.1:5000/farm/api/farm-data?lat=${lat}&lon=${lon}`);
      const data = await res.json();
      setSoilType(data.soil_type);
      setWeather(data.weather);
    } catch { console.warn("Farm data unavailable."); }
  };

  const addCrop = () => {
    const val = cropInput.trim();
    if (!val || otherCrops.includes(val.toLowerCase())) return;
    setOtherCrops(p => [...p, val.toLowerCase()]);
    setCropInput("");
    cropInputRef.current?.focus();
  };

  const modelPrediction = async () => {
    if (!selectedFile) { setError("Please upload or capture a crop image first."); return; }
    setLoading(true); setError(""); setPrediction(""); setConfidence(""); setDetails(null); setContextualRecs(null);
    try {
      const fd = new FormData();
      fd.append("image_upload", selectedFile);
      const res  = await fetch("http://127.0.0.1:5000/ml/predict", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        setPrediction(data.Predicted); setConfidence(data.Confidence); setDetails(data.Details);
        setContextualRecs(buildContextualRecommendations({ disease: data.Predicted, soilType, weather, otherCrops }));
      } else {
        setError(data.Error || "Prediction failed.");
      }
    } catch { setError("Cannot reach server. Make sure Flask is running on port 5000."); }
    setLoading(false);
  };

  const handleClear = () => {
    setSelectedFile(null); setPreview(null); setPrediction(""); setConfidence("");
    setDetails(null); setError(""); setContextualRecs(null);
  };

  return (
    <div className="ai-page">

      {/* Navbar */}
      <nav className="ai-nav">
        <div className="ai-nav-brand" onClick={() => navigate("/")}>
          <div className="ai-nav-logo-ring">
            <img src="/logo.png" alt="Crop Detect" className="ai-nav-logo" />
          </div>
          <span className="ai-nav-wordmark">Crop<span>Detect</span></span>
        </div>
        <div className="ai-nav-right">
          <div className="ai-nav-menu-wrap">
            <button className="ai-nav-menu-btn" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
              <span /><span /><span />
            </button>
            {menuOpen && (
              <div className="ai-dropdown">
                <button onClick={() => { navigate("/"); setMenuOpen(false); }}><Icon.Home /> Home</button>
                <button onClick={async () => { await handleLogout(); setMenuOpen(false); }}><Icon.Logout /> Logout</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="ai-main">

        {/* LEFT PANEL */}
        <div className="ai-panel-left">

          {/* Location */}
          {!locationAccepted ? (
            <div className="ai-location-card">
              <div className="ai-location-icon"><Icon.Pin /></div>
              <div className="ai-location-body">
                <h3>Enable Farm Location</h3>
                <p>Share your location to fetch live soil data and weather. These power your personalised recommendations.</p>
                <button className="ai-btn ai-btn--primary" onClick={requestLocation}>
                  <Icon.Pin /> Share Location
                </button>
              </div>
            </div>
          ) : (
            <div className="ai-farm-bar">
              <div className="ai-farm-stat"><span>🌱</span><strong>{soilType || "Loading…"}</strong><em>Soil Type</em></div>
              {weather && <>
                <div className="ai-farm-stat"><span>🌡</span><strong>{weather.temperature}°C</strong><em>Temperature</em></div>
                <div className="ai-farm-stat"><span>🌧</span><strong>{weather.rainfall}mm</strong><em>Rainfall</em></div>
                <div className="ai-farm-stat"><span>💨</span><strong>{weather.wind_speed}m/s</strong><em>Wind</em></div>
              </>}
            </div>
          )}

          {/* Other crops */}
          <div className="ai-card ai-crops-card">
            <div className="ai-card-header">
              <Icon.Leaf />
              <div>
                <h3>Other Farm Crops</h3>
                <p>Add crops you grow alongside tomatoes for cross-contamination and intercropping advice.</p>
              </div>
            </div>
            <div className="ai-crops-input-row">
              <input
                ref={cropInputRef}
                type="text"
                value={cropInput}
                onChange={e => setCropInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addCrop()}
                placeholder="e.g. maize, potato, beans…"
                className="ai-crops-input"
              />
              <button className="ai-crops-add-btn" onClick={addCrop} aria-label="Add crop"><Icon.Plus /></button>
            </div>
            {otherCrops.length > 0 && (
              <div className="ai-crops-tags">
                {otherCrops.map(crop => (
                  <span key={crop} className="ai-crop-tag">
                    {crop}
                    <button onClick={() => setOtherCrops(p => p.filter(c => c !== crop))} aria-label={`Remove ${crop}`}><Icon.X /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Upload */}
          <div className="ai-card ai-upload-card">
            <div className="ai-card-header">
              <Icon.Scan />
              <div>
                <h3>Scan a Tomato Leaf</h3>
                <p>Upload or photograph a diseased leaf. Model is trained on tomato crops only.</p>
              </div>
            </div>

            <div
              className={`ai-drop-zone ${dragOver ? "ai-drop-zone--over" : ""} ${preview ? "ai-drop-zone--filled" : ""}`}
              onClick={() => !preview && fileInputRef.current.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              {preview ? (
                <div className="ai-preview-wrap">
                  <img src={preview} alt="Leaf preview" className="ai-preview-img" />
                  <button className="ai-preview-clear" onClick={e => { e.stopPropagation(); handleClear(); }} aria-label="Remove image">
                    <Icon.X />
                  </button>
                </div>
              ) : (
                <div className="ai-drop-empty">
                  <div className="ai-drop-icon"><Icon.Upload /></div>
                  <p>Drag &amp; drop or click to upload</p>
                  <span>JPG, PNG supported</span>
                </div>
              )}
            </div>

            <div className="ai-upload-btns">
              <button className="ai-btn ai-btn--secondary" onClick={() => fileInputRef.current.click()}>
                <Icon.Upload /> Upload
              </button>
              <button className="ai-btn ai-btn--secondary" onClick={() => cameraInputRef.current.click()}>
                <Icon.Camera /> Camera
              </button>
            </div>

            <button
              className={`ai-btn ai-btn--primary ai-btn--full ${loading ? "ai-btn--loading" : ""}`}
              onClick={modelPrediction}
              disabled={loading || !selectedFile}
            >
              {loading
                ? <><div className="ai-spinner" />Analysing crop…</>
                : <><Icon.Scan />Run Disease Detection</>
              }
            </button>

            {error && (
              <div className="ai-error-block">
                <Icon.Alert />
                <p>{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="ai-panel-right">
          {contextualRecs ? (
            <>
              <ResultTabs
                prediction={prediction}
                confidence={confidence}
                details={details}
                recs={contextualRecs}
                weather={weather}
                soilType={soilType}
              />
              <button className="ai-btn ai-btn--ghost ai-btn--full ai-clear-btn" onClick={handleClear}>
                ✕ Clear &amp; Scan Again
              </button>
            </>
          ) : (
            <div className="ai-empty-state">
              <div className="ai-empty-icon">🌿</div>
              <h3>Context-aware diagnosis will appear here</h3>
              <p>Your results are analysed against live weather, soil type, and your farm's crop mix — not just the detected disease.</p>
              <div className="ai-empty-steps">
                <div className="ai-empty-step"><span>01</span><p>Share location for soil &amp; weather</p></div>
                <div className="ai-empty-step"><span>02</span><p>Add your other farm crops</p></div>
                <div className="ai-empty-step"><span>03</span><p>Upload a tomato leaf photo</p></div>
                <div className="ai-empty-step"><span>04</span><p>Run the detection</p></div>
              </div>
            </div>
          )}
        </div>
      </main>

      <input type="file" accept="image/*" ref={fileInputRef} hidden onChange={e => handleFile(e.target.files[0])} />
      <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} hidden onChange={e => handleFile(e.target.files[0])} />
    </div>
  );
}