# 🎬 BRIEF DE PRODUCCIÓN — Video Hero Kaze Designs

> **Proyecto**: Kaze Designs — Tienda Virtual de Personalización  
> **Entregable**: Video hero cinematográfico para homepage  
> **Fecha**: 15 mayo 2026  
> **Estado**: Listo para producción

---

## 1. OBJETIVO DEL VIDEO

Crear un video corto (8-12 segundos en loop) que muestre visualmente el proceso de personalización de Kaze Designs. El visitante debe entender en **3 segundos** que Kaze personaliza productos con su marca/diseño.

**Referencia visual**: [Spreadshirt.es](https://www.spreadshirt.es/) — sección hero del homepage.  
La modelo interactúa con elementos de UI flotantes (efecto glassmorphism) para seleccionar prenda, color y diseño.

---

## 2. STORYBOARD — 4 Actos

### 🎬 ACTO 1 — "La Prenda" (0s - 3s)

```
┌─────────────────────────────────────────────────┐
│                                                 │
│         Fondo sólido o gradiente suave          │
│         (color de marca Kaze)                   │
│                                                 │
│    ┌─────────────────────────────────────┐       │
│    │  ╭───╮ ╭───╮ ╭───╮ ╭───╮ ╭───╮    │       │
│    │  │   │ │   │ │   │ │   │ │   │    │  ← Carrusel flotante (prendas en BLANK)    
│    │  ╰───╯ ╰───╯ ╰───╯ ╰───╯ ╰───╯    │       │
│    └─── glassmorphism (borde redondeado) ┘       │
│                                                 │
│              PRODUCTO / MODELO                  │
│           (foto de sesión BoxesMedia)            │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Lo que pasa**:
- Aparece el producto/modelo con una prenda base (ej: camiseta blanca)
- Un carrusel horizontal flotante con efecto glassmorphism se desliza desde la derecha
- Muestra miniaturas **en blanco (blank/placeholder)** de: camiseta, hoodie, gorra, polo, chaleco — sin color, sin diseño, silueta limpia
- Una mano o cursor "selecciona" una opción → la prenda cambia (corte de edición)

**🎵 Audio/ambiente**: Melodía dinámica y moderna que contraste con la cinemática del video. Debe sentirse energética, contemporánea y aspiracional. Buscar tracks con:
- Tempo medio-alto (110-130 BPM)
- Elementos electrónicos/synth modernos
- Build-up progresivo que acompañe los 4 actos
- Sin vocals (instrumental)
- Fuentes sugeridas: Artlist.io, Epidemic Sound, YouTube Audio Library (libre de derechos)

---

### 🎬 ACTO 2 — "El Color" (3s - 5s)

```
┌─────────────────────────────────────────────────┐
│                                                 │
│              PRODUCTO / MODELO                  │
│         (ahora con la prenda seleccionada)      │
│                                                 │
│         ┌────────────────────────┐              │
│         │  ⚫ ⚪ 🔵 🔴 🟢 🟡    │  ← Paleta de colores     
│         │  glassmorphism panel   │     flotante
│         └────────────────────────┘              │
│                                                 │
│      La prenda cambia de color                  │
│      (blanco → negro → rojo → azul)            │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Lo que pasa**:
- La paleta de colores aparece flotando (efecto glassmorphism)
- Círculos de color se iluminan uno a uno
- Con cada selección, la prenda en pantalla cambia de color (corte de edición o transición suave)
- Se detiene en el color elegido

---

### 🎬 ACTO 3 — "El Diseño" (5s - 8s)

```
┌─────────────────────────────────────────────────┐
│                                                 │
│              PRODUCTO / MODELO                  │
│         (prenda + color seleccionados)          │
│                                                 │
│                        ┌──────────┐             │
│                        │ DISEÑO 1 │             │
│                        ├──────────┤             │
│                        │ DISEÑO 2 │ ← Panel vertical
│                        ├──────────┤    de diseños
│                        │ DISEÑO 3 │             │
│                        └──────────┘             │
│                                                 │
│     El diseño aparece sobre la prenda →  ✨     │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Lo que pasa**:
- Panel vertical flotante con diseños/logos de ejemplo aparece desde la derecha
- Un diseño se "selecciona" (brillo o highlight)
- El diseño se aplica sobre la prenda con una animación suave
- Se ve el producto terminado: prenda + color + diseño

---

### 🎬 ACTO 4 — "El CTA" (8s - 10s)

```
┌─────────────────────────────────────────────────┐
│                                                 │
│              PRODUCTO TERMINADO                 │
│           (prenda + color + diseño)             │
│                                                 │
│     ┌───────────────────────────────────┐       │
│     │                                   │       │
│     │   ▶  PERSONALIZA EL TUYO         │  ← CTA gradiente    
│     │      gradiente animado            │    multicolor
│     │                                   │       │
│     └───────────────────────────────────┘       │
│                                                 │
│              Logo Kaze Designs                  │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Lo que pasa**:
- El producto terminado queda centrado
- Aparece un botón CTA grande con gradiente multicolor animado (rosa → rojo → azul → verde)
- El texto dice "Personaliza el Tuyo" o "Cotiza Ahora"
- Logo de Kaze Designs visible
- El video hace loop (vuelve al Acto 1)

---

## 3. CÓMO CREAR LOS OVERLAYS GLASSMORPHISM

El efecto glassmorphism es el estilo visual clave. Son paneles semitransparentes con desenfoque que flotan sobre la imagen/video.

### Características visuales del glassmorphism:

| Propiedad | Valor |
|-----------|-------|
| **Fondo** | Blanco al 15-25% de opacidad (`rgba(255, 255, 255, 0.15)`) |
| **Desenfoque** | Blur de 10-20px detrás del panel (`backdrop-filter: blur(16px)`) |
| **Borde** | 1px sólido blanco al 30% de opacidad |
| **Bordes redondeados** | 16-24px de radio |
| **Sombra** | Sutil, negra al 10% (`box-shadow: 0 8px 32px rgba(0,0,0,0.1)`) |

### Opción A — Crear overlays en software de edición de video

Si el equipo usa **After Effects, Premiere Pro, DaVinci Resolve o CapCut**:

1. **Crear las formas del panel** como capas rectangulares con esquinas redondeadas
2. **Aplicar opacidad** al 15-20%
3. **Aplicar desenfoque gaussiano** a la capa de fondo que queda detrás del panel (no al panel mismo)
4. **Agregar borde fino blanco** al panel (stroke de 1-2px, blanco al 30%)
5. **Animar entrada**: deslizar desde fuera de pantalla con easing suave (ease-out, 0.4s)

**En After Effects específicamente**:
```
1. Capa > Nuevo > Sólido (blanco)
2. Máscara rectangular con Feather = 0, Radio de esquina = 20px  
3. Opacidad de la capa = 18%
4. Efecto > Desenfoque > Desenfoque gaussiano en capa duplicada del fondo = 16px
5. Efecto > Generar > Trazo = 1.5px, blanco al 35%
```

### Opción B — Crear overlays como gráficos PNG y componer en video

Más sencillo para equipos sin experiencia en motion graphics:

1. **Diseñar los paneles en Figma, Canva o Photoshop**:
   - Rectángulo con esquinas redondeadas (20px)
   - Fill: blanco al 18%
   - Stroke: blanco al 30%, 1px
   - Efecto de sombra sutil
2. **Exportar como PNG con transparencia**
3. **Importar al editor de video** como capas superiores
4. **Animar posición**: keyframes de entrada y salida

### Opción C — Grabar pantalla de un prototipo web (⭐ RECOMENDADA para Kaze)

La más rápida y la que mejor se adapta al estilo Kaze:

1. **Crear un HTML/CSS** con los overlays glassmorphism animados
2. **Poner la foto/video del producto como fondo**
3. **Grabar pantalla** con las animaciones CSS funcionando
4. **Componer** el screencast sobre las fotos de BoxesMedia en el editor de video

```html
<!-- Ejemplo de overlay glassmorphism -->
<div style="
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
">
  <!-- Contenido del panel aquí -->
</div>
```

### Opción D — Remotion (video programático con React) ⭐

La opción más poderosa para crear la animación completa del hero con control total:

1. **Crear un proyecto Remotion** con las fotos de BoxesMedia como assets
2. **Programar cada acto** como una composición React con animaciones Spring
3. **Renderizar** a MP4/WebM directamente — sin edición manual
4. **Ventaja**: Se puede iterar infinitamente cambiando código, no re-editando video

Ver sección 7 para más detalles sobre Remotion.

---

## 4. ESPECIFICACIONES TÉCNICAS DE ENTREGA

### Formato del video:

| Especificación | Valor Desktop | Valor Mobile |
|----------------|--------------|--------------|
| **Resolución** | 1920 x 1080px (16:9) | 1080 x 1920px (9:16) |
| **Formato** | MP4 (H.264) + WebM (VP9) | MP4 (H.264) + WebM (VP9) |
| **Duración** | 8-12 segundos (loop seamless) | 5-8 segundos |
| **FPS** | 30fps | 30fps |
| **Bitrate** | 4-6 Mbps | 2-4 Mbps |
| **Tamaño máximo** | ≤5 MB | ≤3 MB |
| **Audio** | 🎵 Melodía dinámica moderna (instrumental, 110-130 BPM) | Misma pista, comprimida |
| **Color space** | sRGB | sRGB |

### Archivos a entregar:

```
📂 entregables/
├── 📂 desktop/
│   ├── kaze-hero-desktop.mp4          ← Video principal
│   ├── kaze-hero-desktop.webm         ← Versión ligera para Chrome/Firefox
│   └── kaze-hero-desktop-poster.webp  ← Frame estático (primer frame del video)
├── 📂 mobile/
│   ├── kaze-hero-mobile.mp4
│   ├── kaze-hero-mobile.webm
│   └── kaze-hero-mobile-poster.webp
└── 📂 fuentes/
    ├── proyecto-editable/             ← Proyecto de AE/Premiere/DaVinci/Remotion
    ├── audio/                         ← Pista de audio seleccionada (.mp3/.wav)
    └── assets-originales/             ← Fotos, PNGs de overlays, logos
```

### Poster frame (imagen de fallback):
- Es la imagen que se muestra mientras el video carga, o en navegadores sin soporte de video
- Debe ser el frame más impactante del video (producto terminado con diseño aplicado)
- Formato: **WebP** para web, **JPG** como fallback
- Calidad: máxima (≤200KB)

---

## 5. FOTOS DE LA SESIÓN BOXESMEDIA

### Qué fotos buscar del Drive:

| Tipo de foto | Uso en el video | Prioridad |
|-------------|-----------------|-----------|
| Producto sobre fondo limpio (blanco/gris) | Background principal del hero | 🔴 ALTA |
| Modelo vistiendo producto | Actos 1-3 del storyboard | 🔴 ALTA |
| Diferentes colores de una misma prenda | Transición del Acto 2 (cambio de color) | 🟡 MEDIA |
| Producto con diseño/logo aplicado | Acto 3 (resultado final) | 🔴 ALTA |
| Close-ups de texturas/detalles | Transiciones entre actos | 🟢 BAJA |

### Tratamiento de las fotos:

1. **Recortar** con fondo transparente si es necesario (remove.bg o herramienta de recorte manual)
2. **Igualar iluminación** entre todas las fotos (misma temperatura de color, exposición)
3. **Resolución mínima**: 2000px en el lado mayor
4. **Formato de trabajo**: PNG con transparencia para composición

---

## 6. GUÍA DE COLORES Y TIPOGRAFÍA

> ⚠️ **Nota**: Pendiente confirmar la identidad visual oficial de Kaze Designs. Usar estos valores como base inicial:

### Paleta provisional (extraída del documento de planeación):

| Color | Hex | Uso |
|-------|-----|-----|
| Ink (texto principal) | `#172026` | Textos sobre overlays |
| Accent (rojo Kaze) | `#c8333f` | CTAs, highlights |
| Accent 2 (teal) | `#1f7a8c` | Acentos secundarios |
| Dark (fondo hero) | `#101820` | Fondo del video si no hay foto |
| Paper (fondo claro) | `#f7f8f5` | Variante clara |
| Dorado/ámbar | `#ffcf66` | Badges, etiquetas premium |

### Gradiente del CTA:

```
Dirección: izquierda a derecha (90deg)
Paradas: rosa (#e83e8c) → rojo (#ff3b30) → azul (#0066ff) → verde (#00d084)
```

### Tipografía sugerida para overlays:

- **Headlines**: Inter Bold o Outfit Bold (700)
- **Labels**: Inter Medium (500)
- **Tamaño mínimo en video**: 24px para que sea legible en mobile

---

## 7. HERRAMIENTAS RECOMENDADAS POR NIVEL

### 🟢 Nivel Principiante (equipo sin experiencia en motion):
| Herramienta | Para qué | Costo |
|------------|----------|-------|
| **CapCut Desktop** | Edición de video + efectos | Gratis |
| **Canva Pro** | Crear los overlays glassmorphism como PNGs | ~$13/mes |
| **Remove.bg** | Recortar fondos de fotos | Gratis (limitado) |
| **Artlist.io / Epidemic Sound** | Música libre de derechos para la melodía | Suscripción |

### 🟡 Nivel Intermedio:
| Herramienta | Para qué | Costo |
|------------|----------|-------|
| **DaVinci Resolve** | Edición + composición profesional | Gratis |
| **Figma** | Diseñar overlays con precisión | Gratis |
| **HandBrake** | Comprimir y convertir a WebM | Gratis |

### 🔴 Nivel Avanzado (⭐ RECOMENDADO para Kaze):
| Herramienta | Para qué | Costo |
|------------|----------|-------|
| **Remotion** | Video programático con React — control total de la animación | Gratis (OSS) |
| **After Effects** | Motion graphics + composición | Adobe CC |
| **Premiere Pro** | Edición final | Adobe CC |

---

## 8. CHECKLIST DE REVISIÓN ANTES DE ENTREGAR

- [ ] El video comunica "personalización de productos" en los primeros 3 segundos
- [ ] Los overlays glassmorphism son legibles (contraste suficiente)
- [ ] Las transiciones entre actos son suaves (no cortes duros)
- [ ] El loop es seamless (último frame conecta con el primero)
- [ ] Existe versión desktop (16:9) Y mobile (9:16)
- [ ] El archivo MP4 pesa ≤5MB (desktop) / ≤3MB (mobile)
- [ ] Existe un poster frame (imagen estática .webp)
- [ ] Los colores coinciden con la paleta de Kaze
- [ ] La melodía dinámica moderna está sincronizada con las transiciones
- [ ] El audio es instrumental, sin vocals, 110-130 BPM
- [ ] Las prendas del carrusel se muestran en blank (sin color/diseño)
- [ ] El CTA gradiente es visible y llamativo
- [ ] Las fotos de BoxesMedia se ven nítidas (no pixeladas por zoom)
- [ ] Se entregaron los archivos editables (proyecto de edición)

---

## 9. TIMELINE SUGERIDO

| Día | Actividad |
|-----|-----------|
| **Día 1** | Revisar fotos del Drive, seleccionar las mejores, recortar fondos |
| **Día 2** | Diseñar overlays glassmorphism (Figma/Canva) o iniciar proyecto Remotion |
| **Día 3** | Componer video desktop: ensamblar fotos + overlays + animaciones + audio |
| **Día 4** | Componer versión mobile + sincronizar melodía con transiciones |
| **Día 5** | Exportar en todos los formatos, comprimir, crear poster frames, revisión con checklist ✅ |

---

## 10. REFERENCIAS VISUALES

| Concepto | Dónde verlo |
|----------|-------------|
| **Glassmorphism** | https://glassmorphism.com/ (generador interactivo) |
| **Referencia hero completo** | https://www.spreadshirt.es/ (sección hero) |
| **Gradientes animados** | https://grainy-gradients.vercel.app/ |
| **Paleta de colores** | Archivo de planeación en `planeacion-mvp/planeacion-kaze-designs.html` |

---

*Brief creado por el equipo técnico BoxesMedia × Kaze Designs*  
*Cualquier duda sobre este brief, consultar con el líder de proyecto.*
