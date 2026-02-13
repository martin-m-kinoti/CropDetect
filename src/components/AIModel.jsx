import React, { useRef, useState } from "react";
import "./AIModel.css";

function AIModel({ onImageSelect }) {

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const handleFile = (file) => {
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setPreview(imageURL);
      onImageSelect && onImageSelect(file);
    }
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