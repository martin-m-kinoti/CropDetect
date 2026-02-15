import React, { useRef, useState } from "react";
import "./AIModel.css";

function AIModel({ onImageSelect }) {

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [prediction, setPrediction] = useState("");
  const [confidence, setConfidence] = useState("");
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = (file) => {
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      onImageSelect && onImageSelect(file);
    }
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

    try {
      const formData = new FormData();
      formData.append("image_upload", selectedFile);

      const response = await fetch(
        "http://127.0.0.1:5000/ml/predict",
        { method: "POST", body: formData }
      );

      const data = await response.json();

      if (response.ok) {
        setPrediction(data.Predicted);
        setConfidence(data.Confidence);
        setDetails(data.Details);
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

          {details && (
            <>
              <div className="details-box">
                {details.description && <p><strong>Description:</strong> {details.description}</p>}

                {details.symptoms && (
                  <div>
                    <strong>Symptoms:</strong>
                    <ul>
                      {details.symptoms.map((symptom, index) => <li key={index}>{symptom}</li>)}
                    </ul>
                  </div>
                )}

                {details.treatment && (
                  <div>
                    <strong>Treatment:</strong>
                    {details.treatment.chemical && <p><em>Chemical:</em> {details.treatment.chemical.join(", ")}</p>}
                    {details.treatment.organic && <p><em>Organic:</em> {details.treatment.organic.join(", ")}</p>}
                  </div>
                )}

                {details.prevention && (
                  <div>
                    <strong>Prevention:</strong>
                    <ul>{details.prevention.map((item, index) => <li key={index}>{item}</li>)}</ul>
                  </div>
                )}

                {details.confidence_note && <p><strong>Note:</strong> {details.confidence_note}</p>}
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
                  }}
                >
                  Clear
                </button>
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