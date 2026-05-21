import React, { useState, useRef, useEffect } from 'react';
import {
  Shirt, ShoppingBag, Palette, Ruler,
  UploadCloud, Type, ZoomIn, ZoomOut, Trash2,
  RotateCcw, ChevronRight, ChevronLeft,
  X, Check, Move, Maximize, RefreshCw, Eye,
  Download
} from 'lucide-react';

// ==========================================
// TYPES
// ==========================================
interface PrintBounds {
  top: string;
  left: string;
  width: string;
  height: string;
}

interface PrintLocation {
  id: string;
  name: string;
  bounds: PrintBounds;
}

interface Product {
  id: string;
  name: string;
  price: number;
  icon: 'shirt' | 'bag' | 'cap';
  images: {
    front: string;
    back?: string;
  };
}

interface DesignState {
  url: string;
  scale: number;
  rotation: number;
  opacity: number;
  x: number;
  y: number;
  whiteRemoved: boolean;
  colorProfile: 'full' | 'bw';
}

interface TextState {
  text: string;
  color: string;
  fontFamily: string;
  scale: number;
  rotation: number;
  opacity: number;
  x: number;
  y: number;
}

// ==========================================
// CATALOG — Source of Truth with Real Assets
// ==========================================
const CATALOG_DATA: {
  products: Product[];
  colors: { id: string; hex: string; name: string }[];
  sizes: string[];
  printLocations: Record<string, PrintLocation[]>;
} = {
  products: [
    {
      id: 'camiseta',
      name: 'Camiseta Premium',
      price: 8,
      icon: 'shirt',
      images: {
        front: '/assets/mockups/tshirt_front.png',
        back: '/assets/mockups/tshirt_back.png'
      }
    },
    {
      id: 'sudadera',
      name: 'Sudadera Heavy',
      price: 18,
      icon: 'shirt',
      images: {
        front: '/assets/mockups/hoodie_front.png',
        back: '/assets/mockups/hoodie_back.png'
      }
    },
    {
      id: 'gorra',
      name: 'Gorra Snapback',
      price: 7,
      icon: 'cap',
      images: {
        front: '/assets/mockups/cap_front.png',
        back: '/assets/mockups/cap_back.png'
      }
    },
    {
      id: 'totebag',
      name: 'Tote Bag Canvas',
      price: 6,
      icon: 'bag',
      images: {
        front: '/assets/mockups/tote_front.png'
      }
    }
  ],
  colors: [
    { id: 'white',  hex: '#FFFFFF', name: 'Blanco Puro' },
    { id: 'black',  hex: '#111827', name: 'Negro Ónice' },
    { id: 'navy',   hex: '#1E3A8A', name: 'Azul Marino' },
    { id: 'red',    hex: '#C8333F', name: 'Rojo Kaze' },
    { id: 'forest', hex: '#166534', name: 'Bosque' },
    { id: 'sand',   hex: '#D4D4D8', name: 'Arena' },
    { id: 'khaki',  hex: '#9E8E71', name: 'Caqui Táctico' }
  ],
  sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
  printLocations: {
    frente: [
      { id: 'full',        name: 'Frente Completo', bounds: { top: '22%', left: '26%', width: '48%', height: '52%' } },
      { id: 'left_chest',  name: 'Pecho Izquierdo', bounds: { top: '26%', left: '54%', width: '18%', height: '18%' } },
      { id: 'right_chest', name: 'Pecho Derecho',   bounds: { top: '26%', left: '28%', width: '18%', height: '18%' } }
    ],
    espalda: [
      { id: 'full_back', name: 'Espalda Completa', bounds: { top: '22%', left: '26%', width: '48%', height: '52%' } },
      { id: 'nape',      name: 'Nuca',             bounds: { top: '16%', left: '38%', width: '24%', height: '10%' } }
    ]
  }
};

// ==========================================
// COMPONENT
// ==========================================
export default function KazeStudio() {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [config, setConfig] = useState({
    product: 'camiseta',
    color: '#C8333F',
    size: 'M',
    view: 'frente' as 'frente' | 'espalda',
    location: 'full'
  });

  const [design, setDesign] = useState<DesignState | null>(null);
  const [textLayer, setTextLayer] = useState<TextState | null>(null);
  const [activePanel, setActivePanel] = useState<'main' | 'upload' | 'removeWhite' | 'colorProfile' | 'text'>('main');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragContainerRef = useRef<HTMLDivElement>(null);
  
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const isRotating = useRef(false);
  
  const textDragging = useRef(false);
  const textResizing = useRef(false);
  const textRotating = useRef(false);

  const startPos = useRef({ x: 0, y: 0 });
  const startDesignPos = useRef({ x: 0, y: 0 });
  const startScale = useRef(60);
  const startRotation = useRef(0);

  useEffect(() => {
    // Load saved design from LocalStorage on mount
    const saved = localStorage.getItem('kaze_studio_design_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.config) setConfig(parsed.config);
        if (parsed.design) setDesign(parsed.design);
        if (parsed.textLayer) setTextLayer(parsed.textLayer);
      } catch (e) {
        console.error("Failed to restore saved design", e);
      }
    }
  }, []);

  const saveToLocal = (newConfig: typeof config, newDesign: DesignState | null, newText: TextState | null = textLayer) => {
    localStorage.setItem('kaze_studio_design_state', JSON.stringify({
      config: newConfig,
      design: newDesign,
      textLayer: newText
    }));
  };

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  const updateConfig = (key: keyof typeof config, value: string) => {
    setConfig(prev => {
      const next = { ...prev, [key]: value };
      // Tote bag view restriction
      if (key === 'product' && value === 'totebag') {
        next.view = 'frente';
        next.location = 'full';
      }
      saveToLocal(next, design, textLayer);
      return next;
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (objectUrl) URL.revokeObjectURL(objectUrl);
    const url = URL.createObjectURL(file);
    setObjectUrl(url);

    const initialDesign: DesignState = {
      url,
      scale: 60,
      rotation: 0,
      opacity: 100,
      x: 0,
      y: 0,
      whiteRemoved: false,
      colorProfile: 'full'
    };

    setDesign(initialDesign);
    setActivePanel('removeWhite');
    saveToLocal(config, initialDesign, textLayer);
    e.target.value = '';
  };

  const handleClearDesign = () => {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      setObjectUrl(null);
    }
    setDesign(null);
    setActivePanel('main');
    saveToLocal(config, null, textLayer);
  };

  const updateDesign = (updates: Partial<DesignState>) => {
    setDesign(prev => {
      if (!prev) return null;
      const next = { ...prev, ...updates };
      saveToLocal(config, next, textLayer);
      return next;
    });
  };

  const updateText = (updates: Partial<TextState>) => {
    setTextLayer(prev => {
      if (!prev) return null;
      const next = { ...prev, ...updates };
      saveToLocal(config, design, next);
      return next;
    });
  };

  const handleClearText = () => {
    setTextLayer(null);
    setActivePanel('main');
    saveToLocal(config, design, null);
  };

  const handleAddText = () => {
    if (!textLayer) {
      const initialText: TextState = {
        text: 'KAZE',
        color: '#FFFFFF',
        fontFamily: 'Outfit',
        scale: 100,
        rotation: 0,
        opacity: 100,
        x: 0,
        y: 0
      };
      setTextLayer(initialText);
      saveToLocal(config, design, initialText);
    }
    setActivePanel('text');
  };

  const getActiveBounds = (): PrintBounds => {
    const locations = CATALOG_DATA.printLocations[config.view] || CATALOG_DATA.printLocations.frente;
    return (locations.find(l => l.id === config.location) ?? locations[0]).bounds;
  };

  const activeProduct = CATALOG_DATA.products.find(p => p.id === config.product)!;
  const bounds = getActiveBounds();

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!design || step !== 2) return;
    isDragging.current = true;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startPos.current = { x: clientX, y: clientY };
    startDesignPos.current = { x: design.x, y: design.y };
    e.preventDefault();
  };

  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!design || step !== 2) return;
    isResizing.current = true;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startPos.current = { x: clientX, y: clientY };
    startScale.current = design.scale;
    e.preventDefault();
    e.stopPropagation();
  };

  const handleRotateStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!design || step !== 2) return;
    isRotating.current = true;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startPos.current = { x: clientX, y: clientY };
    startRotation.current = design.rotation || 0;
    e.preventDefault();
    e.stopPropagation();
  };

  const handleTextDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!textLayer || step !== 2) return;
    textDragging.current = true;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startPos.current = { x: clientX, y: clientY };
    startDesignPos.current = { x: textLayer.x, y: textLayer.y };
    e.preventDefault();
  };

  const handleTextResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!textLayer || step !== 2) return;
    textResizing.current = true;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startPos.current = { x: clientX, y: clientY };
    startScale.current = textLayer.scale;
    e.preventDefault();
    e.stopPropagation();
  };

  const handleTextRotateStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!textLayer || step !== 2) return;
    textRotating.current = true;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startPos.current = { x: clientX, y: clientY };
    startRotation.current = textLayer.rotation || 0;
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!design && !textLayer) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    if (isDragging.current && design) {
      const dx = (clientX - startPos.current.x) / (zoom / 100);
      const dy = (clientY - startPos.current.y) / (zoom / 100);
      updateDesign({
        x: startDesignPos.current.x + dx,
        y: startDesignPos.current.y + dy
      });
    } else if (isResizing.current && design) {
      const dx = (clientX - startPos.current.x) / (zoom / 100);
      const newScale = Math.max(10, Math.min(200, Math.round(startScale.current + dx * 0.5)));
      updateDesign({ scale: newScale });
    } else if (isRotating.current && design) {
      const dx = (clientX - startPos.current.x) / (zoom / 100);
      const newRotation = (startRotation.current + Math.round(dx * 0.5)) % 360;
      updateDesign({ rotation: newRotation < 0 ? newRotation + 360 : newRotation });
    } else if (textDragging.current && textLayer) {
      const dx = (clientX - startPos.current.x) / (zoom / 100);
      const dy = (clientY - startPos.current.y) / (zoom / 100);
      updateText({
        x: startDesignPos.current.x + dx,
        y: startDesignPos.current.y + dy
      });
    } else if (textResizing.current && textLayer) {
      const dx = (clientX - startPos.current.x) / (zoom / 100);
      const newScale = Math.max(10, Math.min(250, Math.round(startScale.current + dx * 0.5)));
      updateText({ scale: newScale });
    } else if (textRotating.current && textLayer) {
      const dx = (clientX - startPos.current.x) / (zoom / 100);
      const newRotation = (startRotation.current + Math.round(dx * 0.5)) % 360;
      updateText({ rotation: newRotation < 0 ? newRotation + 360 : newRotation });
    }
  };

  const handleDragEnd = () => {
    isDragging.current = false;
    isResizing.current = false;
    isRotating.current = false;
    textDragging.current = false;
    textResizing.current = false;
    textRotating.current = false;
  };

  // HD Exporting Logic
  const exportMockupPNG = async () => {
    if (!design && !textLayer) return;

    const STAGE_W = 1200;
    const STAGE_H = 1500;
    const canvas = document.createElement('canvas');
    canvas.width = STAGE_W;
    canvas.height = STAGE_H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const isBack = config.view === 'espalda' && activeProduct.images.back;
      const productImgUrl = isBack ? activeProduct.images.back! : activeProduct.images.front;

      const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });
      };

      const promises: Promise<HTMLImageElement | null>[] = [loadImage(productImgUrl)];
      if (design) {
        promises.push(loadImage(design.url));
      } else {
        promises.push(Promise.resolve(null));
      }

      const [garmentImg, designImg] = await Promise.all(promises);

      // 1. Solid White Background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, STAGE_W, STAGE_H);

      // 2. Colored Garment Base
      const baseCanvas = document.createElement('canvas');
      baseCanvas.width = STAGE_W;
      baseCanvas.height = STAGE_H;
      const baseCtx = baseCanvas.getContext('2d')!;
      baseCtx.fillStyle = config.color;
      baseCtx.fillRect(0, 0, STAGE_W, STAGE_H);
      baseCtx.globalCompositeOperation = 'destination-in';
      baseCtx.drawImage(garmentImg, 0, 0, STAGE_W, STAGE_H);
      ctx.drawImage(baseCanvas, 0, 0);

      // Calculations for Bounds
      const parsePct = (val: string) => parseFloat(val) / 100;
      const bTop = parsePct(bounds.top) * STAGE_H;
      const bLeft = parsePct(bounds.left) * STAGE_W;
      const bWidth = parsePct(bounds.width) * STAGE_W;
      const bHeight = parsePct(bounds.height) * STAGE_H;

      // 3. Draw Design image layer if present
      if (design && designImg) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(bLeft, bTop, bWidth, bHeight);
        ctx.clip();

        const centerX = bLeft + bWidth / 2 + design.x * (STAGE_W / 500);
        const centerY = bTop + bHeight / 2 + design.y * (STAGE_H / 625);
        ctx.translate(centerX, centerY);
        ctx.rotate((design.rotation || 0) * Math.PI / 180);

        const dWidth = bWidth * (design.scale / 100);
        const dHeight = (bWidth * (design.scale / 100)) * (designImg.height / designImg.width);

        ctx.globalAlpha = (design.opacity !== undefined ? design.opacity : 100) / 100;
        
        if (design.colorProfile === 'bw') {
          ctx.filter = 'grayscale(100%)';
        }
        if (design.whiteRemoved) {
          ctx.globalCompositeOperation = 'multiply';
        }

        ctx.drawImage(designImg, -dWidth / 2, -dHeight / 2, dWidth, dHeight);
        ctx.restore();

        // Reset filters & composition
        ctx.filter = 'none';
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1.0;
      }

      // 4. Draw Custom Text layer if present
      if (textLayer) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(bLeft, bTop, bWidth, bHeight);
        ctx.clip();

        const textCenterX = bLeft + bWidth / 2 + textLayer.x * (STAGE_W / 500);
        const textCenterY = bTop + bHeight / 2 + textLayer.y * (STAGE_H / 625);
        ctx.translate(textCenterX, textCenterY);
        ctx.rotate((textLayer.rotation || 0) * Math.PI / 180);

        const baseFontSize = 32;
        const hdFontSize = baseFontSize * (STAGE_W / 500) * (textLayer.scale / 100);
        
        ctx.font = `800 ${hdFontSize}px ${textLayer.fontFamily === 'monospace' ? 'Courier, monospace' : textLayer.fontFamily}`;
        ctx.fillStyle = textLayer.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.globalAlpha = (textLayer.opacity !== undefined ? textLayer.opacity : 100) / 100;
        
        ctx.fillText(textLayer.text, 0, 0);
        ctx.restore();
        
        // Reset alpha
        ctx.globalAlpha = 1.0;
      }

      // 5. Shading multiply overlay
      ctx.globalCompositeOperation = 'multiply';
      ctx.drawImage(garmentImg, 0, 0, STAGE_W, STAGE_H);
      ctx.globalCompositeOperation = 'source-over';

      // Download
      const link = document.createElement('a');
      link.download = `kaze-studio-${config.product}-${config.view}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  const renderIcon = (type: string, size = 24) => {
    switch (type) {
      case 'shirt': return <Shirt size={size} strokeWidth={1.5} />;
      case 'bag':   return <ShoppingBag size={size} strokeWidth={1.5} />;
      case 'cap':   return <span style={{ fontSize: size === 28 ? '26px' : '36px' }}>🧢</span>;
      default:      return <Shirt size={size} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0E0E10] text-zinc-300 font-sans flex flex-col overflow-hidden select-none">
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* ── TOP HEADER ── */}
      <header className="h-16 bg-[#161619]/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 z-20 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 bg-gradient-to-tr from-red-600 to-red-500 rounded-lg flex items-center justify-center shadow-lg shadow-red-600/10">
            <span className="text-white font-black text-sm tracking-tighter">KZ</span>
          </div>
          <div>
            <span className="font-extrabold text-white text-sm tracking-wider uppercase block">Kaze Studio</span>
            <span className="text-[10px] text-zinc-500 font-mono -mt-1 block">Technical Edition</span>
          </div>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-4 md:gap-6">
          {[
            { id: 1, label: 'Prenda' },
            { id: 2, label: 'Personalización' },
            { id: 3, label: 'Resumen' },
          ].map((s, idx) => (
            <button
              key={s.id}
              onClick={() => {
                if (s.id === 1) setStep(1);
                if (s.id === 2) setStep(2);
                if (s.id === 3 && (design || textLayer)) setStep(3);
              }}
              className={`flex items-center gap-3 transition-opacity ${step === s.id ? 'opacity-100' : 'opacity-60 hover:opacity-90'}`}
              disabled={s.id === 3 && !design && !textLayer}
            >
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold border transition-all ${
                  step === s.id 
                    ? 'border-red-500 bg-red-500/10 text-red-400' 
                    : step > s.id 
                      ? 'border-zinc-500 bg-zinc-800 text-zinc-300' 
                      : 'border-zinc-800 text-zinc-600'
                }`}>
                  {step > s.id ? <Check size={12} strokeWidth={3} /> : s.id}
                </div>
                <span className="text-xs font-semibold hidden sm:inline">{s.label}</span>
              </div>
              {idx < 2 && <div className="hidden md:block w-8 h-px bg-white/10" />}
            </button>
          ))}
        </div>

        <div>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 border border-white/10 hover:border-white/20 rounded-lg text-xs font-semibold text-white transition-colors bg-white/5 hover:bg-white/10"
          >
            Volver a la Web
          </button>
        </div>
      </header>

      {/* ── MAIN WORKSPACE ── */}
      <div className="flex flex-1 relative overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
        
        {/* Left Toolbar */}
        <aside className="w-16 bg-[#161619] border-r border-white/5 flex flex-col items-center py-6 gap-3 z-10 flex-shrink-0">
          <button
            onClick={() => activeProduct.images.back && updateConfig('view', config.view === 'frente' ? 'espalda' : 'frente')}
            disabled={!activeProduct.images.back}
            className={`w-12 h-12 flex flex-col items-center justify-center rounded-xl transition-all ${
              !activeProduct.images.back 
                ? 'opacity-30 cursor-not-allowed text-zinc-600' 
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
            title={activeProduct.images.back ? "Voltear Prenda" : "No disponible para este producto"}
          >
            <RefreshCw size={18} />
            <span className="text-[9px] mt-1 font-medium font-sans">Girar</span>
          </button>

          <button
            onClick={() => setShowLocationModal(true)}
            className="w-12 h-12 flex flex-col items-center justify-center text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
            title="Cambiar Zona"
          >
            <Eye size={18} />
            <span className="text-[9px] mt-1 font-medium font-sans">Zonas</span>
          </button>

          <div className="w-8 h-px bg-white/5 my-1" />

          <button
            onClick={() => updateDesign({ x: 0, y: 0, scale: 60, rotation: 0 })}
            disabled={!design}
            className={`w-12 h-12 flex flex-col items-center justify-center rounded-xl transition-all ${
              design ? 'text-zinc-400 hover:text-white hover:bg-white/5' : 'text-zinc-600 opacity-40'
            }`}
            title="Resetear Diseño"
          >
            <RotateCcw size={18} />
            <span className="text-[9px] mt-1 font-medium font-sans">Reset</span>
          </button>

          <button
            onClick={handleClearDesign}
            disabled={!design}
            className={`w-12 h-12 flex flex-col items-center justify-center rounded-xl transition-all ${
              design ? 'text-red-400 hover:text-red-300 hover:bg-red-500/5' : 'text-zinc-600 opacity-40'
            }`}
            title="Eliminar Diseño"
          >
            <Trash2 size={18} />
            <span className="text-[9px] mt-1 font-medium font-sans">Quitar</span>
          </button>

          <div className="w-8 h-px bg-white/5 my-1" />

          {/* Zoom controls */}
          <div className="flex flex-col gap-1 items-center mt-auto">
            <button 
              onClick={() => setZoom(z => Math.min(150, z + 10))} 
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/10 text-white"
            >
              <ZoomIn size={14} />
            </button>
            <span className="text-[9px] font-bold font-mono py-1 text-zinc-500">{zoom}%</span>
            <button 
              onClick={() => setZoom(z => Math.max(50, z - 10))} 
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/10 text-white"
            >
              <ZoomOut size={14} />
            </button>
          </div>
        </aside>

        {/* Editor Screen */}
        <main className="flex-1 bg-[#0E0E10] flex flex-col items-center justify-center p-8 relative overflow-hidden">
          
          {/* Floating Export Mockup Button (ONLY in step 2) */}
          {step === 2 && (design || textLayer) && (
            <button
              onClick={exportMockupPNG}
              className="absolute top-4 right-4 bg-[#1F1F23]/90 hover:bg-[#252529] border border-white/10 hover:border-white/20 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xl transition-all z-30 backdrop-blur"
              title="Descargar imagen en alta resolución"
            >
              <Download size={14} />
              Exportar Mockup
            </button>
          )}

          <div 
            ref={dragContainerRef}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
            className="relative w-full max-w-[500px] aspect-[4/5] bg-[#F3F4F6] rounded-2xl shadow-[0_24px_70px_rgba(0,0,0,0.6)] flex items-center justify-center overflow-hidden border border-white/5 transition-transform"
            style={{ transform: `scale(${zoom / 100})` }}
          >
            {/* Layer 1: Colored base using Mask CSS */}
            <div 
              className="absolute inset-0 z-0 transition-colors duration-500"
              style={{
                backgroundColor: config.color,
                maskImage: `url(${config.view === 'espalda' && activeProduct.images.back ? activeProduct.images.back : activeProduct.images.front})`,
                WebkitMaskImage: `url(${config.view === 'espalda' && activeProduct.images.back ? activeProduct.images.back : activeProduct.images.front})`,
                maskSize: 'contain',
                WebkitMaskSize: 'contain',
                maskPosition: 'center',
                WebkitMaskPosition: 'center',
                maskRepeat: 'no-repeat',
                WebkitMaskRepeat: 'no-repeat'
              }}
            />

            {/* Layer 2: Canvas Design Overlay */}
            <div
              className={`absolute z-10 border border-transparent transition-all duration-300 flex items-center justify-center group ${
                step === 2 ? 'hover:border-red-500/20' : ''
              }`}
              style={{ top: bounds.top, left: bounds.left, width: bounds.width, height: bounds.height }}
            >
              {/* Boundary indicator */}
              {!design && !textLayer && step === 2 && (
                <div className="w-full h-full border-2 border-red-500/20 bg-red-500/5 backdrop-blur-[0.5px] rounded flex items-center justify-center">
                  <span className="text-[10px] text-red-400 font-mono opacity-60 uppercase tracking-widest">Zona de Impresión</span>
                </div>
              )}

              {/* Design Image Layer */}
              {design && (
                <div 
                  className={`relative w-full h-full flex items-center justify-center ${step === 2 ? 'cursor-move' : ''}`}
                  onMouseDown={step === 2 ? handleDragStart : undefined}
                  onTouchStart={step === 2 ? handleDragStart : undefined}
                >
                  <div
                    className={`relative max-w-full max-h-full flex items-center justify-center ${
                      step === 2 ? 'pointer-events-auto group/transform' : 'pointer-events-none'
                    }`}
                    style={{
                      transform: `translate(${design.x}px, ${design.y}px) scale(${design.scale / 100}) rotate(${design.rotation || 0}deg)`,
                      opacity: (design.opacity !== undefined ? design.opacity : 100) / 100,
                    }}
                  >
                    {/* The design image */}
                    <img
                      src={design.url}
                      alt="Artwork"
                      className="max-w-full max-h-full object-contain pointer-events-none select-none"
                      style={{
                        filter: design.colorProfile === 'bw' ? 'grayscale(100%)' : 'none',
                        mixBlendMode: design.whiteRemoved ? 'multiply' : 'normal',
                      }}
                    />

                    {/* Interactive Transform Bounding Box (Visible when active and in step 2) */}
                    {step === 2 && (
                      <div className="absolute -inset-2 border-2 border-red-500/60 border-dashed rounded pointer-events-none opacity-0 group-hover/transform:opacity-100 transition-opacity">
                        {/* Top-Left: Delete Handle */}
                        <button
                          onMouseDown={(e) => { e.stopPropagation(); handleClearDesign(); }}
                          onTouchStart={(e) => { e.stopPropagation(); handleClearDesign(); }}
                          className="absolute -top-2.5 -left-2.5 w-5 h-5 bg-red-600 hover:bg-red-500 border border-white/20 rounded-full flex items-center justify-center text-white cursor-pointer active:scale-95 pointer-events-auto shadow-md"
                          title="Eliminar Arte"
                        >
                          <span className="text-[10px] font-black leading-none">×</span>
                        </button>

                        {/* Top-Right: Rotate Handle */}
                        <div
                          onMouseDown={(e) => { e.stopPropagation(); handleRotateStart(e); }}
                          onTouchStart={(e) => { e.stopPropagation(); handleRotateStart(e); }}
                          className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-blue-600 hover:bg-blue-500 border border-white/20 rounded-full flex items-center justify-center text-white cursor-alias active:scale-95 pointer-events-auto shadow-md"
                          title="Rotar Arte"
                        >
                          <RotateCcw size={10} strokeWidth={3} />
                        </div>

                        {/* Bottom-Right: Resize/Scale Handle */}
                        <div
                          onMouseDown={(e) => { e.stopPropagation(); handleResizeStart(e); }}
                          onTouchStart={(e) => { e.stopPropagation(); handleResizeStart(e); }}
                          className="absolute -bottom-2.5 -right-2.5 w-5 h-5 bg-green-600 hover:bg-green-500 border border-white/20 rounded-full flex items-center justify-center text-white cursor-se-resize active:scale-95 pointer-events-auto shadow-md"
                          title="Cambiar Tamaño"
                        >
                          <Maximize size={10} strokeWidth={3} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Design Custom Text Layer */}
              {textLayer && (
                <div 
                  className={`absolute inset-0 flex items-center justify-center ${step === 2 ? 'cursor-move' : ''}`}
                  onMouseDown={step === 2 ? handleTextDragStart : undefined}
                  onTouchStart={step === 2 ? handleTextDragStart : undefined}
                >
                  <div
                    className={`relative pointer-events-auto ${
                      step === 2 ? 'group/text-transform' : 'pointer-events-none'
                    }`}
                    style={{
                      transform: `translate(${textLayer.x}px, ${textLayer.y}px) scale(${textLayer.scale / 100}) rotate(${textLayer.rotation || 0}deg)`,
                      opacity: (textLayer.opacity !== undefined ? textLayer.opacity : 100) / 100,
                    }}
                  >
                    {/* The text element */}
                    <span
                      style={{
                        color: textLayer.color,
                        fontFamily: textLayer.fontFamily === 'monospace' ? 'Courier, monospace' : textLayer.fontFamily,
                        fontSize: '32px',
                        fontWeight: '800',
                        whiteSpace: 'nowrap',
                        letterSpacing: '0.05em',
                        userSelect: 'none',
                      }}
                      className="block px-2 py-1 select-none leading-none"
                    >
                      {textLayer.text}
                    </span>

                    {/* Transform border and handles (ONLY in Step 2) */}
                    {step === 2 && (
                      <div className="absolute -inset-1.5 border-2 border-blue-500/60 border-dashed rounded pointer-events-none opacity-0 group-hover/text-transform:opacity-100 transition-opacity">
                        {/* Top-Left: Delete Handle */}
                        <button
                          onMouseDown={(e) => { e.stopPropagation(); handleClearText(); }}
                          onTouchStart={(e) => { e.stopPropagation(); handleClearText(); }}
                          className="absolute -top-2 -left-2 w-4.5 h-4.5 bg-red-600 hover:bg-red-500 border border-white/20 rounded-full flex items-center justify-center text-white cursor-pointer active:scale-95 pointer-events-auto shadow-md"
                          title="Eliminar Texto"
                        >
                          <span className="text-[9px] font-black leading-none">×</span>
                        </button>

                        {/* Top-Right: Rotate Handle */}
                        <div
                          onMouseDown={(e) => { e.stopPropagation(); handleTextRotateStart(e); }}
                          onTouchStart={(e) => { e.stopPropagation(); handleTextRotateStart(e); }}
                          className="absolute -top-2 -right-2 w-4.5 h-4.5 bg-blue-600 hover:bg-blue-500 border border-white/20 rounded-full flex items-center justify-center text-white cursor-alias active:scale-95 pointer-events-auto shadow-md"
                          title="Rotar Texto"
                        >
                          <RotateCcw size={8} strokeWidth={3} />
                        </div>

                        {/* Bottom-Right: Resize/Scale Handle */}
                        <div
                          onMouseDown={(e) => { e.stopPropagation(); handleTextResizeStart(e); }}
                          onTouchStart={(e) => { e.stopPropagation(); handleTextResizeStart(e); }}
                          className="absolute -bottom-2 -right-2 w-4.5 h-4.5 bg-green-600 hover:bg-green-500 border border-white/20 rounded-full flex items-center justify-center text-white cursor-se-resize active:scale-95 pointer-events-auto shadow-md"
                          title="Cambiar Tamaño"
                        >
                          <Maximize size={8} strokeWidth={3} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Layer 3: Shading multiply overlay */}
            <div 
              className="absolute inset-0 z-20 pointer-events-none mix-blend-multiply opacity-90"
              style={{
                backgroundImage: `url(${config.view === 'espalda' && activeProduct.images.back ? activeProduct.images.back : activeProduct.images.front})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            />
          </div>

          {/* Location Badge */}
          <div className="absolute bottom-8 bg-[#161619]/90 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/5 text-center shadow-2xl flex items-center gap-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              {config.view === 'frente' ? 'Frente' : 'Espalda'} · {CATALOG_DATA.printLocations[config.view]?.find(l => l.id === config.location)?.name || 'Full'}
            </span>
            <div className="w-px h-3 bg-white/10" />
            <button
              onClick={() => setShowLocationModal(true)}
              className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
            >
              Cambiar zona
            </button>
          </div>
        </main>

        {/* Right Sidebar Control Panel */}
        <aside className="w-[360px] bg-[#161619] border-l border-white/5 flex flex-col z-20 shadow-2xl flex-shrink-0 overflow-hidden">
          
          {/* STEP 1: Prenda config */}
          {step === 1 && (
            <div className="flex flex-col h-full overflow-y-auto no-scrollbar">
              <div className="p-6 space-y-6">
                
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Shirt size={14} className="text-red-500" />
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">1. Prenda Base</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {CATALOG_DATA.products.map(p => (
                      <button
                        key={p.id}
                        onClick={() => updateConfig('product', p.id)}
                        className={`relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                          config.product === p.id 
                            ? 'border-red-500 bg-red-500/10 text-red-400 shadow-md shadow-red-500/5' 
                            : 'border-white/5 bg-[#1F1F23] text-zinc-400 hover:border-white/10 hover:bg-[#252529]'
                        }`}
                      >
                        {config.product === p.id && (
                          <div className="absolute top-2.5 right-2.5 text-red-400">
                            <Check size={14} strokeWidth={3} />
                          </div>
                        )}
                        <div className={`mb-2 transition-transform duration-300 ${config.product === p.id ? 'scale-110 text-red-400' : 'text-zinc-500'}`}>
                          {renderIcon(p.icon, 28)}
                        </div>
                        <span className="font-bold text-xs text-center leading-tight text-white">{p.name}</span>
                        <span className="text-[10px] text-zinc-500 mt-1">desde ${p.price}</span>
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Palette size={14} className="text-red-500" />
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">2. Color</h3>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {CATALOG_DATA.colors.map(c => (
                      <button
                        key={c.id}
                        onClick={() => updateConfig('color', c.hex)}
                        className={`relative w-9 h-9 rounded-full transition-all flex items-center justify-center ${
                          config.color === c.hex 
                            ? 'ring-2 ring-offset-2 ring-offset-[#161619] ring-red-500 scale-110 shadow-lg' 
                            : 'ring-1 ring-white/10 hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      >
                        {config.color === c.hex && (
                          <Check 
                            size={14} 
                            color={c.hex === '#FFFFFF' || c.hex === '#D4D4D8' ? '#000' : '#FFF'} 
                            strokeWidth={4} 
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Ruler size={14} className="text-red-500" />
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">3. Talla</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {CATALOG_DATA.sizes.map(s => (
                      <button
                        key={s}
                        onClick={() => updateConfig('size', s)}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold text-xs transition-all ${
                          config.size === s 
                            ? 'bg-red-500 text-white shadow-lg shadow-red-500/10' 
                            : 'bg-[#1F1F23] border border-white/5 text-zinc-400 hover:border-white/10 hover:text-white'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </section>
              </div>

              <div className="p-5 border-t border-white/5 bg-[#1F1F23] mt-auto">
                <button
                  onClick={() => setStep(2)}
                  className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-600/10 transition-all flex items-center justify-center gap-2"
                >
                  Continuar a Diseño
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Customization config */}
          {step === 2 && activePanel === 'main' && (
            <div className="flex flex-col h-full overflow-y-auto no-scrollbar">
              <div className="p-6 flex-1 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Personalización</h3>
                  <button 
                    onClick={() => setStep(1)} 
                    className="text-xs font-semibold text-zinc-500 hover:text-white transition-colors"
                  >
                    Editar prenda
                  </button>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => setActivePanel('upload')}
                    className="w-full bg-[#1F1F23] border border-white/5 hover:border-white/15 hover:bg-[#252529] p-4 rounded-xl flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <UploadCloud className="text-red-500 group-hover:scale-105 transition-transform" size={18} />
                      <span className="font-semibold text-sm text-zinc-200">Subir Logo / Diseño</span>
                    </div>
                    <ChevronRight size={16} className="text-zinc-500" />
                  </button>

                  <button 
                    onClick={handleAddText}
                    className="w-full bg-[#1F1F23] border border-white/5 hover:border-white/15 hover:bg-[#252529] p-4 rounded-xl flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <Type className="text-red-500 group-hover:scale-105 transition-transform" size={18} />
                      <div className="text-left">
                        <span className="font-semibold text-sm text-zinc-200 block">Añadir Texto</span>
                        {textLayer && (
                          <span className="text-[10px] text-green-400 block font-bold font-mono">"{textLayer.text}"</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-zinc-500" />
                  </button>
                </div>

                {design && (
                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Controles del Diseño</h4>
                      <button 
                        onClick={() => updateDesign({ x: 0, y: 0 })}
                        className="text-[10px] font-bold text-zinc-500 hover:text-white transition-colors"
                      >
                        Centrar
                      </button>
                    </div>
                    
                    {/* Size slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-zinc-400">Escala</span>
                        <span className="text-white font-mono">{design.scale}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="200"
                        value={design.scale}
                        onChange={e => updateDesign({ scale: parseInt(e.target.value) })}
                        className="w-full h-1 bg-[#1F1F23] rounded-lg appearance-none cursor-pointer accent-red-500"
                      />
                      <div className="flex gap-2 pt-1">
                        <button 
                          onClick={() => updateDesign({ scale: Math.max(10, design.scale - 10) })}
                          className="px-2 py-1 bg-[#1F1F23] hover:bg-[#252529] border border-white/5 rounded text-[10px] text-zinc-400 hover:text-white transition-colors"
                        >
                          -10%
                        </button>
                        <button 
                          onClick={() => updateDesign({ scale: Math.min(200, design.scale + 10) })}
                          className="px-2 py-1 bg-[#1F1F23] hover:bg-[#252529] border border-white/5 rounded text-[10px] text-zinc-400 hover:text-white transition-colors"
                        >
                          +10%
                        </button>
                        <button 
                          onClick={() => updateDesign({ scale: 100 })}
                          className="px-2 py-1 bg-[#1F1F23] hover:bg-[#252529] border border-white/5 rounded text-[10px] text-zinc-400 hover:text-white transition-colors"
                        >
                          100%
                        </button>
                        <button 
                          onClick={() => updateDesign({ scale: 60 })}
                          className="px-2 py-1 bg-[#1F1F23] hover:bg-[#252529] border border-white/5 rounded text-[10px] text-zinc-400 hover:text-white transition-colors"
                        >
                          60%
                        </button>
                      </div>
                    </div>

                    {/* Rotation slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-zinc-400">Rotación</span>
                        <span className="text-white font-mono">{design.rotation}°</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={design.rotation}
                        onChange={e => updateDesign({ rotation: parseInt(e.target.value) })}
                        className="w-full h-1 bg-[#1F1F23] rounded-lg appearance-none cursor-pointer accent-red-500"
                      />
                      <div className="flex gap-2 pt-1">
                        <button 
                          onClick={() => updateDesign({ rotation: ((design.rotation || 0) - 45 + 360) % 360 })}
                          className="px-2 py-1 bg-[#1F1F23] hover:bg-[#252529] border border-white/5 rounded text-[10px] text-zinc-400 hover:text-white transition-colors"
                        >
                          -45°
                        </button>
                        <button 
                          onClick={() => updateDesign({ rotation: ((design.rotation || 0) + 45) % 360 })}
                          className="px-2 py-1 bg-[#1F1F23] hover:bg-[#252529] border border-white/5 rounded text-[10px] text-zinc-400 hover:text-white transition-colors"
                        >
                          +45°
                        </button>
                        <button 
                          onClick={() => updateDesign({ rotation: 90 })}
                          className="px-2 py-1 bg-[#1F1F23] hover:bg-[#252529] border border-white/5 rounded text-[10px] text-zinc-400 hover:text-white transition-colors"
                        >
                          90°
                        </button>
                        <button 
                          onClick={() => updateDesign({ rotation: 0 })}
                          className="px-2 py-1 bg-[#1F1F23] hover:bg-[#252529] border border-white/5 rounded text-[10px] text-zinc-400 hover:text-white transition-colors"
                        >
                          0°
                        </button>
                      </div>
                    </div>

                    {/* Opacity slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-zinc-400">Opacidad</span>
                        <span className="text-white font-mono">{design.opacity}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={design.opacity}
                        onChange={e => updateDesign({ opacity: parseInt(e.target.value) })}
                        className="w-full h-1 bg-[#1F1F23] rounded-lg appearance-none cursor-pointer accent-red-500"
                      />
                    </div>

                    {/* Filter quick toggles */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        onClick={() => updateDesign({ whiteRemoved: !design.whiteRemoved })}
                        className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                          design.whiteRemoved 
                            ? 'border-red-500 bg-red-500/10 text-red-400' 
                            : 'border-white/5 bg-[#1F1F23] text-zinc-400 hover:bg-[#252529]'
                        }`}
                      >
                        {design.whiteRemoved ? "Fondo Oculto" : "Fondo Normal"}
                      </button>
                      <button
                        onClick={() => updateDesign({ colorProfile: design.colorProfile === 'full' ? 'bw' : 'full' })}
                        className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all ${
                          design.colorProfile === 'bw' 
                            ? 'border-red-500 bg-red-500/10 text-red-400' 
                            : 'border-white/5 bg-[#1F1F23] text-zinc-400 hover:bg-[#252529]'
                        }`}
                      >
                        {design.colorProfile === 'bw' ? "B&N" : "Color"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-5 border-t border-white/5 bg-[#1F1F23] mt-auto space-y-2">
                <button
                  onClick={() => setStep(3)}
                  disabled={!design && !textLayer}
                  className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${
                    design || textLayer
                      ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/10 cursor-pointer' 
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  Continuar al Resumen
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: upload panel */}
          {step === 2 && activePanel === 'upload' && (
            <div className="p-6 flex flex-col h-full">
              <button
                onClick={() => setActivePanel('main')}
                className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors"
              >
                <ChevronLeft size={16} />
                <span className="text-sm font-bold text-white uppercase tracking-wider">Subir Arte</span>
              </button>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-12 border-2 border-dashed border-white/10 hover:border-red-500/30 bg-[#1F1F23] rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer group transition-all"
              >
                <UploadCloud size={32} className="text-zinc-500 group-hover:text-red-500 transition-colors" />
                <span className="text-xs font-bold text-zinc-300">Seleccionar Archivo</span>
                <span className="text-[10px] text-zinc-500">PNG, JPG de alta resolución</span>
              </div>
            </div>
          )}

          {/* STEP 2: remove white panel */}
          {step === 2 && activePanel === 'removeWhite' && design && (
            <div className="flex flex-col h-full">
              <div className="p-6 flex-1 space-y-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Opciones de Blanco</h3>
                <p className="text-xs text-zinc-400">Configura si deseas ocultar o fundir los fondos blancos en tu logo.</p>

                <div className="space-y-3">
                  <div
                    onClick={() => updateDesign({ whiteRemoved: false })}
                    className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                      !design.whiteRemoved ? 'border-red-500 bg-red-500/5' : 'border-white/5 bg-[#1F1F23] hover:border-white/10'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-4 mt-0.5 flex-shrink-0 ${!design.whiteRemoved ? 'border-red-500' : 'border-zinc-700'}`} />
                    <div>
                      <p className="font-bold text-xs text-white">Conservar Fondo Blanco</p>
                      <p className="text-[10px] text-zinc-500 mt-1">Ideal para fotos completas o artes con cajas blancas.</p>
                    </div>
                  </div>

                  <div
                    onClick={() => updateDesign({ whiteRemoved: true })}
                    className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                      design.whiteRemoved ? 'border-red-500 bg-red-500/5' : 'border-white/5 bg-[#1F1F23] hover:border-white/10'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-4 mt-0.5 flex-shrink-0 ${design.whiteRemoved ? 'border-red-500' : 'border-zinc-700'}`} />
                    <div>
                      <p className="font-bold text-xs text-white">Fusión / Multiplicar</p>
                      <p className="text-[10px] text-zinc-500 mt-1">Intenta ocultar fondos blancos mezclándolos con la tela.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-white/5 flex gap-3 bg-[#1F1F23]">
                <button
                  onClick={handleClearDesign}
                  className="flex-1 py-3 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
                >
                  CANCELAR
                </button>
                <button
                  onClick={() => setActivePanel('main')}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-lg transition-colors"
                >
                  CONTINUAR
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: text customizer panel */}
          {step === 2 && activePanel === 'text' && textLayer && (
            <div className="flex flex-col h-full overflow-y-auto no-scrollbar">
              <div className="p-6 flex-1 space-y-6">
                <button
                  onClick={() => setActivePanel('main')}
                  className="flex items-center gap-2 text-zinc-400 hover:text-white mb-4 transition-colors"
                >
                  <ChevronLeft size={16} />
                  <span className="text-sm font-bold text-white uppercase tracking-wider">Ajustar Texto</span>
                </button>

                {/* Text input */}
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider">Tu Texto</label>
                  <input
                    type="text"
                    value={textLayer.text}
                    onChange={e => updateText({ text: e.target.value })}
                    className="w-full bg-[#1F1F23] border border-white/10 text-white text-xs rounded-xl p-3 outline-none focus:border-red-500 transition-colors font-sans"
                    placeholder="Escribe aquí..."
                  />
                </div>

                {/* Font Family Selection */}
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider">Tipografía</label>
                  <select
                    value={textLayer.fontFamily}
                    onChange={e => updateText({ fontFamily: e.target.value })}
                    className="w-full bg-[#1F1F23] border border-white/10 text-white text-xs rounded-xl p-3 outline-none cursor-pointer focus:border-red-500 font-sans"
                  >
                    <option value="Outfit">Outfit (Moderna)</option>
                    <option value="Inter">Inter (Sans-Serif)</option>
                    <option value="monospace">Courier (Retro Monospace)</option>
                    <option value="Georgia">Georgia (Serif Elegante)</option>
                    <option value="Impact">Impact (Heavy/Sport)</option>
                  </select>
                </div>

                {/* Text Color Picker */}
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider">Color del Texto</label>
                  <div className="flex flex-wrap gap-2">
                    {CATALOG_DATA.colors.map(col => (
                      <button
                        key={col.id}
                        onClick={() => updateText({ color: col.hex })}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${
                          textLayer.color === col.hex ? 'border-red-500 scale-110 shadow' : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: col.hex }}
                        title={col.name}
                      />
                    ))}
                    {/* Custom Color Input */}
                    <input
                      type="color"
                      value={textLayer.color}
                      onChange={e => updateText({ color: e.target.value })}
                      className="w-6 h-6 rounded-full border border-white/20 bg-transparent cursor-pointer overflow-hidden p-0"
                      title="Color personalizado"
                    />
                  </div>
                </div>

                {/* Scale controls */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-zinc-400">Escala del Texto</span>
                    <span className="text-white font-mono">{textLayer.scale}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="250"
                    value={textLayer.scale}
                    onChange={e => updateText({ scale: parseInt(e.target.value) })}
                    className="w-full h-1 bg-[#1F1F23] rounded-lg appearance-none cursor-pointer accent-red-500"
                  />
                  <div className="flex gap-2 pt-1">
                    <button 
                      onClick={() => updateText({ scale: Math.max(10, textLayer.scale - 10) })}
                      className="px-2 py-1 bg-[#1F1F23] hover:bg-[#252529] border border-white/5 rounded text-[10px] text-zinc-400 hover:text-white transition-colors"
                    >
                      -10%
                    </button>
                    <button 
                      onClick={() => updateText({ scale: Math.min(250, textLayer.scale + 10) })}
                      className="px-2 py-1 bg-[#1F1F23] hover:bg-[#252529] border border-white/5 rounded text-[10px] text-zinc-400 hover:text-white transition-colors"
                    >
                      +10%
                    </button>
                    <button 
                      onClick={() => updateText({ scale: 100 })}
                      className="px-2 py-1 bg-[#1F1F23] hover:bg-[#252529] border border-white/5 rounded text-[10px] text-zinc-400 hover:text-white transition-colors"
                    >
                      100%
                    </button>
                  </div>
                </div>

                {/* Rotation controls */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-zinc-400">Rotación del Texto</span>
                    <span className="text-white font-mono">{textLayer.rotation}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={textLayer.rotation}
                    onChange={e => updateText({ rotation: parseInt(e.target.value) })}
                    className="w-full h-1 bg-[#1F1F23] rounded-lg appearance-none cursor-pointer accent-red-500"
                  />
                  <div className="flex gap-2 pt-1">
                    <button 
                      onClick={() => updateText({ rotation: ((textLayer.rotation || 0) - 45 + 360) % 360 })}
                      className="px-2 py-1 bg-[#1F1F23] hover:bg-[#252529] border border-white/5 rounded text-[10px] text-zinc-400 hover:text-white transition-colors"
                    >
                      -45°
                    </button>
                    <button 
                      onClick={() => updateText({ rotation: ((textLayer.rotation || 0) + 45) % 360 })}
                      className="px-2 py-1 bg-[#1F1F23] hover:bg-[#252529] border border-white/5 rounded text-[10px] text-zinc-400 hover:text-white transition-colors"
                    >
                      +45°
                    </button>
                    <button 
                      onClick={() => updateText({ rotation: 0 })}
                      className="px-2 py-1 bg-[#1F1F23] hover:bg-[#252529] border border-white/5 rounded text-[10px] text-zinc-400 hover:text-white transition-colors"
                    >
                      0°
                    </button>
                  </div>
                </div>

                {/* Opacity controls */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-zinc-400">Opacidad del Texto</span>
                    <span className="text-white font-mono">{textLayer.opacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={textLayer.opacity}
                    onChange={e => updateText({ opacity: parseInt(e.target.value) })}
                    className="w-full h-1 bg-[#1F1F23] rounded-lg appearance-none cursor-pointer accent-red-500"
                  />
                </div>

                <div className="pt-2">
                  <button 
                    onClick={() => updateText({ x: 0, y: 0 })}
                    className="w-full py-2 bg-[#1F1F23] hover:bg-[#252529] border border-white/5 rounded-lg text-xs font-bold text-zinc-300 hover:text-white transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Move size={12} />
                    Centrar Texto
                  </button>
                </div>
              </div>

              <div className="p-5 border-t border-white/5 flex gap-3 bg-[#1F1F23]">
                <button
                  onClick={handleClearText}
                  className="flex-1 py-3 text-xs font-bold text-red-500 hover:text-red-400 transition-colors uppercase font-sans"
                >
                  Eliminar
                </button>
                <button
                  onClick={() => setActivePanel('main')}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-xl transition-colors text-center font-sans"
                >
                  Listo
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Resumen panel */}
          {step === 3 && (
            <div className="flex flex-col h-full overflow-y-auto no-scrollbar">
              <div className="p-6 flex-1 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Resumen de Pedido</h3>
                  <button 
                    onClick={() => setStep(2)} 
                    className="text-xs font-semibold text-zinc-500 hover:text-white transition-colors"
                  >
                    Editar diseño
                  </button>
                </div>

                <div className="bg-[#1F1F23] rounded-xl p-4 border border-white/5 space-y-3.5">
                  <div className="flex justify-between text-xs border-b border-white/5 pb-2">
                    <span className="text-zinc-400">Prenda</span>
                    <span className="text-white font-bold">{activeProduct.name}</span>
                  </div>

                  <div className="flex justify-between text-xs border-b border-white/5 pb-2 items-center">
                    <span className="text-zinc-400">Color seleccionado</span>
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: config.color }} />
                      <span className="text-white font-semibold">
                        {CATALOG_DATA.colors.find(c => c.hex === config.color)?.name || 'Personalizado'}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between text-xs border-b border-white/5 pb-2">
                    <span className="text-zinc-400">Talla</span>
                    <span className="text-white font-bold">{config.size}</span>
                  </div>

                  <div className="flex justify-between text-xs border-b border-white/5 pb-2">
                    <span className="text-zinc-400">Área de Impresión</span>
                    <span className="text-white font-bold capitalize">
                      {config.view} · {(CATALOG_DATA.printLocations[config.view]?.find(l => l.id === config.location) || { name: config.location }).name}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs border-b border-white/5 pb-2">
                    <span className="text-zinc-400">Logotipo subido</span>
                    <span className={`font-bold ${design ? 'text-green-400' : 'text-zinc-500'}`}>
                      {design ? (design.colorProfile === 'bw' ? 'Sí (B&N)' : 'Sí (Color)') : 'No'}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Texto personalizado</span>
                    <span className={`font-bold ${textLayer ? 'text-green-400' : 'text-zinc-500'}`}>
                      {textLayer ? `Sí ("${textLayer.text}")` : 'No'}
                    </span>
                  </div>
                </div>

                {/* Precios Estimados */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-extrabold text-zinc-500 uppercase tracking-widest">Precios Estimados (Unitario)</h4>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Base Prenda:</span>
                      <span className="text-white font-mono">${activeProduct.price.toFixed(2)} USD</span>
                    </div>
                    {design && (
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Estampado de Logotipo:</span>
                        <span className="text-white font-mono">$4.00 USD</span>
                      </div>
                    )}
                    {textLayer && (
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Estampado de Texto:</span>
                        <span className="text-white font-mono">$2.00 USD</span>
                      </div>
                    )}
                    <div className="w-full h-px bg-white/5 my-1" />
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-red-500">Precio Total Estimado:</span>
                      <span className="text-white font-mono">
                        ${(
                          activeProduct.price + 
                          (design ? 4.00 : 0) + 
                          (textLayer ? 2.00 : 0)
                        ).toFixed(2)} USD
                      </span>
                    </div>
                  </div>
                  <p className="text-[9px] text-zinc-500 italic mt-2 leading-relaxed">
                    * Los precios son sugeridos y pueden variar de acuerdo al volumen final del pedido y tipo de técnica (Serigrafía, DTF, Bordado).
                  </p>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="p-5 border-t border-white/5 bg-[#1F1F23] mt-auto space-y-2">
                <button
                  onClick={exportMockupPNG}
                  className="w-full py-3.5 bg-[#252529] hover:bg-[#2F2F35] border border-white/5 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-all text-xs"
                >
                  Descargar Mockup PNG
                </button>
                <button
                  onClick={() => alert('¡Cotización Guardada! Nos pondremos en contacto contigo pronto.')}
                  className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold shadow-lg transition-all text-xs flex items-center justify-center gap-2"
                >
                  Solicitar Cotización Final
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="w-full py-2 text-center text-xs font-bold text-zinc-400 hover:text-white transition-colors"
                >
                  VOLVER
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* ── MODAL: location selector ── */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
          <div className="bg-[#161619] w-full max-w-4xl border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Zonas de Impresión disponibles</h3>
                <p className="text-xs text-zinc-400 mt-1">Elige el lado y el área donde deseas colocar tu diseño.</p>
              </div>
              <button 
                onClick={() => setShowLocationModal(false)} 
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto no-scrollbar space-y-6">
              <div>
                <h4 className="text-[11px] font-extrabold text-zinc-500 uppercase tracking-widest mb-4">Lado Frente</h4>
                <div className="grid grid-cols-3 gap-4">
                  {CATALOG_DATA.printLocations.frente.map(loc => (
                    <div
                      key={loc.id}
                      onClick={() => {
                        updateConfig('view', 'frente');
                        updateConfig('location', loc.id);
                        setShowLocationModal(false);
                      }}
                      className={`bg-[#1F1F23] rounded-xl overflow-hidden cursor-pointer border-2 transition-all hover:border-red-500/30 ${
                        config.view === 'frente' && config.location === loc.id ? 'border-red-500' : 'border-transparent'
                      }`}
                    >
                      <div className="aspect-square relative p-4 bg-white/5 flex items-center justify-center">
                        <img 
                          src={activeProduct.images.front} 
                          alt="Frente" 
                          className="max-w-full max-h-full object-contain grayscale opacity-30" 
                        />
                        <div
                          className="absolute border border-red-500 bg-red-500/10 rounded"
                          style={{ top: loc.bounds.top, left: loc.bounds.left, width: loc.bounds.width, height: loc.bounds.height }}
                        />
                      </div>
                      <div className="p-3 text-center bg-[#161619] border-t border-white/5">
                        <p className="font-bold text-xs text-white">{loc.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {activeProduct.images.back && (
                <div>
                  <h4 className="text-[11px] font-extrabold text-zinc-500 uppercase tracking-widest mb-4">Lado Espalda</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {CATALOG_DATA.printLocations.espalda.map(loc => (
                      <div
                        key={loc.id}
                        onClick={() => {
                          updateConfig('view', 'espalda');
                          updateConfig('location', loc.id);
                          setShowLocationModal(false);
                        }}
                        className={`bg-[#1F1F23] rounded-xl overflow-hidden cursor-pointer border-2 transition-all hover:border-red-500/30 ${
                          config.view === 'espalda' && config.location === loc.id ? 'border-red-500' : 'border-transparent'
                        }`}
                      >
                        <div className="aspect-square relative p-4 bg-white/5 flex items-center justify-center">
                          <img 
                            src={activeProduct.images.back} 
                            alt="Espalda" 
                            className="max-w-full max-h-full object-contain grayscale opacity-30" 
                          />
                          <div
                            className="absolute border border-red-500 bg-red-500/10 rounded"
                            style={{ top: loc.bounds.top, left: loc.bounds.left, width: loc.bounds.width, height: loc.bounds.height }}
                          />
                        </div>
                        <div className="p-3 text-center bg-[#161619] border-t border-white/5">
                          <p className="font-bold text-xs text-white">{loc.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
