import { useEffect, useRef } from "react";

interface Props {
  requestId: string;
}

const QRCodeDisplay = ({ requestId }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 120;
    canvas.width = size;
    canvas.height = size;

    // Generate a deterministic pseudo-QR pattern from requestId
    const seed = requestId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const gridSize = 15;
    const cellSize = size / gridSize;

    ctx.fillStyle = "#F0F2F5";
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = "#1e293b";

    // Corner markers
    const drawMarker = (x: number, y: number) => {
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          if (i === 0 || i === 4 || j === 0 || j === 4 || (i >= 1 && i <= 3 && j >= 1 && j <= 3 && (i === 2 && j === 2 || i === 1 || i === 3 || j === 1 || j === 3))) {
            if (i === 0 || i === 4 || j === 0 || j === 4 || (i === 2 && j === 2)) {
              ctx.fillRect((x + i) * cellSize, (y + j) * cellSize, cellSize, cellSize);
            }
          }
        }
      }
    };

    drawMarker(1, 1);
    drawMarker(gridSize - 6, 1);
    drawMarker(1, gridSize - 6);

    // Fill random-looking data cells
    let rng = seed;
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        // Skip corners
        if ((i < 7 && j < 7) || (i >= gridSize - 7 && j < 7) || (i < 7 && j >= gridSize - 7)) continue;
        rng = (rng * 1103515245 + 12345) & 0x7fffffff;
        if (rng % 3 === 0) {
          ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
        }
      }
    }
  }, [requestId]);

  return (
    <div className="mt-4 flex justify-center animate-qr-rise">
      <div className="shadow-raised rounded-xl p-3 bg-background relative">
        <canvas
          ref={canvasRef}
          className="rounded-lg"
          style={{ width: 120, height: 120 }}
        />
        {/* Royal Blue glow under-shadow */}
        <div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-3 rounded-full opacity-40 blur-md"
          style={{ backgroundColor: "hsl(221, 83%, 53%)" }}
        />
      </div>
    </div>
  );
};

export default QRCodeDisplay;
