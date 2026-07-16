import React, { useRef, useState, useEffect } from 'react';
import { Sparkles, Trash2, CheckCircle } from 'lucide-react';

interface SignaturePadProps {
  onSave: (base64Png: string) => void;
  onCancel: () => void;
  title?: string;
}

export default function SignaturePad({ onSave, onCancel, title = 'ÉMARGEMENT NUMÉRIQUE' }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retain clean drawing line on high-DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const coords = getCoordinates(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleValidate = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;

    // Export as PNG
    const base64 = canvas.toDataURL('image/png');
    onSave(base64);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-amber-500/20 bg-white shadow-2xl p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="font-sans text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#0C7A7A]" />
            {title}
          </h3>
          <button 
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-gray-500 font-sans">
          Veuillez apposer votre signature à l'aide de votre souris ou de votre doigt dans le cadre ci-dessous.
        </p>

        <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="h-52 w-full touch-none cursor-crosshair bg-white"
          />
        </div>

        <div className="flex justify-between items-center mt-2">
          <button
            onClick={clearCanvas}
            className="flex items-center gap-2 px-4 py-2 border border-red-200 rounded-lg text-red-600 text-sm font-semibold hover:bg-red-50 transition"
          >
            <Trash2 className="h-4 w-4" />
            EFFACER
          </button>

          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 text-sm font-semibold hover:bg-gray-50 transition"
            >
              ANNULER
            </button>
            <button
              onClick={handleValidate}
              disabled={!hasDrawn}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-white text-sm font-semibold transition ${
                hasDrawn 
                  ? 'bg-[#0C7A7A] hover:bg-[#0A6868] shadow-md shadow-[#0C7A7A]/10' 
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              <CheckCircle className="h-4 w-4" />
              VALIDER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
