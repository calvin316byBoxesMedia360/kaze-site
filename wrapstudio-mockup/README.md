# Pacdora Sample Mockup Maker

Un estudio avanzado de diseño y visualización digital en 3D y 2D para personalización de productos y vehículos. Permite a los diseñadores superponer logotipos, textos dinámicos y diseños gráficos ("wraps"), aplicando transformaciones en tiempo real y efectos de iluminación realistas.

---

## Características Clave

### 1. Estudio 3D (3D Studio)
- **Modelos Tridimensionales Interactivos**: Visualización de prendas (Camiseta) con soporte para rotación orbital, auto-rotación y zoom delimitado.
- **Calibración Visual y Centrado Continuo**: Altura de cámara y objetivos acoplados en `Y = -0.05` para garantizar el bloqueo de la posición vertical durante el zoom.
- **Manipulación de Calcomanías (Decals)**: Herramienta visual en 3D para escalar, rotar y reposicionar imágenes o cajas de texto directamente sobre la superficie del modelo tridimensional.
- **Áreas de Seguridad Dinámicas**: Líneas guías del área de seguridad de impresión adaptadas para frente, espalda y mangas.

### 2. Editor de Patrones (2D Pattern)
- **Alineación Bidimensional**: Posicionamiento milimétrico de las calcomanías sobre el patrón plano del producto.
- **Restricciones de Área**: Algoritmo `clampDecalPosition` que restringe el movimiento de las imágenes e impone límites físicos para evitar impresiones fuera de los límites reales de la tela.

### 3. Editor de Vehículos (Car Wrap Workspace)
- **Detección Automática de Silueta**: Algoritmo de trazado sobre siluetas para crear áreas de seguridad sobre vehículos.
- **Filtros Fotorrealistas**: Multiplicación de sombras y reflejos para inyectar logotipos manteniendo el relieve de la carrocería.
- **Control de Zoom y Arrastre de Alta Precisión**:
  - Manejo de arrastre (Drag & Drop) basado en punteros directos con corrección de escala de zoom (`100 / zoom`) para una precisión píxel a píxel.
  - Límites físicos incorporados para evitar que los elementos de diseño sean arrastrados fuera del lienzo visible.
  - Iconografía diferenciada de zoom (`ZoomIn` y `ZoomOut` con símbolos `+` y `-` integrados) para facilitar la identificación visual.

### 4. Exportación Opaque-Canvas 8K
- **Resolución Profesional**: Exportación mínima garantizada a 2560px de ancho.
- **Consistencia Cromática**: Motor de exportación que combina el buffer WebGL transparente sobre un Canvas 2D con fondo opaco (sólido o degradado) para evitar pérdidas de contraste en visores externos.

---

## Instalación y Ejecución

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Ejecutar el servidor en desarrollo:**
   ```bash
   npm run dev
   ```
   El servidor se abrirá en `http://localhost:5173/`.

3. **Compilar para producción:**
   ```bash
   npm run build
   ```

---

## Estructura del Proyecto

```text
pacdora_sample_mockupMKR/
├── .agents/                      # Configuración de agentes y habilidades
├── docs/                         # Documentación técnica y planes
├── public/                       # Activos estáticos (modelos GLB, imágenes)
│   ├── shirt_baked.glb           # Modelo 3D de la camiseta
│   └── wrapstudio-pro/           # Editor vehicular pro
├── src/
│   ├── components/
│   │   ├── ControlPanel.tsx      # Configuración lateral (colores, capas, textos)
│   │   ├── MockupViewer.tsx      # Renderizador WebGL, decodificación 3D y cámara
│   │   ├── DielineWorkspace.tsx  # Workspace plano 2D
│   │   └── CarWrapWorkspace.tsx  # Workspace de vehículos
│   ├── App.tsx                   # Estado global y enrutamiento
│   ├── index.css                 # Sistema de diseño, temas y tipografías
│   └── main.tsx                  # Punto de entrada de React
├── system_contract.md            # Reglas arquitectónicas inviolables
├── report.html                   # Informe interactivo del estado del sistema
└── package.json                  # Scripts y dependencias
```

---

## Tecnologías Utilizadas
- **React 18** (Vite)
- **Three.js** / **React Three Fiber** / **Drei** (Motor gráfico 3D)
- **HTML5 Canvas API** (Procesamiento y recorte 2D de alta resolución)
- **Framer Motion** (Micro-animaciones UI)
- **Tailwind CSS** & Vanilla CSS (Diseño responsivo y Glassmorphism)
