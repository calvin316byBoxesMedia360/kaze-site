import { spring, useCurrentFrame, useVideoConfig, staticFile, interpolate } from "remotion";
import React from "react";

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animación de entrada para el contenedor del logo (escala y desvanecimiento)
  const scale = spring({
    frame,
    fps,
    config: {
      damping: 12,
      stiffness: 100,
    },
  });

  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Animación de entrada para el texto (desplazamiento vertical y desvanecimiento)
  const textTranslateY = interpolate(frame, [15, 35], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const textOpacity = interpolate(frame, [15, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Efecto de pulso en el fondo oscuro
  const bgPulse = interpolate(
    Math.sin(frame / 10),
    [-1, 1],
    [0.05, 0.15]
  );

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center bg-slate-950 font-sans relative overflow-hidden"
      style={{
        background: `radial-gradient(circle, rgba(31, 122, 140, ${bgPulse}) 0%, rgba(2, 6, 23, 1) 75%)`,
      }}
    >
      {/* Elemento de cuadrícula decorativa */}
      <div className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div
        className="flex flex-col items-center justify-center z-10"
        style={{
          opacity,
          transform: `scale(${scale})`,
        }}
      >
        {/* Contenedor del Logo con sombra brillante y cristalina */}
        <div className="w-48 h-48 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(31,122,140,0.5)] border-2 border-cyan-500/30 mb-8 bg-slate-900 flex items-center justify-center">
          <img
            src={staticFile("kaze-logo.jpg")}
            className="w-full h-full object-cover"
            alt="Kaze Logo"
          />
        </div>

        {/* Título de Marca */}
        <h1 
          className="text-6xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 uppercase text-center drop-shadow-[0_0_15px_rgba(31,122,140,0.4)]"
          style={{
            transform: `translateY(${textTranslateY}px)`,
            opacity: textOpacity,
          }}
        >
          Kaze Designs
        </h1>

        {/* Slogan */}
        <p 
          className="text-xl font-medium text-cyan-200/70 tracking-widest uppercase mt-4 text-center"
          style={{
            transform: `translateY(${textTranslateY + 5}px)`,
            opacity: textOpacity,
          }}
        >
          Custom Apparel & Signs
        </p>
      </div>
    </div>
  );
};
