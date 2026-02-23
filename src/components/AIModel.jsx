import React, { useRef, useState, useEffect } from "react";
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


  const fetchWeather = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://www.meteosource.com/api/v1/free/point?lat=3.94&lon=41.86&key=wggzqafw2k6gdcr6eo89mpibeut6r3xdfmv39foo`
      );

      const data = await response.json();

      const weatherData = {
        temperature: data.current.temperature,
        rainfall: data.current.precipitation.total,
        windSpeed: data.current.wind.speed,
        cloudCover: data.current.cloud_cover
      };

      setWeather(weatherData);
      console.log("Weather loaded:", weatherData);

    } catch (error) {
      console.error("Weather fetch error:", error);
    }
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeather(latitude, longitude);
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    }
  }, []);

  const calculateRisk = (disease, weather) => {
    if (!weather) return "Unknown";

    let score = 0;

    if (weather.rainfall > 2) score += 2;
    if (weather.temperature >= 24 && weather.temperature <= 30) score += 2;
    if (weather.cloudCover > 70) score += 1;

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

      const response = await fetch(
        `http://127.0.0.1:5000/ml/predict`,
        { method: "POST", body: formData }
      );

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
      <div style={{ display: "flex", justifyContent: "flex-end", position: "relative" }}>
        <button
          className="menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰ Menu
        </button>

        {menuOpen && (
          <div className="dropdown-menu">
            <button
              onClick={() => {
                navigate("/");
                setMenuOpen(false);
              }}
            >
              Home
            </button>

            <button
              onClick={async () => {
                await handleLogout();
                setMenuOpen(false);
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>

      <h2 className="upload-title">Upload Your Crop Image</h2>

      <div
        className="upload-box-modern"
        onClick={() => fileInputRef.current.click()}
      >
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
        <button
          className="upload-btn"
          onClick={() => fileInputRef.current.click()}
        >
          Upload Image
        </button>

        <button
          className="camera-btn"
          onClick={() => cameraInputRef.current.click()}
        >
          Take Photo
        </button>
      </div>

      <div className="model-predict">
        <button
          className="pred-button"
          onClick={modelPrediction}
          disabled={loading}
        >
          {loading ? "Detecting..." : "Crop Detect"}
        </button>
      </div>

      {prediction && (
        <div className="result-box">
          <h3>Prediction:</h3>
          <p><strong>{prediction}</strong></p>
          <p>Confidence: {confidence}</p>

          {riskLevel && (
            <p>
              <strong>Environmental Risk:</strong> {riskLevel}
            </p>
          )}

          {details && (
            <>
              <div className="details-box">
                {details.description && (
                  <p>
                    <strong>Description:</strong> {details.description}
                  </p>
                )}

                {details.symptoms && (
                  <div>
                    <strong>Symptoms:</strong>
                    <ul>
                      {details.symptoms.map((symptom, index) => (
                        <li key={index}>{symptom}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {details.treatment && (
                  <div>
                    <strong>Treatment:</strong>
                    {details.treatment.chemical && (
                      <p>
                        <em>Chemical:</em>{" "}
                        {details.treatment.chemical.join(", ")}
                      </p>
                    )}
                    {details.treatment.organic && (
                      <p>
                        <em>Organic:</em>{" "}
                        {details.treatment.organic.join(", ")}
                      </p>
                    )}
                  </div>
                )}

                {details.prevention && (
                  <div>
                    <strong>Prevention:</strong>
                    <ul>
                      {details.prevention.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {details.confidence_note && (
                  <p>
                    <strong>Note:</strong> {details.confidence_note}
                  </p>
                )}
              </div>

              <div className="clear-btn-div">
                <button
                  className="clear-btn"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreview(null);
                    setPrediction("");
                    setConfidence("");
                    setDetails(null);
                    setError("");
                    setRiskLevel("");
                  }}
                >
                  Clear
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {error && (
        <div className="error-box">
          <p>{error}</p>
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        hidden
        onChange={(e) => handleFile(e.target.files[0])}
      />

      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={cameraInputRef}
        hidden
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  );
}

export default AIModel;