import React, { useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import "./AIModel.css";

/* ─── API endpoints ─────────────────────────────────────── */
const API_BASE    = "http://127.0.0.1:5000";
const PREDICT_URL = `${API_BASE}/ml/predict`;
const WEATHER_URL = (lat, lon) => `${API_BASE}/farm/api/farm-data?lat=${lat}&lon=${lon}`;
const RECS_URL    = (disease, crop, soil, otherCrops) =>
  `${API_BASE}/api/recommendations?disease=${encodeURIComponent(disease)}&crop=${encodeURIComponent(crop)}&soil=${encodeURIComponent(soil)}&crops=${encodeURIComponent(otherCrops)}`;

/* ─── Supported crops ────────────────────────────────────── */
const SUPPORTED_CROPS = ["Tomato", "Maize", "Potato"];

/* Model class label -> MongoDB disease name map
 * Keys:   exactly what Flask returns in "predicted_disease"
 * Values: exactly what is stored in MongoDB "disease" field
 */
const DISEASE_LABEL_MAP = {
  // Tomato
  "Tomato___Bacterial_spot":         "Bacterial Spot",
  "Tomato___Early_blight":           "Early Blight",
  "Tomato___Late_blight":            "Late Blight",
  "Tomato___Leaf_Mold":              "Leaf Mold",
  "Tomato___Septoria_leaf_spot":     "Septoria Leaf Spot",
  "Tomato___Spider_mites":           "Spider Mites",
  "Tomato___Target_Spot":            "Target Spot",
  "Tomato___Yellow_Leaf_Curl_Virus": "Yellow Leaf Curl Virus",
  "Tomato___mosaic_virus":           "Mosaic Virus",
  "Tomato___healthy":                "Healthy",
  // Maize
  "Maize___Cercospora_leaf_spot":    "Cercospora Leaf Spot",
  "Maize___Common_rust":             "Common Rust",
  "Maize___Northern_Leaf_Blight":    "Northern Leaf Blight",
  "Maize___healthy":                 "Healthy Maize",
  // Potato
  "Potato___Early_blight":           "Potato Early Blight",
  "Potato___Late_blight":            "Potato Late Blight",
  "Potato___healthy":                "Healthy Potato",
};

/** Maps a raw model class string to the MongoDB disease name.
 *  Falls back to the raw string if no mapping is found. */
function normaliseDiseaseLabel(raw = "") {
  return DISEASE_LABEL_MAP[raw] ?? raw;
}

/* ─── Severity colour map ────────────────────────────────── */
const SEVERITY_COLORS = {
  High:     "#c45c3a",
  Moderate: "#d4a843",
  Low:      "#62a050",
  Healthy:  "#8cc63f",
};

/* ─── Inline icons ───────────────────────────────────────── */
const Icons = {
  Upload: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>,
  Camera: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  Scan:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2"/><line x1="3" y1="12" x2="21" y2="12"/></svg>,
  Pin:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Home:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Logout: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Plus:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  X:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Alert:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Check:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
};

/* ─── Crop emoji map ─────────────────────────────────────── */
const CROP_EMOJI = { Tomato: "🍅", Maize: "🌽", Potato: "🥔" };

/* ─── Confidence ring ────────────────────────────────────── */
function ConfidenceRing({ value }) {
  const pct  = parseFloat(value) || 0;
  const circ = 106.8;
  return (
    <div className="aim-ring">
      <svg viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="17" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3.5"/>
        <circle cx="20" cy="20" r="17" fill="none" stroke="var(--sprout)" strokeWidth="3.5"
          strokeDasharray={`${pct * circ / 100} ${circ}`}
          strokeLinecap="round" transform="rotate(-90 20 20)"
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
      </svg>
      <div className="aim-ring-inner">
        <span className="aim-ring-pct">{value || "0%"}</span>
        <span className="aim-ring-lbl">conf.</span>
      </div>
    </div>
  );
}

/* ─── Result panel ───────────────────────────────────────── */
function ResultPanel({ prediction, confidence, selectedCrop, recs, weather, soilType }) {
  const [tab, setTab] = useState("diagnosis");

  const TABS = [
    { id: "diagnosis", label: "🔍 Diagnosis"  },
    { id: "treatment", label: "💊 Treatment"  },
    { id: "farm",      label: "🌍 Conditions" },
    { id: "crops",     label: "🌿 Your Crops" },
  ];

  const riskColor = SEVERITY_COLORS[recs?.risk_level] || SEVERITY_COLORS.Low;

  return (
    <div className="aim-result">

      {/* Header */}
      <div className="aim-result-header">
        <div className="aim-result-meta">
          <div className="aim-result-crop-badge">
            {CROP_EMOJI[selectedCrop] || "🌱"} {selectedCrop}
          </div>
          <div
            className="aim-risk-pill"
            style={{ background: `${riskColor}22`, color: riskColor, borderColor: `${riskColor}55` }}
          >
            {recs?.risk_level || "Low"} Risk
          </div>
          <h2 className="aim-result-disease">{prediction}</h2>
          <p className="aim-result-sub">Analysis complete · Context-aware result</p>
        </div>
        <ConfidenceRing value={confidence} />
      </div>

      {/* Tabs */}
      <div className="aim-tabs" role="tablist">
        {TABS.map(t => (
          <button
            key={t.id} role="tab" aria-selected={tab === t.id}
            className={`aim-tab ${tab === t.id ? "aim-tab--active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="aim-tab-body" role="tabpanel">

        {tab === "diagnosis" && <>
          {recs?.weather_warnings?.length > 0 && (
            <div className="aim-alert-box">
              <div className="aim-alert-title"><Icons.Alert /> Live Weather Alerts</div>
              {recs.weather_warnings.map((w, i) => <p key={i}>{w}</p>)}
            </div>
          )}
          {recs?.description && (
            <div className="aim-info-box">
              <h4>About This Disease</h4>
              <p>{recs.description}</p>
            </div>
          )}
          {recs?.symptoms?.length > 0 && (
            <div className="aim-info-box">
              <h4>Symptoms to Look For</h4>
              <ul>{recs.symptoms.map((s, i) => <li key={i}><Icons.Check />{s}</li>)}</ul>
            </div>
          )}
          {recs?.immediate?.length > 0 && (
            <div className="aim-info-box aim-info-box--urgent">
              <h4>⚡ Do These Now</h4>
              <ul>{recs.immediate.map((a, i) => <li key={i}><Icons.Check />{a}</li>)}</ul>
            </div>
          )}
        </>}

        {tab === "treatment" && <>
          <div className="aim-info-box">
            <h4>Treatment Plan</h4>
            <p className="aim-sub-note">Adapted to today's weather at your farm.</p>
            {recs?.treatment?.length > 0
              ? <ul>{recs.treatment.map((t, i) => <li key={i}><Icons.Check />{t}</li>)}</ul>
              : <p>No treatment recommendations available.</p>
            }
          </div>
          {recs?.prevention?.length > 0 && (
            <div className="aim-info-box">
              <h4>Prevent It Next Season</h4>
              <ul>{recs.prevention.map((p, i) => <li key={i}><Icons.Check />{p}</li>)}</ul>
            </div>
          )}
        </>}

        {tab === "farm" && <>
          {(weather || soilType) && (
            <div className="aim-weather-grid">
              {weather?.temperature != null && <div className="aim-weather-chip"><span className="aim-weather-val">{weather.temperature}°C</span><span className="aim-weather-lbl">Temperature</span></div>}
              {weather?.rainfall    != null && <div className="aim-weather-chip"><span className="aim-weather-val">{weather.rainfall}mm</span><span className="aim-weather-lbl">Rainfall</span></div>}
              {weather?.wind_speed  != null && <div className="aim-weather-chip"><span className="aim-weather-val">{weather.wind_speed}m/s</span><span className="aim-weather-lbl">Wind</span></div>}
              {weather?.humidity    != null && <div className="aim-weather-chip"><span className="aim-weather-val">{weather.humidity}%</span><span className="aim-weather-lbl">Humidity</span></div>}
              {soilType && <div className="aim-weather-chip aim-weather-chip--soil"><span className="aim-weather-val">{soilType}</span><span className="aim-weather-lbl">Soil Type</span></div>}
            </div>
          )}
          <div className="aim-info-box">
            <h4>Farming Advice for Your Conditions</h4>
            <p className="aim-sub-note">Based on your soil type and current weather.</p>
            {recs?.farming_practice?.length > 0
              ? <ul>{recs.farming_practice.map((f, i) => <li key={i}><Icons.Check />{f}</li>)}</ul>
              : <p>Share your location above to get personalised conditions advice.</p>
            }
          </div>
        </>}

        {tab === "crops" && (
          <div className="aim-info-box">
            <h4>Your Other Crops</h4>
            <p className="aim-sub-note">Cross-contamination risks and companion planting benefits.</p>
            {recs?.other_crops_advice?.length > 0
              ? <ul>{recs.other_crops_advice.map((a, i) => <li key={i}>{a}</li>)}</ul>
              : <p>Add your other farm crops in the panel on the left to see cross-farm advice here.</p>
            }
          </div>
        )}

      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────── */
export default function AIModel({ user }) {
  const navigate       = useNavigate();
  const fileInputRef   = useRef(null);
  const cameraInputRef = useRef(null);
  const otherCropRef   = useRef(null);

  /* image */
  const [preview,      setPreview]      = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver,     setDragOver]     = useState(false);

  /* crop selection */
  const [selectedCrop, setSelectedCrop] = useState("Tomato");

  /* other farm crops */
  const [otherCrops,   setOtherCrops]   = useState([]);
  const [otherInput,   setOtherInput]   = useState("");

  /* results */
  const [prediction, setPrediction] = useState("");
  const [confidence, setConfidence] = useState("");
  const [recs,       setRecs]       = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");

  /* location + weather */
  const [locationState, setLocationState] = useState("idle"); // idle | loading | done | error
  const [soilType,      setSoilType]      = useState("");
  const [weather,       setWeather]       = useState(null);

  /* nav */
  const [menuOpen, setMenuOpen] = useState(false);

  /* ── Auth ── */
  const handleLogout = async () => {
    try { await signOut(auth); navigate("/signin"); }
    catch (e) { console.error(e); }
  };

  /* ── File handling ── */
  const handleFile = useCallback((file) => {
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setPrediction(""); setConfidence(""); setRecs(null); setError("");
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f?.type.startsWith("image/")) handleFile(f);
  }, [handleFile]);

  /* ── Location ── */
  const requestLocation = () => {
    if (!("geolocation" in navigator)) { alert("Geolocation not supported in this browser."); return; }
    setLocationState("loading");
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        setLocationState("done");
        try {
          const res  = await fetch(WEATHER_URL(latitude, longitude));
          const data = await res.json();
          setSoilType(data.soil_type || "");
          setWeather(data.weather || null);
        } catch { /* weather unavailable — not fatal */ }
      },
      (err) => {
        setLocationState("error");
        const msgs = { 1: "Location access denied.", 2: "Location unavailable.", 3: "Location timed out." };
        alert(msgs[err.code] || "Could not get location.");
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  /* ── Other crops (cross-farm) ── */
  const addOtherCrop = () => {
    const val = otherInput.trim().toLowerCase();
    if (!val || otherCrops.includes(val)) return;
    setOtherCrops(p => [...p, val]);
    setOtherInput("");
    otherCropRef.current?.focus();
  };

  /* ── Detection ── */
  const runDetection = async () => {
    if (!selectedFile) { setError("Please upload or take a photo of your crop leaf first."); return; }
    setLoading(true); setError("");
    setPrediction(""); setConfidence(""); setRecs(null);

    try {
      /* 1 — ML prediction */
      const fd = new FormData();
      fd.append("image_upload", selectedFile);
      fd.append("crop", selectedCrop); // send selected crop to model
      const predRes  = await fetch(PREDICT_URL, { method: "POST", body: fd });
      const predData = await predRes.json();

      if (!predRes.ok) {
        setError(predData.Error || "Detection failed. Please try again.");
        setLoading(false);
        return;
      }

      // Flask returns: { predicted_disease: "Tomato___Early_blight", confidence: "94.23%" }
      const rawLabel = predData.predicted_disease;
      const disease  = normaliseDiseaseLabel(rawLabel); // maps to MongoDB name

      if (!disease) {
        setError("Prediction returned no disease name. Check the Flask /ml/predict response.");
        setLoading(false);
        return;
      }

      setPrediction(disease);
      setConfidence(predData.confidence ?? "");

      /* 2 — Recommendations from MongoDB */
      const cropList = otherCrops.join(",");
      const recsRes  = await fetch(RECS_URL(disease, selectedCrop, soilType, cropList));
      if (recsRes.ok) {
        setRecs(await recsRes.json());
      } else {
        setRecs({
          risk_level: "Low", description: "", symptoms: [],
          immediate: [], treatment: [], farming_practice: [],
          other_crops_advice: [], weather_warnings: [], prevention: [],
        });
      }
    } catch {
      setError("Cannot reach server. Make sure Flask is running on port 5000.");
    }

    setLoading(false);
  };

  const handleClear = () => {
    setSelectedFile(null); setPreview(null);
    setPrediction(""); setConfidence(""); setRecs(null); setError("");
  };

  const displayName  = user?.displayName || user?.email?.split("@")[0] || "Farmer";
  const avatarLetter = (user?.displayName?.[0] || user?.email?.[0] || "F").toUpperCase();

  return (
    <div className="aim-page">

      {/* ── Navbar ── */}
      <nav className="aim-nav">
        <div className="aim-nav-brand" onClick={() => navigate("/")}>
          <div className="aim-nav-logo-ring">
            <img src="/logo.png" alt="Crop Detect" className="aim-nav-logo" />
          </div>
          <span className="aim-nav-wordmark">Crop<span>Detect</span></span>
        </div>

        <div className="aim-nav-right">
          {user && (
            <div className="aim-nav-user">
              <div className="aim-nav-avatar">{avatarLetter}</div>
              <span className="aim-nav-username">{displayName}</span>
            </div>
          )}
          <div className="aim-nav-menu-wrap">
            <button className="aim-menu-btn" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
              <span /><span /><span />
            </button>
            {menuOpen && (
              <div className="aim-dropdown">
                <button onClick={() => { navigate("/"); setMenuOpen(false); }}>
                  <Icons.Home /> Dashboard
                </button>
                <button className="aim-dropdown-logout" onClick={handleLogout}>
                  <Icons.Logout /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="aim-main">

        {/* ══ LEFT PANEL ══ */}
        <div className="aim-left">

          {/* Step 1 — Location */}
          <div className="aim-step-card">
            <div className="aim-step-num">Step 1</div>
            <h3 className="aim-step-title">Your Farm Location</h3>
            <p className="aim-step-desc">
              Share your location to get live weather and soil data for better advice.
            </p>

            {locationState === "idle" && (
              <button className="aim-btn aim-btn--primary aim-btn--full" onClick={requestLocation}>
                <Icons.Pin /> Share My Location
              </button>
            )}
            {locationState === "loading" && (
              <div className="aim-location-loading">
                <div className="aim-spinner" /> Getting your location…
              </div>
            )}
            {locationState === "done" && (
              <div className="aim-location-done">
                <div className="aim-weather-row">
                  <div className="aim-weather-chip">
                    <span className="aim-weather-val">{soilType || "—"}</span>
                    <span className="aim-weather-lbl">Soil</span>
                  </div>
                  {weather && <>
                    <div className="aim-weather-chip">
                      <span className="aim-weather-val">{weather.temperature}°C</span>
                      <span className="aim-weather-lbl">Temp</span>
                    </div>
                    <div className="aim-weather-chip">
                      <span className="aim-weather-val">{weather.rainfall}mm</span>
                      <span className="aim-weather-lbl">Rain</span>
                    </div>
                    <div className="aim-weather-chip">
                      <span className="aim-weather-val">{weather.wind_speed}m/s</span>
                      <span className="aim-weather-lbl">Wind</span>
                    </div>
                  </>}
                </div>
                <p className="aim-location-ok">✅ Location set — conditions loaded</p>
              </div>
            )}
            {locationState === "error" && (
              <button className="aim-btn aim-btn--ghost aim-btn--full" onClick={requestLocation}>
                <Icons.Pin /> Try Again
              </button>
            )}
          </div>

          {/* Step 2 — Crop selection */}
          <div className="aim-step-card">
            <div className="aim-step-num">Step 2</div>
            <h3 className="aim-step-title">Select Your Crop</h3>
            <p className="aim-step-desc">Choose the crop you want to diagnose.</p>

            <div className="aim-crop-select-row">
              {SUPPORTED_CROPS.map(crop => (
                <button
                  key={crop}
                  className={`aim-crop-btn ${selectedCrop === crop ? "aim-crop-btn--active" : ""}`}
                  onClick={() => setSelectedCrop(crop)}
                >
                  <span className="aim-crop-emoji">{CROP_EMOJI[crop]}</span>
                  <span className="aim-crop-label">{crop}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3 — Other farm crops */}
          <div className="aim-step-card">
            <div className="aim-step-num">Step 3</div>
            <h3 className="aim-step-title">Other Crops on Your Farm</h3>
            <p className="aim-step-desc">
              Add nearby crops to see cross-infection risks and intercropping advice.
            </p>
            <div className="aim-crops-row">
              <input
                ref={otherCropRef}
                type="text"
                value={otherInput}
                onChange={e => setOtherInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addOtherCrop()}
                placeholder="e.g. beans, onions, cassava…"
                className="aim-crops-input"
              />
              <button className="aim-crops-add" onClick={addOtherCrop} aria-label="Add crop">
                <Icons.Plus />
              </button>
            </div>
            {otherCrops.length > 0 && (
              <div className="aim-tags">
                {otherCrops.map(crop => (
                  <span key={crop} className="aim-tag">
                    {crop}
                    <button
                      onClick={() => setOtherCrops(p => p.filter(c => c !== crop))}
                      aria-label={`Remove ${crop}`}
                    >
                      <Icons.X />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Step 4 — Upload */}
          <div className="aim-step-card">
            <div className="aim-step-num">Step 4</div>
            <h3 className="aim-step-title">Take or Upload a Leaf Photo</h3>
            <p className="aim-step-desc">
              Photograph a diseased {selectedCrop.toLowerCase()} leaf in good natural light.
            </p>

            <div
              className={`aim-dropzone ${dragOver ? "aim-dropzone--over" : ""} ${preview ? "aim-dropzone--filled" : ""}`}
              onClick={() => !preview && fileInputRef.current.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              role="button" tabIndex={0}
              aria-label="Upload crop image"
            >
              {preview ? (
                <div className="aim-preview">
                  <img src={preview} alt="Leaf preview" />
                  <button
                    className="aim-preview-clear"
                    onClick={e => { e.stopPropagation(); handleClear(); }}
                    aria-label="Remove image"
                  >
                    <Icons.X />
                  </button>
                </div>
              ) : (
                <div className="aim-dropzone-empty">
                  <div className="aim-drop-icon"><Icons.Upload /></div>
                  <p>Tap to upload</p>
                  <span>or drag your photo here</span>
                </div>
              )}
            </div>

            <div className="aim-upload-row">
              <button className="aim-btn aim-btn--secondary" onClick={() => fileInputRef.current.click()}>
                <Icons.Upload /> Gallery
              </button>
              <button className="aim-btn aim-btn--secondary" onClick={() => cameraInputRef.current.click()}>
                <Icons.Camera /> Camera
              </button>
            </div>

            <button
              className={`aim-btn aim-btn--primary aim-btn--full aim-detect-btn ${loading ? "aim-btn--loading" : ""}`}
              onClick={runDetection}
              disabled={loading || !selectedFile}
            >
              {loading
                ? <><div className="aim-spinner" /> Analysing your {selectedCrop.toLowerCase()}…</>
                : <><Icons.Scan /> Detect Disease</>
              }
            </button>

            {error && (
              <div className="aim-error">
                <Icons.Alert />
                <p>{error}</p>
              </div>
            )}
          </div>

        </div>{/* end left */}

        {/* ══ RIGHT PANEL ══ */}
        <div className="aim-right">
          {recs ? (
            <>
              <ResultPanel
                prediction={prediction}
                confidence={confidence}
                selectedCrop={selectedCrop}
                recs={recs}
                weather={weather}
                soilType={soilType}
              />
              <button className="aim-btn aim-btn--ghost aim-btn--full aim-clear-btn" onClick={handleClear}>
                ✕ Clear and Scan Another Leaf
              </button>
            </>
          ) : (
            <div className="aim-empty">
              <div className="aim-empty-icon">🌿</div>
              <h3>Your result will appear here</h3>
              <p>
                Upload a leaf photo and tap <strong>Detect Disease</strong> to get a full
                diagnosis with treatment advice.
              </p>
              <div className="aim-empty-steps">
                <div className="aim-empty-step"><span>1</span><p>Share location</p></div>
                <div className="aim-empty-step"><span>2</span><p>Select crop</p></div>
                <div className="aim-empty-step"><span>3</span><p>Add nearby crops</p></div>
                <div className="aim-empty-step"><span>4</span><p>Upload &amp; detect</p></div>
              </div>
            </div>
          )}
        </div>

      </main>

      {/* Hidden file inputs */}
      <input type="file" accept="image/*" ref={fileInputRef} hidden
        onChange={e => handleFile(e.target.files[0])} />
      <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} hidden
        onChange={e => handleFile(e.target.files[0])} />
    </div>
  );
}