# AI_LOGBOOK.md - Kaze

## 2026-05-22 - Documentación de Continuidad y Transferencia
- Se actualizaron todos los archivos de documentación operativa (`README.md`, `INFO.md`, `SYSTEM_CONTRACT.md`, `MEMORY.md`, `NEXT_SESSION.md`).
- Se actualizaron las dos copias de `INFORME_PROYECTO_KAZE.html` (en la raíz y dentro del backend) con los detalles técnicos del despliegue exitoso en Railway y el MVP del Studio.
- Se dejó el repositorio listo para ser clonado y ejecutado en cualquier terminal físico sin fricciones.

## 2026-05-21 - Despliegue en Railway, Ajuste de Correo y Kaze Studio
- Se completó la lógica interactiva de **Kaze Studio** (rotar, escalar mediante botones y drag-and-drop, frente y espalda, descarga directa del mockup en PNG y flujo paso a paso de checkout simulado).
- Se alinearon los botones de **Diseña tu Prenda** en las Navbar de `kaze-site-local/index.html` y `kaze-web` a la par de los botones de **Cotizar** con un estilo visual premium (glassmorphic y dorado).
- Por requerimiento de urgencia, se actualizó el correo receptor de cotizaciones por defecto del backend a `kazecustomdesign@yahoo.com`.
- Se configuró Vite en `kaze-studio` para compilar los estáticos finales en `kaze-site-local/studio/`.
- Se pushearon los commits y se autorizó el auto-despliegue en Railway. El sitio y la herramienta de mockups están en vivo en `https://kazedesignswtv1-production.up.railway.app`.

## 2026-05-20 - GitHub y Railway
- Se creó el repo privado `https://github.com/calvin316byBoxesMedia360/kaze-site`.
- Se pusheó `main` hasta `6851564 chore: add Railway deployment config`.
- Se agregó `kaze-site-local/.railwayignore`.
- Se agregó `railway.json` para orientar Railway hacia `kaze-site-local`.
- Railway proyecto/servicio: `kaze-site`, ambiente `production`.
- Railway Agent configuró source repo `calvin316byBoxesMedia360/kaze-site`, branch `main`, root directory `kaze-site-local`.

## 2026-05-18 - Rediseño híbrido Kaze Shop Studio
- El usuario indicó que la Technical Edition era demasiado repetitiva y fría.
- Se rediseñó `/technical` hacia un enfoque híbrido: técnico, humano, local y orientado a guía.
- Cambios clave:
  - Marca conceptual: `Kaze Shop Studio`.
  - Hero más humano.
  - Nueva sección `Built Around People`.
  - Capacidades y overlays con copy menos robótico.
  - CTA final centrado en traer la idea y recibir ayuda.
- Verificación: `npm run build` pasó y `/technical` responde 200.

## 2026-05-18 - GEO y estrategia de ubicación
- Se agregó como regla de continuidad:
  - Reforzar Watsonville, CA y 347 Main Street.
  - Mencionar Monterey Bay / Santa Cruz County de forma natural.
  - Posicionar a Kaze como tienda local física para negocios, equipos, eventos y marcas cercanas.
  - Aplicar la estrategia en metadata, JSON-LD, copy visible, contacto, áreas atendidas y CTAs.

## 2026-05-18 - Kaze Technical Edition
- Se creó la ruta `/technical` como variante paralela de diseño.
- Se integraron imágenes editadas en `kaze-web/public/technical/`.
- Se aplicó un primer lenguaje visual técnico: overlays, iconos, specs, galería y CTA.
- Se hizo commit `9a6a4e0 feat: add Kaze Technical Edition`.

## 2026-05-18 - Skills locales e informe de habilidades
- Se crearon skills locales en `.agents/skills/` para guiar trabajo futuro:
  - `kaze-nextjs-frontend`
  - `kaze-technical-edition`
  - `kaze-responsive-ux`
  - `kaze-visual-ux-auditor`
  - `kaze-design-system`
- Se copió el informe a `kaze-web/public/habilidades-agentes.html`.

## 2026-05-18 - Cambio de foco a Next.js
- El usuario confirmó que `kaze-web/` es la versión de interés para iterar.
- Se levantó Next localmente en `http://127.0.0.1:3000/`.
- Se verificó build de Next con `npm run build`.
