import React from "react";
import "./Doc.css";

function Documentation() {
  return (
    <div className="doc-page">
      <div className="doc-container">

        <h1>Crop Detect AI Tool Documentation</h1>

        <section>
          <h2>1. Overview</h2>
          <p>
            Crop Detect Crop Detect is a dedicated deep learning model that 
            can work with images to detect and classify tomato leaf diseases. 
            The system offers the identification of disease, prediction measure, 
            and treatment suggestion, depending on the identified crops.
          </p>
        </section>

        <section>
          <h2>2. Supported Tomato Classes</h2>
          <ul>
            <li>Tomato - Bacterial Spot</li>
            <li>Tomato - Early Blight</li>
            <li>Tomato - Late Blight</li>
            <li>Tomato - Leaf Mold</li>
            <li>Tomato - Septoria Leaf Spot</li>
            <li>Tomato - Spider Mites</li>
            <li>Tomato - Target Spot</li>
            <li>Tomato - Yellow Leaf Curl Virus</li>
            <li>Tomato - Mosaic Virus</li>
            <li>Tomato - Healthy</li>
          </ul>
        </section>

        <section>
          <h2>3. How the Model Works</h2>
          <ul>
            <li>User uploads tomato leaf image</li>
            <li>Image resized to 224x224 pixels</li>
            <li>Pixel normalization applied</li>
            <li>Model performs feature extraction</li>
            <li>Softmax layer outputs disease probability</li>
            <li>Recommendation engine maps disease to treatment</li>
          </ul>
        </section>

        <section>
          <h2>4. Model Architecture</h2>
          <p>
            The system uses a Convolutional Neural Network (CNN) built with
            transfer learning for improved accuracy.
          </p>
          <ul>
            <li>Base Model: MobileNetV2 / ResNet50</li>
            <li>Input Size: 224x224 RGB</li>
            <li>Optimizer: Adam</li>
            <li>Loss Function: Categorical Crossentropy</li>
            <li>Output: 10 Tomato Classes</li>
          </ul>
        </section>

        <section>
          <h2>5. API Integration</h2>
          <p>Endpoint:</p>
          <code>POST /predict</code>
          <p>Request: Multipart form-data (image)</p>
          <p>Response Example:</p>
          <pre>
{`{
  "classification": "Tomato - Early Blight",
  "accuracy": "93.4%",
  "recommendation": "Remove infected leaves and apply fungicide treatment."
}`}
          </pre>
        </section>

        <section>
          <h2>6. Accuracy & Limitations</h2>
          <ul>
            <li>Validation Accuracy: 94-97%</li>
            <li>Best performance on clear leaf images</li>
            <li>Performance may reduce in low lighting</li>
            <li>Does not yet support fruit disease detection</li>
          </ul>
        </section>

        <section>
          <h2>7. Dataset Information</h2>
          <p>
            The model was trained using a labeled tomato leaf disease dataset
            containing thousands of annotated images across 10 classes.
          </p>
        </section>

        <section>
          <h2>8. Future Improvements</h2>
          <ul>
            <li>Maize and potato disease detection</li>
            <li>Field-level multi-leaf detection</li>
            <li>Severity estimation (mild, moderate, severe)</li>
            <li>Multi-crop expansion (Phase 2) to other crops</li>
          </ul>
        </section>

        <section>
          <h2>9. Support</h2>
          <p>
            For technical support or research collaboration:
            support@cropdetect.ai
          </p>
        </section>

      </div>
    </div>
  );
}

export default Documentation;