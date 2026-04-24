import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Doc.css";

const CROPS = [
  {
    id:    "tomato",
    label: "Tomato",
    accent: "#e05a3a",
    accentMuted: "rgba(224,90,58,0.12)",
    accentBorder: "rgba(224,90,58,0.28)",
    classes: [
      "Bacterial Spot",
      "Early Blight",
      "Late Blight",
      "Leaf Mold",
      "Septoria Leaf Spot",
      "Spider Mites (Two-spotted Mite)",
      "Target Spot",
      "Yellow Leaf Curl Virus",
      "Mosaic Virus",
      "Healthy",
    ],
    model: {
      base:       "MobileNetV2 (transfer learning)",
      inputSize:  "224 × 224 RGB",
      optimizer:  "Adam",
      loss:       "Categorical Crossentropy",
      classes:    "10 classes",
      accuracy:   "90 – 97%",
    },
    pipeline: [
      "Upload a clear tomato leaf photograph",
      "Image is resized to 224 × 224 pixels",
      "Pixel values normalised to [0, 1]",
      "MobileNetV2 extracts visual features",
      "Softmax layer outputs disease probabilities",
      "Highest-confidence class is returned",
      "Recommendation engine maps disease → treatment",
    ],
    limitations: [
      "Best accuracy on single, well-lit leaves",
      "Performance drops in very low light",
    ],
  },
  {
    id:    "maize",
    label: "Maize",
    accent: "#d4a843",
    accentMuted: "rgba(212,168,67,0.12)",
    accentBorder: "rgba(212,168,67,0.28)",
    classes: [
      "Cercospora Leaf Spot (Grey Leaf Spot)",
      "Common Rust",
      "Northern Leaf Blight",
      "Healthy",
    ],
    model: {
      base:       "MobileNetV2 (transfer learning)",
      inputSize:  "224 × 224 RGB",
      optimizer:  "Adam",
      loss:       "Categorical Crossentropy",
      classes:    "4 classes",
      accuracy:   "92 – 96%",
    },
    pipeline: [
      "Upload a clear maize leaf photograph",
      "Image is resized to 224 × 224 pixels",
      "Pixel values normalised to [0, 1]",
      "MobileNetV2 extracts visual features",
      "Softmax layer outputs disease probabilities",
      "Highest-confidence class is returned",
      "Recommendation engine maps disease → treatment",
    ],
    limitations: [
      "Leaf must be isolated, not bunched",
      "Accuracy lower on severely damaged leaves",
      "Single-leaf input only (no field panoramic)",
    ],
  },
  {
    id:    "potato",
    label: "Potato",
    accent: "#8cc63f",
    accentMuted: "rgba(140,198,63,0.12)",
    accentBorder: "rgba(140,198,63,0.28)",
    classes: [
      "Early Blight",
      "Late Blight",
      "Healthy",
    ],
    model: {
      base:       "MobileNetV2 (transfer learning)",
      inputSize:  "224 × 224 RGB",
      optimizer:  "Adam",
      loss:       "Categorical Crossentropy",
      classes:    "3 classes",
      accuracy:   "93 – 98%",
    },
    pipeline: [
      "Upload a clear potato leaf photograph",
      "Image is resized to 224 × 224 pixels",
      "Pixel values normalised to [0, 1]",
      "MobileNetV2 extracts visual features",
      "Softmax layer outputs disease probabilities",
      "Highest-confidence class is returned",
      "Recommendation engine maps disease → treatment",
    ],
    limitations: [
      "Leaf surface must be clearly visible",
      "Tuber diseases not yet supported",
      "Accuracy lower on wet or muddy leaves",
      "Night photography not recommended",
    ],
  },
];

const API_EXAMPLE = `POST /ml/predict
Content-Type: multipart/form-data

Body fields:
  image_upload  (file)    — leaf photo
  crop          (string)  — "Tomato" | "Maize" | "Potato"

─────────────────────────────────────
Response (200 OK):

{
  "crop":             "Tomato",
  "predicted_disease": "Tomato___Early_blight",
  "confidence":       "94.23%"
}`;

const RECS_EXAMPLE = `GET /api/recommendations
  ?disease=Early%20Blight
  &crop=Tomato
  &soil=Sandy%20Clay%20Loam
  &crops=maize%2Cbeans

─────────────────────────────────────
Response (200 OK):

{
  "disease":          "Early Blight",
  "crop":             "tomato",
  "risk_level":       "High",
  "description":      "Fungal disease caused by Alternaria solani…",
  "symptoms":         ["Dark brown spots with yellow halos", …],
  "immediate":        ["Remove infected leaves now", …],
  "treatment":        ["Apply copper-based fungicide", …],
  "farming_practice": "For clay soils, improve drainage…",
  "prevention":       ["Rotate crops annually", …],
  "weather_warnings": ["Rain forecast — delay spraying", …],
  "other_crops_advice": ["Maize is not at risk from Early Blight", …]
}`;

function CheckItem({ children }) {
  return (
    <li className="doc-check-item">
      <svg className="doc-check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      <span>{children}</span>
    </li>
  );
}

function NumberItem({ num, children }) {
  return (
    <li className="doc-num-item">
      <div className="doc-num-badge">{num}</div>
      <span>{children}</span>
    </li>
  );
}

function ModelSpec({ label, value }) {
  return (
    <div className="doc-spec-row">
      <span className="doc-spec-key">{label}</span>
      <span className="doc-spec-val">{value}</span>
    </div>
  );
}

function CropSection({ crop }) {
  return (
    <div className="doc-crop-section">

      <div className="doc-block">
        <h3 className="doc-block-title" style={{ color: crop.accent }}>
          Supported Disease Classes
        </h3>
        <div className="doc-class-grid">
          {crop.classes.map((cls, i) => (
            <div
              key={cls}
              className="doc-class-chip"
              style={{
                background:   cls === "Healthy" ? "rgba(140,198,63,0.08)" : crop.accentMuted,
                borderColor:  cls === "Healthy" ? "rgba(140,198,63,0.25)" : crop.accentBorder,
                color:        cls === "Healthy" ? "#8cc63f" : crop.accent,
              }}
            >
              {cls}
            </div>
          ))}
        </div>
      </div>

      <div className="doc-block">
        <h3 className="doc-block-title" style={{ color: crop.accent }}>
          Model Architecture
        </h3>
        <div className="doc-spec-table">
          <ModelSpec label="Base Model"      value={crop.model.base}       />
          <ModelSpec label="Input Size"      value={crop.model.inputSize}  />
          <ModelSpec label="Optimizer"       value={crop.model.optimizer}  />
          <ModelSpec label="Loss Function"   value={crop.model.loss}       />
          <ModelSpec label="Output Classes"  value={crop.model.classes}    />
          <ModelSpec label="Validation Acc." value={crop.model.accuracy}   />
        </div>
      </div>

      <div className="doc-block">
        <h3 className="doc-block-title" style={{ color: crop.accent }}>
          Processing Pipeline
        </h3>
        <ol className="doc-num-list">
          {crop.pipeline.map((step, i) => (
            <NumberItem key={i} num={i + 1}>{step}</NumberItem>
          ))}
        </ol>
      </div>

      <div className="doc-block">
        <h3 className="doc-block-title" style={{ color: crop.accent }}>
          Known Limitations
        </h3>
        <ul className="doc-check-list">
          {crop.limitations.map((l, i) => <CheckItem key={i}>{l}</CheckItem>)}
        </ul>
      </div>

    </div>
  );
}

export default function Documentation() {
  const navigate  = useNavigate();
  const [activeCrop, setActiveCrop] = useState("tomato");
  const crop = CROPS.find(c => c.id === activeCrop);

  return (
    <div className="doc-page">

      <nav className="doc-nav">
        <button className="doc-nav-brand" onClick={() => navigate("/")}>
          <img src="/logo.png" alt="CropDetect" className="doc-nav-logo" />
          <span className="doc-nav-wordmark">Crop<span>Detect</span></span>
        </button>
        <button className="doc-nav-cta" onClick={() => navigate("/ai-model")}>
          Try the AI Model →
        </button>
      </nav>

      <main className="doc-main">

        <header className="doc-hero">
          <div className="doc-hero-tag">Documentation</div>
          <h1 className="doc-hero-title">
            CropDetect AI Model
          </h1>
          <p className="doc-hero-desc">
            Three specialist deep-learning models — one each for tomato, maize, and potato —
            detecting leaf diseases from a single photograph and delivering context-aware
            treatment advice for Kenyan smallholder farmers.
          </p>
        </header>

        <section className="doc-section" aria-labelledby="overview-heading">
          <h2 id="overview-heading" className="doc-section-title">System Overview</h2>
          <div className="doc-overview-grid">
            {[
              { label: "3 ML Models",     desc: "Separate specialist models for tomato, maize, and potato" },
              { label: "Photo Input",      desc: "Upload or photograph a single leaf — results in seconds" },
              { label: "Live Context",     desc: "Weather, soil type and neighbouring crops shape every result" },
              { label: "Treatment Plans",  desc: "Immediate actions, fungicides, and prevention — in plain language" },
            ].map(card => (
              <div key={card.label} className="doc-overview-card">
                <div className="doc-overview-icon">{card.icon}</div>
                <div>
                  <div className="doc-overview-label">{card.label}</div>
                  <p className="doc-overview-desc">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="doc-section" aria-labelledby="crops-heading">
          <h2 id="crops-heading" className="doc-section-title">Crop Models</h2>
          <p className="doc-section-sub">
            Each crop runs on its own trained model with dedicated class labels and disease mappings.
          </p>

          <div className="doc-crop-tabs" role="tablist">
            {CROPS.map(c => (
              <button
                key={c.id}
                role="tab"
                aria-selected={activeCrop === c.id}
                className={`doc-crop-tab ${activeCrop === c.id ? "doc-crop-tab--active" : ""}`}
                style={activeCrop === c.id ? {
                  borderColor: c.accent,
                  color: c.accent,
                  background: c.accentMuted,
                } : {}}
                onClick={() => setActiveCrop(c.id)}
              >
                <span>{c.label}</span>
              </button>
            ))}
          </div>

          <div role="tabpanel">
            <CropSection key={activeCrop} crop={crop} />
          </div>
        </section>

      </main>
    </div>
  );
}