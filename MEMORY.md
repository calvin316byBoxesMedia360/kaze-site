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
Fecha local: 3 de Junio de 2026

**Resumen:**
1. **Formulario de Cotización con PNG Adjunto**: Se implementó una nueva funcionalidad en los editores de vehículos y prendas 3D que permite capturar el diseño en base64 y adjuntarlo a un formulario de cotización profesional de 3 pasos (`QuoteModal.tsx`) con previsualización lateral.
2. **Envío de Correo con Adjunto Binario**: Se modificó `/api/quote` en `server.js` para recibir el mockup en base64, embeber la previsualización en el cuerpo HTML y adjuntarlo como archivo físico binario (`kaze-diseño.png`) para la API de Resend.
3. **CTAs Duales**: Se rediseñaron las interfaces de usuario para incluir botones duales: `"Cotizar con este Diseño (Adjuntar PNG)"` (color de acento) y `"Descargar PNG"` (outline glassmorphic).
4. **Limpieza e Integración de Producción**: Se simplificó la barra lateral del editor de vehículos (eliminando pestañas, pincel, renderizado IA y configuraciones complejas obsoletas) y se compiló el subproyecto con éxito en la ruta de producción.

---

## Decisiones Vigentes
* La única fuente activa de trabajo es `C:\Users\boxes\Documents\Kaze`. La carpeta en descargas es solo de respaldo.
* Toda nueva modificación debe ser commiteada y pusheada a la rama `main` de GitHub para actualizar producción en Railway.
* El destinatario de cotizaciones por defecto del backend es `kazecustomdesign@yahoo.com`, configurable por variable de entorno (`NOTIFICATION_EMAIL`).
* Si se edita `kaze-studio`, se debe correr `npm run build` en su directorio para compilar la carpeta de producción en `/studio/` del servidor principal.
* Si se edita `wrapstudio-mockup`, se debe correr `npm run build` en su directorio para compilar la carpeta de producción en `/wrapstudio/` del servidor principal.

---

## Historial De Iteraciones

### 2026-06-03 - v8.0: Formulario de Cotización Profesional y PNG Adjunto
* **Captura Silenciosa de Mockup**: Modificación de la función de exportación de canvas (en autos) y WebGL (en prendas 3D) para retornar la imagen base64 de manera asíncrona mediante callbacks, desactivando temporalmente los elementos guía y costuras de la previsualización.
* **CTAs Duales e Intuitivos**: Sustitución de los botones individuales de descarga por botones duales ("Cotizar con este Diseño (Adjuntar PNG)" en oro de la marca y "Descargar PNG" en glassmorphism) en el header de vehículos, pie de panel de autos y pie de panel de camisetas.
* **Componente de Cotización Profesional**: Creación de `QuoteModal.tsx` con un formulario intuitivo de 3 pasos (Servicios, Detalles del Proyecto, Datos de Contacto), adaptabilidad a variables CSS de temas/acentos del sitio principal, miniatura del diseño a la izquierda y microanimaciones de carga y confirmación de envío.
* **Backend con Adjunto Binario**: Actualización del endpoint `/api/quote` en `server.js` para embeber la miniatura del diseño en el cuerpo HTML del correo y estructurar un adjunto físico binario para la llamada de Resend, enviando el correo final a `kazecustomdesign@yahoo.com`.

### 2026-06-03 - v7.0: Simplificación de la Interfaz del Editor de Vehículos 2D
* **Limpieza de Barra Lateral**: Remoción de las pestañas ("Vehículo", "Capas", "Áreas", "IA Render") convirtiendo la barra lateral en un panel único, estático y limpio.
* **Reposicionamiento y Reset**: Colocación del cargador de auto personalizado al inicio del panel y adición de la función "Restaurar" para restablecer el coche sedan por defecto.
* **Depuración de Funciones Obsoletas**: Eliminación de opciones de ángulo de plantilla, fotorrealismo (sombras/reflejos/desaturación de chapa), lista de capas, dibujo de máscaras, y renderizado IA con Gemini.
* **Reducción de Controles**: Eliminación del pincel de la barra de herramientas flotante y depuración de estados sin usar para asegurar compilación estricta de TypeScript.

### 2026-06-03 - v6.0: Sincronización Estética, Refinamientos de Diseño e Integración de Producción
* **Sincronización Visual**: Se implementaron overrides de variables CSS para temas (Light/Paper, Dark/Industrial, Midnight) y acentos (Gold, Crimson, Neon) en `wrapstudio-mockup/src/index.css`. Se añadió un hook en `App.tsx` para sincronizar automáticamente el visor leyendo de `localStorage` en cada renderizado y mount.
* **Refinamientos del Panel**: Se convirtieron los colores oscuros inline estáticos de selects e inputs en `ControlPanel.tsx` a variables CSS, garantizando perfecta adaptabilidad y contraste en tema claro.
* **Hero y Video**: Se arregló el stacking context CSS en `index.html` (video en `z-index: 1`, overlay gradiente en `z-index: 2` y contenido de texto en `z-index: 3`), logrando que el video promocional se reproduzca en segundo plano en lugar de quedar oculto tras el fondo oscuro.
* **Eliminación de la herramienta 2D**: Se quitaron todos los elementos, botones de acción y llaves de traducción i18n al editor de camiseta 2D `/studio/` (en el navbar, hero, y sección de apparel).
* **Resaltado de Botones e Icono**: Se crearon las clases `.btn-highlight` y `.btn-highlight-outline` para destacar los botones principales de Estudio 3D y Cotización. Se reemplazó el icono outline del modo oscuro por SVGs sólidos de Lucide con transiciones de rotación al hacer clic.
* **Corrección de Carga en Producción**: Se implementó una redirección 301 para peticiones a directorios sin barra diagonal final en `server.js` (como `/wrapstudio` redirigiendo a `/wrapstudio/`), garantizando que el navegador resuelva correctamente la ruta `./assets/...` de los recursos dinámicos compilados.

### 2026-06-02 - v5.0: Integración Avanzada de wrapstudio-mockup y Mejoras 3D
* **Optimización de Rendimiento**: Se condicionó el cálculo del aspect ratio del texto en `App.tsx` para evitar que cree un canvas a 60fps durante pointer-move, y se simplificaron `DielineWorkspace.tsx` y `MockupViewer.tsx` para reutilizar el estado, logrando interacciones a 60fps fluidos.
* **Alineación de Mangas**: Se corrigió el desfase vertical (+0.10) y lateral (se pasó de `0.34` a `0.24` en X) para centrar los diseños y el área de seguridad en las mangas físicas de la camiseta. Se limitó el clamping y la escala máxima a `0.16` (tamaño real de la manga).
* **Escala en Patrones 2D**: Se multiplicó la escala visual de los decales en el patrón 2D por `1.8` (multiplicador `0.81`), logrando que la escala del diseño en las piezas 2D simule correctamente la proporción real de cobertura visible en 3D.
* **Mejoras del Pincel y Desplazamiento**: Se solucionó la pantalla negra del pincel usando opacidad al 50%. Se reparó la herramienta de la manita aplicando `draggable={false}` y `pointer-events: none` a las imágenes base del carro para que el arrastre no se bloquee.
* **Zoom y Rotación**: Se habilitó zoom con scroll de mouse (modalidad directa y atajo con tecla `Ctrl`). Se programó la rotación directa de vinilos en las 4 esquinas de la caja de selección con cursor SVG curvo verde lima.


---

## Historial De Iteraciones

### 2026-06-01 - Integración de wrapstudio-mockup (Herramienta 3D)
* Se descargó el repositorio `wrapstudio-mockup.git` y se extrajo en la carpeta `/wrapstudio-mockup` en la raíz del proyecto.
* Se eliminaron los metadatos de Git locales (`.git/`) del módulo integrado para mantener la estructura de monorepo unificada.
* Se instalaron todas las dependencias requeridas (incluyendo Three.js y WebGL wrappers) ejecutando `npm install` localmente.
* Se configuró el `.gitignore` del proyecto raíz para ignorar `/wrapstudio-mockup/node_modules/` y `/wrapstudio-mockup/dist/`.

### 2026-05-29 - Configuración y Render de Video Promocional en Remotion
* Se creó e inicializó la carpeta `kaze-promo` como subproyecto de video en Remotion.
* Se programó la línea de tiempo y las 5 escenas animadas del video promocional de 30 segundos para Kaze Designs (Intro de marca, demostración del Studio interactivo, galería de portafolio, detrás de cámaras del código y del informe de habilidades, y Outro con CTA).
* Se renderizaron exitosamente los videos MP4 de salida: `kaze-promo/out/kaze-promo-horizontal.mp4` (1920x1080) y `kaze-promo/out/kaze-promo-vertical.mp4` (1080x1920).
* Se eliminó el subdirectorio `.git` local de `kaze-promo` para que pueda subirse limpiamente como parte del monorepo principal.

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
