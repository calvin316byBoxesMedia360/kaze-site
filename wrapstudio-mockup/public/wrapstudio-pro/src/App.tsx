/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Car, 
  Settings, 
  HelpCircle, 
  Bell, 
  MousePointer2, 
  Hand, 
  Search, 
  Brush, 
  Layers, 
  Grid3X3, 
  Undo2, 
  Redo2, 
  Upload, 
  Download, 
  Info, 
  ChevronDown,
  RefreshCw,
  Sparkles,
  Save,
  Trash2,
  FolderOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Layer {
  id: string;
  url: string;
  name: string;
  opacity: number;
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotate: number;
  width: number;
  height: number;
  maskUrl?: string; // Client-side mask data URL
}

export default function App() {
  const [zoom, setZoom] = useState(85);
  const [selectedPanel, setSelectedPanel] = useState(['Front Door', 'Rear Door']);
  const [activeTab, setActiveTab] = useState('Side');
  
  // Base vehicles and templates corresponding to views
  const [vehicleUrl, setVehicleUrl] = useState("https://lh3.googleusercontent.com/aida-public/AB6AXuBMTNrnvHRPw1Lv_R4s9Ba1R2xeofOUWtsGf9NtDhdsm5454Yjgdb0pW_v4bwikhcPNSGeJJ7dTlQ_maLNUbVvBLlO8n_hBJD5sLuMnAqCS4BSm6pxylcitbUOvDdP0GxeYxDMRMTiUcnZzoRQCROAUCaPRXH62QVuuTgg1dFVABZGytgIrFxPeMy60hQe2abNMW1mSiZgxCK4MMrEzrZQJ6UDavrFT5jkqBk5qrkDWfgIBuU5hB8CZIBI2-dCxN3toYhjt-jzGihc");
  const [projects, setProjects] = useState<any[]>([]);
  const [showProjects, setShowProjects] = useState(false);
  const [isTracing, setIsTracing] = useState(false);
  const [showContours, setShowContours] = useState(false);
  const [isDefaultVehicle, setIsDefaultVehicle] = useState(true);
  const [vehicleSize, setVehicleSize] = useState({ width: 1920, height: 1080 });
  
  // Custom WrapStudio states
  const [activeTool, setActiveTool] = useState<'select' | 'brush' | 'pan' | 'zoom'>('select');
  const [brushMode, setBrushMode] = useState<'erase' | 'restore'>('erase');
  const [brushSize, setBrushSize] = useState(30);
  const [desaturateVehicle, setDesaturateVehicle] = useState(false);
  const [reflectionOpacity, setReflectionOpacity] = useState(60);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const brushCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawingMask, setIsDrawingMask] = useState(false);

  // Multi-layer state
  const [layers, setLayers] = useState<Layer[]>([]);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);

  // History for Undo/Redo
  const [history, setHistory] = useState<Layer[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const saveToHistory = (newLayers: Layer[]) => {
    setHistory(prevHistory => {
      const newHistory = prevHistory.slice(0, historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(newLayers)));
      if (newHistory.length > 50) newHistory.shift();
      setHistoryIndex(newHistory.length - 1);
      return newHistory;
    });
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setLayers(JSON.parse(JSON.stringify(history[prevIndex])));
      setHistoryIndex(prevIndex);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setLayers(JSON.parse(JSON.stringify(history[nextIndex])));
      setHistoryIndex(nextIndex);
    }
  };

  const updateLayersWithHistory = (newLayers: Layer[] | ((prev: Layer[]) => Layer[]), skipHistory = false) => {
    setLayers(prev => {
      const updated = typeof newLayers === 'function' ? newLayers(prev) : newLayers;
      if (!skipHistory) saveToHistory(updated);
      return updated;
    });
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const vehicleInputRef = useRef<HTMLInputElement>(null);

  const activeLayer = layers.find(l => l.id === activeLayerId);

  // Initialize and load default mask on tool/layer switch
  useEffect(() => {
    if (activeTool === 'brush' && activeLayerId) {
      const canvas = brushCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const layer = layers.find(l => l.id === activeLayerId);
      if (layer && layer.maskUrl) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
        };
        img.src = layer.maskUrl;
      } else {
        // Fill canvas with solid black (fully visible)
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [activeTool, activeLayerId]);

  useEffect(() => {
    fetchProjects();

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history]);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      console.error("Failed to fetch projects", err);
    }
  };

  const saveProject = async () => {
    try {
      await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Project ${new Date().toLocaleTimeString()}`,
          vehicle_image: vehicleUrl,
          layers,
          panels: selectedPanel
        })
      });
      fetchProjects();
    } catch (err) {
      console.error("Failed to save project", err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const newLayer: Layer = {
          id: Math.random().toString(36).substr(2, 9),
          url,
          name: file.name,
          opacity: 90,
          x: 0,
          y: 0,
          scaleX: 1.0,
          scaleY: 1.0,
          rotate: 0,
          width: img.width,
          height: img.height
        };
        updateLayersWithHistory(prev => [...prev, newLayer]);
        setActiveLayerId(newLayer.id);
      };
      img.src = url;
    }
  };

  const handleVehicleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (vehicleUrl && vehicleUrl.startsWith('blob:')) {
        URL.revokeObjectURL(vehicleUrl);
      }
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        setVehicleSize({ width: img.width, height: img.height });
        setVehicleUrl(url);
        setIsDefaultVehicle(false);
        setShowContours(false);
        setIsTracing(true);
        setTimeout(() => setIsTracing(false), 1500);
      };
      img.src = url;
    }
  };

  const updateLayer = (id: string, updates: Partial<Layer>, skipHistory = false) => {
    updateLayersWithHistory(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l), skipHistory);
  };

  const deleteLayer = (id: string) => {
    updateLayersWithHistory(prev => {
      const layerToDelete = prev.find(l => l.id === id);
      if (layerToDelete && layerToDelete.url.startsWith('blob:')) {
        URL.revokeObjectURL(layerToDelete.url);
      }
      const filtered = prev.filter(l => l.id !== id);
      if (activeLayerId === id) {
        setActiveLayerId(filtered.length > 0 ? filtered[filtered.length - 1].id : null);
      }
      return filtered;
    });
  };

  const togglePanel = (panel: string) => {
    setSelectedPanel(prev => 
      prev.includes(panel) ? prev.filter(p => p !== panel) : [...prev, panel]
    );
  };

  // Drawing event handlers
  const handleBrushDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = brushCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.setPointerCapture(e.pointerId);
    setIsDrawingMask(true);

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;
    ctx.globalCompositeOperation = brushMode === 'erase' ? 'destination-out' : 'source-over';
    ctx.strokeStyle = '#000000';
  };

  const handleBrushMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingMask) return;
    const canvas = brushCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleBrushUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingMask) return;
    const canvas = brushCanvasRef.current;
    if (!canvas) return;
    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch (err) {}
    setIsDrawingMask(false);

    // Save drawn mask as base64 PNG
    const maskDataUrl = canvas.toDataURL('image/png');
    if (activeLayerId) {
      updateLayer(activeLayerId, { maskUrl: maskDataUrl });
    }
  };

  const exportResult = async () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const vehicleImg = new Image();
    vehicleImg.crossOrigin = "anonymous";
    vehicleImg.src = vehicleUrl;

    await new Promise((resolve) => {
      vehicleImg.onload = resolve;
    });

    canvas.width = vehicleImg.width;
    canvas.height = vehicleImg.height;
    const uiContainerWidth = 800;
    const scaleFactor = canvas.width / uiContainerWidth;

    // Draw Base vehicle (desaturated if toggle is active)
    if (desaturateVehicle) {
      const baseCanvas = document.createElement('canvas');
      baseCanvas.width = canvas.width;
      baseCanvas.height = canvas.height;
      const baseCtx = baseCanvas.getContext('2d');
      if (baseCtx) {
        baseCtx.drawImage(vehicleImg, 0, 0);
        baseCtx.filter = 'grayscale(1) brightness(1.15) contrast(1.05)';
        ctx.drawImage(baseCanvas, 0, 0);
      } else {
        ctx.drawImage(vehicleImg, 0, 0);
      }
    } else {
      ctx.drawImage(vehicleImg, 0, 0);
    }

    // Draw Contours
    if (showContours && isDefaultVehicle) {
      const contourImg = new Image();
      contourImg.crossOrigin = "anonymous";
      contourImg.src = "https://lh3.googleusercontent.com/aida-public/AB6AXuBt6QOLKQlyHHtFmo9MYTBlUutvMGoxxWsPja_pmUMQjulR5ud8QJ87D619oWEHTQzxhMU01SE63CDFZnsjX7qqXT5bvBHU7dhtebVWlKKhDdNAaX5wWg7r0HDX03UYLdb9eQTXLEid8CmMxl55Fgz1ZTCPrtYJygd5BNUjpYmi_jG5E_f26qimOJ9IQjRG46x7hE7lVkpr504mfeyEOOO0OXiVMyT-dAvpzCbd7omojH4k9tmVL3pQUsa_rHoyhMulE5aC6H_YJHg";
      await new Promise((resolve) => { contourImg.onload = resolve; });
      ctx.globalAlpha = 0.4;
      ctx.drawImage(contourImg, 0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1.0;
    }

    // Draw Layers with Masking and panel clipping
    for (const layer of layers) {
      const layerCanvas = document.createElement('canvas');
      layerCanvas.width = canvas.width;
      layerCanvas.height = canvas.height;
      const layerCtx = layerCanvas.getContext('2d');
      if (!layerCtx) continue;

      const artworkImg = new Image();
      artworkImg.crossOrigin = "anonymous";
      artworkImg.src = layer.url;
      await new Promise((resolve) => { artworkImg.onload = resolve; });

      layerCtx.save();
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      layerCtx.translate(centerX + (layer.x * scaleFactor), centerY + (layer.y * scaleFactor));
      layerCtx.rotate((layer.rotate * Math.PI) / 180);
      layerCtx.scale(layer.scaleX, layer.scaleY);

      // Draw artwork natively centered
      layerCtx.drawImage(artworkImg, -artworkImg.width / 2, -artworkImg.height / 2);
      layerCtx.restore();

      // Apply painted layer mask
      if (layer.maskUrl) {
        const maskImg = new Image();
        maskImg.crossOrigin = "anonymous";
        maskImg.src = layer.maskUrl;
        await new Promise((resolve) => { maskImg.onload = resolve; });

        layerCtx.save();
        layerCtx.globalCompositeOperation = 'destination-in';
        layerCtx.drawImage(maskImg, 0, 0, canvas.width, canvas.height);
        layerCtx.restore();
      }

      // Clip by active panels
      if (isDefaultVehicle && selectedPanel.length > 0) {
        const svgClipCanvas = document.createElement('canvas');
        svgClipCanvas.width = canvas.width;
        svgClipCanvas.height = canvas.height;
        const clipCtx = svgClipCanvas.getContext('2d');
        if (clipCtx) {
          clipCtx.fillStyle = '#000000';
          // Scale coordinate paths to match high-res canvas
          clipCtx.scale(scaleFactor, scaleFactor);
          
          if (selectedPanel.includes('Hood')) {
            clipCtx.beginPath();
            clipCtx.moveTo(90, 205);
            clipCtx.lineTo(290, 178);
            clipCtx.quadraticCurveTo(305, 210, 275, 228);
            clipCtx.lineTo(130, 240);
            clipCtx.closePath();
            clipCtx.fill();
          }
          if (selectedPanel.includes('Front Door')) {
            clipCtx.beginPath();
            clipCtx.moveTo(290, 178);
            clipCtx.lineTo(420, 178);
            clipCtx.bezierCurveTo(420, 220, 420, 270, 420, 295);
            clipCtx.lineTo(285, 295);
            clipCtx.bezierCurveTo(285, 270, 280, 230, 290, 178);
            clipCtx.closePath();
            clipCtx.fill();
          }
          if (selectedPanel.includes('Rear Door')) {
            clipCtx.beginPath();
            clipCtx.moveTo(420, 178);
            clipCtx.lineTo(565, 178);
            clipCtx.bezierCurveTo(570, 210, 560, 270, 560, 295);
            clipCtx.lineTo(420, 295);
            clipCtx.closePath();
            clipCtx.fill();
          }
          if (selectedPanel.includes('Trunk')) {
            clipCtx.beginPath();
            clipCtx.moveTo(565, 178);
            clipCtx.lineTo(715, 195);
            clipCtx.lineTo(705, 235);
            clipCtx.lineTo(560, 240);
            clipCtx.closePath();
            clipCtx.fill();
          }
          if (selectedPanel.includes('Fender (Front)')) {
            clipCtx.beginPath();
            clipCtx.moveTo(50, 220);
            clipCtx.lineTo(130, 240);
            clipCtx.lineTo(120, 295);
            clipCtx.lineTo(50, 295);
            clipCtx.closePath();
            clipCtx.fill();
          }

          layerCtx.save();
          layerCtx.globalCompositeOperation = 'destination-in';
          layerCtx.setTransform(1, 0, 0, 1, 0, 0); // reset scale
          layerCtx.drawImage(svgClipCanvas, 0, 0);
          layerCtx.restore();
        }
      }

      // Draw the masked layer canvas onto the main car canvas
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = layer.opacity / 100;

      // Subtle shadow for realistic depth
      ctx.shadowColor = "rgba(0,0,0,0.1)";
      ctx.shadowBlur = 2;
      ctx.shadowOffsetX = 0.5;
      ctx.shadowOffsetY = 0.5;

      ctx.drawImage(layerCanvas, 0, 0);
      ctx.restore();
    }

    // Draw Glossy reflections on top of wraps
    if (reflectionOpacity > 0) {
      const reflCanvas = document.createElement('canvas');
      reflCanvas.width = canvas.width;
      reflCanvas.height = canvas.height;
      const reflCtx = reflCanvas.getContext('2d');
      if (reflCtx) {
        reflCtx.drawImage(vehicleImg, 0, 0);
        reflCtx.filter = 'grayscale(1) contrast(2.8) brightness(0.35)';
        
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = reflectionOpacity / 100;
        ctx.drawImage(reflCanvas, 0, 0);
        ctx.restore();
      }
    }

    const link = document.createElement('a');
    link.download = `wrap-design-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex flex-col h-screen bg-[#101922] text-slate-100 font-sans overflow-hidden">
      {/* Top Navigation */}
      <header className="flex items-center justify-between border-b border-[#314d68] bg-[#1a2632] px-6 py-3 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-primary">
            <div className="bg-[#0d7ff2] p-1.5 rounded-lg shadow-lg shadow-[#0d7ff2]/20">
              <Car className="size-5 text-white" />
            </div>
            <h2 className="text-white text-lg font-bold tracking-tight">WrapStudio Pro</h2>
          </div>
          <div className="h-6 w-px bg-[#314d68] mx-2 hidden md:block"></div>
          <span className="text-sm font-medium text-[#90adcb] hidden md:block">
            Project: 2024 Sedan Mockup v2.ws
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowProjects(!showProjects)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#223649] text-white hover:bg-[#0d7ff2] transition-colors text-sm font-medium"
          >
            <FolderOpen className="size-4" />
            Projects ({projects.length})
          </button>
          <button 
            onClick={saveProject}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0d7ff2] text-white hover:bg-[#0b6bcb] transition-colors text-sm font-bold"
          >
            <Save className="size-4" />
            Save
          </button>
          <div className="h-6 w-px bg-[#314d68] mx-2"></div>
          <div className="flex gap-2">
            <button className="flex items-center justify-center rounded-lg h-9 w-9 bg-[#223649] text-white hover:bg-[#0d7ff2] transition-colors">
              <Settings className="size-5" />
            </button>
            <button className="flex items-center justify-center rounded-lg h-9 w-9 bg-[#223649] text-white hover:bg-[#0d7ff2] transition-colors relative">
              <Bell className="size-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border border-[#223649]"></span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar: Tools */}
        <aside className="w-16 flex flex-col items-center py-4 gap-4 border-r border-[#314d68] bg-[#1a2632] z-10 shrink-0">
          <div className="flex flex-col gap-3 w-full px-2">
            <ToolButton 
              icon={<MousePointer2 className="size-5" />} 
              active={activeTool === 'select'} 
              onClick={() => setActiveTool('select')}
              title="Select Tool (V)" 
            />
            <ToolButton 
              icon={<Hand className="size-5" />} 
              active={activeTool === 'pan'} 
              onClick={() => setActiveTool('pan')}
              title="Pan Tool (H)" 
            />
            <ToolButton 
              icon={<Search className="size-5" />} 
              active={activeTool === 'zoom'} 
              onClick={() => setActiveTool('zoom')}
              title="Zoom Tool (Z)" 
            />
            <ToolButton 
              icon={<Brush className="size-5" />} 
              active={activeTool === 'brush'} 
              onClick={() => setActiveTool('brush')}
              title="Brush Mask (B)" 
            />
          </div>
          <div className="w-8 h-px bg-[#314d68] my-1"></div>
          <div className="flex flex-col gap-3 w-full px-2">
            <ToolButton icon={<Layers className="size-5" />} title="Layers" />
            <ToolButton 
              icon={<Grid3X3 className="size-5" />} 
              active={showContours}
              onClick={() => setShowContours(!showContours)}
              title="Toggle Vector Lines" 
            />
          </div>
          <div className="mt-auto flex flex-col gap-3 w-full px-2">
            <ToolButton 
              icon={<Undo2 className="size-5" />} 
              onClick={undo}
              disabled={historyIndex <= 0}
              title="Undo (Ctrl+Z)" 
            />
            <ToolButton 
              icon={<Redo2 className="size-5" />} 
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              title="Redo (Ctrl+Y)" 
            />
          </div>
        </aside>

        {/* Center Canvas */}
        <main className="flex-1 bg-[#101922] relative overflow-hidden flex flex-col">
          {/* Canvas Toolbar overlay */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            <div className="bg-[#223649]/80 backdrop-blur-sm border border-[#314d68] rounded-lg px-3 py-1.5 flex items-center gap-3 text-xs font-medium text-[#90adcb] shadow-lg">
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setZoom(Math.max(10, zoom - 10))}
                  className="p-1 hover:bg-[#0d7ff2] hover:text-white rounded transition-colors"
                >
                  <Search className="size-3 rotate-90" />
                  <span className="sr-only">Zoom Out</span>
                  <span className="absolute -top-1 -left-1 text-[8px] font-bold">-</span>
                </button>
                <span className="min-w-[60px] text-center">Zoom: {zoom}%</span>
                <button 
                  onClick={() => setZoom(Math.min(400, zoom + 10))}
                  className="p-1 hover:bg-[#0d7ff2] hover:text-white rounded transition-colors"
                >
                  <Search className="size-3" />
                  <span className="sr-only">Zoom In</span>
                  <span className="absolute -top-1 -right-1 text-[8px] font-bold">+</span>
                </button>
              </div>
              <div className="w-px h-3 bg-[#314d68]"></div>
              <span>{vehicleSize.width} x {vehicleSize.height}px</span>
            </div>
          </div>

          {/* Brush mask overlay controls */}
          {activeTool === 'brush' && activeLayerId && (
            <div className="absolute top-16 left-4 z-10 bg-[#223649]/90 backdrop-blur-sm border border-[#314d68] rounded-lg p-3 flex flex-col gap-2 shadow-lg w-48 text-xs">
              <p className="font-bold text-white uppercase text-[10px] tracking-wider">Ajustes de Pincel</p>
              <div className="flex gap-1">
                <button
                  onClick={() => setBrushMode('erase')}
                  className={`flex-1 py-1 rounded text-center font-bold transition-all text-[10px] ${brushMode === 'erase' ? 'bg-red-500 text-white' : 'bg-[#101922] text-[#90adcb] hover:text-white'}`}
                >
                  Borrar (Erase)
                </button>
                <button
                  onClick={() => setBrushMode('restore')}
                  className={`flex-1 py-1 rounded text-center font-bold transition-all text-[10px] ${brushMode === 'restore' ? 'bg-green-500 text-white' : 'bg-[#101922] text-[#90adcb] hover:text-white'}`}
                >
                  Pintar (Restore)
                </button>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[#90adcb]">
                  <span>Tamaño:</span>
                  <span>{brushSize}px</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={brushSize}
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                  className="w-full h-1 bg-[#314d68] rounded-full appearance-none cursor-pointer accent-[#0d7ff2]"
                />
              </div>
              <p className="text-[9px] text-[#90adcb] italic mt-1 leading-normal">Pinta sobre el coche para recortar o restaurar el diseño de la capa activa.</p>
            </div>
          )}

          {/* Projects Overlay */}
          <AnimatePresence>
            {showProjects && (
              <motion.div 
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                className="absolute top-0 left-0 bottom-0 w-64 bg-[#1a2632] border-r border-[#314d68] z-30 p-4 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm uppercase tracking-wider">Saved Projects</h3>
                  <button onClick={() => setShowProjects(false)} className="text-[#90adcb] hover:text-white">
                    <ChevronDown className="size-4 rotate-90" />
                  </button>
                </div>
                <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-150px)]">
                  {projects.map(p => (
                    <div key={p.id} className="p-3 rounded-lg bg-[#223649] border border-[#314d68] hover:border-[#0d7ff2] cursor-pointer transition-colors group">
                      <p className="text-xs font-medium text-white mb-1">{p.name}</p>
                      <p className="text-[10px] text-[#90adcb]">{new Date(p.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* The Canvas Area */}
          <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
            <div 
              className="absolute inset-0 opacity-10 pointer-events-none" 
              style={{ 
                backgroundImage: 'linear-gradient(#314d68 1px, transparent 1px), linear-gradient(90deg, #314d68 1px, transparent 1px)', 
                backgroundSize: '40px 40px' 
              }}
            ></div>

            {/* SVG clip-paths for panel selection */}
            <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }}>
              <defs>
                <clipPath id="active-panels-clip">
                  {selectedPanel.includes('Hood') && (
                    <path d="M 90 205 L 290 178 C 300 185, 305 210, 275 228 L 130 240 Z" />
                  )}
                  {selectedPanel.includes('Front Door') && (
                    <path d="M 290 178 L 420 178 C 420 220, 420 270, 420 295 L 285 295 C 285 270, 280 230, 290 178 Z" />
                  )}
                  {selectedPanel.includes('Rear Door') && (
                    <path d="M 420 178 L 565 178 C 570 210, 560 270, 560 295 L 420 295 Z" />
                  )}
                  {selectedPanel.includes('Trunk') && (
                    <path d="M 565 178 L 715 195 L 705 235 L 560 240 Z" />
                  )}
                  {selectedPanel.includes('Fender (Front)') && (
                    <path d="M 50 220 L 130 240 L 120 295 L 50 295 Z" />
                  )}
                </clipPath>
              </defs>
            </svg>

            <motion.div 
              style={{ scale: zoom / 100 }}
              className="relative w-[800px] h-[400px] flex items-center justify-center"
            >
              {/* Base Vehicle Layer */}
              <div className="absolute inset-0 flex items-center justify-center">
                <img 
                  src={vehicleUrl} 
                  alt="Vehicle Template"
                  className={`w-full h-auto transition-all duration-700 ${isTracing ? 'filter grayscale contrast-200 blur-[1px]' : 'brightness-110 contrast-125'} ${desaturateVehicle ? 'filter grayscale(1) brightness-[1.12] contrast-[1.08]' : ''}`}
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Wrap Overlays (Draggable, with global mask clipping wrapper) */}
              {layers.map(layer => (
                <div
                  key={layer.id}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    maskImage: layer.maskUrl ? `url(${layer.maskUrl})` : 'none',
                    WebkitMaskImage: layer.maskUrl ? `url(${layer.maskUrl})` : 'none',
                    maskSize: '100% 100%',
                    WebkitMaskSize: '100% 100%',
                    clipPath: (isDefaultVehicle && selectedPanel.length > 0) ? 'url(#active-panels-clip)' : 'none',
                    WebkitClipPath: (isDefaultVehicle && selectedPanel.length > 0) ? 'url(#active-panels-clip)' : 'none',
                    zIndex: activeLayerId === layer.id ? 20 : 10
                  }}
                >
                  <motion.div 
                    drag={activeTool === 'select'}
                    dragMomentum={false}
                    onDragStart={() => setActiveLayerId(layer.id)}
                    onDrag={(e, info) => {
                      updateLayer(layer.id, {
                        x: layer.x + info.delta.x,
                        y: layer.y + info.delta.y
                      }, true); // Skip history during drag
                    }}
                    onDragEnd={() => saveToHistory(layers)}
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: layer.opacity / 100,
                      x: layer.x,
                      y: layer.y,
                      scaleX: layer.scaleX,
                      scaleY: layer.scaleY,
                      rotate: layer.rotate,
                    }}
                    className={`absolute mix-blend-multiply cursor-move group/artwork ${activeLayerId === layer.id ? 'ring-2 ring-[#0d7ff2]/50' : ''}`}
                    style={{ 
                      width: `${(layer.width / vehicleSize.width) * 800}px`,
                      height: `${(layer.height / vehicleSize.width) * 800}px`,
                      pointerEvents: activeTool === 'select' ? 'auto' : 'none'
                    }}
                  >
                    <div 
                      className="w-full h-full bg-cover bg-center border-2 border-transparent hover:border-primary/50 transition-colors relative"
                      style={{ backgroundImage: `url("${layer.url}")` }}
                    >
                      {/* Corner & Side Resize Handles */}
                      {activeLayerId === layer.id && activeTool === 'select' && (
                        <div className="absolute inset-0 opacity-0 group-hover/artwork:opacity-100 transition-opacity pointer-events-none">
                          {/* Corners (Proportional) */}
                          <ResizeHandle position="top-left" onDrag={(delta) => {
                            const sDelta = -(delta.x + delta.y) / 200;
                            updateLayer(layer.id, {
                              scaleX: Math.max(0.1, layer.scaleX + sDelta),
                              scaleY: Math.max(0.1, layer.scaleY + sDelta),
                              x: layer.x + delta.x / 2,
                              y: layer.y + delta.y / 2
                            }, true);
                          }} onDragEnd={() => saveToHistory(layers)} />
                          <ResizeHandle position="top-right" onDrag={(delta) => {
                            const sDelta = (delta.x - delta.y) / 200;
                            updateLayer(layer.id, {
                              scaleX: Math.max(0.1, layer.scaleX + sDelta),
                              scaleY: Math.max(0.1, layer.scaleY + sDelta),
                              x: layer.x + delta.x / 2,
                              y: layer.y + delta.y / 2
                            }, true);
                          }} onDragEnd={() => saveToHistory(layers)} />
                          <ResizeHandle position="bottom-left" onDrag={(delta) => {
                            const sDelta = (-delta.x + delta.y) / 200;
                            updateLayer(layer.id, {
                              scaleX: Math.max(0.1, layer.scaleX + sDelta),
                              scaleY: Math.max(0.1, layer.scaleY + sDelta),
                              x: layer.x + delta.x / 2,
                              y: layer.y + delta.y / 2
                            }, true);
                          }} onDragEnd={() => saveToHistory(layers)} />
                          <ResizeHandle position="bottom-right" onDrag={(delta) => {
                            const sDelta = (delta.x + delta.y) / 200;
                            updateLayer(layer.id, {
                              scaleX: Math.max(0.1, layer.scaleX + sDelta),
                              scaleY: Math.max(0.1, layer.scaleY + sDelta),
                              x: layer.x + delta.x / 2,
                              y: layer.y + delta.y / 2
                            }, true);
                          }} onDragEnd={() => saveToHistory(layers)} />
                          
                          {/* Sides (Independent Stretching) */}
                          <ResizeHandle position="top" onDrag={(delta) => {
                            updateLayer(layer.id, {
                              scaleY: Math.max(0.1, layer.scaleY - delta.y / 100),
                              y: layer.y + delta.y / 2
                            }, true);
                          }} onDragEnd={() => saveToHistory(layers)} />
                          <ResizeHandle position="bottom" onDrag={(delta) => {
                            updateLayer(layer.id, {
                              scaleY: Math.max(0.1, layer.scaleY + delta.y / 100),
                              y: layer.y + delta.y / 2
                            }, true);
                          }} onDragEnd={() => saveToHistory(layers)} />
                          <ResizeHandle position="left" onDrag={(delta) => {
                            updateLayer(layer.id, {
                              scaleX: Math.max(0.1, layer.scaleX - delta.x / 100),
                              x: layer.x + delta.x / 2
                            }, true);
                          }} onDragEnd={() => saveToHistory(layers)} />
                          <ResizeHandle position="right" onDrag={(delta) => {
                            updateLayer(layer.id, {
                              scaleX: Math.max(0.1, layer.scaleX + delta.x / 100),
                              x: layer.x + delta.x / 2
                            }, true);
                          }} onDragEnd={() => saveToHistory(layers)} />
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              ))}

              {/* Contour Lines (Vector Simulation) */}
              <AnimatePresence>
                {showContours && isDefaultVehicle && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-multiply"
                  >
                    <img 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBt6QOLKQlyHHtFmo9MYTBlUutvMGoxxWsPja_pmUMQjulR5ud8QJ87D619oWEHTQzxhMU01SE63CDFZnsjX7qqXT5bvBHU7dhtebVWlKKhDdNAaX5wWg7r0HDX03UYLdb9eQTXLEid8CmMxl55Fgz1ZTCPrtYJygd5BNUjpYmi_jG5E_f26qimOJ9IQjRG46x7hE7lVkpr504mfeyEOOO0OXiVMyT-dAvpzCbd7omojH4k9tmVL3pQUsa_rHoyhMulE5aC6H_YJHg" 
                      alt="Contours"
                      className="w-full h-auto grayscale invert dark:invert-0"
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Glossy Reflection Overlay (on top of wraps) */}
              {reflectionOpacity > 0 && (
                <div 
                  className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-screen"
                  style={{ opacity: reflectionOpacity / 100 }}
                >
                  <img 
                    src={vehicleUrl} 
                    alt="Vehicle Reflections"
                    className="w-full h-auto filter grayscale(1) contrast-[2.8] brightness-[0.35]"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {/* Brush drawing canvas overlay */}
              {activeTool === 'brush' && activeLayerId && (
                <canvas
                  ref={brushCanvasRef}
                  className="absolute inset-0 z-30 cursor-crosshair pointer-events-auto"
                  width={800}
                  height={400}
                  onPointerDown={handleBrushDown}
                  onPointerMove={handleBrushMove}
                  onPointerUp={handleBrushUp}
                />
              )}

              {/* Tracing Animation Overlay */}
              <AnimatePresence>
                {isTracing && (
                  <motion.div 
                    initial={{ top: '-100%' }}
                    animate={{ top: '100%' }}
                    transition={{ duration: 1.5, ease: "linear" }}
                    className="absolute left-0 right-0 h-1 bg-primary/50 shadow-[0_0_15px_rgba(13,127,242,0.8)] z-50 pointer-events-none"
                  />
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </main>

        {/* Right Sidebar: Properties */}
        <aside className="w-[320px] bg-[#1a2632] border-l border-[#314d68] flex flex-col overflow-y-auto shrink-0 scrollbar-thin scrollbar-thumb-[#314d68]">
          {/* 1. Vehicle Setup */}
          <div className="p-5 border-b border-[#314d68]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Vehicle Setup</h3>
              <Info className="size-4 text-[#90adcb] cursor-help" />
            </div>
            <div className="bg-[#223649] rounded-lg p-3 mb-4 flex items-center gap-3 border border-[#314d68]/50">
              <div className="h-10 w-16 bg-[#101922] rounded overflow-hidden flex items-center justify-center">
                <img 
                  src={vehicleUrl} 
                  className="w-full h-full object-cover" 
                  alt="Vehicle"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-white truncate">Current Vehicle</p>
                <p className="text-[10px] text-[#90adcb] font-mono">{vehicleSize.width} x {vehicleSize.height}px</p>
                <input 
                  type="file" 
                  ref={vehicleInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleVehicleUpload}
                />
                <button 
                  onClick={() => vehicleInputRef.current?.click()}
                  className="text-xs text-[#0d7ff2] hover:text-[#0b6bcb] font-medium flex items-center gap-1 mt-0.5"
                >
                  <Upload className="size-3" /> Replace Photo
                </button>
              </div>
            </div>

            {/* Shading & Highlights controls */}
            <div className="space-y-3 mb-4 bg-[#223649]/30 p-2.5 rounded-lg border border-[#314d68]/30">
              <label className="flex items-center justify-between text-xs cursor-pointer text-[#90adcb] hover:text-white transition-colors">
                <span>Desaturar Auto Base</span>
                <input
                  type="checkbox"
                  checked={desaturateVehicle}
                  onChange={(e) => setDesaturateVehicle(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-[#314d68] bg-[#101922] text-[#0d7ff2] focus:ring-[#0d7ff2]/20"
                />
              </label>
              
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-[#90adcb]">
                  <span>Brillo Laca (Reflejos)</span>
                  <span>{reflectionOpacity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={reflectionOpacity}
                  onChange={(e) => setReflectionOpacity(parseInt(e.target.value))}
                  className="w-full h-1 bg-[#314d68] rounded-full appearance-none cursor-pointer accent-[#0d7ff2]"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-[#223649] p-1 rounded-lg">
              {['Side', 'Front', 'Rear'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center justify-center py-1.5 rounded text-xs font-bold transition-all ${
                    activeTab === tab ? 'bg-[#0d7ff2] text-white shadow-sm' : 'text-[#90adcb] hover:text-white hover:bg-[#1a2632]/50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Artwork Management */}
          <div className="p-5 border-b border-[#314d68]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Layers</h3>
              <div className="flex gap-1">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[10px] bg-[#0d7ff2] hover:bg-[#0b6bcb] text-white px-2 py-1 rounded font-bold transition-colors"
                >
                  + ADD
                </button>
                <button 
                  onClick={() => setShowAiModal(true)}
                  className="text-[10px] bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-2 py-1 rounded font-bold transition-colors flex items-center gap-1"
                >
                  <Sparkles className="size-3" /> AI
                </button>
              </div>
            </div>
            
            <div className="space-y-2 mb-4 max-h-32 overflow-y-auto pr-1">
              {layers.map(layer => (
                <div 
                  key={layer.id}
                  onClick={() => setActiveLayerId(layer.id)}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-all ${
                    activeLayerId === layer.id ? 'bg-[#0d7ff2]/20 border border-[#0d7ff2]/50' : 'bg-[#223649]/50 border border-transparent hover:border-[#314d68]'
                  }`}
                >
                  <div className="h-8 w-8 bg-[#101922] rounded overflow-hidden shrink-0">
                    <img src={layer.url} className="w-full h-full object-contain" alt="" />
                  </div>
                  <span className="text-[10px] text-white font-medium truncate flex-1">{layer.name}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id); }}
                    className="text-[#90adcb] hover:text-red-400 p-1"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              ))}
              {layers.length === 0 && (
                <p className="text-[10px] text-[#90adcb] text-center italic py-2">No layers added yet</p>
              )}
            </div>

            <div className="space-y-3">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/png, image/jpeg"
                onChange={handleFileUpload}
              />
              
              {activeLayer && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 pt-2 border-t border-[#314d68]"
                >
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-[#90adcb]">Opacity</span>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          value={activeLayer.opacity} 
                          onChange={(e) => updateLayer(activeLayer.id, { opacity: parseFloat(e.target.value) || 0 })}
                          className="w-12 bg-[#101922] border border-[#314d68] text-white text-[10px] text-center rounded py-0.5"
                        />
                        <span className="text-white font-mono text-[10px]">%</span>
                      </div>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      step="0.1"
                      value={activeLayer.opacity}
                      onChange={(e) => updateLayer(activeLayer.id, { opacity: parseFloat(e.target.value) }, true)}
                      onMouseUp={() => saveToHistory(layers)}
                      className="w-full h-1 bg-[#314d68] rounded-full appearance-none cursor-pointer accent-[#0d7ff2]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-[10px] mb-1.5">
                        <span className="text-[#90adcb] uppercase font-bold">Scale X</span>
                        <input 
                          type="number" 
                          value={Math.round(activeLayer.scaleX * 100 * 10) / 10} 
                          onChange={(e) => updateLayer(activeLayer.id, { scaleX: (parseFloat(e.target.value) || 0) / 100 })}
                          className="w-12 bg-[#101922] border border-[#314d68] text-white text-[10px] text-center rounded py-0.5"
                        />
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="500" 
                        step="0.1"
                        value={activeLayer.scaleX * 100}
                        onChange={(e) => updateLayer(activeLayer.id, { scaleX: parseFloat(e.target.value) / 100 }, true)}
                        onMouseUp={() => saveToHistory(layers)}
                        className="w-full h-1 bg-[#314d68] rounded-full appearance-none cursor-pointer accent-[#0d7ff2]"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] mb-1.5">
                        <span className="text-[#90adcb] uppercase font-bold">Scale Y</span>
                        <input 
                          type="number" 
                          value={Math.round(activeLayer.scaleY * 100 * 10) / 10} 
                          onChange={(e) => updateLayer(activeLayer.id, { scaleY: (parseFloat(e.target.value) || 0) / 100 })}
                          className="w-12 bg-[#101922] border border-[#314d68] text-white text-[10px] text-center rounded py-0.5"
                        />
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="500" 
                        step="0.1"
                        value={activeLayer.scaleY * 100}
                        onChange={(e) => updateLayer(activeLayer.id, { scaleY: parseFloat(e.target.value) / 100 }, true)}
                        onMouseUp={() => saveToHistory(layers)}
                        className="w-full h-1 bg-[#314d68] rounded-full appearance-none cursor-pointer accent-[#0d7ff2]"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-[#90adcb]">Rotation</span>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          value={activeLayer.rotate} 
                          onChange={(e) => updateLayer(activeLayer.id, { rotate: parseFloat(e.target.value) || 0 })}
                          className="w-12 bg-[#101922] border border-[#314d68] text-white text-[10px] text-center rounded py-0.5"
                        />
                        <span className="text-white font-mono text-[10px]">°</span>
                      </div>
                    </div>
                    <input 
                      type="range" 
                      min="-180" 
                      max="180" 
                      step="0.1"
                      value={activeLayer.rotate}
                      onChange={(e) => updateLayer(activeLayer.id, { rotate: parseFloat(e.target.value) }, true)}
                      onMouseUp={() => saveToHistory(layers)}
                      className="w-full h-1 bg-[#314d68] rounded-full appearance-none cursor-pointer accent-[#0d7ff2]"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] uppercase text-[#90adcb] font-bold">
                        <span>Pos X</span>
                        <input 
                          type="number" 
                          value={Math.round(activeLayer.x * (vehicleSize.width / 800) * 10) / 10} 
                          onChange={(e) => updateLayer(activeLayer.id, { x: (parseFloat(e.target.value) || 0) / (vehicleSize.width / 800) })}
                          className="w-16 bg-[#101922] border border-[#314d68] text-white text-[10px] text-center rounded py-0.5"
                        />
                      </div>
                      <input 
                        type="range" 
                        min="-500" 
                        max="500" 
                        step="0.1"
                        value={activeLayer.x}
                        onChange={(e) => updateLayer(activeLayer.id, { x: parseFloat(e.target.value) }, true)}
                        onMouseUp={() => saveToHistory(layers)}
                        className="w-full h-1 bg-[#314d68] rounded-full appearance-none cursor-pointer accent-[#0d7ff2]"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] uppercase text-[#90adcb] font-bold">
                        <span>Pos Y</span>
                        <input 
                          type="number" 
                          value={Math.round(activeLayer.y * (vehicleSize.width / 800) * 10) / 10} 
                          onChange={(e) => updateLayer(activeLayer.id, { y: (parseFloat(e.target.value) || 0) / (vehicleSize.width / 800) })}
                          className="w-16 bg-[#101922] border border-[#314d68] text-white text-[10px] text-center rounded py-0.5"
                        />
                      </div>
                      <input 
                        type="range" 
                        min="-500" 
                        max="500" 
                        step="0.1"
                        value={activeLayer.y}
                        onChange={(e) => updateLayer(activeLayer.id, { y: parseFloat(e.target.value) }, true)}
                        onMouseUp={() => saveToHistory(layers)}
                        className="w-full h-1 bg-[#314d68] rounded-full appearance-none cursor-pointer accent-[#0d7ff2]"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* 3. Panel Selection */}
          <div className="p-5 border-b border-[#314d68]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Panel Selection</h3>
              <button 
                onClick={() => setSelectedPanel(['Hood', 'Front Door', 'Rear Door', 'Trunk', 'Fender (Front)'])}
                className="text-xs text-[#0d7ff2] hover:text-white transition-colors"
              >
                Select All
              </button>
            </div>
            <div className="flex flex-col gap-1 max-h-40 overflow-y-auto pr-1">
              {['Hood', 'Front Door', 'Rear Door', 'Trunk', 'Fender (Front)'].map(panel => (
                <label 
                  key={panel}
                  className={`flex items-center gap-3 p-2 rounded cursor-pointer group transition-colors ${
                    selectedPanel.includes(panel) ? 'bg-[#223649]/30' : 'hover:bg-[#223649]'
                  }`}
                >
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox" 
                      checked={selectedPanel.includes(panel)}
                      onChange={() => togglePanel(panel)}
                      className="h-4 w-4 rounded border-[#314d68] bg-[#101922] text-[#0d7ff2] focus:ring-[#0d7ff2]/20 focus:ring-offset-0"
                    />
                  </div>
                  <span className={`text-sm ${selectedPanel.includes(panel) ? 'text-white font-medium' : 'text-[#90adcb] group-hover:text-white'}`}>
                    {panel}
                  </span>
                  {selectedPanel.includes(panel) && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-green-500"></div>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* 4. Export */}
          <div className="p-5 mt-auto bg-[#223649]/20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Export</h3>
              <div className="flex items-center gap-1 bg-[#101922] border border-[#314d68] text-white text-[10px] rounded py-0.5 px-2">
                <span>4K (2160p)</span>
                <ChevronDown className="size-3" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <button 
                onClick={exportResult}
                className="flex items-center justify-center w-full h-9 rounded-lg bg-[#0d7ff2] hover:bg-[#0b6bcb] text-white text-sm font-bold shadow-lg shadow-[#0d7ff2]/20 transition-all"
              >
                <Download className="size-4 mr-2" /> Export PNG (Transp.)
              </button>
              <button 
                onClick={exportResult}
                className="flex items-center justify-center w-full h-9 rounded-lg border border-[#314d68] hover:bg-[#223649] text-[#90adcb] hover:text-white text-sm font-medium transition-all"
              >
                Export JPG (White BG)
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* AI Image Generator Modal */}
      <AnimatePresence>
        {showAiModal && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1a2632] border border-[#314d68] rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="size-5 text-purple-400" />
                  Generar Wrap con IA (Gemini)
                </h3>
                <button
                  onClick={() => setShowAiModal(false)}
                  className="text-slate-400 hover:text-white font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-[#90adcb] font-medium block">
                  Describe tu diseño o patrón:
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ej: Patrón de camuflaje urbano en color cian, gris oscuro y blanco, diseño vectorial para auto..."
                  className="w-full h-24 bg-[#101922] border border-[#314d68] rounded-lg p-3 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#0d7ff2] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowAiModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#223649] text-xs font-bold text-white hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    if (!aiPrompt.trim()) return;
                    setIsGeneratingAi(true);
                    try {
                      const response = await ai.models.generateImages({
                        model: "imagen-3.0-generate-002",
                        prompt: aiPrompt,
                        config: {
                          numberOfImages: 1,
                        },
                      });
                      const base64 = response.generatedImages[0].image.imageBytes;
                      const url = `data:image/png;base64,${base64}`;
                      
                      // Add new layer with the generated image
                      const newLayer: Layer = {
                        id: Math.random().toString(36).substr(2, 9),
                        url,
                        name: `AI: ${aiPrompt.substring(0, 15)}...`,
                        opacity: 90,
                        x: 0,
                        y: 0,
                        scaleX: 1.0,
                        scaleY: 1.0,
                        rotate: 0,
                        width: 1024,
                        height: 1024
                      };
                      updateLayersWithHistory(prev => [...prev, newLayer]);
                      setActiveLayerId(newLayer.id);
                      setShowAiModal(false);
                      setAiPrompt('');
                    } catch (err) {
                      console.error("AI Generation failed", err);
                      alert("Error al generar la imagen. Por favor intenta de nuevo.");
                    } finally {
                      setIsGeneratingAi(false);
                    }
                  }}
                  disabled={isGeneratingAi}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-xs font-bold text-white disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isGeneratingAi ? (
                    <>
                      <RefreshCw className="size-3.5 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-3.5" />
                      Generar Imagen
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ToolButton({ icon, active = false, title, onClick, disabled = false }: { icon: React.ReactNode, active?: boolean, title?: string, onClick?: () => void, disabled?: boolean }) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`group flex flex-col items-center justify-center w-full aspect-square rounded-lg transition-all ${
        disabled ? 'opacity-30 cursor-not-allowed' :
        active 
          ? 'bg-[#0d7ff2] text-white shadow-lg shadow-[#0d7ff2]/20' 
          : 'text-[#90adcb] hover:bg-[#223649] hover:text-white'
      }`}
      title={title}
    >
      {icon}
    </button>
  );
}

function ResizeHandle({ position, onDrag, onDragEnd }: { position: string, onDrag: (delta: { x: number, y: number }) => void, onDragEnd?: () => void }) {
  const getCursor = () => {
    if (position === 'top' || position === 'bottom') return 'ns-resize';
    if (position === 'left' || position === 'right') return 'ew-resize';
    if (position === 'top-left' || position === 'bottom-right') return 'nwse-resize';
    return 'nesw-resize';
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top': return '-top-1.5 left-1/2 -translate-x-1/2';
      case 'bottom': return '-bottom-1.5 left-1/2 -translate-x-1/2';
      case 'left': return 'top-1/2 -left-1.5 -translate-y-1/2';
      case 'right': return 'top-1/2 -right-1.5 -translate-y-1/2';
      case 'top-left': return '-top-1.5 -left-1.5';
      case 'top-right': return '-top-1.5 -right-1.5';
      case 'bottom-left': return '-bottom-1.5 -left-1.5';
      case 'bottom-right': return '-bottom-1.5 -right-1.5';
      default: return '';
    }
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDrag={(e, info) => onDrag(info.delta)}
      onDragEnd={onDragEnd}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      className={`absolute w-3 h-3 bg-white border-2 border-[#0d7ff2] rounded-full pointer-events-auto z-20 ${getPositionClasses()}`}
      style={{ cursor: getCursor() }}
    />
  );
}
