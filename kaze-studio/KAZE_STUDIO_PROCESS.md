# Kaze Studio — Documento de Proceso

**Tipo:** Proyecto standalone portable (Vite + React + TypeScript + Tailwind CDN)  
**Carpeta:** `kaze-studio/`  
**Arrancar:** `npm install` → `npm run dev` → `http://localhost:5173`

---

## Visión del producto

Herramienta premium de mockup interactivo print-on-demand. Permite visualizar diseños sobre prendas físicas antes de ordenar. Pensada como valor agregado para clientes de Kaze, con flujo final hacia cotización.

**Flujo objetivo:**  
Configurar prenda → Subir arte → Ver mockup en tiempo real → Solicitar cotización

---

## Stack técnico

| Tecnología | Versión | Uso |
|------------|---------|-----|
| React | 19 | UI |
| TypeScript | 5.8 | Tipos |
| Vite | 6 | Dev server + build |
| Tailwind CSS | CDN (v3) | Estilos |
| lucide-react | 0.562 | Íconos |

**Nota sobre Tailwind:** Se usa via CDN (mismo patrón que el dashboard principal). No requiere PostCSS ni configuración de build.

---

## Arquitectura del componente

```
KazeStudio (src/KazeStudio.tsx)
├── CATALOG_DATA          — JSON: productos, colores, tallas, zonas de impresión
├── Estado principal      — step, config, design, activePanel
├── TopNavbar             — Stepper de 3 pasos
├── LeftToolbar           — Acciones rápidas (Lado, Limpiar, Zoom)
├── Canvas                — 3 capas: foto producto + tinte color + diseño
│   └── PrintArea         — Zona dinámica con handles visuales
├── RightSidebar
│   ├── Step1             — Producto / Color / Talla
│   └── Step2 (paneles)   — main / upload / removeWhite / colorProfile
└── LocationModal         — Frente y Espalda con zonas de impresión
```

**Técnica de render 3D:**  
Foto de producto en escala de grises (`grayscale + contrast`) → capa de color encima con `mix-blend-mode: multiply`. Funciona porque el fondo es blanco/neutro: el multiply deja el blanco intacto y tiñe las sombras.

---

## Fases de implementación

| Fase | Estado | Descripción |
|------|--------|-------------|
| 1 | ✅ Completada 2026-05-21 | Fundación funcional |
| 2 | Pendiente | Interactividad del canvas (drag, resize, undo/redo, texto) |
| 3 | Pendiente | Flujo de conversión (export PNG, cotización) |
| 4 | Pendiente | Diferenciación premium (plantillas, remove.bg, lifestyle) |

---

## FASE 1 — Completada 2026-05-21

### Fixes sobre el diseño original

| # | Problema | Solución |
|---|----------|----------|
| 1 | Upload simulado con URL hardcodeada | `input[type=file]` oculto + `URL.createObjectURL()` + cleanup con `revokeObjectURL` |
| 2 | Espalda ausente en el modal | Dos secciones separadas (Frente / Espalda) con imagen invertida `scaleX(-1)` |
| 3 | Bounds de Tailwind (PurgeCSS unsafe) | Tipo `PrintBounds {top, left, width, height}` aplicado via `style={}` |
| 4 | Solo camiseta con imagen | Cada `Product` tiene su `imageUrl`; canvas usa `activeProduct.imageUrl` |
| 5 | Sin TypeScript types | Interfaces `Product`, `PrintBounds`, `PrintLocation`, `DesignState` |
| 6 | Radio "Mantener Original" no hacía nada | Ambas opciones ahora actualizan `design.whiteRemoved` correctamente |

### Archivos del proyecto

```
kaze-studio/
├── index.html              — Entry HTML + Tailwind CDN + Inter font
├── package.json            — Deps mínimas (react, lucide-react, vite, ts)
├── vite.config.ts          — Config Vite básica, puerto 5173
├── tsconfig.json           — TypeScript estricto, jsx react-jsx
├── src/
│   ├── main.tsx            — ReactDOM.createRoot → <KazeStudio />
│   ├── index.css           — Reset + no-scrollbar utility
│   └── KazeStudio.tsx      — Componente principal (~400 líneas)
└── KAZE_STUDIO_PROCESS.md  — Este documento
```

---

## FASE 2 — Pendiente

### Drag & Drop del diseño
- Mover artwork dentro de la zona de impresión con mouse events
- `design.x` y `design.y` ya existen en el estado, listos para usar
- Opción: `react-draggable` (instalar) o mouse events nativos

### Resize con handles
- Las 4 esquinas ya existen visualmente (`.absolute -top-1.5 -left-1.5`)
- Faltan los `onMouseDown` handlers para resize proporcional
- `design.scale` ya existe en el estado

### Undo / Redo
```ts
// Añadir al estado:
const [history, setHistory] = useState<DesignState[]>([]);
const [histIdx, setHistIdx] = useState(-1);

// Cada cambio a design → pushHistory(newDesign)
// Botones Undo/Redo en toolbar izquierda (ya existen como botones dummy)
```

### Herramienta de texto
- Nuevo panel `activePanel === 'text'`
- Input libre + Google Fonts selector + color + tamaño
- Renderizar como `<div>` absoluto sobre la zona de impresión
- En Fase 3: merge al export PNG junto con el artwork

---

## FASE 3 — Pendiente

### Export PNG del mockup
- `html2canvas` (instalar: `npm i html2canvas`)
- Capturar el div del canvas → `canvas.toDataURL('image/png')` → download
- Botón "Descargar Mockup" en la toolbar o al finalizar

### Paso 3: Checkout / Cotización
- Tabla de cantidades por talla
- Precio base × cantidad con descuento por volumen (≥50 uds → 15% off)
- Generar resumen en PDF o enviarlo por WhatsApp/email

---

## FASE 4 — Diferenciación premium

- **Remove.bg API** — Remoción real de fondo por IA (sustituye `mix-blend-mode` workaround)
- **Plantillas** — Galería de artes prediseñadas por categoría
- **Lifestyle mockups** — Fotos en contexto (persona usando la prenda)
- **Guardado** — Persistencia de diseños por sesión/usuario (localStorage o Firebase)
- **Multi-layer** — Soporte para múltiples elementos (arte + texto + logo)

---

## Comandos de desarrollo

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo (hot reload)
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview
```
