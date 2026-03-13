import React, { useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import "./AIModel.css";

const API_BASE    =  "http://localhost:5000";
const PREDICT_URL = `${API_BASE}/ml/predict`;
const WEATHER_URL = (lat, lon) => `${API_BASE}/farm/api/farm-data?lat=${lat}&lon=${lon}`;
const RECS_URL    = (disease, crop, soil, otherCrops) =>
  `${API_BASE}/api/recommendations?disease=${encodeURIComponent(disease)}&crop=${encodeURIComponent(crop)}&soil=${encodeURIComponent(soil)}&crops=${encodeURIComponent(otherCrops)}`;

const SUPPORTED_CROPS = ["Tomato", "Maize", "Potato"];
const DISEASE_LABEL_MAP = {
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
  "Maize___Cercospora_leaf_spot":    "Cercospora Leaf Spot",
  "Maize___Common_rust":             "Common Rust",
  "Maize___Northern_Leaf_Blight":    "Northern Leaf Blight",
  "Maize___healthy":                 "Healthy Maize",
  "Potato___Early_blight":           "Potato Early Blight",
  "Potato___Late_blight":            "Potato Late Blight",
  "Potato___healthy":                "Healthy Potato",
};

function normaliseDiseaseLabel(raw = "") {
  return DISEASE_LABEL_MAP[raw] ?? raw;
}

const SEVERITY_COLORS = {
  High:     "#c45c3a",
  Moderate: "#d4a843",
  Low:      "#62a050",
  Healthy:  "#8cc63f",
};

const Icons = {
  Upload:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>,
  Camera:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  Scan:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2"/><line x1="3" y1="12" x2="21" y2="12"/></svg>,
  Pin:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Home:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Logout:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Plus:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  X:        () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Alert:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Check:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Download: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
};

/* Report generator */
function generateReport({ prediction, confidence, selectedCrop, recs, weather, soilType, otherCrops, userEmail }) {
  const now      = new Date();
  const dateStr  = now.toLocaleDateString("en-KE", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const timeStr  = now.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" });
  const riskColor = SEVERITY_COLORS[recs?.risk_level] || SEVERITY_COLORS.Low;
  const pct       = parseFloat(confidence) || 0;

  const list = (items = []) =>
    items.length ? `<ul>${items.map(i => `<li>${i}</li>`).join("")}</ul>` : "<p>—</p>";

  const weatherRows = weather ? [
    weather.temperature  != null ? `<div class="chip"><strong>${weather.temperature}°C</strong><small>Temperature</small></div>` : "",
    weather.rainfall     != null ? `<div class="chip"><strong>${weather.rainfall}mm</strong><small>Rainfall</small></div>` : "",
    weather.wind_speed   != null ? `<div class="chip"><strong>${weather.wind_speed}m/s</strong><small>Wind</small></div>` : "",
    weather.cloud_cover  != null ? `<div class="chip"><strong>${weather.cloud_cover}%</strong><small>Cloud Cover</small></div>` : "",
    weather.weather_label        ? `<div class="chip"><strong>${weather.weather_label}</strong><small>Condition</small></div>` : "",
  ].filter(Boolean).join("") : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>CropDetect Report — ${prediction} — ${now.toISOString().slice(0,10)}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,600;0,700;1,400&family=Outfit:wght@300;400;500;600&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Outfit',sans-serif;background:#f4f0e8;color:#3d2b1f;line-height:1.6;padding:0}
  @media print{body{background:#fff}@page{margin:20mm}}

  /* Page */
  .page{max-width:740px;margin:0 auto;background:white;box-shadow:0 2px 24px rgba(0,0,0,0.12)}

  /* Header */
  .header{background:#1c3b24;padding:2.5rem 2.5rem 2rem;color:white}
  .header-top{display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;flex-wrap:wrap}
  .logo-row{display:flex;align-items:center;gap:0.6rem;margin-bottom:1.5rem}
  .logo-box{width:32px;height:32px;background:rgba(140,198,63,0.2);border:1px solid rgba(140,198,63,0.4);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1rem}
  .logo-text{font-family:'Lora',serif;font-size:1.1rem;font-weight:700;color:#f7f3ed}
  .logo-text span{color:#8cc63f}
  .report-label{font-size:0.65rem;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:rgba(247,243,237,0.5);margin-bottom:0.5rem}
  .disease-name{font-family:'Lora',serif;font-size:2rem;font-weight:700;color:#f7f3ed;letter-spacing:-0.02em;line-height:1.1;margin-bottom:0.6rem}
  .meta-row{display:flex;flex-wrap:wrap;gap:0.6rem;align-items:center;margin-top:0.5rem}
  .crop-badge{display:inline-flex;align-items:center;gap:0.3rem;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);padding:0.28rem 0.75rem;border-radius:20px;font-size:0.78rem;font-weight:500;color:rgba(247,243,237,0.85)}
  .risk-badge{display:inline-flex;align-items:center;gap:0.3rem;padding:0.28rem 0.75rem;border-radius:20px;font-size:0.78rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;border:1px solid;background:${riskColor}22;color:${riskColor};border-color:${riskColor}66}
  .conf-area{display:flex;flex-direction:column;align-items:center;gap:0.4rem;flex-shrink:0}
  .conf-ring-svg{width:72px;height:72px}
  .conf-ring-bg{fill:none;stroke:rgba(255,255,255,0.1);stroke-width:3.5}
  .conf-ring-fill{fill:none;stroke:#8cc63f;stroke-width:3.5;stroke-linecap:round;stroke-dasharray:${pct * 106.8 / 100} 106.8;transform:rotate(-90deg);transform-origin:50% 50%}
  .conf-label-main{font-size:0.95rem;font-weight:700;fill:#8cc63f;dominant-baseline:middle;text-anchor:middle}
  .conf-label-sub{font-size:0.55rem;fill:rgba(247,243,237,0.4);dominant-baseline:middle;text-anchor:middle}

  /* Body */
  .body{padding:2rem 2.5rem}
  .section{margin-bottom:1.75rem;border:1px solid rgba(61,43,31,0.1);border-radius:12px;overflow:hidden}
  .section-head{background:#f7f3ed;border-bottom:1px solid rgba(61,43,31,0.08);padding:0.75rem 1.1rem;font-size:0.7rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#4a7c3f}
  .section-body{padding:1.1rem 1.1rem 1.25rem;background:white}
  .section-body p{font-size:0.9rem;color:#3d2b1f;line-height:1.75;font-weight:300}
  .section-body ul{padding-left:0;list-style:none;display:flex;flex-direction:column;gap:0.45rem}
  .section-body ul li{font-size:0.88rem;color:#3d2b1f;line-height:1.65;padding-left:1.4rem;position:relative;font-weight:400}
  .section-body ul li::before{content:"✓";position:absolute;left:0;color:#4a7c3f;font-weight:700;font-size:0.8rem}

  /* Weather chips */
  .chips{display:flex;flex-wrap:wrap;gap:0.65rem;margin-bottom:1rem}
  .chip{background:#f7f3ed;border:1px solid rgba(61,43,31,0.1);border-radius:8px;padding:0.6rem 0.9rem;display:flex;flex-direction:column;align-items:center;gap:0.12rem;min-width:80px}
  .chip strong{font-size:0.95rem;font-weight:600;color:#3d2b1f}
  .chip small{font-size:0.65rem;color:#6b5c4a;letter-spacing:0.04em}

  /* Alert box */
  .alert-box{background:rgba(212,168,67,0.08);border:1px solid rgba(212,168,67,0.3);border-left:3px solid #d4a843;border-radius:8px;padding:0.9rem 1rem;margin-bottom:1rem}
  .alert-box .alert-title{font-size:0.78rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#7a5200;margin-bottom:0.4rem}
  .alert-box p{font-size:0.85rem;color:#5a3e00;line-height:1.6;margin-bottom:0.25rem;font-weight:300}

  /* Other crops */
  .crop-tags{display:flex;flex-wrap:wrap;gap:0.4rem}
  .crop-tag{display:inline-block;background:#f0f7e8;border:1px solid rgba(74,124,63,0.25);color:#2d5a38;padding:0.25rem 0.65rem;border-radius:20px;font-size:0.78rem;font-weight:500}

  /* Footer */
  .footer{border-top:1px solid rgba(61,43,31,0.1);padding:1.25rem 2.5rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem;background:#f7f3ed}
  .footer-brand{font-family:'Lora',serif;font-size:0.85rem;font-weight:700;color:#1c3b24}
  .footer-brand span{color:#4a7c3f}
  .footer-meta{font-size:0.75rem;color:#6b5c4a;text-align:right}
</style>
</head>
<body>
<div class="page">

  <div class="header">
    <div class="logo-row">
      <div class="logo-box">🍃</div>
      <span class="logo-text">Crop<span>Detect</span></span>
    </div>
    <div class="report-label">Crop Disease Detection Report</div>
    <div class="header-top">
      <div>
        <div class="disease-name">${prediction}</div>
      </div>
      <div class="conf-area">
        <svg class="conf-ring-svg" viewBox="0 0 40 40">
          <circle class="conf-ring-bg" cx="20" cy="20" r="17"/>
          <circle class="conf-ring-fill" cx="20" cy="20" r="17"/>
          <text class="conf-label-main" x="20" y="19">${confidence}</text>
          <text class="conf-label-sub"  x="20" y="26">conf.</text>
        </svg>
      </div>
    </div>
  </div>

  <div class="body">

    ${recs?.description ? `
    <div class="section">
      <div class="section-head">About This Disease</div>
      <div class="section-body"><p>${recs.description}</p></div>
    </div>` : ""}

    ${recs?.weather_warnings?.length ? `
    <div class="alert-box">
      <div class="alert-title">⚠ Live Weather Alerts</div>
      ${recs.weather_warnings.map(w => `<p>${w}</p>`).join("")}
    </div>` : ""}

    ${recs?.symptoms?.length ? `
    <div class="section">
      <div class="section-head">Symptoms to Look For</div>
      <div class="section-body">${list(recs.symptoms)}</div>
    </div>` : ""}

    ${recs?.immediate?.length ? `
    <div class="section">
      <div class="section-head">Immediate Actions</div>
      <div class="section-body">${list(recs.immediate)}</div>
    </div>` : ""}

    ${recs?.treatment?.length ? `
    <div class="section">
      <div class="section-head">Treatment Plan</div>
      <div class="section-body">${list(recs.treatment)}</div>
    </div>` : ""}

    ${recs?.prevention?.length ? `
    <div class="section">
      <div class="section-head">Prevention for Next Season</div>
      <div class="section-body">${list(recs.prevention)}</div>
    </div>` : ""}

    ${(weather || soilType) ? `
    <div class="section">
      <div class="section-head">Farm Conditions at Scan Time</div>
      <div class="section-body">
        <div class="chips">
          ${soilType ? `<div class="chip"><strong>${soilType}</strong><small>Soil Type</small></div>` : ""}
          ${weatherRows}
        </div>
        ${recs?.farming_practice?.length ? `
        <p style="font-size:0.78rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#4a7c3f;margin-bottom:0.5rem">Farming Advice</p>
        ${list(recs.farming_practice)}` : ""}
      </div>
    </div>` : ""}

    ${otherCrops?.length ? `
    <div class="section">
      <div class="section-head">Other Crops on Your Farm</div>
      <div class="section-body">
        <div class="crop-tags" style="margin-bottom:${recs?.other_crops_advice?.length ? "0.85rem" : "0"}">
          ${otherCrops.map(c => `<span class="crop-tag">${c}</span>`).join("")}
        </div>
        ${recs?.other_crops_advice?.length ? list(recs.other_crops_advice) : ""}
      </div>
    </div>` : ""}

  </div>

  <div class="footer">
    <span class="footer-brand">Crop<span>Detect</span> · AI-Powered Diagnosis</span>
    <span class="footer-meta">
      ${userEmail ? `${userEmail} · ` : ""}${dateStr} · ${timeStr}
    </span>
  </div>

</div>
</body>
</html>`;

  const blob     = new Blob([html], { type: "text/html;charset=utf-8" });
  const url      = URL.createObjectURL(blob);
  const filename = `CropDetect_${selectedCrop}_${prediction.replace(/\s+/g, "_")}_${now.toISOString().slice(0,10)}.html`;
  const a        = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ConfidenceRing */
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

/* ResultPanel */
function ResultPanel({ prediction, confidence, selectedCrop, recs, weather, soilType, otherCrops, userEmail }) {
  const [tab, setTab] = useState("diagnosis");

  const TABS = [
    { id: "diagnosis", label: "Diagnosis"  },
    { id: "treatment", label: "Treatment"  },
    { id: "farm",      label: "Conditions" },
    { id: "crops",     label: "Your Crops" },
  ];

  const riskColor = SEVERITY_COLORS[recs?.risk_level] || SEVERITY_COLORS.Low;

  const handleDownload = () => {
    generateReport({ prediction, confidence, selectedCrop, recs, weather, soilType, otherCrops, userEmail });
  };

  return (
    <div className="aim-result">

      <div className="aim-result-header">
        <div className="aim-result-meta">
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
              <h4>Do These Now</h4>
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
              {weather?.temperature  != null && <div className="aim-weather-chip"><span className="aim-weather-val">{weather.temperature}°C</span><span className="aim-weather-lbl">Temperature</span></div>}
              {weather?.rainfall     != null && <div className="aim-weather-chip"><span className="aim-weather-val">{weather.rainfall}mm</span><span className="aim-weather-lbl">Rainfall</span></div>}
              {weather?.wind_speed   != null && <div className="aim-weather-chip"><span className="aim-weather-val">{weather.wind_speed}m/s</span><span className="aim-weather-lbl">Wind Speed</span></div>}
              {weather?.cloud_cover  != null && <div className="aim-weather-chip"><span className="aim-weather-val">{weather.cloud_cover}%</span><span className="aim-weather-lbl">Cloud Cover</span></div>}
              {weather?.weather_label && <div className="aim-weather-chip aim-weather-chip--label"><span className="aim-weather-val aim-weather-val--label">{weather.weather_label}</span><span className="aim-weather-lbl">Condition</span></div>}
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

      {/* Download button — shown below all tabs */}
      <div style={{ padding: "0 1.5rem 1.5rem" }}>
        <button className="aim-download-btn" onClick={handleDownload}>
          <Icons.Download />
          Download Report as File
        </button>
      </div>

    </div>
  );
}

/* Main component */
export default function AIModel({ user }) {
  const navigate       = useNavigate();
  const fileInputRef   = useRef(null);
  const cameraInputRef = useRef(null);
  const otherCropRef   = useRef(null);

  const [preview,      setPreview]      = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver,     setDragOver]     = useState(false);

  const [selectedCrop, setSelectedCrop] = useState("Tomato");

  const [otherCrops,   setOtherCrops]   = useState([]);
  const [otherInput,   setOtherInput]   = useState("");

  const [prediction, setPrediction] = useState("");
  const [confidence, setConfidence] = useState("");
  const [recs,       setRecs]       = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");

  const [locationState, setLocationState] = useState("idle");
  const [soilType,      setSoilType]      = useState("");
  const [weather,       setWeather]       = useState(null);

  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef(null);

  const handleLogout = async () => {
    try { await signOut(auth); navigate("/signin"); }
    catch (e) { console.error(e); }
    setAvatarOpen(false);
  };

  React.useEffect(() => {
    const handler = (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target))
        setAvatarOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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
        } catch (e) { console.error(e); }
      },
      (err) => {
        setLocationState("error");
        const msgs = { 1: "Location access denied.", 2: "Location unavailable.", 3: "Location timed out." };
        alert(msgs[err.code] || "Could not get location.");
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  const addOtherCrop = () => {
    const val = otherInput.trim().toLowerCase();
    if (!val || otherCrops.includes(val)) return;
    setOtherCrops(p => [...p, val]);
    setOtherInput("");
    otherCropRef.current?.focus();
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreview(null);
    setPrediction("");
    setConfidence("");
    setRecs(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const runDetection = async () => {
    if (!selectedFile) { setError("Please upload or take a photo of your crop leaf first."); return; }
    setLoading(true); setError("");
    setPrediction(""); setConfidence(""); setRecs(null);

    try {
      const formData = new FormData();
      formData.append("image_upload", selectedFile);
      formData.append("crop",         selectedCrop);
      formData.append("user_uid",     user?.uid     || "");
      formData.append("user_email",   user?.email   || "");
      formData.append("soil_type",    soilType      || "");
      formData.append("weather",      weather ? JSON.stringify(weather) : "");

      const res = await fetch(PREDICT_URL, { method: "POST", body: formData });
      if (!res.ok) throw new Error("Could not analyze image.");
      const data = await res.json();

      const rawLabel = data.predicted_disease || data.prediction || data.predicted_class || "Unknown";
      const conf     = data.confidence || "0%";
      const disease  = normaliseDiseaseLabel(rawLabel);

      setPrediction(disease);
      setConfidence(conf);

      const recsRes = await fetch(RECS_URL(disease, selectedCrop, soilType, otherCrops.join(",")));
      if (recsRes.ok) {
        setRecs(await recsRes.json());
      } else {
        setRecs({
          risk_level: "Low", description: "", symptoms: [],
          immediate: [], treatment: [], farming_practice: [],
          other_crops_advice: [], weather_warnings: [], prevention: [],
        });
      }
    } catch (e) {
      console.error(e);
      setError("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const displayName  = user?.displayName || user?.email?.split("@")[0] || "User";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="aim-page">
      <nav className="aim-nav">
        <div className="aim-nav-brand" onClick={() => navigate("/")}>
          <div className="aim-nav-logo-ring">
            <img src="/logo.png" alt="Crop Detect" className="aim-nav-logo" />
          </div>
          <span className="aim-nav-wordmark">Crop<span>Detect</span></span>
        </div>

        <div className="aim-nav-right">
          {user ? (
            <div className="db-avatar-wrap" ref={avatarRef}>
              <button
                className={`db-avatar ${avatarOpen ? "db-avatar--open" : ""}`}
                onClick={() => setAvatarOpen(p => !p)}
                aria-label="Account menu"
              >
                {avatarLetter}
              </button>

              {avatarOpen && (
                <div className="db-avatar-dropdown">
                  <div className="db-avatar-dropdown-header">
                    <div className="db-avatar-dropdown-badge">{avatarLetter}</div>
                    <div className="db-avatar-dropdown-info">
                      <span className="db-avatar-dropdown-name">{displayName}</span>
                      <span className="db-avatar-dropdown-email">{user.email}</span>
                    </div>
                  </div>
                  <div className="db-avatar-dropdown-divider" />
                  <button
                    className="db-avatar-dropdown-item"
                    onClick={() => { navigate("/"); setAvatarOpen(false); }}
                  >
                    <Icons.Home /> Dashboard
                  </button>
                  <div className="db-avatar-dropdown-divider" />
                  <button
                    className="db-avatar-dropdown-item db-avatar-dropdown-item--logout"
                    onClick={handleLogout}
                  >
                    <Icons.Logout /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="aim-btn aim-btn--primary" onClick={() => navigate("/signin")}>
              Sign In
            </button>
          )}
        </div>
      </nav>

      <main className="aim-main">

        <div className="aim-left">

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
                    <div className="aim-weather-chip"><span className="aim-weather-val">{weather.temperature}°C</span><span className="aim-weather-lbl">Temp</span></div>
                    <div className="aim-weather-chip"><span className="aim-weather-val">{weather.rainfall}mm</span><span className="aim-weather-lbl">Rain</span></div>
                    <div className="aim-weather-chip"><span className="aim-weather-val">{weather.wind_speed}m/s</span><span className="aim-weather-lbl">Wind</span></div>
                    <div className="aim-weather-chip"><span className="aim-weather-val">{weather.cloud_cover}%</span><span className="aim-weather-lbl">Cloud</span></div>
                    <div className="aim-weather-chip aim-weather-chip--label">
                      <span className="aim-weather-val aim-weather-val--label">{weather.weather_label}</span>
                      <span className="aim-weather-lbl">Condition</span>
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
                  <span className="aim-crop-label">{crop}</span>
                </button>
              ))}
            </div>
          </div>

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

        </div>

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
                otherCrops={otherCrops}
                userEmail={user?.email}
              />
              <button className="aim-btn aim-btn--ghost aim-btn--full aim-clear-btn" onClick={handleClear}>
                ✕ Clear and Scan Another Leaf
              </button>
            </>
          ) : (
            <div className="aim-empty">
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

      <input type="file" accept="image/*" ref={fileInputRef} hidden
        onChange={e => handleFile(e.target.files[0])} />
      <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} hidden
        onChange={e => handleFile(e.target.files[0])} />
    </div>
  );
}