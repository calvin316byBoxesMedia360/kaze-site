import { Sequence } from "remotion";
import React from "react";
import { Intro } from "./components/Intro";
import { KazeStudioDemo } from "./components/KazeStudioDemo";
import { Portfolio } from "./components/Portfolio";
import { TechBehind } from "./components/TechBehind";
import { Outro } from "./components/Outro";

interface Props {
  layout: "horizontal" | "vertical";
}

export const KazePromo: React.FC<Props> = ({ layout }) => {
  return (
    <>
      {/* Secuencia 1: Intro de Marca (0s - 5s) */}
      <Sequence from={0} durationInFrames={150}>
        <Intro />
      </Sequence>

      {/* Secuencia 2: Simulación de Editor Kaze Studio (5s - 13s) */}
      <Sequence from={150} durationInFrames={240}>
        <KazeStudioDemo layout={layout} />
      </Sequence>

      {/* Secuencia 3: Galería de Proyectos de Rótulos y Clientes (13s - 21s) */}
      <Sequence from={390} durationInFrames={240}>
        <Portfolio layout={layout} />
      </Sequence>

      {/* Secuencia 4: Detrás de Cámaras Tecnológico (21s - 26s) */}
      <Sequence from={630} durationInFrames={150}>
        <TechBehind layout={layout} />
      </Sequence>

      {/* Secuencia 5: Outro y Cierre con CTA (26s - 30s) */}
      <Sequence from={780} durationInFrames={120}>
        <Outro layout={layout} />
      </Sequence>
    </>
  );
};
