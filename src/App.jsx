import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

function PneumoniaDetection() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setResult(null);
      setError("");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    accept: {
      "image/*": [],
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select an image file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Prediction failed");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Error during prediction!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial", textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <h1 style={{ color: "#007BFF" }}>Pneumonia Detection</h1>
        <img
          style={{ width: "60px", height: "60px", margin: "0px 10px 0px 10px" }}
          src="./lung.jpg"
          alt=""
        />
      </div>

      <form onSubmit={handleSubmit}>
        <div
          {...getRootProps()}
          style={{
            margin: "20px auto",
            padding: "30px",
            width: "300px",
            border: `2px dashed ${isDragActive ? "#28a745" : "#007BFF"}`,
            borderRadius: "10px",
            backgroundColor: isDragActive ? "#e6ffe6" : "#f9f9f9",
            cursor: "pointer",
            transition: "border-color 0.3s, background-color 0.3s",
          }}
        >
          <input {...getInputProps()} />
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              style={{
                maxWidth: "100%",
                maxHeight: "200px",
                borderRadius: "10px",
              }}
            />
          ) : (
            <p>Drag and drop an image here</p>
          )}
          <button
            type="button"
            onClick={open}
            style={{
              marginTop: "10px",
              padding: "8px 16px",
              fontSize: "14px",
              backgroundColor: "#007BFF",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Choose Image
          </button>
        </div>

        <button
          type="submit"
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginTop: "20px",
          }}
        >
          Upload and Predict
        </button>
      </form>

      {loading && (
        <div style={{ marginTop: "20px" }}>
          <div className="spinner" />
          <p>Predicting...</p>
        </div>
      )}

      {error && <div style={{ marginTop: "20px", color: "red" }}>{error}</div>}

      {result && (
        <div style={{ marginTop: "20px", fontSize: "20px" }}>
          <p>
            Diagnosis: <strong>{result.diagnosis}</strong>
          </p>
          <p>
            Confidence: <strong>{result.confidence}%</strong>
          </p>
        </div>
      )}

      {/* Spinner Styles */}
      <style>{`
        .spinner {
          margin: 0 auto;
          width: 40px;
          height: 40px;
          border: 4px solid rgba(0,0,0,0.1);
          border-top: 4px solid #28a745;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function App() {
  return (
    <>
      <PneumoniaDetection />
    </>
  );
}

export default App;
