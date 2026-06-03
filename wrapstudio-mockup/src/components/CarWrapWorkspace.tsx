/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  MousePointer2, 
  Hand, 
  ZoomIn,
  ZoomOut,
  Grid3X3, 
  Undo2, 
  Redo2, 
  Upload, 
  Download, 
  RefreshCw,
  Sparkles,
  Save,
  Trash2,
  FolderOpen,
  AlertCircle,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { QuoteModal } from './QuoteModal';

// Safe API key initialization
const getApiKey = () => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY) {
      return process.env.GEMINI_API_KEY;
    }
  } catch (_e) {}
  
  try {
    // @ts-ignore
    const metaEnv = import.meta.env;
    if (metaEnv) {
      return metaEnv.VITE_GEMINI_API_KEY || metaEnv.GEMINI_API_KEY || "";
    }
  } catch (_e) {}
  
  return "";
};

const aiApiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey: aiApiKey || "MOCK_KEY" });

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
  maskUrl?: string; // Layer-specific brush mask data URL
  aspect?: number;
  colorMode?: 'multiply' | 'source-over' | string;
}

interface Project {
  id: string;
  name: string;
  vehicle_image: string;
  layers: Layer[];
  globalBodyMaskUrl?: string;
  selectedPanel: string[];
  created_at: string;
}

interface Props {
  onBackToTshirt: () => void;
}

// Background removal and trimming helpers
function trimCanvas(canvas: HTMLCanvasElement): {
  trimmedCanvas: HTMLCanvasElement;
  aspect: number;
  trimRect?: {
    x: number;
    y: number;
    w: number;
    h: number;
    origW: number;
    origH: number;
  };
} {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { trimmedCanvas: canvas, aspect: canvas.width / canvas.height };
  
  const width = canvas.width;
  const height = canvas.height;
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const alpha = data[idx + 3];
      if (alpha > 5) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  
  if (maxX < minX || maxY < minY) {
    return {
      trimmedCanvas: canvas,
      aspect: width / height,
      trimRect: { x: 0, y: 0, w: width, h: height, origW: width, origH: height }
    };
  }
  
  const trimmedWidth = (maxX - minX) + 1;
  const trimmedHeight = (maxY - minY) + 1;
  
  const trimmedCanvas = document.createElement('canvas');
  trimmedCanvas.width = trimmedWidth;
  trimmedCanvas.height = trimmedHeight;
  const trimmedCtx = trimmedCanvas.getContext('2d');
  if (!trimmedCtx) return { trimmedCanvas: canvas, aspect: width / height };
  
  trimmedCtx.drawImage(
    canvas,
    minX, minY, trimmedWidth, trimmedHeight,
    0, 0, trimmedWidth, trimmedHeight
  );
  
  return {
    trimmedCanvas,
    aspect: trimmedWidth / trimmedHeight,
    trimRect: { x: minX, y: minY, w: trimmedWidth, h: trimmedHeight, origW: width, origH: height }
  };
}

function removeImageBackground(imageUrl: string, threshold = 40): Promise<{
  url: string;
  aspect: number;
  trimRect?: {
    x: number;
    y: number;
    w: number;
    h: number;
    origW: number;
    origH: number;
  };
}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Cannot get 2D context'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      let bgR = data[0];
      let bgG = data[1];
      let bgB = data[2];
      let bgA = data[3];
      
      if (bgA < 50) {
        const corners = [
          { x: canvas.width - 1, y: 0 },
          { x: 0, y: canvas.height - 1 },
          { x: canvas.width - 1, y: canvas.height - 1 }
        ];
        for (const corner of corners) {
          const idx = (corner.y * canvas.width + corner.x) * 4;
          if (data[idx + 3] >= 50) {
            bgR = data[idx];
            bgG = data[idx + 1];
            bgB = data[idx + 2];
            bgA = data[idx + 3];
            break;
          }
        }
      }
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        const distance = Math.sqrt(
          (r - bgR) ** 2 +
          (g - bgG) ** 2 +
          (b - bgB) ** 2
        );
        
        const feather = 18; // Soft edge width for anti-aliasing
        if (distance <= threshold - feather) {
          data[i + 3] = 0;
        } else if (distance <= threshold + feather) {
          // Smoothly interpolate alpha for anti-aliased edges
          const ratio = (distance - (threshold - feather)) / (feather * 2);
          // Easing function for smoother blend (optional but nice)
          const smoothRatio = ratio * ratio * (3 - 2 * ratio);
          data[i + 3] = Math.round(data[i + 3] * smoothRatio);
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
      const { trimmedCanvas, aspect, trimRect } = trimCanvas(canvas);
      resolve({
        url: trimmedCanvas.toDataURL('image/png'),
        aspect,
        trimRect
      });
    };
    img.onerror = (err) => {
      reject(err);
    };
    img.src = imageUrl;
  });
}

function scanVehicleSilhouette(imageUrl: string, threshold = 35): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Cannot get 2D context'));
        
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const width = canvas.width;
        const height = canvas.height;
        
        // 1. Check if the image already has significant transparency
        let transparentBorderCount = 0;
        const totalBorderPixels = (width * 2) + (height * 2) - 4;
        
        // Check outer perimeter for transparency
        for (let x = 0; x < width; x++) {
          if (data[(0 * width + x) * 4 + 3] < 50) transparentBorderCount++;
          if (data[((height - 1) * width + x) * 4 + 3] < 50) transparentBorderCount++;
        }
        for (let y = 1; y < height - 1; y++) {
          if (data[(y * width + 0) * 4 + 3] < 50) transparentBorderCount++;
          if (data[(y * width + (width - 1)) * 4 + 3] < 50) transparentBorderCount++;
        }
        
        // If more than 5% of the border is transparent, treat it as a transparent background
        const isTransparentBg = transparentBorderCount > (totalBorderPixels * 0.05);
        
        const maskData = ctx.createImageData(width, height);
        const mData = maskData.data;
        
        if (isTransparentBg) {
          // Transparent background: simply copy alpha channel with a clean threshold
          for (let i = 0; i < data.length; i += 4) {
            const a = data[i + 3];
            mData[i] = 0;
            mData[i + 1] = 0;
            mData[i + 2] = 0;
            mData[i + 3] = a < 50 ? 0 : 255;
          }
        } else {
          // Opaque background: Perform border-seeded queue-based flood-fill
          const visited = new Uint8Array(width * height);
          const seedColors = new Uint32Array(width * height);
          const queue = new Int32Array(width * height);
          let head = 0;
          let tail = 0;
          
          // Get the colors of the 4 corners to establish background reference
          const corners = [
            { x: 0, y: 0 },
            { x: width - 1, y: 0 },
            { x: 0, y: height - 1 },
            { x: width - 1, y: height - 1 }
          ];
          
          const cornerColors = corners.map(c => {
            const idx = (c.y * width + c.x) * 4;
            return {
              r: data[idx],
              g: data[idx + 1],
              b: data[idx + 2]
            };
          });
          
          // Helper to check if a border pixel is background-like (similar to any corner color)
          const isBackgroundSeed = (x: number, y: number) => {
            const idx = (y * width + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            
            // If the pixel is close to ANY corner color, it's a valid background seed
            for (const cc of cornerColors) {
              const dist = Math.sqrt((r - cc.r)**2 + (g - cc.g)**2 + (b - cc.b)**2);
              if (dist < 60) return true;
            }
            return false;
          };
          
          // Enqueue seed pixels along all borders
          const addSeed = (x: number, y: number) => {
            if (isBackgroundSeed(x, y)) {
              const idx = y * width + x;
              visited[idx] = 1;
              const dIdx = idx * 4;
              // Pack color
              seedColors[idx] = (data[dIdx] << 16) | (data[dIdx + 1] << 8) | data[dIdx + 2];
              queue[tail++] = idx;
            }
          };
          
          for (let x = 0; x < width; x++) {
            addSeed(x, 0);
            addSeed(x, height - 1);
          }
          for (let y = 1; y < height - 1; y++) {
            addSeed(0, y);
            addSeed(width - 1, y);
          }
          
          // BFS Flood Fill
          const dx = [0, 0, -1, 1];
          const dy = [-1, 1, 0, 0];
          
          const isStudioBlackBg = cornerColors.every(cc => (cc.r + cc.g + cc.b) / 3 < 20);
          
          while (head < tail) {
            const idx = queue[head++];
            const cx = idx % width;
            const cy = Math.floor(idx / width);
            
            const parentSeed = seedColors[idx];
            const sr = (parentSeed >> 16) & 0xff;
            const sg = (parentSeed >> 8) & 0xff;
            const sb = parentSeed & 0xff;
            
            const pIdx = idx * 4;
            const pr = data[pIdx];
            const pg = data[pIdx + 1];
            const pb = data[pIdx + 2];
            
            for (let i = 0; i < 4; i++) {
              const nx = cx + dx[i];
              const ny = cy + dy[i];
              
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const nidx = ny * width + nx;
                if (visited[nidx] === 0) {
                  const ndIdx = nidx * 4;
                  const nr = data[ndIdx];
                  const ng = data[ndIdx + 1];
                  const nb = data[ndIdx + 2];
                  
                  const distToSeed = Math.sqrt((nr - sr)**2 + (ng - sg)**2 + (nb - sb)**2);
                  const distToParent = Math.sqrt((nr - pr)**2 + (ng - pg)**2 + (nb - pb)**2);
                  
                  // Dynamically tune thresholds based on vertical region to protect tires, wheels, and side skirts
                  let currentThreshold = threshold;
                  let currentMaxLocalGradient = 15;
                  
                  if (isStudioBlackBg) {
                    if (ny > height * 0.72) {
                      // Very strict limits at the bottom to prevent crawling into tires and shadow bridges
                      currentThreshold = 10;
                      currentMaxLocalGradient = 5;
                    } else {
                      currentThreshold = 15;
                      currentMaxLocalGradient = 8;
                    }
                  } else {
                    // For custom images, make the bottom region slightly more conservative to protect wheels
                    if (ny > height * 0.75) {
                      currentThreshold = Math.min(threshold, 22);
                      currentMaxLocalGradient = 10;
                    }
                  }
                  
                  if (distToSeed < currentThreshold && distToParent < currentMaxLocalGradient) {
                    visited[nidx] = 1;
                    seedColors[nidx] = parentSeed;
                    queue[tail++] = nidx;
                  }
                }
              }
            }
          }
          
          // Write mask: background (visited = 1) is transparent, vehicle is opaque
          for (let i = 0; i < width * height; i++) {
            const dIdx = i * 4;
            mData[dIdx] = 0;
            mData[dIdx + 1] = 0;
            mData[dIdx + 2] = 0;
            mData[dIdx + 3] = visited[i] === 1 ? 0 : 255;
          }
        }
        
        ctx.putImageData(maskData, 0, 0);
        
        // Apply a gentle native blur to anti-alias the edges of the mask
        const blurCanvas = document.createElement('canvas');
        blurCanvas.width = width;
        blurCanvas.height = height;
        const bCtx = blurCanvas.getContext('2d');
        if (bCtx) {
          bCtx.filter = 'blur(1.5px)';
          bCtx.drawImage(canvas, 0, 0);
          resolve(blurCanvas.toDataURL('image/png'));
        } else {
          resolve(canvas.toDataURL('image/png'));
        }
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = (err) => {
      console.warn("Failed to load image for silhouette, skipping", err);
      reject(err);
    };
    img.src = imageUrl;
  });
}


export function CarWrapWorkspace({ onBackToTshirt }: Props) {
  // Navigation & Tabs
  const [zoom, setZoom] = useState(85);
  const [showProjects, setShowProjects] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  
  // Base vehicles and templates
  const [vehicleUrl, setVehicleUrl] = useState("https://lh3.googleusercontent.com/aida-public/AB6AXuBMTNrnvHRPw1Lv_R4s9Ba1R2xeofOUWtsGf9NtDhdsm5454Yjgdb0pW_v4bwikhcPNSGeJJ7dTlQ_maLNUbVvBLlO8n_hBJD5sLuMnAqCS4BSm6pxylcitbUOvDdP0GxeYxDMRMTiUcnZzoRQCROAUCaPRXH62QVuuTgg1dFVABZGytgIrFxPeMy60hQe2abNMW1mSiZgxCK4MMrEzrZQJ6UDavrFT5jkqBk5qrkDWfgIBuU5hB8CZIBI2-dCxN3toYhjt-jzGihc");
  const [isDefaultVehicle, setIsDefaultVehicle] = useState(true);
  const [vehicleSize, setVehicleSize] = useState({ width: 1920, height: 1080 });
  const [selectedPanel, setSelectedPanel] = useState<string[]>([]);
  
  // Overlay & Realism settings
  const desaturateVehicle = false;
  const [reflectionOpacity, setReflectionOpacity] = useState(60);
  const reflectionContrast = 6.0;
  const reflectionBrightness = 0.12;
  
  const [shadowOpacity, setShadowOpacity] = useState(80);
  const shadowContrast = 3.5;
  const shadowBrightness = 1.3;
  
  // Mask & Drawing States
  const [activeTool, setActiveTool] = useState<'select' | 'pan' | 'zoom' | 'brush' | 'bodyMask'>('select');
  const [brushMode, setBrushMode] = useState<'erase' | 'restore'>('erase');
  const [brushSize, setBrushSize] = useState(30);
  const [isDrawingMask, setIsDrawingMask] = useState(false);
  const [globalBodyMaskUrl, setGlobalBodyMaskUrl] = useState<string | undefined>(undefined);
  const [showContours, setShowContours] = useState(false);
  const [isTracing, setIsTracing] = useState(false);
  
  // Layers State
  const [layers, setLayers] = useState<Layer[]>([]);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
  
  // AI Mockup Generation States
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isProcessingBg, setIsProcessingBg] = useState(false);
  
  // Quote Form Modal States
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [quoteImage, setQuoteImage] = useState('');
  
  // History for Undo/Redo
  const [history, setHistory] = useState<Layer[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const brushCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const vehicleInputRef = useRef<HTMLInputElement>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  
  const activeLayer = layers.find(l => l.id === activeLayerId);

  // Mouse wheel zoom handling when zoom tool is active or Ctrl is held
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleWheel = (e: WheelEvent) => {
      if (activeTool === 'zoom' || e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY;
        // Adjust zoom by 5% increments
        if (delta < 0) {
          setZoom(prev => Math.min(400, prev + 5));
        } else {
          setZoom(prev => Math.max(10, prev - 5));
        }
      }
    };

    viewport.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      viewport.removeEventListener('wheel', handleWheel);
    };
  }, [activeTool]);

  // Initialize and load default mask on tool/layer switch
  useEffect(() => {
    if ((activeTool === 'brush' && activeLayerId) || activeTool === 'bodyMask') {
      const canvas = brushCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const currentMaskUrl = activeTool === 'bodyMask' 
        ? globalBodyMaskUrl 
        : (layers.find(l => l.id === activeLayerId)?.maskUrl);
        
      if (currentMaskUrl) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
        };
        img.src = currentMaskUrl;
      } else {
        // Fill canvas with solid black (fully visible)
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [activeTool, activeLayerId, globalBodyMaskUrl]);

  // Auto-scan vehicle silhouette when URL changes
  useEffect(() => {
    if (!vehicleUrl) return;
    let isSubscribed = true;

    const runScan = async () => {
      setIsTracing(true);
      try {
        const maskUrl = await scanVehicleSilhouette(vehicleUrl);
        if (isSubscribed) {
          setGlobalBodyMaskUrl(maskUrl);
        }
      } catch (err) {
        console.warn("Silhouette scan failed or bypassed.");
      } finally {
        if (isSubscribed) {
          setTimeout(() => setIsTracing(false), 800);
        }
      }
    };

    runScan();

    return () => { isSubscribed = false; };
  }, [vehicleUrl]);

  // Load vehicle image to get its actual size whenever vehicleUrl changes
  useEffect(() => {
    if (!vehicleUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setVehicleSize({ width: img.width, height: img.height });
    };
    img.src = vehicleUrl;
  }, [vehicleUrl]);

  // Load Projects from LocalStorage
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
      if (!skipHistory) {
        setTimeout(() => saveToHistory(updated), 0);
      }
      return updated;
    });
  };

  const fetchProjects = () => {
    try {
      const stored = localStorage.getItem('wrapstudio_projects');
      if (stored) {
        setProjects(JSON.parse(stored));
      } else {
        setProjects([]);
      }
    } catch (err) {
      console.error("Failed to load local projects", err);
    }
  };

  const saveProject = () => {
    try {
      const name = prompt("Nombre del proyecto:", `Proyecto Auto ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`);
      if (!name) return;
      
      const newProject: Project = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        vehicle_image: vehicleUrl,
        layers,
        globalBodyMaskUrl,
        selectedPanel,
        created_at: new Date().toISOString()
      };
      
      const updated = [...projects, newProject];
      localStorage.setItem('wrapstudio_projects', JSON.stringify(updated));
      setProjects(updated);
      alert("Proyecto guardado localmente con éxito.");
    } catch (err) {
      console.error("Failed to save project", err);
      alert("Error al guardar el proyecto.");
    }
  };

  const deleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("¿Estás seguro de que quieres eliminar este proyecto?")) return;
    try {
      const updated = projects.filter(p => p.id !== id);
      localStorage.setItem('wrapstudio_projects', JSON.stringify(updated));
      setProjects(updated);
    } catch (err) {
      console.error("Failed to delete project", err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("handleFileUpload triggered");
    const file = e.target.files?.[0];
    if (file) {
      console.log("Selected file:", file.name, "size:", file.size);
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        console.log("Image loaded successfully. size:", img.width, "x", img.height);
        try {
          const vWidth = (vehicleSize && typeof vehicleSize.width === 'number' && vehicleSize.width > 0) 
            ? vehicleSize.width 
            : 1920;

          // Calculate initial scale to fit nicely on the canvas (e.g. max 240px wide)
          const renderedUnscaledWidth = (img.width / vWidth) * 800;
          const targetRenderedWidth = 240;
          const initialScale = Math.min(1.0, targetRenderedWidth / renderedUnscaledWidth);

          console.log("Calculated initial scale:", initialScale);

          const newLayer: Layer = {
            id: Math.random().toString(36).substr(2, 9),
            url,
            name: file.name,
            opacity: 90,
            x: 0,
            y: 0,
            scaleX: initialScale,
            scaleY: initialScale,
            rotate: 0,
            width: img.width,
            height: img.height,
            aspect: img.width / img.height
          };
          updateLayersWithHistory(prev => [...prev, newLayer]);
          setActiveLayerId(newLayer.id);
          setActiveTool('select');
          
          // Reset file input value so onChange can be triggered again for the same file
          e.target.value = '';
          console.log("Layer added to workspace successfully:", newLayer.id);
        } catch (err) {
          console.error("Error processing loaded image in handleFileUpload:", err);
          alert("Error al procesar la imagen: " + (err as Error).message);
        }
      };

      img.onerror = () => {
        console.error("Failed to load image from file:", url);
        alert("No se pudo cargar la imagen. Asegúrate de que es un archivo JPG o PNG válido.");
        e.target.value = '';
      };

      img.src = url;
    }
  };

  const handleVehicleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("handleVehicleUpload triggered");
    const file = e.target.files?.[0];
    if (file) {
      console.log("Selected vehicle file:", file.name, "size:", file.size);
      if (vehicleUrl && vehicleUrl.startsWith('blob:')) {
        URL.revokeObjectURL(vehicleUrl);
      }
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        console.log("Vehicle image loaded successfully. size:", img.width, "x", img.height);
        try {
          setVehicleSize({ width: img.width, height: img.height });
          setVehicleUrl(url);
          setIsDefaultVehicle(false);
          setShowContours(false);
          setGlobalBodyMaskUrl(undefined); // Clear old body mask for new car
          
          // Set lower opacity for shadows and reflections on custom cars to keep the backdrop pristine
          setShadowOpacity(25);
          setReflectionOpacity(15);
          
          e.target.value = '';
        } catch (err) {
          console.error("Error setting vehicle image:", err);
          alert("Error al cargar la foto del vehículo: " + (err as Error).message);
        }
      };

      img.onerror = () => {
        console.error("Failed to load vehicle image from file:", url);
        alert("No se pudo cargar la imagen del vehículo. Asegúrate de que es un archivo JPG o PNG válido.");
        e.target.value = '';
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

  const handleLayerDragStart = (e: React.PointerEvent, layer: Layer) => {
    if (activeTool !== 'select') return;
    
    e.preventDefault();
    setActiveLayerId(layer.id);

    const startX = e.clientX;
    const startY = e.clientY;
    const initialLayerX = layer.x;
    const initialLayerY = layer.y;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      // Correct for canvas zoom scale
      const scaleCorrection = 100 / zoom;

      let targetX = initialLayerX + dx * scaleCorrection;
      let targetY = initialLayerY + dy * scaleCorrection;

      // Safety boundaries (prevent dragging completely off-screen)
      const limitX = 600;
      const limitY = 300;
      targetX = Math.max(-limitX, Math.min(limitX, targetX));
      targetY = Math.max(-limitY, Math.min(limitY, targetY));

      updateLayer(layer.id, {
        x: targetX,
        y: targetY
      }, true);
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      saveToHistory(layers);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };


  // Drawing event handlers with ZOOM Correction
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    // Correct coordinates for zoom scaling
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    return { x, y };
  };

  const handleBrushDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = brushCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.setPointerCapture(e.pointerId);
    setIsDrawingMask(true);

    const { x, y } = getCanvasCoords(e, canvas);

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

    const { x, y } = getCanvasCoords(e, canvas);

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

    // Save mask
    const maskDataUrl = canvas.toDataURL('image/png');
    if (activeTool === 'bodyMask') {
      setGlobalBodyMaskUrl(maskDataUrl);
    } else if (activeLayerId) {
      updateLayer(activeLayerId, { maskUrl: maskDataUrl });
    }
  };

  const handleRemoveBackground = async () => {
    if (!activeLayerId || !activeLayer) return;
    setIsProcessingBg(true);
    try {
      const result = await removeImageBackground(activeLayer.url);
      if (result.trimRect) {
        const { x: xTrim, y: yTrim, w: wTrim, h: hTrim, origW, origH } = result.trimRect;
        
        // Calculate center shift of trimmed area
        const dx = (xTrim + wTrim / 2) - (origW / 2);
        const dy = (yTrim + hTrim / 2) - (origH / 2);
        
        // Shift in screen coordinates
        const scaleX = activeLayer.scaleX;
        const scaleY = activeLayer.scaleY;
        const screenPixelsPerOrigPixelX = scaleX * (800 / vehicleSize.width);
        const screenPixelsPerOrigPixelY = scaleY * (800 / vehicleSize.width);
        
        const shiftX = dx * screenPixelsPerOrigPixelX;
        const shiftY = dy * screenPixelsPerOrigPixelY;
        
        const updatedLayers = layers.map(l => {
          if (l.id !== activeLayerId) return l;
          return {
            ...l,
            url: result.url,
            width: wTrim,
            height: hTrim,
            aspect: result.aspect,
            x: l.x + shiftX,
            y: l.y + shiftY
          };
        });
        updateLayersWithHistory(updatedLayers);
      } else {
        updateLayer(activeLayerId, { url: result.url, aspect: result.aspect });
      }
      alert("Fondo removido con éxito.");
    } catch (err) {
      console.error("Error removing background", err);
      alert("No se pudo remover el fondo de esta imagen.");
    } finally {
      setIsProcessingBg(false);
    }
  };

  // High-Res Export
  const exportResult = async (isDownload = true): Promise<string | null> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const loadImgSafely = (img: HTMLImageElement, url: string): Promise<boolean> => {
      return new Promise((resolve) => {
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(true);
        img.onerror = () => {
          img.removeAttribute('crossorigin');
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = url;
        };
        img.src = url;
      });
    };

    const vehicleImg = new Image();
    await loadImgSafely(vehicleImg, vehicleUrl);

    canvas.width = Math.max(vehicleImg.width, 2560);
    canvas.height = vehicleImg.height * (canvas.width / vehicleImg.width);
    const scaleFactor = canvas.width / 800;
    const baseScale = canvas.width / vehicleImg.width;

    const carVisualHeight = 800 * (vehicleImg.height / vehicleImg.width);
    const offsetY = (400 - carVisualHeight) / 2;

    // Draw Base vehicle
    const baseCanvas = document.createElement('canvas');
    baseCanvas.width = canvas.width;
    baseCanvas.height = canvas.height;
    const baseCtx = baseCanvas.getContext('2d');
    if (baseCtx) {
      baseCtx.imageSmoothingEnabled = true;
      baseCtx.imageSmoothingQuality = 'high';
      baseCtx.drawImage(vehicleImg, 0, 0, canvas.width, canvas.height);
      if (desaturateVehicle) {
        baseCtx.save();
        baseCtx.filter = 'grayscale(1) brightness(1.12) contrast(1.08)';
        baseCtx.drawImage(vehicleImg, 0, 0, canvas.width, canvas.height);
        baseCtx.restore();
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(baseCanvas, 0, 0);
    } else {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(vehicleImg, 0, 0, canvas.width, canvas.height);
    }

    // Draw Contours (Vector Lines)
    if (showContours && isDefaultVehicle) {
      const contourImg = new Image();
      await loadImgSafely(contourImg, "https://lh3.googleusercontent.com/aida-public/AB6AXuBt6QOLKQlyHHtFmo9MYTBlUutvMGoxxWsPja_pmUMQjulR5ud8QJ87D619oWEHTQzxhMU01SE63CDFZnsjX7qqXT5bvBHU7dhtebVWlKKhDdNAaX5wWg7r0HDX03UYLdb9eQTXLEid8CmMxl55Fgz1ZTCPrtYJygd5BNUjpYmi_jG5E_f26qimOJ9IQjRG46x7hE7lVkpr504mfeyEOOO0OXiVMyT-dAvpzCbd7omojH4k9tmVL3pQUsa_rHoyhMulE5aC6H_YJHg");
      ctx.globalAlpha = 0.4;
      ctx.drawImage(contourImg, 0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1.0;
    }

    // Create Design Canvas for Global Masking
    const designCanvas = document.createElement('canvas');
    designCanvas.width = canvas.width;
    designCanvas.height = canvas.height;
    const designCtx = designCanvas.getContext('2d');

    if (designCtx) {
      for (const layer of layers) {
        const layerCanvas = document.createElement('canvas');
        layerCanvas.width = canvas.width;
        layerCanvas.height = canvas.height;
        const layerCtx = layerCanvas.getContext('2d');
        if (!layerCtx) continue;

        const artworkImg = new Image();
        await loadImgSafely(artworkImg, layer.url);

        layerCtx.save();
        layerCtx.imageSmoothingEnabled = true;
        layerCtx.imageSmoothingQuality = 'high';
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        layerCtx.translate(centerX + (layer.x * scaleFactor), centerY + (layer.y * scaleFactor));
        layerCtx.rotate((layer.rotate * Math.PI) / 180);
        layerCtx.scale(layer.scaleX * baseScale, layer.scaleY * baseScale);

        const drawW = layer.width;
        const drawH = layer.height;
        layerCtx.drawImage(artworkImg, -drawW / 2, -drawH / 2, drawW, drawH);
        layerCtx.restore();

        // Apply layer brush mask
        if (layer.maskUrl) {
          const maskImg = new Image();
          await loadImgSafely(maskImg, layer.maskUrl);

          layerCtx.save();
          layerCtx.globalCompositeOperation = 'destination-in';
          layerCtx.setTransform(1, 0, 0, 1, 0, 0); // Clear any transform
          if (maskImg.width === 800 && maskImg.height === 400) {
            layerCtx.scale(scaleFactor, scaleFactor);
            layerCtx.translate(0, -offsetY);
            layerCtx.drawImage(maskImg, 0, 0);
          } else {
            layerCtx.drawImage(maskImg, 0, 0, canvas.width, canvas.height);
          }
          layerCtx.restore();
        }

        // Apply panel selection clipping
        if (isDefaultVehicle && selectedPanel.length > 0) {
          const clipCanvas = document.createElement('canvas');
          clipCanvas.width = canvas.width;
          clipCanvas.height = canvas.height;
          const clipCtx = clipCanvas.getContext('2d');
          if (clipCtx) {
            clipCtx.fillStyle = '#000000';
            clipCtx.scale(scaleFactor, scaleFactor);
            clipCtx.translate(0, -offsetY); // Apply Y-offset correction
            
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
            layerCtx.setTransform(1, 0, 0, 1, 0, 0);
            layerCtx.drawImage(clipCanvas, 0, 0);
            layerCtx.restore();
          }
        }

        designCtx.save();
        designCtx.globalAlpha = layer.opacity / 100;
        if (layer.colorMode === 'multiply') {
          designCtx.globalCompositeOperation = 'multiply';
        } else {
          designCtx.globalCompositeOperation = 'source-over';
        }
        designCtx.drawImage(layerCanvas, 0, 0);
        designCtx.restore();
      }

      // Apply Global Body Mask
      if (globalBodyMaskUrl) {
        const gMaskImg = new Image();
        await loadImgSafely(gMaskImg, globalBodyMaskUrl);

        designCtx.save();
        designCtx.globalCompositeOperation = 'destination-in';
        designCtx.setTransform(1, 0, 0, 1, 0, 0); // Clear any transform
        if (gMaskImg.width === 800 && gMaskImg.height === 400) {
          designCtx.scale(scaleFactor, scaleFactor);
          designCtx.translate(0, -offsetY);
          designCtx.drawImage(gMaskImg, 0, 0);
        } else {
          designCtx.drawImage(gMaskImg, 0, 0, canvas.width, canvas.height);
        }
        designCtx.restore();
      }

      ctx.save();
      ctx.drawImage(designCanvas, 0, 0);
      ctx.restore();
    }

    // Apply Crevice Shadows (Multiply)
    if (shadowOpacity > 0) {
      const shadowCanvas = document.createElement('canvas');
      shadowCanvas.width = canvas.width;
      shadowCanvas.height = canvas.height;
      const shadowCtx = shadowCanvas.getContext('2d');
      if (shadowCtx) {
        shadowCtx.imageSmoothingEnabled = true;
        shadowCtx.imageSmoothingQuality = 'high';
        // Optimize contrast and brightness for clean crease lines without washing out flat areas
        shadowCtx.filter = `grayscale(1) contrast(3.5) brightness(1.3)`;
        shadowCtx.drawImage(vehicleImg, 0, 0, canvas.width, canvas.height);
        
        // Mask shadows to the vehicle body
        if (globalBodyMaskUrl) {
          const gMaskImg = new Image();
          await loadImgSafely(gMaskImg, globalBodyMaskUrl);
          shadowCtx.save();
          shadowCtx.globalCompositeOperation = 'destination-in';
          shadowCtx.setTransform(1, 0, 0, 1, 0, 0);
          if (gMaskImg.width === 800 && gMaskImg.height === 400) {
            shadowCtx.scale(scaleFactor, scaleFactor);
            shadowCtx.translate(0, -offsetY);
            shadowCtx.drawImage(gMaskImg, 0, 0);
          } else {
            shadowCtx.drawImage(gMaskImg, 0, 0, canvas.width, canvas.height);
          }
          shadowCtx.restore();
        }
        
        // Mask shadows ONLY to the designs area to avoid darkening the rest of the car chapa
        shadowCtx.save();
        shadowCtx.globalCompositeOperation = 'destination-in';
        shadowCtx.setTransform(1, 0, 0, 1, 0, 0);
        shadowCtx.drawImage(designCanvas, 0, 0);
        shadowCtx.restore();
        
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        ctx.globalAlpha = shadowOpacity / 100;
        ctx.drawImage(shadowCanvas, 0, 0);
        ctx.restore();
      }
    }

    // Apply Glossy Reflections (Screen)
    if (reflectionOpacity > 0) {
      const reflCanvas = document.createElement('canvas');
      reflCanvas.width = canvas.width;
      reflCanvas.height = canvas.height;
      const reflCtx = reflCanvas.getContext('2d');
      if (reflCtx) {
        reflCtx.imageSmoothingEnabled = true;
        reflCtx.imageSmoothingQuality = 'high';
        // High contrast and low brightness isolate pure specular reflections, keeping the wrap solid
        reflCtx.filter = `grayscale(1) contrast(6.0) brightness(0.12)`;
        reflCtx.drawImage(vehicleImg, 0, 0, canvas.width, canvas.height);
        
        // Mask reflections to the vehicle body
        if (globalBodyMaskUrl) {
          const gMaskImg = new Image();
          await loadImgSafely(gMaskImg, globalBodyMaskUrl);
          reflCtx.save();
          reflCtx.globalCompositeOperation = 'destination-in';
          reflCtx.setTransform(1, 0, 0, 1, 0, 0);
          if (gMaskImg.width === 800 && gMaskImg.height === 400) {
            reflCtx.scale(scaleFactor, scaleFactor);
            reflCtx.translate(0, -offsetY);
            reflCtx.drawImage(gMaskImg, 0, 0);
          } else {
            reflCtx.drawImage(gMaskImg, 0, 0, canvas.width, canvas.height);
          }
          reflCtx.restore();
        }
        
        // Mask reflections ONLY to the designs area to avoid glaring the rest of the car chapa
        reflCtx.save();
        reflCtx.globalCompositeOperation = 'destination-in';
        reflCtx.setTransform(1, 0, 0, 1, 0, 0);
        reflCtx.drawImage(designCanvas, 0, 0);
        reflCtx.restore();
        
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = reflectionOpacity / 100;
        ctx.drawImage(reflCanvas, 0, 0);
        ctx.restore();
      }
    }

    if (isDownload) {
      try {
        const link = document.createElement('a');
        link.download = `rotulacion-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (err) {
        console.error("Export failed due to tainted canvas / CORS constraints:", err);
        alert("Error al exportar: Algunas imágenes cargadas tienen restricciones de seguridad (CORS) del navegador. Intenta usar imágenes locales o subirlas directamente desde tu dispositivo.");
      }
      return null;
    } else {
      return canvas.toDataURL('image/png');
    }
  };

  const handleQuoteClick = async () => {
    try {
      const imgUrl = await exportResult(false);
      if (imgUrl) {
        setQuoteImage(imgUrl);
        setIsQuoteOpen(true);
      }
    } catch (err) {
      console.error(err);
      alert("Error al generar la imagen para la cotización.");
    }
  };


  const vehicleAspect = vehicleSize.width / vehicleSize.height;
  const carHeight = 800 / vehicleAspect;
  const carTop = (400 - carHeight) / 2;
  const clipPathId = `active-panels-clip-${selectedPanel.map(p => p.replace(/\s+/g, '')).join('-')}`;

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--bg-darker)',
      color: 'var(--text-body)',
      fontFamily: 'var(--font-sans)',
      overflow: 'hidden',
      zIndex: 100
    }}>
      {/* Top Header Selector */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-glass)',
        backgroundColor: '#0c0c0e',
        padding: '12px 24px',
        height: '56px',
        zIndex: 20,
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="panel-logo" style={{ transform: 'none', margin: 0 }}>✦</div>
            <span className="panel-title" style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>MockupMKR</span>
          </div>
          <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-glass)' }}></div>
          
          <select
            value="car"
            onChange={(e) => {
              if (e.target.value === 'tshirt') {
                onBackToTshirt();
              }
            }}
            style={{
              background: '#18181c',
              border: '1px solid var(--border-glass)',
              borderRadius: '8px',
              color: '#ffffff',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="car">🚗 Rotulación de Auto 2D (WrapStudio)</option>
            <option value="tshirt">👕 Camiseta 3D (T-Shirt)</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={() => {
              fetchProjects();
              setShowProjects(!showProjects);
            }}
            className="btn-base"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: '600',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border-glass)',
              borderRadius: '8px',
              cursor: 'pointer',
              color: 'var(--text-body)',
              height: '34px',
              transition: 'all 0.2s'
            }}
          >
            <FolderOpen className="size-3.5" />
            Proyectos ({projects.length})
          </button>
          <button 
            onClick={saveProject}
            className="btn-base"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: '800',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border-glass)',
              borderRadius: '8px',
              cursor: 'pointer',
              color: 'var(--text-body)',
              height: '34px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              e.currentTarget.style.color = 'var(--text-body)';
            }}
          >
            <Save className="size-3.5" />
            Guardar
          </button>
          <button 
            onClick={handleQuoteClick}
            className="btn-base"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: '800',
              background: 'var(--accent)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              color: '#09090B',
              height: '34px',
              boxShadow: '0 0 12px var(--accent-glow-strong)',
              transition: 'all 0.2s'
            }}
          >
            <Send className="size-3.5" />
            Cotizar con este Diseño (Adjuntar PNG)
          </button>
          <button 
            onClick={() => exportResult(true)}
            className="btn-base"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: '600',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border-glass)',
              borderRadius: '8px',
              cursor: 'pointer',
              color: 'var(--text-body)',
              height: '34px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              e.currentTarget.style.color = 'var(--text-body)';
            }}
          >
            <Download className="size-3.5" />
            Descargar PNG
          </button>
        </div>
      </header>

      {/* Main workspace area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', width: '100%' }}>
        
        {/* Projects Drawer */}
        <AnimatePresence>
          {showProjects && (
            <motion.div 
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ type: 'tween', duration: 0.25 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                width: '280px',
                background: '#09090b',
                borderRight: '1px solid var(--border-glass)',
                zIndex: 40,
                padding: '24px',
                display: 'flex',
                boxShadow: '8px 0 32px rgba(0, 0, 0, 0.5)',
                flexDirection: 'column'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-white)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Proyectos Guardados</h4>
                <button
                  onClick={() => setShowProjects(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '16px', cursor: 'pointer', padding: '4px' }}
                >
                  ✕
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', flex: 1 }}>
                {projects.map(p => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setVehicleUrl(p.vehicle_image);
                      setLayers(p.layers);
                      setSelectedPanel(p.selectedPanel || ['Front Door', 'Rear Door']);
                      if (p.globalBodyMaskUrl) setGlobalBodyMaskUrl(p.globalBodyMaskUrl);
                      if (p.layers.length > 0) setActiveLayerId(p.layers[0].id);
                      setShowProjects(false);
                    }}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-glass)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-glass)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                    }}
                  >
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <p style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-white)', margin: '0 0 4px 0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{p.name}</p>
                      <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: 0 }}>{new Date(p.created_at).toLocaleDateString()}</p>
                    </div>
                    <button 
                      onClick={(e) => deleteProject(p.id, e)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
                {projects.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '32px 0', fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    No hay proyectos guardados
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Left Sidebar control panel */}
        <aside className="control-panel" style={{ width: '320px', borderRight: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', height: '100%', flexShrink: 0, zIndex: 10 }}>
          {/* Hidden uploader inputs */}
          <input 
            type="file" 
            ref={fileInputRef} 
            accept="image/png, image/jpeg"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <input 
            type="file" 
            ref={vehicleInputRef} 
            accept="image/png, image/jpeg"
            onChange={handleVehicleUpload}
            style={{ display: 'none' }}
          />

          <div className="panel-content" style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Auto Personalizado (Custom Vehicle Upload) */}
            <div className="control-section">
              <p className="section-label">Auto Personalizado</p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                <div style={{ width: '48px', height: '32px', borderRadius: '4px', background: '#09090b', overflow: 'hidden', flexShrink: 0 }}>
                  <img src={vehicleUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Vehículo" referrerPolicy="no-referrer" />
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <p style={{ fontSize: '11px', color: 'var(--text-white)', fontWeight: 'bold', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {isDefaultVehicle ? 'Plantilla Sedan 2D' : 'Imagen subida'}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <button 
                      onClick={() => vehicleInputRef.current?.click()}
                      style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Upload className="size-3" /> Subir foto de auto
                    </button>
                    {!isDefaultVehicle && (
                      <button 
                        onClick={() => {
                          setVehicleUrl("https://lh3.googleusercontent.com/aida-public/AB6AXuBMTNrnvHRPw1Lv_R4s9Ba1R2xeofOUWtsGf9NtDhdsm5454Yjgdb0pW_v4bwikhcPNSGeJJ7dTlQ_maLNUbVvBLlO8n_hBJD5sLuMnAqCS4BSm6pxylcitbUOvDdP0GxeYxDMRMTiUcnZzoRQCROAUCaPRXH62QVuuTgg1dFVABZGytgIrFxPeMy60hQe2abNMW1mSiZgxCK4MMrEzrZQJ6UDavrFT5jkqBk5qrkDWfgIBuU5hB8CZIBI2-dCxN3toYhjt-jzGihc");
                          setIsDefaultVehicle(true);
                          setGlobalBodyMaskUrl(undefined);
                        }}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '11px', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                      >
                        Restaurar
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontStyle: 'italic', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertCircle className="size-3" /> Sugerencia: Subir fotos en planos laterales, frontales o traseros limpios.
              </p>
            </div>

            {/* Diseño del Wrap (Wrap Uploader) */}
            <div className="control-section" style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
              <p className="section-label">Diseño del Wrap</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-base"
                style={{
                  width: '100%',
                  padding: '10px 4px',
                  fontSize: '11px',
                  background: 'var(--accent)',
                  color: '#09090B',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px var(--accent-glow)'
                }}
              >
                <Upload className="size-3.5" /> Subir Diseño (Wrap)
              </button>
            </div>

            {/* Selected Layer Properties */}
            {activeLayer && (
              <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h5 style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                    Propiedades de Capa
                  </h5>
                  <button
                    onClick={() => {
                      if (activeLayerId) deleteLayer(activeLayerId);
                    }}
                    style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: '4px' }}
                  >
                    <Trash2 className="size-3" /> Eliminar
                  </button>
                </div>

                {/* Centering & Background removal */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    onClick={handleRemoveBackground}
                    disabled={isProcessingBg}
                    className="btn-base"
                    style={{
                      width: '100%',
                      height: '32px',
                      fontSize: '11px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '6px',
                      cursor: isProcessingBg ? 'not-allowed' : 'pointer',
                      color: 'var(--text-body)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    {isProcessingBg ? <RefreshCw className="size-3 animate-spin" /> : '✂'}
                    Remover Fondo (Auto-Trim)
                  </button>
                  <button
                    onClick={() => {
                      if (!activeLayer) return;
                      const renderedUnscaledWidth = (activeLayer.width / vehicleSize.width) * 800;
                      const targetRenderedWidth = 240;
                      const initialScale = Math.min(1.0, targetRenderedWidth / renderedUnscaledWidth);
                      updateLayer(activeLayer.id, {
                        x: 0,
                        y: 0,
                        scaleX: initialScale,
                        scaleY: initialScale,
                        rotate: 0
                      });
                    }}
                    className="btn-base"
                    style={{
                      width: '100%',
                      height: '32px',
                      fontSize: '11px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: 'var(--text-body)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    🎯 Centrar en Lienzo
                  </button>
                </div>

                {/* Opacity */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <span>Opacidad</span>
                    <span style={{ color: 'var(--text-white)', fontWeight: 'bold' }}>{Math.round(activeLayer.opacity)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={activeLayer.opacity}
                    onChange={(e) => updateLayer(activeLayer.id, { opacity: parseFloat(e.target.value) }, true)}
                    onMouseUp={() => saveToHistory(layers)}
                    style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
                  />
                </div>

                {/* Position */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Posición X</span>
                    <input
                      type="number"
                      value={Math.round(activeLayer.x)}
                      onChange={(e) => updateLayer(activeLayer.id, { x: parseFloat(e.target.value) || 0 })}
                      style={{ background: '#121216', border: '1px solid var(--border-glass)', borderRadius: '6px', color: '#fff', fontSize: '12px', padding: '6px 10px', width: '100%' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Posición Y</span>
                    <input
                      type="number"
                      value={Math.round(activeLayer.y)}
                      onChange={(e) => updateLayer(activeLayer.id, { y: parseFloat(e.target.value) || 0 })}
                      style={{ background: '#121216', border: '1px solid var(--border-glass)', borderRadius: '6px', color: '#fff', fontSize: '12px', padding: '6px 10px', width: '100%' }}
                    />
                  </div>
                </div>

                {/* Scale */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Escala X</span>
                    <input
                      type="number"
                      step="0.01"
                      value={Math.round(activeLayer.scaleX * 100) / 100}
                      onChange={(e) => updateLayer(activeLayer.id, { scaleX: parseFloat(e.target.value) || 0.01 })}
                      style={{ background: '#121216', border: '1px solid var(--border-glass)', borderRadius: '6px', color: '#fff', fontSize: '12px', padding: '6px 10px', width: '100%' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Escala Y</span>
                    <input
                      type="number"
                      step="0.01"
                      value={Math.round(activeLayer.scaleY * 100) / 100}
                      onChange={(e) => updateLayer(activeLayer.id, { scaleY: parseFloat(e.target.value) || 0.01 })}
                      style={{ background: '#121216', border: '1px solid var(--border-glass)', borderRadius: '6px', color: '#fff', fontSize: '12px', padding: '6px 10px', width: '100%' }}
                    />
                  </div>
                </div>

                {/* Rotation */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <span>Rotación</span>
                    <span style={{ color: 'var(--text-white)', fontWeight: 'bold' }}>{Math.round(activeLayer.rotate)}°</span>
                  </div>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={activeLayer.rotate}
                    onChange={(e) => updateLayer(activeLayer.id, { rotate: parseFloat(e.target.value) }, true)}
                    onMouseUp={() => saveToHistory(layers)}
                    style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
                  />
                </div>
              </div>
            )}

          </div>

          {/* Sidebar Footer with Export */}
          <div style={{ borderTop: '1px solid var(--border-glass)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
            <button
              onClick={handleQuoteClick}
              className="btn-base"
              style={{
                width: '100%',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'var(--accent)',
                color: '#09090B',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: '0 4px 14px var(--accent-glow-strong)',
                transition: 'all 0.2s'
              }}
            >
              <Send className="size-4" /> Cotizar con este Diseño (Adjuntar PNG)
            </button>
            <button
              onClick={() => exportResult(true)}
              className="btn-base"
              style={{
                width: '100%',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-body)',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                e.currentTarget.style.color = 'var(--text-body)';
              }}
            >
              <Download className="size-4" /> Descargar PNG
            </button>
          </div>
        </aside>

        {/* Center Viewport Canvas */}
        <main style={{ flex: 1, backgroundColor: 'var(--bg-darker)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          
          {/* Floating Tools Toolbar */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 30,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--surface-glass)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--border-glass)',
            borderRadius: '12px',
            padding: '6px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
          }}>
            <button
              onClick={() => setActiveTool('select')}
              style={{
                background: activeTool === 'select' ? 'var(--accent)' : 'transparent',
                color: activeTool === 'select' ? '#09090B' : 'var(--text-body)',
                border: 'none',
                borderRadius: '8px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              title="Seleccionar y transformar capa (V)"
            >
              <MousePointer2 className="size-4.5" />
            </button>
            <button
              onClick={() => setActiveTool('pan')}
              style={{
                background: activeTool === 'pan' ? 'var(--accent)' : 'transparent',
                color: activeTool === 'pan' ? '#09090B' : 'var(--text-body)',
                border: 'none',
                borderRadius: '8px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              title="Mover lienzo (H)"
            >
              <Hand className="size-4.5" />
            </button>
            <button
              onClick={() => setActiveTool('zoom')}
              style={{
                background: activeTool === 'zoom' ? 'var(--accent)' : 'transparent',
                color: activeTool === 'zoom' ? '#09090B' : 'var(--text-body)',
                border: 'none',
                borderRadius: '8px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              title="Lupa zoom (Z)"
            >
              <ZoomIn className="size-4.5" />
            </button>
            <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-glass)', margin: '0 4px' }}></div>
            
            <button
              onClick={() => setShowContours(!showContours)}
              disabled={!isDefaultVehicle}
              style={{
                background: showContours ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                color: showContours ? 'var(--accent)' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '8px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isDefaultVehicle ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                opacity: isDefaultVehicle ? 1 : 0.3
              }}
              title="Mostrar líneas vectoriales"
            >
              <Grid3X3 className="size-4.5" />
            </button>

            <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-glass)', margin: '0 4px' }}></div>
            
            <button 
              onClick={undo}
              disabled={historyIndex <= 0}
              style={{
                background: 'transparent',
                color: historyIndex <= 0 ? 'var(--text-muted)' : 'var(--text-body)',
                border: 'none',
                borderRadius: '8px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: historyIndex <= 0 ? 'not-allowed' : 'pointer',
                opacity: historyIndex <= 0 ? 0.3 : 1
              }}
              title="Deshacer (Ctrl+Z)"
            >
              <Undo2 className="size-4.5" />
            </button>
            <button 
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              style={{
                background: 'transparent',
                color: historyIndex >= history.length - 1 ? 'var(--text-muted)' : 'var(--text-body)',
                border: 'none',
                borderRadius: '8px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: historyIndex >= history.length - 1 ? 'not-allowed' : 'pointer',
                opacity: historyIndex >= history.length - 1 ? 0.3 : 1
              }}
              title="Rehacer (Ctrl+Y)"
            >
              <Redo2 className="size-4.5" />
            </button>
          </div>

          {/* Floating Brush/Mask Controls */}
          {((activeTool === 'brush' && activeLayerId) || activeTool === 'bodyMask') && (
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              zIndex: 30,
              width: '220px',
              background: 'var(--surface-glass)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid var(--border-glass)',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
            }}>
              <h5 style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px 0' }}>
                {activeTool === 'bodyMask' ? 'Máscara de Carrocería' : 'Ajustes del Pincel'}
              </h5>
              
              <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
                <button
                  onClick={() => setBrushMode('erase')}
                  className={`chip-btn ${brushMode === 'erase' ? 'chip-btn--active' : ''}`}
                  style={{ flex: 1, padding: '6px 0', fontSize: '10px', textAlign: 'center', borderColor: brushMode === 'erase' ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-glass)', color: brushMode === 'erase' ? '#ef4444' : 'var(--text-muted)' }}
                >
                  Borrar (Ocultar)
                </button>
                <button
                  onClick={() => setBrushMode('restore')}
                  className={`chip-btn ${brushMode === 'restore' ? 'chip-btn--active' : ''}`}
                  style={{ flex: 1, padding: '6px 0', fontSize: '10px', textAlign: 'center', borderColor: brushMode === 'restore' ? 'rgba(34, 197, 94, 0.4)' : 'var(--border-glass)', color: brushMode === 'restore' ? '#22c55e' : 'var(--text-muted)' }}
                >
                  Pintar (Mostrar)
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <span>Tamaño</span>
                  <span style={{ color: 'var(--text-white)', fontWeight: 'bold' }}>{brushSize}px</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="150"
                  value={brushSize}
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
                />
              </div>
            </div>
          )}

          {/* Canvas Wrapper */}
          <div 
            ref={viewportRef}
            style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}
          >
            <div 
              style={{ 
                position: 'absolute',
                inset: 0,
                opacity: 0.05,
                pointerEvents: 'none',
                backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
                backgroundSize: '40px 40px' 
              }}
            ></div>

            {/* SVG clip-paths for panel selection */}
            <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }}>
              <defs>
                <clipPath id={clipPathId}>
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

            {/* Canvas zoom and pan container */}
            <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '800px', height: '400px', position: 'relative' }}>
              <motion.div 
                drag={activeTool === 'pan'}
                dragMomentum={false}
                whileDrag={activeTool === 'pan' ? { cursor: 'grabbing' } : undefined}
                style={{ 
                  position: 'absolute', 
                  inset: 0, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  cursor: activeTool === 'pan' ? 'grab' : activeTool === 'zoom' ? 'zoom-in' : 'default'
                }}
              >
              {/* Base Vehicle Layer */}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <img 
                  draggable={false}
                  src={vehicleUrl} 
                  alt="Vehicle Template"
                  style={{
                    width: '100%',
                    height: 'auto',
                    transition: 'all 0.7s',
                    imageRendering: 'high-quality' as any,
                    filter: isTracing 
                      ? 'grayscale(1) contrast(200%) blur(1px)' 
                      : `${isDefaultVehicle ? 'brightness(1.1) contrast(1.15)' : ''} ${desaturateVehicle ? 'grayscale(1) brightness(1.12) contrast(1.08)' : ''}`.trim() || 'none'
                  }}
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Vector Lines Simulation */}
              <AnimatePresence>
                {showContours && isDefaultVehicle && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    exit={{ opacity: 0 }}
                    style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', mixBlendMode: 'screen' }}
                  >
                    <img 
                      draggable={false}
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBt6QOLKQlyHHtFmo9MYTBlUutvMGoxxWsPja_pmUMQjulR5ud8QJ87D619oWEHTQzxhMU01SE63CDFZnsjX7qqXT5bvBHU7dhtebVWlKKhDdNAaX5wWg7r0HDX03UYLdb9eQTXLEid8CmMxl55Fgz1ZTCPrtYJygd5BNUjpYmi_jG5E_f26qimOJ9IQjRG46x7hE7lVkpr504mfeyEOOO0OXiVMyT-dAvpzCbd7omojH4k9tmVL3pQUsa_rHoyhMulE5aC6H_YJHg" 
                      alt="Contours"
                      style={{ width: '100%', height: 'auto', filter: 'grayscale(1) invert(1)' }}
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Designs Wrapper (Masked by Global Body Mask) */}
              <div style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                ...(globalBodyMaskUrl ? {
                  maskImage: `url(${globalBodyMaskUrl})`,
                  WebkitMaskImage: `url(${globalBodyMaskUrl})`,
                  maskSize: `800px ${carHeight}px`,
                  WebkitMaskSize: `800px ${carHeight}px`,
                  maskPosition: `0px ${carTop}px`,
                  WebkitMaskPosition: `0px ${carTop}px`,
                  maskRepeat: 'no-repeat',
                  WebkitMaskRepeat: 'no-repeat'
                } : {})
              }}>
                {layers.map(layer => (
                  <div
                    key={layer.id}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      pointerEvents: 'none',
                      clipPath: (isDefaultVehicle && selectedPanel.length > 0) ? `url(#${clipPathId})` : 'none',
                      WebkitClipPath: (isDefaultVehicle && selectedPanel.length > 0) ? `url(#${clipPathId})` : 'none',
                      zIndex: activeLayerId === layer.id ? 20 : 10,
                      ...(layer.maskUrl ? {
                        maskImage: `url(${layer.maskUrl})`,
                        WebkitMaskImage: `url(${layer.maskUrl})`,
                        maskSize: '100% 100%',
                        WebkitMaskSize: '100% 100%',
                        maskRepeat: 'no-repeat',
                        WebkitMaskRepeat: 'no-repeat'
                      } : {})
                    }}
                  >
                    <motion.div 
                      onPointerDown={(e) => handleLayerDragStart(e, layer)}
                      initial={{ opacity: 0 }}
                      animate={{ 
                        opacity: layer.opacity / 100,
                        x: layer.x,
                        y: layer.y,
                        scaleX: layer.scaleX,
                        scaleY: layer.scaleY,
                        rotate: layer.rotate
                      }}
                      transition={{
                        x: { duration: 0 },
                        y: { duration: 0 },
                        scaleX: { duration: 0 },
                        scaleY: { duration: 0 },
                        rotate: { duration: 0 }
                      }}
                      style={{ 
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        width: `${(layer.width / vehicleSize.width) * 800}px`,
                        height: `${(layer.height / vehicleSize.width) * 800}px`,
                        marginLeft: `-${((layer.width / vehicleSize.width) * 800) / 2}px`,
                        marginTop: `-${((layer.height / vehicleSize.width) * 800) / 2}px`,
                        pointerEvents: activeTool === 'select' ? 'auto' : 'none',
                        cursor: 'move',
                        mixBlendMode: 'normal'
                      }}
                    >
                      <div 
                        style={{ 
                          width: '100%',
                          height: '100%',
                          backgroundImage: `url("${layer.url}")`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          border: activeLayerId === layer.id ? '2px solid var(--accent)' : '2px solid transparent',
                          position: 'relative'
                        }}
                      >
                        {/* Interactive Resize & Rotate handles */}
                        {activeLayerId === layer.id && activeTool === 'select' && (() => {
                          const layerW = (layer.width / vehicleSize.width) * 800 * layer.scaleX;
                          const layerH = (layer.height / vehicleSize.width) * 800 * layer.scaleY;
                          
                          return (
                            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                              {/* Corners */}
                              <ResizeHandle position="top-left" scaleX={layer.scaleX} scaleY={layer.scaleY} onDrag={(delta) => {
                                const scaleChangeX = 1 - delta.x / layerW;
                                const scaleChangeY = 1 - delta.y / layerH;
                                const scaleChange = (scaleChangeX + scaleChangeY) / 2;
                                const newScaleX = Math.max(0.01, layer.scaleX * scaleChange);
                                const newScaleY = Math.max(0.01, layer.scaleY * scaleChange);
                                
                                const dW = (layer.width / vehicleSize.width) * 800 * (newScaleX - layer.scaleX);
                                const dH = (layer.height / vehicleSize.width) * 800 * (newScaleY - layer.scaleY);
                                
                                updateLayer(layer.id, {
                                  scaleX: newScaleX,
                                  scaleY: newScaleY,
                                  x: layer.x - dW / 2,
                                  y: layer.y - dH / 2
                                }, true);
                              }} onDragEnd={() => saveToHistory(layers)} />
                              
                              <ResizeHandle position="top-right" scaleX={layer.scaleX} scaleY={layer.scaleY} onDrag={(delta) => {
                                const scaleChangeX = 1 + delta.x / layerW;
                                const scaleChangeY = 1 - delta.y / layerH;
                                const scaleChange = (scaleChangeX + scaleChangeY) / 2;
                                const newScaleX = Math.max(0.01, layer.scaleX * scaleChange);
                                const newScaleY = Math.max(0.01, layer.scaleY * scaleChange);
                                
                                const dW = (layer.width / vehicleSize.width) * 800 * (newScaleX - layer.scaleX);
                                const dH = (layer.height / vehicleSize.width) * 800 * (newScaleY - layer.scaleY);
                                
                                updateLayer(layer.id, {
                                  scaleX: newScaleX,
                                  scaleY: newScaleY,
                                  x: layer.x + dW / 2,
                                  y: layer.y - dH / 2
                                }, true);
                              }} onDragEnd={() => saveToHistory(layers)} />
                              
                              <ResizeHandle position="bottom-left" scaleX={layer.scaleX} scaleY={layer.scaleY} onDrag={(delta) => {
                                const scaleChangeX = 1 - delta.x / layerW;
                                const scaleChangeY = 1 + delta.y / layerH;
                                const scaleChange = (scaleChangeX + scaleChangeY) / 2;
                                const newScaleX = Math.max(0.01, layer.scaleX * scaleChange);
                                const newScaleY = Math.max(0.01, layer.scaleY * scaleChange);
                                
                                const dW = (layer.width / vehicleSize.width) * 800 * (newScaleX - layer.scaleX);
                                const dH = (layer.height / vehicleSize.width) * 800 * (newScaleY - layer.scaleY);
                                
                                updateLayer(layer.id, {
                                  scaleX: newScaleX,
                                  scaleY: newScaleY,
                                  x: layer.x - dW / 2,
                                  y: layer.y + dH / 2
                                }, true);
                              }} onDragEnd={() => saveToHistory(layers)} />
                              
                              <ResizeHandle position="bottom-right" scaleX={layer.scaleX} scaleY={layer.scaleY} onDrag={(delta) => {
                                const scaleChangeX = 1 + delta.x / layerW;
                                const scaleChangeY = 1 + delta.y / layerH;
                                const scaleChange = (scaleChangeX + scaleChangeY) / 2;
                                const newScaleX = Math.max(0.01, layer.scaleX * scaleChange);
                                const newScaleY = Math.max(0.01, layer.scaleY * scaleChange);
                                
                                const dW = (layer.width / vehicleSize.width) * 800 * (newScaleX - layer.scaleX);
                                const dH = (layer.height / vehicleSize.width) * 800 * (newScaleY - layer.scaleY);
                                
                                updateLayer(layer.id, {
                                  scaleX: newScaleX,
                                  scaleY: newScaleY,
                                  x: layer.x + dW / 2,
                                  y: layer.y + dH / 2
                                }, true);
                              }} onDragEnd={() => saveToHistory(layers)} />

                              {/* Sides */}
                              <ResizeHandle position="top" scaleX={layer.scaleX} scaleY={layer.scaleY} onDrag={(delta) => {
                                const scaleChangeY = 1 - delta.y / layerH;
                                const newScaleY = Math.max(0.01, layer.scaleY * scaleChangeY);
                                const dH = (layer.height / vehicleSize.width) * 800 * (newScaleY - layer.scaleY);
                                
                                updateLayer(layer.id, {
                                  scaleY: newScaleY,
                                  y: layer.y - dH / 2
                                }, true);
                              }} onDragEnd={() => saveToHistory(layers)} />
                              
                              <ResizeHandle position="bottom" scaleX={layer.scaleX} scaleY={layer.scaleY} onDrag={(delta) => {
                                const scaleChangeY = 1 + delta.y / layerH;
                                const newScaleY = Math.max(0.01, layer.scaleY * scaleChangeY);
                                const dH = (layer.height / vehicleSize.width) * 800 * (newScaleY - layer.scaleY);
                                
                                updateLayer(layer.id, {
                                  scaleY: newScaleY,
                                  y: layer.y + dH / 2
                                }, true);
                              }} onDragEnd={() => saveToHistory(layers)} />
                              
                              <ResizeHandle position="left" scaleX={layer.scaleX} scaleY={layer.scaleY} onDrag={(delta) => {
                                const scaleChangeX = 1 - delta.x / layerW;
                                const newScaleX = Math.max(0.01, layer.scaleX * scaleChangeX);
                                const dW = (layer.width / vehicleSize.width) * 800 * (newScaleX - layer.scaleX);
                                
                                updateLayer(layer.id, {
                                  scaleX: newScaleX,
                                  x: layer.x - dW / 2
                                }, true);
                              }} onDragEnd={() => saveToHistory(layers)} />
                              
                              <ResizeHandle position="right" scaleX={layer.scaleX} scaleY={layer.scaleY} onDrag={(delta) => {
                                const scaleChangeX = 1 + delta.x / layerW;
                                const newScaleX = Math.max(0.01, layer.scaleX * scaleChangeX);
                                const dW = (layer.width / vehicleSize.width) * 800 * (newScaleX - layer.scaleX);
                                
                                updateLayer(layer.id, {
                                  scaleX: newScaleX,
                                  x: layer.x + dW / 2
                                }, true);
                              }} onDragEnd={() => saveToHistory(layers)} />

                              {/* Rotate Handles (Photoshop style) */}
                              <RotateHandle 
                                position="top-left" 
                                currentRotate={layer.rotate}
                                scaleX={layer.scaleX} 
                                scaleY={layer.scaleY} 
                                onRotate={(newRotate) => {
                                  updateLayer(layer.id, { rotate: newRotate }, true);
                                }} 
                                onRotateEnd={() => saveToHistory(layers)} 
                              />
                              <RotateHandle 
                                position="top-right" 
                                currentRotate={layer.rotate}
                                scaleX={layer.scaleX} 
                                scaleY={layer.scaleY} 
                                onRotate={(newRotate) => {
                                  updateLayer(layer.id, { rotate: newRotate }, true);
                                }} 
                                onRotateEnd={() => saveToHistory(layers)} 
                              />
                              <RotateHandle 
                                position="bottom-left" 
                                currentRotate={layer.rotate}
                                scaleX={layer.scaleX} 
                                scaleY={layer.scaleY} 
                                onRotate={(newRotate) => {
                                  updateLayer(layer.id, { rotate: newRotate }, true);
                                }} 
                                onRotateEnd={() => saveToHistory(layers)} 
                              />
                              <RotateHandle 
                                position="bottom-right" 
                                currentRotate={layer.rotate}
                                scaleX={layer.scaleX} 
                                scaleY={layer.scaleY} 
                                onRotate={(newRotate) => {
                                  updateLayer(layer.id, { rotate: newRotate }, true);
                                }} 
                                onRotateEnd={() => saveToHistory(layers)} 
                              />
                            </div>
                          );
                         })()}
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>

              {/* Shading & Crevices Overlay (Multiply) */}
              {shadowOpacity > 0 && globalBodyMaskUrl && (
                <div 
                  style={{ 
                    position: 'absolute', 
                    inset: 0, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    pointerEvents: 'none', 
                    mixBlendMode: 'multiply', 
                    opacity: shadowOpacity / 100,
                    ...(globalBodyMaskUrl ? {
                      maskImage: `url(${globalBodyMaskUrl})`,
                      WebkitMaskImage: `url(${globalBodyMaskUrl})`,
                      maskSize: `800px ${carHeight}px`,
                      WebkitMaskSize: `800px ${carHeight}px`,
                      maskPosition: `0px ${carTop}px`,
                      WebkitMaskPosition: `0px ${carTop}px`,
                      maskRepeat: 'no-repeat',
                      WebkitMaskRepeat: 'no-repeat'
                    } : {})
                  }}
                >
                  <img 
                    draggable={false}
                    src={vehicleUrl} 
                    alt="Vehicle Shadows"
                    style={{ width: '100%', height: 'auto', imageRendering: 'high-quality' as any, filter: `grayscale(1) contrast(${shadowContrast}) brightness(${shadowBrightness})` }}
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {/* Glossy Reflections Overlay (Screen) */}
              {reflectionOpacity > 0 && globalBodyMaskUrl && (
                <div 
                  style={{ 
                    position: 'absolute', 
                    inset: 0, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    pointerEvents: 'none', 
                    mixBlendMode: 'screen', 
                    opacity: reflectionOpacity / 100,
                    ...(globalBodyMaskUrl ? {
                      maskImage: `url(${globalBodyMaskUrl})`,
                      WebkitMaskImage: `url(${globalBodyMaskUrl})`,
                      maskSize: `800px ${carHeight}px`,
                      WebkitMaskSize: `800px ${carHeight}px`,
                      maskPosition: `0px ${carTop}px`,
                      WebkitMaskPosition: `0px ${carTop}px`,
                      maskRepeat: 'no-repeat',
                      WebkitMaskRepeat: 'no-repeat'
                    } : {})
                  }}
                >
                  <img 
                    draggable={false}
                    src={vehicleUrl} 
                    alt="Vehicle Reflections"
                    style={{ width: '100%', height: 'auto', imageRendering: 'high-quality' as any, filter: `grayscale(1) contrast(${reflectionContrast}) brightness(${reflectionBrightness})` }}
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {/* Brush canvas (bodyMask or layer-mask editing) */}
              {((activeTool === 'brush' && activeLayerId) || activeTool === 'bodyMask') && (
                <canvas
                  ref={brushCanvasRef}
                  style={{ position: 'absolute', inset: 0, zIndex: 30, cursor: 'crosshair', pointerEvents: 'auto', opacity: 0.5 }}
                  width={800}
                  height={400}
                  onPointerDown={handleBrushDown}
                  onPointerMove={handleBrushMove}
                  onPointerUp={handleBrushUp}
                />
              )}

              {/* Scanning effect */}
              <AnimatePresence>
                {isTracing && (
                  <motion.div 
                    initial={{ top: '-100%' }}
                    animate={{ top: '100%' }}
                    transition={{ duration: 1.5, ease: "linear" }}
                    style={{ position: 'absolute', left: 0, right: 0, height: '4px', background: 'var(--accent)', boxShadow: '0 0 15px var(--accent-glow-strong)', zIndex: 50, pointerEvents: 'none' }}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>

          {/* Floating Zoom Controls */}
          <div className="canvas-zoom-controls" style={{ bottom: '20px' }}>
            <button
              onClick={() => setZoom(Math.max(10, zoom - 10))}
              title="Reducir Zoom"
            >
              <ZoomOut className="size-3.5" />
            </button>
            <span style={{ minWidth: '64px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-white)' }}>
              {zoom}%
            </span>
            <button
              onClick={() => setZoom(Math.min(400, zoom + 10))}
              title="Aumentar Zoom"
            >
              <ZoomIn className="size-3.5" />
            </button>
          </div>
        </main>
      </div>

      {/* AI Generate Prompt Modal */}
      <AnimatePresence>
        {showAiModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                background: '#09090b',
                border: '1px solid var(--border-glass)',
                borderRadius: '12px',
                padding: '24px',
                maxWidth: '440px',
                width: '100%',
                boxShadow: '0 12px 48px rgba(0,0,0,0.6)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <Sparkles className="size-4 text-purple-400" />
                  Generar Calcomanía con IA
                </h3>
                <button
                  onClick={() => setShowAiModal(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '16px', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                  Describe tu diseño o patrón
                </span>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ej: Logo circular de cabeza de lobo enojado, diseño plano moderno, fondo negro transparente..."
                  style={{
                    width: '100%',
                    height: '96px',
                    background: '#121216',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '8px',
                    padding: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  onClick={() => setShowAiModal(false)}
                  className="btn-base"
                  style={{
                    padding: '8px 16px',
                    fontSize: '12px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: 'var(--text-body)',
                    width: 'auto',
                    height: '34px'
                  }}
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
                      const generated = response.generatedImages;
                      if (!generated || generated.length === 0) {
                        throw new Error("No images generated");
                      }
                      const firstImg = generated[0];
                      if (!firstImg || !firstImg.image || !firstImg.image.imageBytes) {
                        throw new Error("Invalid image format from Gemini AI");
                      }
                      const base64 = firstImg.image.imageBytes;
                      const url = `data:image/png;base64,${base64}`;
                      
                      // Calculate initial scale to fit nicely on the canvas (e.g. max 240px wide)
                      const renderedUnscaledWidth = (1024 / vehicleSize.width) * 800;
                      const targetRenderedWidth = 240;
                      const initialScale = Math.min(1.0, targetRenderedWidth / renderedUnscaledWidth);

                      const newLayer: Layer = {
                        id: Math.random().toString(36).substr(2, 9),
                        url,
                        name: `IA: ${aiPrompt.substring(0, 15)}...`,
                        opacity: 90,
                        x: 0,
                        y: 0,
                        scaleX: initialScale,
                        scaleY: initialScale,
                        rotate: 0,
                        width: 1024,
                        height: 1024,
                        aspect: 1.0
                      };
                      updateLayersWithHistory(prev => [...prev, newLayer]);
                      setActiveLayerId(newLayer.id);
                      setActiveTool('select');
                      setShowAiModal(false);
                      setAiPrompt('');
                    } catch (err) {
                      console.error("AI image generation failed", err);
                      alert("Error al generar la imagen. Comprueba tu clave de API.");
                    } finally {
                      setIsGeneratingAi(false);
                    }
                  }}
                  disabled={isGeneratingAi}
                  className="btn-base btn-filled"
                  style={{
                    padding: '8px 16px',
                    fontSize: '12px',
                    background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    width: 'auto',
                    height: '34px',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
                  }}
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

      {/* AI Render Result Comparison Modal */}

      <QuoteModal 
        isOpen={isQuoteOpen} 
        onClose={() => setIsQuoteOpen(false)} 
        mockupImage={quoteImage} 
        defaultService="vinil" 
      />

    </div>
  );
}

function ResizeHandle({ position, onDrag, onDragEnd, scaleX = 1, scaleY = 1 }: { position: string, onDrag: (delta: { x: number, y: number }) => void, onDragEnd?: () => void, scaleX?: number, scaleY?: number }) {
  const isDraggingRef = useRef(false);
  const lastPointerPosRef = useRef({ x: 0, y: 0 });

  const getCursor = () => {
    if (position === 'top' || position === 'bottom') return 'ns-resize';
    if (position === 'left' || position === 'right') return 'ew-resize';
    if (position === 'top-left' || position === 'bottom-right') return 'nwse-resize';
    return 'nesw-resize';
  };

  const getPositionStyles = () => {
    switch (position) {
      case 'top': return { top: '0px', left: '50%' };
      case 'bottom': return { bottom: '0px', left: '50%' };
      case 'left': return { top: '50%', left: '0px' };
      case 'right': return { top: '50%', right: '0px' };
      case 'top-left': return { top: '0px', left: '0px' };
      case 'top-right': return { top: '0px', right: '0px' };
      case 'bottom-left': return { bottom: '0px', left: '0px' };
      case 'bottom-right': return { bottom: '0px', right: '0px' };
      default: return {};
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    isDraggingRef.current = true;
    lastPointerPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    e.stopPropagation();
    e.preventDefault();
    
    const deltaX = e.clientX - lastPointerPosRef.current.x;
    const deltaY = e.clientY - lastPointerPosRef.current.y;
    
    lastPointerPosRef.current = { x: e.clientX, y: e.clientY };
    
    // Pass raw screen delta directly to match screen math
    onDrag({
      x: deltaX,
      y: deltaY
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    e.stopPropagation();
    e.preventDefault();
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_err) {}
    isDraggingRef.current = false;
    if (onDragEnd) onDragEnd();
  };

  return (
    <div
      style={{
        position: 'absolute',
        width: '0px',
        height: '0px',
        zIndex: 20,
        transform: `scale(${1 / scaleX}, ${1 / scaleY})`,
        transformOrigin: 'center',
        ...getPositionStyles()
      }}
    >
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ 
          position: 'absolute',
          width: '12px',
          height: '12px',
          left: '-6px',
          top: '-6px',
          backgroundColor: '#FFFFFF',
          border: '2px solid var(--accent)',
          borderRadius: '50%',
          pointerEvents: 'auto',
          cursor: getCursor()
        }}
      />
    </div>
  );
}

function RotateHandle({ 
  position, 
  currentRotate, 
  onRotate, 
  onRotateEnd, 
  scaleX = 1, 
  scaleY = 1 
}: { 
  position: string; 
  currentRotate: number; 
  onRotate: (newRotate: number) => void; 
  onRotateEnd?: () => void; 
  scaleX?: number; 
  scaleY?: number; 
}) {
  const isDraggingRef = useRef(false);
  const startAngleRef = useRef(0);
  const initialRotateRef = useRef(0);
  const centerXRef = useRef(0);
  const centerYRef = useRef(0);

  const getPositionStyles = () => {
    // Offset further outward from the corner (e.g., -18px)
    const offset = '-18px';
    switch (position) {
      case 'top-left': return { top: offset, left: offset };
      case 'top-right': return { top: offset, right: offset };
      case 'bottom-left': return { bottom: offset, left: offset };
      case 'bottom-right': return { bottom: offset, right: offset };
      default: return {};
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    
    // Find layer center relative to the screen
    const rect = e.currentTarget.parentElement?.parentElement?.getBoundingClientRect();
    if (!rect) return;
    
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    centerXRef.current = centerX;
    centerYRef.current = centerY;
    isDraggingRef.current = true;
    
    // Calculate start angle of pointer relative to center
    startAngleRef.current = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    initialRotateRef.current = currentRotate;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    e.stopPropagation();
    e.preventDefault();
    
    const currentAngle = Math.atan2(e.clientY - centerYRef.current, e.clientX - centerXRef.current) * (180 / Math.PI);
    const angleDelta = currentAngle - startAngleRef.current;
    
    const newRotate = Math.round(initialRotateRef.current + angleDelta);
    onRotate(newRotate);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    e.stopPropagation();
    e.preventDefault();
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_err) {}
    isDraggingRef.current = false;
    if (onRotateEnd) onRotateEnd();
  };

  const rotateCursor = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23ccff00' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><path d='M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67'/></svg>") 12 12, auto`;

  return (
    <div
      style={{
        position: 'absolute',
        width: '0px',
        height: '0px',
        zIndex: 25,
        transform: `scale(${1 / scaleX}, ${1 / scaleY})`,
        transformOrigin: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...getPositionStyles()
      }}
    >
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ 
          position: 'absolute',
          width: '16px',
          height: '16px',
          left: '-8px',
          top: '-8px',
          backgroundColor: 'transparent',
          border: '1.5px solid transparent',
          borderRadius: '50%',
          pointerEvents: 'auto',
          cursor: rotateCursor,
          transition: 'all 0.15s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--accent)';
          e.currentTarget.style.borderColor = '#FFFFFF';
          e.currentTarget.style.transform = 'scale(1.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.borderColor = 'transparent';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      />
    </div>
  );
}
