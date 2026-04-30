import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Doc.css";

const STEPS = [
  { title: "Open the App",         desc: "Open CropDetect on your phone and sign in to your account." },
  { title: "Choose Your Crop",     desc: "Select whether you are growing Tomato, Maize, or Potato." },
  { title: "Take a Clear Photo",   desc: "Take a close photo of one sick leaf. Make sure the leaf fills most of the screen." },
  { title: "Tap Predict",          desc: "Press the green Predict button and wait a few seconds." },
  { title: "Read Your Result",     desc: "The app will tell you the disease name and what to do about it." },
  { title: "Follow the Treatment", desc: "Read the treatment steps carefully and act quickly for the best results." },
];

const CROPS = {
  tomato: {
    label: "Tomato",
    tab:   "tomato",
    diseases: [
      { name: "Early Blight",           sign: "Brown spots with yellow rings on older leaves",        sev: "medium" },
      { name: "Late Blight",            sign: "Dark, water-soaked patches that spread fast",          sev: "high"   },
      { name: "Leaf Mold",              sign: "Yellow patches on top of leaf, grey-brown below",      sev: "medium" },
      { name: "Septoria Leaf Spot",     sign: "Small round spots with dark edges and pale centres",   sev: "medium" },
      { name: "Spider Mites",           sign: "Tiny dots and fine webbing under the leaf",            sev: "medium" },
      { name: "Yellow Leaf Curl Virus", sign: "Leaves curl upward and turn yellow from the edges",    sev: "high"   },
      { name: "Mosaic Virus",           sign: "Patchy light and dark green pattern on leaves",        sev: "high"   },
      { name: "Bacterial Spot",         sign: "Small dark water-soaked spots, sometimes with yellow", sev: "medium" },
      { name: "Target Spot",            sign: "Circular spots with rings, like a dart board",         sev: "medium" },
      { name: "Healthy",                sign: "No signs of disease. Your crop looks good!",          sev: "low"    },
    ],
  },
  maize: {
    label: "Maize",
    tab:   "maize",
    diseases: [
      { name: "Grey Leaf Spot",        sign: "Long narrow grey-brown streaks along the leaf",        sev: "high"   },
      { name: "Common Rust",           sign: "Raised orange-brown powder spots on both leaf sides",  sev: "medium" },
      { name: "Northern Leaf Blight",  sign: "Long cigar-shaped grey-green lesions on leaves",       sev: "high"   },
      { name: "Healthy",               sign: "No signs of disease. Your crop looks good!",          sev: "low"    },
    ],
  },
  potato: {
    label: "Potato",
    tab:   "potato",
    diseases: [
      { name: "Early Blight", sign: "Brown spots with yellow rings, starting on older leaves", sev: "medium" },
      { name: "Late Blight",  sign: "Dark, fast-spreading water-soaked patches",               sev: "high"   },
      { name: "Healthy",      sign: "No signs of disease. Your crop looks good!",             sev: "low"    },
    ],
  },
};

const PHOTO_TIPS = {
  good: [
    { label: "Good Light",     desc: "Take photos in daylight, outside or near a window" },
    { label: "One Leaf",       desc: "Focus on a single sick leaf, up close" },
    { label: "Flat and Clear", desc: "Hold the leaf flat so the spots are clearly visible" },
    { label: "Steady Hand",    desc: "Hold still so the photo is not blurry" },
  ],
  bad: [
    { label: "Avoid Darkness", desc: "Night or dark shade photos give poor results" },
    { label: "Too Far Away",   desc: "Do not stand far back — the leaf must fill the screen" },
    { label: "Wet Leaves",     desc: "Dry leaves give better results than wet ones" },
    { label: "Many Leaves",    desc: "Do not photograph a whole bunch of leaves at once" },
  ],
};

const RESULT_ROWS = [
  { label: "Disease Name",    value: "The name of the disease found on your leaf, or 'Healthy' if no disease is detected." },
  { label: "Confidence",      value: "How sure the AI is about the result — a higher percentage means the app is more confident." },
  { label: "Risk Level",      value: "High means act today. Moderate means act soon. Low means keep watching your crops." },
  { label: "What To Do Now",  value: "Step-by-step treatment actions you can take immediately to protect your crop." },
  { label: "Prevention Tips", value: "Simple steps to stop the disease from spreading to healthy plants." },
];

const FAQS = [
  { q: "Does the app work without internet?",       a: "The app needs an internet connection to analyse your photo. A basic mobile data connection is enough — it does not use much data." },
  { q: "What if my phone camera is not very good?", a: "Most phone cameras work well. Just make sure the leaf is in focus and you are in good light. Avoid taking photos at night or in very dark shade." },
  { q: "Can I use the app for other crops?",        a: "Right now the app works for Tomato, Maize, and Potato. More crops will be added soon." },
  { q: "What if the app gives the wrong answer?",   a: "The app is very accurate but not perfect. If you are unsure, take another photo in better light, or show the result to your local agricultural officer." },
  { q: "Is my information safe?",                   a: "Yes. Your photos and results are stored securely and are only visible to you. We do not share your personal details with anyone." },
];

/* FAQ component */
function FAQ({ items }) {
  const [open, setOpen] = useState(null);
  return (
    <div className="faq-list">
      {items.map((item, i) => (
        <div className="faq-item" key={i}>
          <button className="faq-q" onClick={() => setOpen(open === i ? null : i)}>
            <span>{item.q}</span>
            <span className={`faq-arrow ${open === i ? "open" : ""}`}>▾</span>
          </button>
          {open === i && <div className="faq-a">{item.a}</div>}
        </div>
      ))}
    </div>
  );
}

export default function Documentation() {
  const navigate = useNavigate();
  const [activeCrop, setActiveCrop] = useState("tomato");
  const crop = CROPS[activeCrop];

  return (
    <>
      <nav className="dn">
        <button className="dn-brand" onClick={() => navigate("/")}>
          <img src="/logo.png" alt="CropDetect" className="dn-logo" />
          <span className="dn-word">Crop<span>Detect</span></span>
        </button>
      </nav>

      <header className="dh">
        <div className="dh-tag">How It Works</div>
        <h1 className="dh-title">Your Guide to Using CropDetect</h1>
        <p className="dh-desc">
          Simple steps to detect crop disease and get treatment advice right from your phone.
        </p>
        <button className="dh-btn" onClick={() => navigate("/ai-model")}>
          Start Detecting
        </button>
      </header>

      <main className="dm">

        <section className="ds">
          <h2 className="ds-title">How to Use the App</h2>
          <p className="ds-sub">Follow these simple steps</p>
          <div className="step-list">
            {STEPS.map((s, i) => (
              <div className="step-card" key={i}>
                <div className="step-num">{i + 1}</div>
                <div className="step-body">
                  <div className="step-title">{s.title}</div>
                  <div className="step-desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="ds">
          <h2 className="ds-title">How to Take a Good Photo</h2>
          <p className="ds-sub">A clear photo gives a better result</p>

          <p className="do-label">Do this</p>
          <div className="photo-grid" style={{ marginBottom: 16 }}>
            {PHOTO_TIPS.good.map((p, i) => (
              <div className="photo-card good" key={i}>
                <div className="photo-card-label">{p.label}</div>
                <div className="photo-card-desc">{p.desc}</div>
              </div>
            ))}
          </div>

          <p className="dont-label">Avoid this</p>
          <div className="photo-grid">
            {PHOTO_TIPS.bad.map((p, i) => (
              <div className="photo-card bad" key={i}>
                <div className="photo-card-label">{p.label}</div>
                <div className="photo-card-desc">{p.desc}</div>
              </div>
            ))}
          </div>

          <div className="tip-box">
            <div className="tip-text">
              Tip: Take the photo in the morning when the leaf is dry and the light is good.
            </div>
          </div>
        </section>

        <section className="ds">
          <h2 className="ds-title">Diseases the App Can Detect</h2>
          <p className="ds-sub">Select your crop to see the list</p>

          <div className="crop-tabs">
            {Object.values(CROPS).map(c => (
              <button
                key={c.tab}
                className={`crop-tab ${activeCrop === c.tab ? `active-${c.tab}` : ""}`}
                onClick={() => setActiveCrop(c.tab)}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="disease-grid">
            {crop.diseases.map((d, i) => (
              <div className={`disease-card severity-${d.sev}`} key={i}>
                <div className="disease-name">{d.name}</div>
                <div className="disease-sign">Signs: {d.sign}</div>
                <span className={`sev-pill sev-${d.sev}`}>
                  {d.sev === "high" ? "Act Fast" : d.sev === "medium" ? "Act Soon" : "No Action Needed"}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="ds">
          <h2 className="ds-title">Understanding Your Result</h2>
          <p className="ds-sub">Here is what each part of the result means</p>
          <div className="result-box">
            {RESULT_ROWS.map((r, i) => (
              <div className="result-row" key={i}>
                <div className="result-label">{r.label}</div>
                <div className="result-value">{r.value}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="ds">
          <h2 className="ds-title">Common Questions</h2>
          <p className="ds-sub">Answers to questions farmers often ask</p>
          <FAQ items={FAQS} />
        </section>

        <div className="dcta">
          <div className="dcta-title">Ready to check your crops?</div>
          <p className="dcta-sub">
            Take a photo of any sick leaf and get your result in seconds.
          </p>
          <button className="dcta-btn" onClick={() => navigate("/ai-model")}>
            Start Detecting Now
          </button>
        </div>

      </main>
    </>
  );
}