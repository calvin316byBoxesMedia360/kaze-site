# MEMORY.md - Memoria Viva del Proyecto Kaze

## Propósito
Este archivo es la memoria operativa corta del proyecto. Debe leerse al inicio de cada nueva sesión antes de tocar código o documentos.

## Regla De Uso Para Cada Sesión
Al iniciar:
1. Leer `MEMORY.md`.
2. Leer `NEXT_SESSION.md`.
3. Ejecutar: `git status --short`.
4. No revertir cambios existentes no hechos por la sesión actual.

Al cerrar una iteración importante:
1. Actualizar `Último Checkpoint`.
2. Agregar entrada a `Historial De Iteraciones`.
3. Actualizar docs relacionados si aplica.
4. Hacer commit y push para registrar avances.

---

## Estado Actual Del Proyecto
* **Proyecto:** KAZE Custom Apparel & Signs / Kaze Designs.
* **Ubicación de Trabajo Activa:** `C:\Users\boxes\Documents\Kaze`.
* **Git Remote:** `https://github.com/calvin316byBoxesMedia360/kaze-site.git` (rama `main`).
* **Deploy Activo (Railway):** [https://kazedesignswtv1-production.up.railway.app](https://kazedesignswtv1-production.up.railway.app)
* **Kaze Studio Activo:** [https://kazedesignswtv1-production.up.railway.app/studio/](https://kazedesignswtv1-production.up.railway.app/studio/)
* **Dirección Local de Trabajo:** `http://127.0.0.1:4178/`.
* **Correo de Recepción de Formularios:** `kazecustomdesign@yahoo.com`

---

## Módulos Principales
* `kaze-site-local/`: Directorio que Railway sirve en producción.
  * `index.html`: Landing page principal, con el botón de "Diseña tu Prenda" alineado junto a "Cotizar".
  * `server.js`: Backend en Express que sirve archivos estáticos, maneja las redirecciones del SPA del editor (`/studio/`) y envía correos mediante la API de Resend.
  * `studio/`: Compilación optimizada en producción de Kaze Studio (el personalizador interactivo React).
  * `assets/mockups/`: Carpeta de imágenes base premium recortadas y procesadas por IA para la herramienta de diseño.
* `kaze-studio/`: Aplicación SPA interactiva de diseño de mockups (React 18 + Vite 5 + TypeScript + Tailwind CSS).
* `kaze-web/`: Estructura inicial en Next.js (reservada para futuras iteraciones v2.0).

---

## Último Checkpoint
Fecha local: 21 de Mayo de 2026

**Resumen:**
1. **MVP e Interconectividad en Producción:** Se vinculó el repositorio de GitHub a Railway con integración automática (GitHub Auto-Deploy). El sitio está 100% online y responde a todas las rutas.
2. **Kaze Studio (Diseña tu Prenda):** 
   - Se completó la herramienta de diseño de mockups con rotación y escalado dinámico (por cursor y por botones de escala).
   - Se añadió la capacidad de descargar el diseño resultante de forma independiente con un botón de descarga en PNG.
   - El botón de inicio de diseño fue alineado en la navbar principal de `kaze-site-local/index.html` y `kaze-web/src/components/Navbar.tsx` junto al botón "Cotizar" para darle paridad de importancia.
3. **Actualización de Destinatario de Correo:** Se actualizó el correo fallback en `server.js` por solicitud urgente del cliente a `kazecustomdesign@yahoo.com`.
4. **Documentación Completa:** Se sincronizaron todas las guías de inicio rápido, el archivo de reglas operativas, el log de cambios de IA y ambas copias del archivo interactivo de reporte (`INFORME_PROYECTO_KAZE.html`).

---

## Decisiones Vigentes
* La única fuente activa de trabajo es `C:\Users\boxes\Documents\Kaze`. La carpeta en descargas es solo de respaldo.
* Toda nueva modificación debe ser commiteada y pusheada a la rama `main` de GitHub para actualizar producción en Railway.
* El destinatario de cotizaciones por defecto del backend es `kazecustomdesign@yahoo.com`, configurable por variable de entorno (`NOTIFICATION_EMAIL`).
* Si se edita `kaze-studio`, se debe correr `npm run build` en su directorio para compilar la carpeta de producción en `/studio/` del servidor principal.

---

## Historial De Iteraciones

### 2026-05-21 - Despliegue Exitoso en Railway e Integración de Kaze Studio
* Se completó la lógica del personalizador en React: rotación y escalado de imágenes importadas, prendas base premium optimizadas por IA, visualización de frente/dorso, flujo por pasos y botón de descarga directa de mockup en PNG.
* Se alineó estéticamente el botón **Diseña tu Prenda** en la Navbar al lado de **Cotizar** en todas las vistas (HTML local y Next.js).
* Se actualizó el correo receptor de cotizaciones del backend a `kazecustomdesign@yahoo.com`.
* Se configuró el flujo de compilación para volcar el Studio dentro del servidor de backend (`kaze-site-local/studio`).
* Se realizó el push del código a GitHub y se habilitó el despliegue automático en Railway. El sitio está oficialmente en producción.
* El cliente presentó el MVP con total éxito, destacando los videos e imágenes creados con IA y el branding digital.

### 2026-05-20 - GitHub y Configuración de Railway
* Se creó el repositorio privado `https://github.com/calvin316byBoxesMedia360/kaze-site`.
* Se subió la rama `main` con el historial del proyecto.
* Se agregó `.railwayignore` y `railway.json` para orientar el despliegue a la carpeta `kaze-site-local`.

### 2026-05-18 - Remplazo de Placeholders y Landing Page Larga
* Se generaron 16 imágenes fotorrealistas de alta definición (4K) con IA para reemplazar todos los placeholders de Unsplash en Hero, Servicios, Proyectos, Historia y Catálogos.
* Se guardaron los recursos en `kaze-site-local/assets/images`.
