# AI_LOGBOOK.md - Kaze

## 2026-05-18 - Cambio de foco a Next.js
- El usuario confirmo que `kaze-web/` es la version de interes para iterar.
- Se levanto Next localmente en `http://127.0.0.1:3000/`.
- Se verifico build de Next con `npm run build`.

## 2026-05-18 - Kaze Technical Edition
- Se creo la ruta `/technical` como variante paralela de diseno.
- Se integraron imagenes editadas en `kaze-web/public/technical/`.
- Se aplico un primer lenguaje visual tecnico: overlays, iconos, specs, galeria y CTA.
- Se hizo commit `9a6a4e0 feat: add Kaze Technical Edition`.

## 2026-05-18 - Skills locales e informe de habilidades
- Se reviso `public/informe-habilidades.html`.
- Se crearon skills locales en `.agents/skills/` para guiar trabajo futuro:
  - `kaze-nextjs-frontend`
  - `kaze-technical-edition`
  - `kaze-responsive-ux`
  - `kaze-visual-ux-auditor`
  - `kaze-design-system`
- Se copio el informe a `kaze-web/public/habilidades-agentes.html`.
- URL local: `http://127.0.0.1:3000/habilidades-agentes.html`.

## 2026-05-18 - Rediseño hibrido Kaze Shop Studio
- El usuario indico que la Technical Edition era demasiado repetitiva/fria.
- Se redisenio `/technical` hacia un enfoque hibrido: tecnico, humano, local y orientado a guia.
- Cambios clave:
  - Marca conceptual: `Kaze Shop Studio`.
  - Hero mas humano.
  - Nueva seccion `Built Around People`.
  - Capacidades y overlays con copy menos robotico.
  - CTA final centrado en traer la idea y recibir ayuda.
- Verificacion: `npm run build` paso y `/technical` responde 200.
- Nota: `npm run lint` aun falla por un error heredado en `kaze-web/src/app/page.tsx:25`.

## 2026-05-18 - GEO y estrategia de ubicacion
- El usuario pidio no olvidar GEO y estrategia de ubicacion para la tienda.
- Se agrego como regla de continuidad:
  - Reforzar Watsonville, CA y 347 Main Street.
  - Mencionar Monterey Bay / Santa Cruz County de forma natural.
  - Posicionar a Kaze como tienda local fisica para negocios, equipos, eventos y marcas cercanas.
  - Aplicar la estrategia en metadata, JSON-LD, copy visible, contacto, areas atendidas y CTAs.
