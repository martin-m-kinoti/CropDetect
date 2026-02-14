import React, { useRef, useState } from "react";
import "./AIModel.css";

function AIModel({ onImageSelect }) {

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [prediction, setPrediction] = useState("");
  const [confidence, setConfidence] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle file selection
  const handleFile = (file) => {
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      onImageSelect && onImageSelect(file);
    }
  };

  // Send image to Flask backend
  const modelPrediction = async () => {

    if (!selectedFile) {
      setError("Please upload an image first.");
      return;
    }

    setLoading(true);
    setError("");
    setPrediction("");
    setConfidence("");

    try {
      const formData = new FormData();
      formData.append("image_upload", selectedFile);

      const response = await fetch(
        "http://127.0.0.1:5000/ml/predict",
        {
          method: "POST",
          body: formData
        }
      );

      const data = await response.json();

      if (response.ok) {
        setPrediction(data.Predicted);
        setConfidence(data.Confidence);
      } else {
        setError(data.Error || "Prediction failed.");
      }

    } catch (err) {
      setError("Server error. Is Flask running?");
    }

    setLoading(false);
  };

  return (
    <div className="upload-wrapper">

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

      {/* Prediction Output */}
      {prediction && (
        <div className="result-box">
          <h3>Prediction:</h3>
          <p><strong>{prediction}</strong></p>
          <p>Confidence: {confidence}</p>
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