import { useCurrentFrame, useVideoConfig, staticFile, interpolate, spring } from "remotion";
import React from "react";

interface Props {
  layout: "horizontal" | "vertical";
}

export const Outro: React.FC<Props> = ({ layout }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animaciones de escala y rebote para el logo final
  const logoScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 85 },
  });

  const logoOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Animación para el bloque de textos de contacto
  const contentOpacity = interpolate(frame, [25, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const contentTranslateY = interpolate(frame, [25, 45], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Animación del botón brillante principal
  const buttonPulse = interpolate(
    Math.sin(frame / 6),
    [-1, 1],
    [1, 1.04]
  );

  const isVertical = layout === "vertical";

  return (
    <div className="w-full h-full bg-slate-950 text-white font-sans flex flex-col items-center justify-center p-12 relative overflow-hidden">
      
      {/* Background glow effects */}
      <div className="absolute top-1/4 w-96 h-96 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 w-96 h-96 rounded-full bg-red-500/10 blur-[120px] pointer-events-none" />
      
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Contenido Central */}
      <div className="flex flex-col items-center justify-center text-center z-10">
        
        {/* Logo Final con borde brillante y sombra */}
        <div 
          className="w-36 h-36 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(34,211,238,0.3)] border-2 border-cyan-400/20 mb-6 bg-slate-900 flex items-center justify-center"
          style={{
            opacity: logoOpacity,
            transform: `scale(${logoScale})`,
          }}
        >
          <img
            src={staticFile("kaze-logo.jpg")}
            className="w-full h-full object-cover"
            alt="Kaze Logo"
          />
        </div>

        {/* Textos y CTA */}
        <div
          style={{
            opacity: contentOpacity,
            transform: `translateY(${contentTranslateY}px)`,
          }}
          className="flex flex-col items-center"
        >
          <h2 className="text-4xl font-extrabold tracking-wide bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent uppercase">
            Impulsa Tu Imagen Hoy
          </h2>
          <p className="text-sm text-cyan-200/60 font-medium uppercase tracking-widest mt-2 max-w-sm">
            Prendas de alta gama & Rótulos luminosos a tu alcance.
          </p>

          {/* Botón CTA animado con gradiente (estilo Spreadshirt) */}
          <div 
            className="mt-8 flex gap-4"
            style={{
              transform: `scale(${buttonPulse})`,
            }}
          >
            <a
              href="https://kazedesignswtv1-production.up.railway.app/studio/"
              target="_blank"
              rel="noopener noreferrer"
              className="py-3.5 px-8 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-slate-950 uppercase tracking-widest shadow-[0_10px_30px_rgba(6,182,212,0.3)] border border-cyan-300/20 hover:shadow-[0_15px_40px_rgba(6,182,212,0.5)] transition-all duration-300"
            >
              Diseña Tu Prenda
            </a>
          </div>

          {/* Enlaces de Contacto y URL */}
          <div className="mt-10 flex flex-col gap-2.5 items-center bg-slate-900/50 border border-slate-800/80 p-5 rounded-2xl backdrop-blur-sm shadow-[0_15px_30px_rgba(0,0,0,0.3)]">
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Sitio Oficial de Producción</span>
              <span className="text-xs font-mono font-bold text-cyan-300 mt-1 select-all">
                kazedesignswtv1-production.up.railway.app
              </span>
            </div>
            <div className="w-24 h-px bg-slate-800" />
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Contacto & Cotizaciones</span>
              <span className="text-xs font-mono font-bold text-slate-200 mt-1 select-all">
                kazecustomdesign@yahoo.com
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* Marca de Agua Inferior */}
      <div className="absolute bottom-6 text-[10px] font-bold text-slate-600 tracking-widest uppercase">
        © 2026 KAZE DESIGNS. Watsonville, CA.
      </div>
    </div>
  );
};
