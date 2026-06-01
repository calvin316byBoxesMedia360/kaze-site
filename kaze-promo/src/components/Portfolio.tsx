import { useCurrentFrame, useVideoConfig, staticFile, interpolate, spring } from "remotion";
import React from "react";

interface Props {
  layout: "horizontal" | "vertical";
}

export const Portfolio: React.FC<Props> = ({ layout }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animaciones de neón titilante (flicker) al inicio de la escena (frames 0-35)
  const neonFlicker = (() => {
    if (frame < 5) return 0.1;
    if (frame < 8) return 0.8;
    if (frame < 10) return 0.2;
    if (frame < 14) return 0.9;
    if (frame < 16) return 0.3;
    if (frame < 22) return 0.95;
    if (frame < 24) return 0.4;
    return 1; // Encendido total
  })();

  // Entrada del Título principal
  const titleEntrance = spring({
    frame: frame - 10,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const titleOpacity = interpolate(frame, [10, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Tiempos clave para mostrar las 3 imágenes del catálogo
  // Slide 1: Neon Sample (frames 30 - 100)
  // Slide 2: Grabados Sample (frames 100 - 170)
  // Slide 3: Bordado Sample (frames 170 - 240)

  const activeSlide = (() => {
    if (frame < 100) return 0;
    if (frame < 170) return 1;
    return 2;
  })();

  // Animaciones de zoom/escala para la imagen activa
  const getSlideStyle = (index: number) => {
    let frameOffset = 0;
    if (index === 0) frameOffset = 30;
    if (index === 1) frameOffset = 100;
    if (index === 2) frameOffset = 170;

    const localFrame = frame - frameOffset;

    // Escala lenta (zoom in continuo)
    const scale = interpolate(localFrame, [0, 80], [1.02, 1.15], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    // Desvanecimiento de entrada y salida
    const opacity = interpolate(
      localFrame,
      [0, 12, 58, 70],
      [0, 1, 1, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );

    // Desplazamiento horizontal de entrada
    const translateX = interpolate(localFrame, [0, 15], [50, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    return {
      opacity,
      transform: `scale(${scale}) translateX(${translateX}px)`,
    };
  };

  const isVertical = layout === "vertical";

  return (
    <div className="w-full h-full bg-slate-950 text-white font-sans flex flex-col justify-between p-12 relative overflow-hidden">
      
      {/* Luz de neón de fondo brillando */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          opacity: neonFlicker * 0.25,
          background: "radial-gradient(circle at 50% 30%, rgba(200, 51, 63, 0.4) 0%, rgba(2, 6, 23, 1) 75%)",
        }}
      />
      
      {/* Contorno brillante Neón en los bordes del video (Flicker) */}
      <div 
        className="absolute inset-4 rounded-3xl border-2 pointer-events-none transition-all duration-100"
        style={{
          borderColor: `rgba(200, 51, 63, ${neonFlicker * 0.4})`,
          boxShadow: `0 0 ${neonFlicker * 30}px rgba(200, 51, 63, ${neonFlicker * 0.3}), inset 0 0 ${neonFlicker * 20}px rgba(200, 51, 63, ${neonFlicker * 0.2})`,
        }}
      />

      {/* Header */}
      <div className="flex justify-between items-end z-10">
        <div>
          <span 
            className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-semibold tracking-widest uppercase rounded-full border"
            style={{
              borderColor: `rgba(200, 51, 63, ${neonFlicker * 0.4})`,
              boxShadow: `0 0 10px rgba(200, 51, 63, ${neonFlicker * 0.2})`
            }}
          >
            Señalización y Rótulos
          </span>
          <h2 
            className="text-4xl font-black mt-3 uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-red-200 via-red-100 to-amber-200"
            style={{
              opacity: titleOpacity,
              transform: `translateY(${titleEntrance ? 0 : 20}px)`,
            }}
          >
            Hacemos Brillar Tu Marca
          </h2>
        </div>
      </div>

      {/* Visualización de Galería */}
      <div className={`flex-1 flex ${isVertical ? 'flex-col' : 'flex-row'} items-center justify-center gap-12 z-10 my-4`}>
        
        {/* Contenedor de la Imagen con Filtro de Cohesión */}
        <div className="relative w-[450px] h-[300px] rounded-2xl overflow-hidden border border-slate-800 shadow-[0_30px_60px_rgba(0,0,0,0.6)] bg-slate-900 flex items-center justify-center">
          
          {/* Capa de Tinte de Color Cohesivo (Rojo Kaze muy suave) */}
          <div className="absolute inset-0 bg-red-950/20 mix-blend-color-burn z-20 pointer-events-none" />

          {/* SLIDE 1: Neon */}
          {frame >= 30 && frame < 105 && (
            <img
              src={staticFile("neon_sample.png")}
              className="w-full h-full object-cover relative z-10"
              style={getSlideStyle(0)}
              alt="Neon sign portfolio"
            />
          )}

          {/* SLIDE 2: Grabado Láser */}
          {frame >= 100 && frame < 175 && (
            <img
              src={staticFile("grabados_sample.png")}
              className="w-full h-full object-cover relative z-10"
              style={getSlideStyle(1)}
              alt="Laser engraving portfolio"
            />
          )}

          {/* SLIDE 3: Bordado */}
          {frame >= 170 && (
            <img
              src={staticFile("embroidery_sample.png")}
              className="w-full h-full object-cover relative z-10"
              style={getSlideStyle(2)}
              alt="Embroidery portfolio"
            />
          )}

        </div>

        {/* Panel Informativo del Proyecto / Social Proof */}
        <div className="w-80 flex flex-col gap-4">
          
          {/* Card 1: Detalle Técnico del Producto */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-[10px] uppercase font-bold text-red-400 tracking-wider">Servicio Destacado</div>
            <div className="text-lg font-bold text-slate-100 mt-1">
              {activeSlide === 0 && "Letreros de Neón LED"}
              {activeSlide === 1 && "Grabado Láser en Acrílico"}
              {activeSlide === 2 && "Bordado Profesional"}
            </div>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {activeSlide === 0 && "Fabricados a la medida con tiras LED flexibles de alta durabilidad y bajo consumo."}
              {activeSlide === 1 && "Grabado de alta precisión en madera, metal y acrílicos retroiluminados."}
              {activeSlide === 2 && "Bordado de alta densidad para uniformes comerciales, gorras y chaquetas."}
            </p>
          </div>

          {/* Card 2: Testimonio / Review Real */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 backdrop-blur-sm relative">
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Cliente Satisfecho</div>
            <div className="flex text-amber-400 text-xs mt-1">★★★★★</div>
            <p className="text-xs italic text-slate-300 mt-2 font-medium">
              {activeSlide === 0 && '“¡El neón de mi negocio quedó espectacular! La luz es súper brillante y el diseño es idéntico a mi logo.”'}
              {activeSlide === 1 && '“Excelente calidad de grabado y rotulación en nuestra sucursal. Los volvería a contratar sin dudarlo.”'}
              {activeSlide === 2 && '“Los bordados para los uniformes de nuestro staff quedaron limpios, firmes y muy profesionales.”'}
            </p>
            <div className="text-[10px] font-bold text-slate-400 mt-2 text-right">
              {activeSlide === 0 && "— Tiffany S."}
              {activeSlide === 1 && "— Watsonville Retail"}
              {activeSlide === 2 && "— Kaze Client"}
            </div>
          </div>

        </div>

      </div>

      {/* Footer / Proceso de Compra */}
      <div className="w-full bg-slate-900/40 border border-slate-800/60 p-4 rounded-xl backdrop-blur-sm flex justify-between items-center text-xs text-slate-400 z-10">
        <div className="flex gap-2 items-center">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: `rgba(200, 51, 63, ${neonFlicker})`, boxShadow: `0 0 8px rgba(200, 51, 63, 0.8)` }} />
          <span>Luminosidad Activa</span>
        </div>
        <div className="font-mono text-red-400">
          Glow Effect: Enabled
        </div>
      </div>
    </div>
  );
};
