import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import "./AIModel.css";

function AIModel({ onImageSelect }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [prediction, setPrediction] = useState("");
  const [confidence, setConfidence] = useState("");
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [locationAccepted, setLocationAccepted] = useState(false);
  const [latLon, setLatLon] = useState(null);
  const [soilType, setSoilType] = useState("");
  const [weather, setWeather] = useState(null);
  const [riskLevel, setRiskLevel] = useState("");

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/signin");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleFile = (file) => {
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      onImageSelect && onImageSelect(file);
    }
  };

  const requestLocation = () => {
    if (!("geolocation" in navigator)) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationAccepted(true);
        const { latitude, longitude } = position.coords;
        setLatLon({ latitude, longitude });
        fetchFarmData(latitude, longitude);
      },
      (error) => {
        setLocationAccepted(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert(
              "Location access denied. Please allow it to fetch soil and weather data."
            );
            break;
          case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            alert("The request to get your location timed out.");
            break;
          default:
            alert("An unknown error occurred while fetching your location.");
        }
        console.error("Geolocation error:", error);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const fetchFarmData = async (lat, lon) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/farm/api/farm-data?lat=${lat}&lon=${lon}`
      );
      const data = await response.json();
      setSoilType(data.soil_type);
      setWeather(data.weather);
    } catch (err) {
      console.error("Farm data fetch error:", err);
    }
  };

  const calculateRisk = (disease, weather) => {
    if (!weather) return "Unknown";
    let score = 0;
    if (weather.rainfall > 2) score += 2;
    if (weather.temperature >= 24 && weather.temperature <= 30) score += 2;
    if (weather.cloud_cover > 70) score += 1;
    if (score >= 4) return "High";
    if (score >= 2) return "Moderate";
    return "Low";
  };

  const modelPrediction = async () => {
    if (!selectedFile) {
      setError("Please upload an image first.");
      return;
    }

    setLoading(true);
    setError("");
    setPrediction("");
    setConfidence("");
    setDetails(null);
    setRiskLevel("");

    try {
      const formData = new FormData();
      formData.append("image_upload", selectedFile);

      const response = await fetch(`http://127.0.0.1:5000/ml/predict`, {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setPrediction(data.Predicted);
        setConfidence(data.Confidence);
        setDetails(data.Details);

        if (weather) {
          const risk = calculateRisk(data.Predicted, weather);
          setRiskLevel(risk);
        }
      } else {
        setError(data.Error || "Prediction failed.");
      }
    } catch {
      setError("Server error. Is Flask running?");
    }

    setLoading(false);
  };

  return (
    <div className="upload-wrapper">
      <div
        style={{ display: "flex", justifyContent: "flex-end", position: "relative" }}
      >
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)}>
          ☰ Menu
        </button>
        {menuOpen && (
          <div className="dropdown-menu">
            <button onClick={() => { navigate("/"); setMenuOpen(false); }}>Home</button>
            <button onClick={async () => { await handleLogout(); setMenuOpen(false); }}>Logout</button>
          </div>
        )}
      </div>

      {!locationAccepted && (
        <div className="location-warning">
          <p>Please allow location access to fetch soil and weather data for your farm.</p>
          <button onClick={requestLocation} className="location-share-btn">
            Share Location
          </button>
        </div>
      )}

      {locationAccepted && soilType && weather && (
        <div className="farm-data">
          <p><strong>Soil Type:</strong> {soilType}</p>
          <p><strong>Temperature:</strong> {weather.temperature}°C</p>
          <p><strong>Rainfall:</strong> {weather.rainfall} mm</p>
          <p><strong>Wind Speed:</strong> {weather.wind_speed} m/s</p>
          <p><strong>Cloud Cover:</strong> {weather.cloud_cover}%</p>
        </div>
      )}

      <h2 className="upload-title">Upload Your Crop Image</h2>

      <div className="upload-box-modern" onClick={() => fileInputRef.current.click()}>
        {preview ? (
          <img src={preview} alt="Preview" className="preview-img" />
        ) : (
          <>
            <div className="upload-icon">☁️⬆</div>
            <p>Drag & Drop or Click to Upload</p>
            <span>Supported: JPG, PNG</span>
          </>
        )}
      </div>

      <div className="upload-actions">
        <button className="upload-btn" onClick={() => fileInputRef.current.click()}>Upload Image</button>
        <button className="camera-btn" onClick={() => cameraInputRef.current.click()}>Take Photo</button>
      </div>

      <div className="model-predict">
        <button className="pred-button" onClick={modelPrediction} disabled={loading}>
          {loading ? "Detecting..." : "Crop Detect"}
        </button>
      </div>

      {prediction && (
        <div className="result-box">
          <h3>Prediction:</h3>
          <p><strong>{prediction}</strong></p>
          <p>Confidence: {confidence}</p>
          {riskLevel && <p><strong>Environmental Risk:</strong> {riskLevel}</p>}

          {details && (
            <>
              <div className="details-box">
                {details.description && <p><strong>Description:</strong> {details.description}</p>}
                {details.symptoms && (
                  <div>
                    <strong>Symptoms:</strong>
                    <ul>{details.symptoms.map((s, i) => <li key={i}>{s}</li>)}</ul>
                  </div>
                )}
                {details.treatment && (
                  <div>
                    {details.treatment.chemical && <p><em>Chemical:</em> {details.treatment.chemical.join(", ")}</p>}
                    {details.treatment.organic && <p><em>Organic:</em> {details.treatment.organic.join(", ")}</p>}
                  </div>
                )}
                {details.prevention && <div><strong>Prevention:</strong><ul>{details.prevention.map((i, idx) => <li key={idx}>{i}</li>)}</ul></div>}
                {details.confidence_note && <p><strong>Note:</strong> {details.confidence_note}</p>}
              </div>

              <div className="clear-btn-div">
                <button className="clear-btn" onClick={() => {
                  setSelectedFile(null); setPreview(null); setPrediction(""); setConfidence(""); setDetails(null); setError(""); setRiskLevel("");
                }}>Clear</button>
              </div>
            </>
          )}
        </div>
      )}

      {error && <div className="error-box"><p>{error}</p></div>}

      <input type="file" accept="image/*" ref={fileInputRef} hidden onChange={(e) => handleFile(e.target.files[0])} />
      <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} hidden onChange={(e) => handleFile(e.target.files[0])} />
    </div>
  );
}

export default AIModel;