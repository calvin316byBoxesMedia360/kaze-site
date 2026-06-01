import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import React from "react";

interface Props {
  layout: "horizontal" | "vertical";
}

export const TechBehind: React.FC<Props> = ({ layout }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animaciones para las cards de tecnologías (staggered entrance)
  const card1Entrance = spring({
    frame: frame - 15,
    fps,
    config: { damping: 12, stiffness: 90 },
  });

  const card2Entrance = spring({
    frame: frame - 30,
    fps,
    config: { damping: 12, stiffness: 90 },
  });

  const card3Entrance = spring({
    frame: frame - 45,
    fps,
    config: { damping: 12, stiffness: 90 },
  });

  // Animación del código desplazándose verticalmente (scrolling code effect)
  const codeScrollY = interpolate(frame, [0, 150], [0, -120], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const isVertical = layout === "vertical";

  // Fragmento de código simulado para el background
  const codeSnippet = `// Kaze Studio - Custom Mockup Customizer
import React, { useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";

export const Editor = () => {
  const [color, setColor] = useState("#c8333f");
  const [logo, setLogo] = useState(null);
  const canvasRef = useRef(null);

  const handleApplyDesign = (design) => {
    setLogo(design);
    console.log("Design applied to mockup front");
  };

  return (
    <div className="kaze-studio-editor">
      <Toolbar onApply={handleApplyDesign} />
      <PreviewCanvas color={color} logo={logo} />
      <ColorPicker onChange={setColor} active={color} />
      <QuoteSubmitForm item={canvasRef.current} />
    </div>
  );
};`;

  return (
    <div className="w-full h-full bg-slate-950 text-white font-sans flex flex-col justify-between p-12 relative overflow-hidden">
      
      {/* Código flotante y difuminado en el fondo */}
      <div 
        className="absolute right-0 top-0 w-1/2 h-full opacity-10 font-mono text-[9px] text-cyan-400 select-none pointer-events-none p-12"
        style={{
          transform: `translateY(${codeScrollY}px)`,
          maskImage: "linear-gradient(to bottom, transparent, white 20%, white 80%, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent, white 20%, white 80%, transparent)",
        }}
      >
        <pre>{codeSnippet}</pre>
        <pre className="mt-8">{codeSnippet}</pre>
      </div>

      {/* Gradiente sutil */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950 to-transparent pointer-events-none" />
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Header */}
      <div className="z-10">
        <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-semibold tracking-widest uppercase rounded-full border border-cyan-500/30">
          Tecnología y Desarrollo
        </span>
        <h2 className="text-4xl font-black tracking-tight mt-3 bg-gradient-to-r from-white via-cyan-100 to-teal-200 bg-clip-text text-transparent uppercase">
          Arquitectura Web Moderna
        </h2>
        <p className="text-xs text-slate-400 mt-2 max-w-lg">
          Un ecosistema robusto e integrado para asegurar velocidad, escalabilidad y un despliegue de alto rendimiento en producción.
        </p>
      </div>

      {/* Grid de Tecnologías */}
      <div className={`flex-1 flex ${isVertical ? 'flex-col' : 'flow-row'} justify-center items-center gap-6 z-10 my-4`}>
        
        {/* Card 1: Frontend (React & Next.js) */}
        <div 
          className="w-72 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md shadow-[0_20px_40px_rgba(0,0,0,0.3)] flex flex-col gap-3"
          style={{
            transform: `scale(${card1Entrance})`,
            opacity: interpolate(frame, [15, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-extrabold text-lg">
            R
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Frontend Interactivo</h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Desarrollado con <strong>React</strong> y <strong>TypeScript</strong> para una interfaz interactiva fluida y libre de lags en móviles.
            </p>
          </div>
        </div>

        {/* Card 2: Backend (Node & Express) */}
        <div 
          className="w-72 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md shadow-[0_20px_40px_rgba(0,0,0,0.3)] flex flex-col gap-3"
          style={{
            transform: `scale(${card2Entrance})`,
            opacity: interpolate(frame, [30, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 font-extrabold text-lg">
            Ex
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Servidor y Cotizador</h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Backend en <strong>Express.js</strong> conectado a la API de **Resend** para procesar cotizaciones en milisegundos de forma segura.
            </p>
          </div>
        </div>

        {/* Card 3: Cloud & Git (Railway & GitHub) */}
        <div 
          className="w-72 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md shadow-[0_20px_40px_rgba(0,0,0,0.3)] flex flex-col gap-3"
          style={{
            transform: `scale(${card3Entrance})`,
            opacity: interpolate(frame, [45, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-extrabold text-lg">
            Cl
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Infraestructura Cloud</h3>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Despliegue automatizado en <strong>Railway</strong> mediante Webhooks de **GitHub** para actualizaciones instantáneas de producción.
            </p>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="w-full bg-slate-900/40 border border-slate-800/60 p-4 rounded-xl backdrop-blur-sm flex justify-between items-center text-xs text-slate-400 z-10">
        <div>Optimización SEO y W3C Cumplida</div>
        <div className="font-mono text-cyan-300">
          Architecture: Clean Monorepo
        </div>
      </div>
    </div>
  );
};
