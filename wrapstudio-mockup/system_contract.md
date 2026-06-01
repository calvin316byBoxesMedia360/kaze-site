# System Contract - Pacdora Mockup Maker

Este documento define las reglas de arquitectura inviolables, restricciones matemáticas y mecánicas fundamentales de la aplicación. Cualquier futuro agente autónomo o desarrollador DEBE respetar este contrato al realizar modificaciones en el código.

## 1. Reglas del Renderizado (HTML5 Canvas & WebGL)
- **Orden de Filtros y Operaciones (2D):** 
  Cualquier alteración a un contexto Canvas mediante `ctx.filter` (ej. brillos, contrastes, grises) debe aplicarse OBLIGATORIAMENTE **ANTES** de ejecutar el comando `ctx.drawImage` para ese buffer. De lo contrario, los filtros no se aplicarán a la imagen procesada.
- **Resolución de Exportación (2D):** 
  La resolución dinámica de exportación en `handleExport` nunca debe descender de **2560 píxeles** (eje ancho), garantizando así que las imágenes de vehículos de baja resolución no destruyan los vectores y diseños superpuestos de alta calidad. `TARGET_WIDTH = Math.max(vehicleImg.width, 2560)`.
- **Modos de Fusión (Blend Modes):** 
  Al componer el diseño, las sombras deben aplicarse siempre mediante `multiply`, y los reflejos de brillo mediante `screen`. El diseño en sí mismo hereda la opción elegida por el usuario (`multiply` o `source-over`), este modo DEBE transferirse correctamente del contexto de la capa al contexto del diseño principal.
- **Transparencia WebGL en 3D:**
  El `<Canvas>` de React Three Fiber debe conservar la transparencia activa (`alpha: true`) en sus parámetros de inicialización del `WebGLRenderer`. Si se desactiva, los pases de renderizado auxiliar de `ContactShadows` generarán planos y cajas oscuras opacas sobre el suelo del escenario.

## 2. Anti-Aliasing y Bordes
- **Recorte y Detección de Fondo (Vehículos):**
  Para imágenes de vehículos, el algoritmo de detección de silueta `scanVehicleSilhouette` DEBE emplear una inundación por cola sembrada en el borde (border-seeded queue-based flood-fill) en lugar de una comparación global de color. Esto garantiza que las áreas internas del vehículo similares al fondo no se vuelvan transparentes y que el diseño quede delimitado con total precisión a la silueta del chasis del auto.
- **Alineación de la Máscara en Previsualización (CSS):**
  La propiedad de máscara CSS del contenedor del diseño (`mask-image` / `WebkitMaskImage`) debe configurarse dinámicamente usando `mask-size` y `mask-position` basados en la relación de aspecto y desfase vertical real del vehículo (`carHeight` y `carTop`). Si se fuerza a `100% 100%`, la máscara se desalineará verticalmente debido a la diferencia de aspecto entre la foto del coche (ej. 16:9) y el contenedor de la herramienta (2:1).
- **Fidelidad de la Imagen del Vehículo (Formato Nativo):**
  Cuando se cargue un vehículo personalizado (`isDefaultVehicle === false`), la imagen base de fondo DEBE mostrarse sin ningún filtro estático de brillo o contraste para mantener la fidelidad cromática original de la foto. Además, se DEBE aplicar la propiedad CSS `image-rendering: high-quality` a las imágenes base, sombras y reflejos para forzar al navegador a usar suavizado bicúbico durante el escalado en pantalla y evitar la pixelación.
- **Suavizado de la Silueta:**
  La silueta generada debe someterse a un suavizado mediante un filtro de desenfoque nativo (`blur(1.5px)`) en un lienzo auxiliar de dibujo para evitar bordes dentados y permitir una integración impecable del wrap en el vehículo.
- **Recorte y Detección de Fondo (Logotipos):**
  El algoritmo de la función `removeImageBackground` NO debe aplicar nunca un recorte duro (opacidad 0 o 255 directos). En su lugar, DEBE aplicar un difuminado (*feathering*) matemático usando una métrica de distancia de píxeles (`feather = 18` o similar) e interpolación cuadrática o cúbica para atenuar gradualmente el canal Alpha. Si se altera esta matemática, reaparecerá el alias y "diente de sierra" destruyendo la calidad visual del logotipo del cliente.
- **Evitar Caché de clip-path SVG (Chrome/Safari):**
  Para obligar al navegador a re-renderizar de forma síncrona e inmediata el recorte de los paneles del coche cuando el usuario marca o desmarca los checkboxes, el ID del elemento `<clipPath>` y su referencia en la propiedad CSS `clip-path` DEBEN ser dinámicos (`clipPathId` dependiente de la lista de paneles seleccionados). Si el ID es estático, los navegadores basados en Chromium no actualizarán la región de recorte visual del diseño debido a la caché interna de vectores.
- **Renderizado del Canvas Principal:** 
  Cualquier inicialización de Canvas (`ctx`, `layerCtx`, `baseCtx`) debe incorporar:
  `ctx.imageSmoothingEnabled = true;`
  `ctx.imageSmoothingQuality = 'high';`


## 3. UI y comportamiento de Cámara / Zoom 3D
- **Paridad de Ejes Y en Zoom:**
  Para evitar que la maquetación 3D se des-centre de la pantalla al acercarse o alejarse, el eje vertical Y de la posición por defecto de la cámara y el objetivo (`target`) de `OrbitControls` deben coincidir exactamente. El centro visual óptimo de la camiseta está establecido en **Y = -0.05**.
  - Posición de cámara por defecto: `[0, -0.05, 1.8]`
  - Objetivo de controles (`target`): `[0, -0.05, 0]`
- **Evitar re-renderizados infinitos en descargas:**
  La función de exportación expuesta al exterior mediante callbacks no debe sincronizar estados de React locales que fuercen re-renderizados estructurales de la escena WebGL durante el ciclo de captura. La visibilidad de las guías de costura (`safety-area-line`) y los controladores 3D (`decal-3d-handles`) se oculta y restaura de forma síncrona en el grafo de objetos de Three.js durante el flujo del trigger del export.
- **Límites de Zoom e Interacción:**
  El zoom de cámara está restringido estrictamente mediante `minDistance = 1.1` y `maxDistance = 3.5` en los controles orbitales para prevenir el recorte de la cámara por planos de renderizado cercano (*near clipping plane*) y deformaciones del modelo.
- **Iconografía de Zoom Clara (2D/3D):**
  Los botones flotantes de zoom deben emplear iconos específicos que incorporen símbolos de suma (`ZoomIn`) y resta (`ZoomOut`) en lugar de iconos genéricos de búsqueda o lupas idénticas, facilitando al usuario la identificación visual inmediata de cada acción.
- **Sistema de Arrastre de Capas Preciso (Drag & Drop 2D):**
  Para evitar el comportamiento errático (saltos o que la calcomanía salga disparada y se pierda fuera de la pantalla), el arrastre de las capas de diseño debe gestionarse mediante manejadores de eventos de puntero directos (`onPointerDown`, `pointermove`, `pointerup`) en lugar de arrastre nativo basado en renderizado de estados de animaciones reactivas en bucle.
  - **Corrección de Escala de Zoom**: La diferencia en coordenadas de pantalla (`dx`, `dy`) debe escalarse por `100 / zoom` antes de sumarse a las coordenadas de la capa. Esto asegura que el cursor se mantenga exactamente en el mismo punto de la calcomanía en cualquier nivel de zoom.
  - **Límites de Seguridad (Anti-Pérdida)**: Las coordenadas de la calcomanía deben limitarse físicamente (por ejemplo, a un máximo absoluto de `limitX = 600` y `limitY = 300` en relación con el centro del lienzo) para evitar que la imagen sea arrastrada completamente fuera del lienzo y resulte imposible de recuperar para el usuario.

## 4. Pipeline de Exportación 3D (Composición 2D Opaque)
- **Eliminación de la silueta de sombras e intensidad de color:**
  Dado que el renderizador de WebGL usa un lienzo transparente para permitir sombras dinámicas complejas combinadas con CSS, la exportación directa de la textura WebGL puede dar como resultado imágenes con colores atenuados ("faint/washed out") al abrirse en visores locales.
  Para evitar esto, `ExportHelper` dibuja la escena WebGL sobre un canvas 2D temporal previamente pintado con el color/degradado de fondo de la aplicación (`state.bgColor`), consolidando un PNG 100% opaco y con contraste real.

## 5. Integración futura como Git Submodule
- **Estrategia de Repositorio:** 
  Este proyecto (`pacdora_sample_mockupMKR`) está destinado a integrarse como un **Git Submodule** dentro del repositorio principal `kaze-site` (específicamente bajo la cuenta `calvin316byBoxesMedia360`).
- **Ruta de Despliegue:**
  Debe compilarse de forma autónoma y su salida (`dist`) se ubicará en una subruta pública del sitio web principal (por ejemplo, `/wrap-studio` o similar), emulando el flujo existente de Kaze Studio. Cualquier cambio en las dependencias o scripts de compilación debe mantener la compatibilidad con un proceso de construcción automatizado e independiente.
