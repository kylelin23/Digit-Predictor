import "./App.css";
import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import sadFace from "../public/triangle-svgrepo-com.svg";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function App() {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);

  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("");
  const [notCorrect, setNotCorrect] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 300, 300);
    ctx.strokeStyle = "white";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 18;
  }, []);

  function getPointerPosition(event) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const point = event.touches ? event.touches[0] : event;

    return {
      x: point.clientX - rect.left,
      y: point.clientY - rect.top,
    };
  }

  function startDrawing(event) {
    event.preventDefault();
    isDrawingRef.current = true;
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = getPointerPosition(event);

    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function draw(event) {
    if (!isDrawingRef.current) return;
    event.preventDefault();

    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = getPointerPosition(event);

    ctx.lineTo(x, y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function stopDrawing() {
    isDrawingRef.current = false;
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 300, 300);
    ctx.strokeStyle = "white";

    setResult(null);
    setStatus("Canvas cleared.");
    setNotCorrect(false);
  }

  function hasDrawing() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const image = ctx.getImageData(0, 0, 300, 300);
    const { data } = image;

    for (let i = 0; i < data.length; i += 4) {
      if (data[i] > 10 || data[i + 1] > 10 || data[i + 2] > 10) {
        return true;
      }
    }

    return false;
  }

  async function predictDigit() {
    setResult(null);
    setNotCorrect(false);

    if (!hasDrawing()) {
      setStatus("Please draw something first.");
      return;
    }

    setStatus("Sending image...");

    try {
      const image = canvasRef.current.toDataURL("image/png");

      const response = await fetch(`${API_URL}/predict-digit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus(`Error: ${data.detail || data.error || "request failed"}`);
        return;
      }

      setResult({
        prediction: data.digit,
        confidence: null,
      });
      setStatus("Success");
    } catch (error) {
      setStatus("Could not reach backend");
      console.error(error);
    }
  }

  function launchConfetti() {
    confetti({
      particleCount: 140,
      spread: 90,
      origin: { y: 0.6 },
    });

    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 120,
        origin: { x: 0.2, y: 0.7 },
      });
    }, 150);

    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 120,
        origin: { x: 0.8, y: 0.7 },
      });
    }, 300);
  }

  function correct() {
    setStatus("Nice! I got it right.");
    launchConfetti();
    setNotCorrect(false);
  }

  function incorrect() {
    setNotCorrect(true);
    setStatus("Aw shucks, I got it wrong.");
  }

  return (
    <div className="container">
      <h1 style={{ fontSize: 40 }}>Digit Guesser</h1>
      <h5 style = {{fontSize: 17}} className = "instructions">Draw a digit (0-9) on the canvas below and I'll try to guess it! </h5>
      <div className="canvasContainer">
        <div style={{ display: "flex", flexDirection: "column" }}>
          <h3 style={{ textAlign: "center", fontSize: 25 }}>Draw Here</h3>
          <canvas
            ref={canvasRef}
            width={300}
            height={300}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="canvas"
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 15,
            }}
          >
            <button
              style={{ backgroundColor: "lightGreen" }}
              className="button"
              onClick={predictDigit}
            >
              Predict
            </button>
            <button className="button" onClick={clearCanvas}>
              Clear
            </button>
          </div>
        </div>

        <div>
          <h3 style={{ textAlign: "center", fontSize: 25 }}>Prediction</h3>

          {!result && <div className="gray-box">{status}</div>}

          {result && status !== "Please draw something first." && (
            <div>
              {!notCorrect && (
                <div className="prediction-box">
                  <div style={{ color: "white", fontSize: 20 }}>My Guess:</div>
                  <div
                    style={{
                      color: "white",
                      fontSize: 90,
                      fontFamily: "San Francisco",
                    }}
                  >
                    <strong>{result.prediction}</strong>
                  </div>
                </div>
              )}

              {notCorrect && (
                <div className="wrong-box">
                  <img src={sadFace} width="200px" alt="Sad Face" />
                  <div>Aw shucks I got it wrong !</div>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 15,
                }}
              >
                <button
                  style={{ backgroundColor: "lightGreen" }}
                  className="button"
                  onClick={correct}
                >
                  Correct
                </button>
                <button className="button" onClick={incorrect}>
                  Incorrect
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
