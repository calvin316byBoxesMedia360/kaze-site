import { useCurrentFrame, useVideoConfig, staticFile, interpolate, spring } from "remotion";
import React from "react";

interface Props {
  layout: "horizontal" | "vertical";
}

export const KazeStudioDemo: React.FC<Props> = ({ layout }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animaciones básicas usando spring
  const uiEntrance = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 90 },
  });

  // Tiempos clave de la secuencia de demo
  // Fase 1: Camiseta (frames 0 - 150)
  // Fase 2: Gorra (frames 150 - 240)

  // Color de la camiseta según el tiempo
  // 0-40: Blanco, 40-70: Negro, 70-100: Rojo, 100-150: Azul Marino
  const tshirtColor = (() => {
    if (frame < 40) return "#ffffff";
    if (frame < 70) return "#1e293b"; // negro/gris oscuro
    if (frame < 100) return "#c8333f"; // rojo kaze
    return "#1e3a8a"; // azul marino
  })();

  // Indicador de color activo en el panel UI
  const activeColorIndex = (() => {
    if (frame < 40) return 0;
    if (frame < 70) return 1;
    if (frame < 100) return 2;
    return 3;
  })();

  // Escala y posición del diseño del logo que vuela sobre la camiseta
  const logoScale = spring({
    frame: frame - 95, // Vuela a partir del frame 95
    fps,
    config: { damping: 10, stiffness: 80 },
  });

  const logoOpacity = interpolate(frame, [95, 110], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const logoTranslateY = interpolate(frame, [95, 115], [-100, -10], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Transición de Camiseta a Gorra
  const tshirtOpacity = interpolate(frame, [145, 160], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tshirtScale = interpolate(frame, [145, 160], [1, 0.7], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const capOpacity = interpolate(frame, [155, 170], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const capScale = interpolate(frame, [155, 175], [0.7, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Color de la gorra (150-180: Negro, 180-210: Rojo, 210-240: Rosa/Pastel)
  const capColor = (() => {
    if (frame < 185) return "#1e293b"; // Negro
    if (frame < 210) return "#c8333f"; // Rojo
    return "#ec4899"; // Rosa
  })();

  const activeCapColorIndex = (() => {
    if (frame < 185) return 1;
    if (frame < 210) return 2;
    return 4; // Rosa
  })();

  // Aparece el parche de diseño en la gorra
  const capLogoOpacity = interpolate(frame, [195, 210], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const isVertical = layout === "vertical";

  return (
    <div className="w-full h-full bg-slate-950 text-white font-sans flex flex-col justify-between p-12 relative overflow-hidden">
      {/* Fondo de Gradiente Dinámico */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none transition-colors duration-500"
        style={{
          background: `radial-gradient(circle at center, ${frame < 150 ? tshirtColor : capColor}55 0%, rgba(2, 6, 23, 1) 70%)`
        }}
      />
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Encabezado de la Escena */}
      <div className="flex justify-between items-center z-10">
        <div>
          <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-semibold tracking-widest uppercase rounded-full border border-cyan-500/30">
            Kaze Studio
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight mt-2 bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent">
            Personaliza en Tiempo Real
          </h2>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/80 px-4 py-2 rounded-xl backdrop-blur-md text-xs font-semibold text-cyan-300 flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
          Simulación del Editor
        </div>
      </div>

      {/* Área Principal (Layout adaptable) */}
      <div className={`flex-1 flex ${isVertical ? 'flex-col justify-center' : 'flex-row'} items-center justify-around gap-8 z-10 my-4`}>
        
        {/* Editor Mockup (Prenda principal) */}
        <div className="relative w-96 h-96 flex items-center justify-center">
          
          {/* VISTA CAMISETA */}
          {frame < 160 && (
            <div 
              className="absolute w-full h-full flex items-center justify-center"
              style={{
                opacity: tshirtOpacity,
                transform: `scale(${tshirtScale})`,
              }}
            >
              {/* Imagen base de la camiseta blanca */}
              <img
                src={staticFile("tshirt_front.png")}
                className="w-full h-full object-contain relative z-10 filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                alt="T-shirt mockup"
              />
              
              {/* Capa de multiplicación de color (tint) */}
              <div 
                className="absolute w-[80%] h-[80%] rounded-full mix-blend-multiply z-20 pointer-events-none transition-colors duration-300"
                style={{
                  backgroundColor: tshirtColor,
                  maskImage: `url(${staticFile("tshirt_front.png")})`,
                  maskSize: "contain",
                  maskPosition: "center",
                  maskRepeat: "no-repeat",
                  WebkitMaskImage: `url(${staticFile("tshirt_front.png")})`,
                  WebkitMaskSize: "contain",
                  WebkitMaskPosition: "center",
                  WebkitMaskRepeat: "no-repeat",
                }}
              />

              {/* Diseño / Logo que vuela sobre la camiseta */}
              {frame >= 95 && (
                <div 
                  className="absolute z-30 w-24 h-24 rounded-lg overflow-hidden bg-slate-900 border border-cyan-400/40 shadow-[0_0_20px_rgba(34,211,238,0.3)] flex items-center justify-center"
                  style={{
                    opacity: logoOpacity,
                    transform: `translateY(${logoTranslateY}px) scale(${logoScale})`,
                  }}
                >
                  <img
                    src={staticFile("kaze-logo.jpg")}
                    className="w-full h-full object-cover"
                    alt="Custom Print"
                  />
                </div>
              )}
            </div>
          )}

          {/* VISTA GORRA */}
          {frame >= 145 && (
            <div 
              className="absolute w-[85%] h-[85%] flex items-center justify-center"
              style={{
                opacity: capOpacity,
                transform: `scale(${capScale})`,
              }}
            >
              {/* Imagen de gorra */}
              <img
                src={staticFile("cap_front.png")}
                className="w-full h-full object-contain relative z-10 filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
                alt="Cap mockup"
              />
              
              {/* Tinte de color para la gorra */}
              <div 
                className="absolute w-[90%] h-[90%] rounded-full mix-blend-multiply z-20 pointer-events-none transition-colors duration-300"
                style={{
                  backgroundColor: capColor,
                  maskImage: `url(${staticFile("cap_front.png")})`,
                  maskSize: "contain",
                  maskPosition: "center",
                  maskRepeat: "no-repeat",
                  WebkitMaskImage: `url(${staticFile("cap_front.png")})`,
                  WebkitMaskSize: "contain",
                  WebkitMaskPosition: "center",
                  WebkitMaskRepeat: "no-repeat",
                }}
              />

              {/* Logo / Diseño en el parche frontal de la gorra */}
              {frame >= 195 && (
                <div 
                  className="absolute z-30 w-16 h-12 rounded bg-slate-900 border border-pink-400/40 shadow-[0_0_15px_rgba(236,72,153,0.3)] flex items-center justify-center"
                  style={{
                    opacity: capLogoOpacity,
                    transform: `translateY(-22px) scale(0.95)`,
                  }}
                >
                  <img
                    src={staticFile("kaze-logo.jpg")}
                    className="w-full h-full object-cover opacity-90"
                    alt="Custom patch"
                  />
                </div>
              )}
            </div>
          )}

        </div>

        {/* Panel de Controles Flotante (Glassmorphism) */}
        <div 
          className="w-80 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md shadow-[0_30px_60px_rgba(0,0,0,0.4)] flex flex-col gap-5"
          style={{
            transform: `scale(${uiEntrance})`,
          }}
        >
          {/* Selector de Producto */}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold">1. Producto Activo</label>
            <div className="flex gap-2 mt-2">
              <button className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${frame < 150 ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300' : 'bg-slate-950/40 border-slate-800/60 text-slate-400'}`}>
                Camiseta
              </button>
              <button className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${frame >= 150 ? 'bg-pink-500/20 border-pink-400/50 text-pink-300' : 'bg-slate-950/40 border-slate-800/60 text-slate-400'}`}>
                Gorra
              </button>
            </div>
          </div>

          {/* Selector de Color */}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold">2. Paleta de Colores</label>
            <div className="flex gap-3 mt-2.5">
              {[
                { name: "Blanco", value: "#ffffff" },
                { name: "Negro", value: "#1e293b" },
                { name: "Rojo", value: "#c8333f" },
                { name: "Azul", value: "#1e3a8a" },
                { name: "Rosa", value: "#ec4899" },
              ].map((color, idx) => {
                const isSelected = frame < 150 ? activeColorIndex === idx : activeCapColorIndex === idx;
                return (
                  <div
                    key={color.name}
                    className={`w-8 h-8 rounded-full border-2 transition-all duration-300 cursor-pointer shadow-inner relative flex items-center justify-center`}
                    style={{ 
                      backgroundColor: color.value,
                      borderColor: isSelected ? '#22d3ee' : 'rgba(255,255,255,0.1)'
                    }}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-cyan-400" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Panel de Diseño */}
          <div>
            <label className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold">3. Diseño Aplicado</label>
            <div className="mt-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center">
                {(frame >= 95 && frame < 150) || frame >= 195 ? (
                  <img src={staticFile("kaze-logo.jpg")} className="w-full h-full object-cover" alt="Selected design" />
                ) : (
                  <div className="text-[10px] text-slate-500 font-bold">VACÍO</div>
                )}
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-slate-200">
                  {((frame >= 95 && frame < 150) || frame >= 195) ? "Logo Kaze Oficial" : "Arrastra tu diseño..."}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {((frame >= 95 && frame < 150) || frame >= 195) ? "Impresión DTF Premium" : "PNG, SVG o JPG"}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer / Barra de Progreso */}
      <div className="w-full bg-slate-900/40 border border-slate-800/60 p-4 rounded-xl backdrop-blur-sm flex justify-between items-center text-xs text-slate-400 z-10">
        <div>Modo de Edición Activo</div>
        <div className="font-mono text-cyan-300">
          Compilación: 100% Producción
        </div>
      </div>
    </div>
  );
};
