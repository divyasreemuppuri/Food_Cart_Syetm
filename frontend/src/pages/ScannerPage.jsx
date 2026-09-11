import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use"; // To make confetti full screen

export default function ScannerPage() {
  const [scanning, setScanning] = useState(false);
  const [scannedOrders, setScannedOrders] = useState([]); // Store all scanned orders
  const [showConfetti, setShowConfetti] = useState(false); // For payment success celebration
  const html5QrCodeRef = useRef(null);
  const isScannerActiveRef = useRef(false);
  const { width, height } = useWindowSize();

  // Initialize scanner once
  useEffect(() => {
    html5QrCodeRef.current = new Html5Qrcode("reader");

    return () => {
      if (html5QrCodeRef.current && isScannerActiveRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // Handle successful scan
  const onScanSuccess = async (decodedText) => {
    try {
      const qrData = JSON.parse(decodedText);

      // Call your backend API
      const res = await fetch(`http://localhost:5000/api/scan/${qrData.orderId}`);
      const data = await res.json();

      const status = res.ok ? "✅ Payment Success" : `❌ ${data.message}`;
      if (res.ok) {
        alert(`✅ ₹${qrData.amount} deducted for ${qrData.studentName}`);
        // Show confetti for 3 seconds
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      } else {
        alert(`⚠️ ${data.message}`);
      }

      // Add to scannedOrders table
      setScannedOrders((prev) => [
        { ...qrData, status },
        ...prev, // latest on top
      ]);

      stopCameraScan();
    } catch (err) {
      alert("❌ Invalid QR code!");    console.error("Scan Order Deduct Error:", err);

      console.error(err);
    }
  };

  function onScanError(errorMessage) {
    if (!errorMessage.includes("No MultiFormat Readers")) {
      console.warn("Scan error:", errorMessage);
    }
  }

  const startCameraScan = async () => {
    if (!html5QrCodeRef.current || isScannerActiveRef.current) return;

    const qrConfig = {
      fps: 10,
      qrbox: { width: 300, height: 300 },
      aspectRatio: 1.0,
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
    };

    setScanning(true);

    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length) {
        await html5QrCodeRef.current.start(
          { facingMode: "environment" },
          qrConfig,
          onScanSuccess,
          onScanError
        );
        isScannerActiveRef.current = true;
        console.log("✅ Camera scan started successfully.");
      } else {
        alert("No camera found!");
        setScanning(false);
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("Camera access denied or unavailable.");
      setScanning(false);
    }
  };

  const stopCameraScan = async () => {
    if (!html5QrCodeRef.current) return;

    try {
      if (isScannerActiveRef.current) {
        await html5QrCodeRef.current.stop();
        console.log("⏹ Scanner stopped successfully.");
      }
    } catch (err) {
      console.warn("Error while stopping scanner:", err);
    } finally {
      isScannerActiveRef.current = false;
      setScanning(false);
    }
  };

  const onFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const result = await html5QrCodeRef.current.scanFile(file, true);
      const qrData = JSON.parse(result);

      const res = await fetch(`http://localhost:5000/api/scan/${qrData.orderId}`);
      const data = await res.json();

      const status = res.ok ? "✅ Payment Success" : `❌ ${data.message}`;
      if (res.ok) {
        alert(`✅ Payment success for ₹${qrData.amount}`);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 20000);
      } else {
        alert(`❌ ${data.message}`);
      }

      setScannedOrders((prev) => [
        { ...qrData, status },
        ...prev, // latest on top
      ]);
    } catch (err) {
      console.error("Scan error:", err);
      alert("Unable to detect QR from image. Try a clearer QR or use camera scan.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "40px", position: "relative" }}>
      <h2>🎯 QR Payment Scanner</h2>

      {/* Confetti */}
      {showConfetti && <Confetti width={width} height={height} numberOfPieces={200} />}

      {/* Live Camera Scanner */}
      <div
        id="reader"
        style={{
          width: scanning ? "350px" : "0",
          height: scanning ? "350px" : "0",
          margin: "auto",
          borderRadius: "10px",
          transition: "all 0.3s ease",
          overflow: "hidden",
        }}
      ></div>

      {/* Buttons */}
      <div style={{ marginTop: "20px" }}>
        {!scanning ? (
          <button onClick={startCameraScan} style={buttonStyleBlue}>📷 Start Camera Scan</button>
        ) : (
          <button onClick={stopCameraScan} style={buttonStyleRed}>⏹ Stop Scanning</button>
        )}
      </div>

      {/* Upload Image Scanner */}
      <div style={{ marginTop: "20px" }}>
        <label style={buttonStyleGreen}>
          🖼 Upload QR Image
          <input type="file" accept="image/*" onChange={onFileUpload} style={{ display: "none" }} />
        </label>
      </div>

      {/* Scanned Orders Table */}
      {scannedOrders.length > 0 && (
        <div style={{ marginTop: "30px", maxWidth: "800px", marginLeft: "auto", marginRight: "auto" }}>
          <h4>Last Scanned Orders:</h4>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f2f2f2" }}>
                <th style={thStyle}>Order ID</th>
                <th style={thStyle}>Student Name</th>
                <th style={thStyle}>Amount (₹)</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {scannedOrders.map((order, index) => (
                <tr key={index}>
                  <td style={tdStyle}>{order.orderId}</td>
                  <td style={tdStyle}>{order.studentName}</td>
                  <td style={tdStyle}>{order.amount}</td>
                  <td style={tdStyle}>{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Styles
const buttonStyleBlue = { backgroundColor: "#007bff", color: "white", padding: "10px 20px", borderRadius: "8px", border: "none", cursor: "pointer" };
const buttonStyleRed = { backgroundColor: "#dc3545", color: "white", padding: "10px 20px", borderRadius: "8px", border: "none", cursor: "pointer" };
const buttonStyleGreen = { display: "inline-block", backgroundColor: "#28a745", color: "white", padding: "10px 20px", borderRadius: "8px", cursor: "pointer" };
const thStyle = { border: "1px solid #ddd", padding: "8px" };
const tdStyle = { border: "1px solid #ddd", padding: "8px" };
