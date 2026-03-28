import "./App.css";
import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import sadFace from "../public/triangle-svgrepo-com.svg";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);

  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("");
  const [notCorrect, setNotCorrect] = useState(false)

  // Set up canvas
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

  function getMousePosition(event) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function startDrawing(event) {
    isDrawingRef.current = true;
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = getMousePosition(event);

    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function draw(event) {
    if (!isDrawingRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = getMousePosition(event);

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

    setResult(null);
    setStatus("Canvas cleared.");
    setNotCorrect(false);
  }

  function preprocessCanvas() {
    const sourceCanvas = canvasRef.current;
    const sourceCtx = sourceCanvas.getContext("2d");
    const sourceImage = sourceCtx.getImageData(0, 0, 300, 300);
    const { data, width, height } = sourceImage;

    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const value = data[index];

        if (value > 10) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (maxX === -1 || maxY === -1) {
      return null;
    }

    const cropWidth = maxX - minX + 1;
    const cropHeight = maxY - minY + 1;

    const croppedCanvas = document.createElement("canvas");
    croppedCanvas.width = cropWidth;
    croppedCanvas.height = cropHeight;
    const croppedCtx = croppedCanvas.getContext("2d");

    croppedCtx.drawImage(
      sourceCanvas,
      minX,
      minY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );

    const targetCanvas = document.createElement("canvas");
    targetCanvas.width = 28;
    targetCanvas.height = 28;
    const targetCtx = targetCanvas.getContext("2d");

    targetCtx.fillStyle = "black";
    targetCtx.fillRect(0, 0, 28, 28);

    const scale = Math.min(20 / cropWidth, 20 / cropHeight);
    const drawWidth = Math.max(1, Math.round(cropWidth * scale));
    const drawHeight = Math.max(1, Math.round(cropHeight * scale));
    const offsetX = Math.floor((28 - drawWidth) / 2);
    const offsetY = Math.floor((28 - drawHeight) / 2);

    targetCtx.drawImage(
      croppedCanvas,
      0,
      0,
      cropWidth,
      cropHeight,
      offsetX,
      offsetY,
      drawWidth,
      drawHeight
    );

    const finalImage = targetCtx.getImageData(0, 0, 28, 28);
    const pixels = [];

    for (let i = 0; i < finalImage.data.length; i += 4) {
      pixels.push(finalImage.data[i] / 255);
    }

    return pixels;
  }

  async function predictDigit() {
    setStatus("Preparing image...");

    const pixels = preprocessCanvas();

    if (!pixels) {
      setStatus("Please draw something first.");
      return;
    }

    setStatus("Sending request...");

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pixels }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus(`Error: ${data.detail || "request failed"}`);
        return;
      }

      setResult(data);
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
  }

  return (
    <div className = "container">
      <h1 style = {{fontSize: 40}}>Digit Guesser</h1>
      <h5 style = {{fontSize: 17}} className = "instructions">Draw a digit (0-9) on the canvas below and I'll try to guess it! </h5>
      <div className = "canvasContainer">
        <div style = {{display: 'flex', flexDirection: 'column'}}>
          <h3 style = {{textAlign: 'center', fontSize: 25}}>Draw Here</h3>
          <canvas
            ref={canvasRef}
            width={300}
            height={300}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className = "canvas"
          />
          <div style = {{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 15}}>
            <button style = {{backgroundColor: 'lightGreen'}} className = "button" onClick={predictDigit}>Predict</button>
            <button className = "button" onClick={clearCanvas}>Clear</button>
          </div>

        </div>

        <div>
          <h3 style = {{textAlign: 'center', fontSize: 25}}>Prediction</h3>
          {!result && (
            <div className = "gray-box">
              {status}
            </div>
          )}

          {result && status != "Please draw something first." && (
            <div>
              { !notCorrect &&
                <div className = "prediction-box">
                    <div style = {{color: 'white', fontSize: 20}}>My Guess:</div>
                    <div style = {{color: 'white', fontSize: 90, fontFamily: 'San Francisco'}}><strong>{result.prediction}</strong></div>
                    <div style = {{color: 'white', fontSize: 20}}>Confidence: {(result.confidence * 100).toFixed(0)}%</div>
                </div>
              }
              { notCorrect &&
                <div className = "wrong-box">
                  <img src={sadFace} width = "200px" alt="Sad Face" />
                  <div>Aw shucks I got it wrong !</div>
                </div>
              }

              <div style = {{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 15}}>
                <button style = {{backgroundColor: 'lightGreen'}} className = "button" onClick={correct}>Correct</button>
                <button className = "button" onClick={incorrect}>Incorrect</button>
              </div>
            </div>

          )}
        </div>
      </div>

    </div>
  );
}

export default App;