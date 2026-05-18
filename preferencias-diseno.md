# 🎨 KAZE DESIGNS — Lista de Preferencias de Diseño

> **Documento vivo** | Última actualización: 15 mayo 2026  
> **Propósito**: Consolidar inspiraciones visuales, funcionales y de UX extraídas de sitios de referencia para guiar el desarrollo del proyecto Kaze Designs.  
> **Responsabilidad**: Cada preferencia incluye contexto de aplicación, funcionalidad esperada y nivel de complejidad técnica.  
> **Documento de planeación vinculado**: [planeacion-kaze-designs.html](file:///c:/Users/boxes/Downloads/Habilidades%20de%20Agentes/proyecto%20Kaze/planeacion-mvp/planeacion-kaze-designs.html)

---

## 📦 Assets Disponibles

| Asset | Estado | Ubicación | Notas |
|-------|--------|-----------|-------|
| **Fotos de sesión profesional** | ✅ Disponible | Google Drive (BoxesMedia) | Sesión fotográfica realizada por BoxesMedia. Usar para hero, catálogo y fichas de producto |
| **Logo Kaze Designs** | ❓ Pendiente confirmación | — | Verificar si existe versión vectorial |
| **Videos de productos** | ❓ Por definir | — | Evaluar si se necesita producción nueva o se usan fotos + animación |

---

## Índice de Fuentes de Inspiración
| # | Fuente | URL | Fecha de análisis |
|---|--------|-----|-------------------|
| 1 | Spreadshirt | https://www.spreadshirt.es/ | 15/05/2026 |
| 2 | La Tostadora | https://www.latostadora.com/ | 15/05/2026 |
| 3 | Owayo | https://www.owayo.es/ | 15/05/2026 |
| 4a | Kings of Neon | https://www.kingsofneon.com/ | 15/05/2026 |
| 4b | Custom Signs Makers | https://customsignsmakers.com/ | 15/05/2026 |

---

## PREFERENCIA #001 — Hero Cinematográfico con Simulación Interactiva

**Fuente**: Spreadshirt.es — Sección Hero del Homepage  
**Prioridad**: 🔴 ALTA (Herramienta central del proyecto)

### 📸 Lo que se observa

Un **video hero a pantalla completa** donde una modelo real interactúa con elementos de UI flotantes superpuestos (glassmorphism). La secuencia narrativa del video es:

1. **Selección de prenda** → Carrusel horizontal flotante con miniaturas de prendas (tank top, camiseta, sudadera, hoodie, etc.). La modelo "desliza" y selecciona una prenda, que cambia sobre ella en el video.
2. **Selección de color** → Aparece un CTA con gradiente multicolor (rosa → rojo → azul → verde) con texto "Create Now", sugiriendo la entrada al editor de personalización.
3. **Selección de diseño** → Panel vertical flotante con diseños disponibles. La modelo "toca" un diseño y éste se aplica sobre la prenda que lleva puesta, mostrando el resultado final en vivo.

### 🧠 Contexto de Aplicación en Kaze

Esta sección es **la pieza central de conversión** del sitio. En Kaze Designs, el visitante necesita entender en **menos de 10 segundos** que puede personalizar productos (ropa, uniformes, gorras, etc.) con sus propios diseños, logos o texto. Un hero cinematográfico logra esto sin necesidad de leer texto.

**Para Kaze, esta preferencia se traduce en:**

- Un **video/animación hero** que muestra el flujo completo: elegir prenda → elegir color → aplicar diseño/logo → ver resultado.
- Los elementos de UI flotantes (carrusel de prendas, panel de diseños) deben sentirse **táctiles e interactivos** visualmente, aunque en la primera versión puedan ser parte del video pre-renderizado.
- El CTA final debe llevar directamente al **configurador/mockup de producto** o al formulario de cotización.

### ⚙️ Funcionalidad Técnica Esperada

| Aspecto | Implementación MVP | Implementación Futura |
|---------|--------------------|-----------------------|
| **Video hero** | Video MP4/WebM pre-producido con overlays CSS (glassmorphism) | Video interactivo con Canvas API o WebGL que responda a hover/scroll |
| **Carrusel de prendas** | Overlay estático sincronizado con momentos del video | Carrusel funcional que filtra el catálogo real |
| **CTA gradiente** | Botón CSS con gradiente animado (`background-size` animation) | Botón conectado al configurador 3D |
| **Panel de diseños** | Overlay glassmorphism con diseños estáticos | Panel conectado a la galería de diseños del usuario |
| **Cambio de prenda en modelo** | Segmentos de video editados mostrando diferentes prendas | Composición en tiempo real con Canvas/WebGL |

### 🏗️ Complejidad Técnica

```
MVP:       ████████░░ 80% (video + CSS overlays + animaciones)
Completo:  ██████████ 100% (interactividad real + rendering dinámico)
```

### 🔒 Consideraciones de Seguridad y Rendimiento

- **Optimización de video**: Usar formato WebM para Chrome/Firefox, MP4 como fallback. Comprimir a ≤5MB para carga rápida.
- **Lazy loading**: El video debe usar `loading="lazy"` y `preload="metadata"` para no bloquear el First Contentful Paint.
- **Fallback mobile**: En conexiones lentas o mobile, mostrar una imagen estática con el CTA superpuesto.
- **Accesibilidad**: Incluir `aria-label` descriptivo, botón de pausa para el video, y texto alternativo para usuarios con movimiento reducido (`prefers-reduced-motion`).

### 📱 Análisis Mobile-First — Regla de los 3 Segundos

El hero debe generar **impacto total en los primeros 3 segundos** en pantalla de celular. Esto cambia significativamente la estrategia respecto a desktop:

#### Problema en mobile con el enfoque Spreadshirt:
- El video horizontal de Spreadshirt pierde impacto en portrait (9:16)
- Los overlays glassmorphism se comprimen y pierden legibilidad
- El ancho de banda móvil penaliza videos pesados

#### Estrategia propuesta para Kaze en mobile:

```
┌──────────────────────┐
│  SEGUNDO 0-1         │  → Foto de sesión BoxesMedia (producto estrella)
│  ┌──────────────────┐ │    con tratamiento visual premium
│  │                  │ │    Texto: "Tu marca, tu estilo"
│  │   📸 HERO IMG    │ │
│  │   (foto real     │ │
│  │    vertical)     │ │
│  │                  │ │
│  └──────────────────┘ │
├──────────────────────┤
│  SEGUNDO 1-2         │  → Micro-animación de categorías
│  ┌──┐ ┌──┐ ┌──┐     │    (iconos que aparecen con stagger)
│  │👕│ │🧢│ │🚗│     │    Ropa · Gorras · Wraps · Rótulos
│  └──┘ └──┘ └──┘     │
├──────────────────────┤
│  SEGUNDO 2-3         │  → CTA principal con gradiente animado
│  ┌──────────────────┐ │    "Cotiza tu proyecto"
│  │ ▶ COTIZA AHORA   │ │    + Botón secundario WhatsApp
│  └──────────────────┘ │
└──────────────────────┘
```

#### Diferencias Desktop vs Mobile:

| Aspecto | Desktop (16:9) | Mobile (9:16) |
|---------|----------------|---------------|
| **Hero media** | Video cinematográfico con modelo + overlays | Foto estática de alta calidad con animación CSS |
| **Tamaño de archivo** | ≤5MB (video WebM) | ≤200KB (imagen WebP + CSS animations) |
| **Categorías** | Carrusel horizontal flotante en video | Grid de iconos con stagger animation |
| **CTA** | Botón gradiente integrado en video | Botón sticky en bottom con gradiente |
| **Tiempo de carga** | ≤2s en broadband | ≤1s en 4G |
| **Impacto 3 segundos** | Narrativa visual completa (prenda→color→diseño) | Propuesta de valor + categorías + CTA inmediato |

#### Servicios a mostrar en hero (referencia: [planeación MVP](file:///c:/Users/boxes/Downloads/Habilidades%20de%20Agentes/proyecto%20Kaze/planeacion-mvp/planeacion-kaze-designs.html)):

La planeación define 4 pilares narrativos. En mobile, estos deben ser visibles en el primer scroll:

1. **🏷️ Marca tu negocio** → Logos, diseño gráfico, rótulos luminosos
2. **👔 Viste a tu equipo** → Uniformes, ropa personalizada, bordado
3. **📣 Promociona tus productos** → Productos promocionales, regalos exclusivos
4. **🚗 Transforma espacios** → Vinil, wraps comerciales, grabado láser

### 💡 Sugerencia Proactiva del Equipo Técnico

> **Producción del video hero**: Con las fotos de la sesión BoxesMedia, se puede crear el video hero con **Remotion** — componiendo las fotos reales con animaciones de overlays glassmorphism, transiciones entre productos y efectos de selección. Esto evita producir video nuevo y permite iterar rápidamente. Para mobile, las mismas fotos se usan como imágenes estáticas con animaciones CSS puras.

> **Fotos de Drive**: Solicitar acceso al Google Drive de BoxesMedia para inventariar las fotos disponibles, clasificarlas por categoría de servicio y determinar cuáles funcionan para hero, catálogo y fichas de producto.

---

## PREFERENCIA #002 — Transformación AI de Fotos Reales como Servicio de Valor Agregado

**Fuente**: La Tostadora — Sección "Tus fotos con efectos"  
**Prioridad**: 🟠 MEDIA-ALTA (Diferenciador competitivo + retención de usuario)

### 📸 Lo que se observa

La Tostadora ofrece una sección llamada **"Tus fotos con efectos"** donde el usuario sube una foto real y la plataforma la transforma con IA en estilos artísticos creativos que se aplican directamente al producto:

| Efecto | Descripción | Producto de ejemplo |
|--------|-------------|---------------------|
| **Manga** | Convierte la foto de una persona en estilo manga/anime japonés | Camiseta |
| **Animación 3D** | Transforma pareja real en personajes 3D tipo Pixar/Disney | Taza |
| **Anime** | Versión anime de la persona con ropas estilizadas | Camiseta oversize |
| **Acuarela** | Convierte foto grupal en pintura de acuarela | Placa decorativa |

**Flujo del usuario**:
1. Ve el catálogo de efectos con ejemplos visuales (foto original → resultado)
2. Selecciona un efecto + producto
3. Sube su foto (drag & drop, PNG/JPG/HEIC, max 15MB, mín 500px)
4. La IA transforma la foto en el estilo seleccionado
5. El resultado se aplica automáticamente al mockup del producto
6. El usuario ve el producto terminado y puede comprar/cotizar

**Lo que impresiona**:
- La foto original aparece en una esquina con una flecha → mostrando el "antes y después"
- El badge **"✂ Con tu foto"** diferencia estos productos del catálogo regular
- El resultado se ve inmediatamente sobre el producto (mockup en vivo)

### 🧠 Contexto de Aplicación en Kaze

Esta funcionalidad es un **diferenciador competitivo enorme** para Kaze Designs. La mayoría de tiendas de personalización local solo ofrecen: "envíanos tu diseño y lo imprimimos". Con AI Photo Effects, Kaze puede:

1. **Bajar la barrera de entrada**: El cliente no necesita tener un diseño listo, solo una foto
2. **Retener atención**: El factor "wow" de ver tu cara en estilo manga o 3D genera engagement viral
3. **Involucrar al cliente en el proceso creativo**: Se siente parte del diseño, no solo un comprador
4. **Generar contenido compartible**: Los resultados son tan divertidos que el usuario los comparte en redes (marketing orgánico gratuito)
5. **Aumentar ticket promedio**: Al ver el resultado, el cliente quiere más variantes/productos

**Para Kaze, esta preferencia se traduce en:**

- Sección dedicada **"Diseña con tu foto"** o **"Tu foto, tu estilo"** en el homepage
- Catálogo de efectos AI disponibles (manga, caricatura, acuarela, pop art, minimalista, etc.)
- Upload de foto con preview inmediato del resultado sobre el producto
- Integración con el flujo de cotización (el resultado transformado se adjunta automáticamente)

### ⚙️ Funcionalidad Técnica Esperada

| Aspecto | Implementación MVP | Implementación Futura |
|---------|--------------------|-----------------------|
| **Upload de foto** | Drag & drop con validación (PNG/JPG, max 10MB, mín 500px) | Captura desde cámara, recorte inteligente |
| **Transformación AI** | API de estilo transfer (Replicate, Stability AI, o Google Imagen) | Modelo propio fine-tuned con estilos de marca Kaze |
| **Efectos disponibles** | 4-6 estilos predefinidos (manga, 3D, acuarela, pop art, minimalista, retro) | Generación libre con prompts del usuario |
| **Preview en mockup** | Canvas 2D: resultado AI superpuesto en foto de producto | Mockup 3D interactivo con rotación |
| **Antes/después** | Foto original en miniatura con flecha al resultado | Slider interactivo antes/después |
| **Compartir resultado** | Botón de descarga + compartir en redes | Link único con OG preview para redes sociales |

### 🏗️ Complejidad Técnica

```
MVP:       █████████░ 90% (requiere integración con API de AI)
Completo:  ██████████ 100% (modelo propio + mockup 3D + sharing viral)
```

### 🔒 Consideraciones de Seguridad y Rendimiento

- **Privacidad de fotos**: Las fotos del usuario deben procesarse y eliminarse del servidor en un plazo definido (24-48h). No almacenar fotos sin consentimiento explícito.
- **Validación de archivos**: Verificar tipo MIME real (no solo extensión), limitar tamaño, escanear por contenido malicioso.
- **Rate limiting**: Máximo de transformaciones por sesión/IP para evitar abuso de la API de AI (costo por llamada).
- **Costos de API**: Cada transformación AI tiene costo (~$0.02-0.10/imagen). Monitorear uso y establecer límites.
- **CORS y uploads seguros**: Usar presigned URLs para subida directa a storage (no pasar por el servidor web).
- **Contenido inapropiado**: Filtro de contenido NSFW antes de procesar la foto con AI.

### 📱 Experiencia Mobile

```
┌──────────────────────┐
│  🎨 Diseña con tu foto  │  → Título de sección
├──────────────────────┤
│ ┌────────┐ ┌────────┐ │  → Grid 2 columnas
│ │ MANGA  │ │  3D    │ │    de efectos
│ │ 📷→🎨 │ │ 📷→✨ │ │    (foto→resultado)
│ └────────┘ └────────┘ │
│ ┌────────┐ ┌────────┐ │
│ │ACUAREL│ │POP ART│ │
│ │ 📷→🖼️ │ │ 📷→🌈 │ │
│ └────────┘ └────────┘ │
├──────────────────────┤
│ ┌──────────────────┐ │  → CTA
│ │ 📸 SUBE TU FOTO     │ │
│ └──────────────────┘ │
└──────────────────────┘
```

### 💡 Sugerencias Proactivas del Equipo Técnico

> **Potencial viral**: Esta funcionalidad puede ser la razón #1 por la que un visitante comparte el sitio de Kaze en redes. Considerar crear una landing page dedicada tipo "Transforma tu foto en arte" que funcione como herramienta de marketing independiente.

> **Estrategia de costos AI**: Ofrecer 1-2 transformaciones gratuitas como gancho. Después, requerir registro o solicitud de cotización para más. Esto convierte el efecto "wow" en un lead capturado.

> **Efectos alineados con servicios Kaze**: Además de estilos artísticos, incluir transformaciones útiles para el negocio: vectorización de logos, simplificación de arte para serigrafia, adaptación de fotos para bordado.

---

## PREFERENCIA #003 — Configurador 3D de Producto con Diseño en Tiempo Real

**Fuente**: Owayo.es — Configurador 3D ("configurador owayo 3D")  
**Prioridad**: 🟡 MEDIA (Aspiracional — implementar por fases)

### 📸 Lo que se observa

Owayo ofrece un **configurador 3D completo en navegador** donde el usuario personaliza prendas deportivas en tiempo real:

- **Modelo 3D rotable** → Click + drag para girar la prenda 360°. Se aprecian costuras, texturas, pliegues realistas
- **Pestañas de personalización**: Diseño (templates), Colores, Texto, Logo
- **Templates prediseñados** → Grid de miniaturas con patrones (Etape, Velocity, Attack, Break, etc.)
- **Cambio en tiempo real** → Al seleccionar un template, el modelo 3D actualiza colores y patrones instantáneamente
- **Controles de vista** → Zoom in/out, rotación, reset de vista
- **Acciones del usuario** → Guardar, Mis bocetos, Ejemplares, Revisión del diseño, Compartir
- **CTA final** → "Precio y plazo de entrega" + "Añadir a la cesta"

### 🧠 Contexto de Aplicación en Kaze — Análisis de Viabilidad

Tienes razón en dudar. Un configurador 3D como el de Owayo requiere:
- Modelos 3D profesionales de cada prenda (modelado + UV mapping + texturizado)
- Motor de rendering en navegador (WebGL/Three.js)
- Sistema de aplicación de texturas/colores/logos en tiempo real
- Optimización heavy para que funcione en mobile

**Esto es demasiado para un MVP.** Pero la buena noticia es que podemos llegar ahí por fases.

### 🛣️ Roadmap de 3 Fases — De Simple a 3D

```
FASE 1 (MVP)          FASE 2 (v2)           FASE 3 (v3)
Canvas 2D             Mockup 2.5D           3D Completo
─────────────         ─────────────         ─────────────
┌─────────┐           ┌─────────┐           ┌─────────┐
│         │           │    ╱╲   │           │  ╱    ╲ │
│  ┌───┐  │           │   ╱  ╲  │           │ ╱ 3D   ╲│
│  │ART│  │           │  │ ART│  │           │╲modelo ╱│
│  └───┘  │           │   ╲  ╱  │           │ ╲    ╱ │
│  FLAT   │           │    ╲╱   │           │  ╲  ╱  │
└─────────┘           └─────────┘           └─────────┘
Foto plana +          Foto producto con     Modelo 3D
logo/texto            perspectiva +         rotable +
superpuesto           sombras + color       texturas
                      dinámico              realistas

Complejidad: 30%      Complejidad: 60%      Complejidad: 100%
Tiempo: 1-2 sem       Tiempo: 3-4 sem       Tiempo: 8-12 sem
```

### ⚙️ Funcionalidad por Fase

| Característica | Fase 1 (MVP) | Fase 2 | Fase 3 (Owayo-level) |
|----------------|-------------|--------|----------------------|
| **Vista del producto** | Foto plana de la sesión BoxesMedia | Foto con perspectiva, múltiples ángulos | Modelo 3D rotable 360° |
| **Aplicar logo/diseño** | Canvas 2D: drag, resize, rotate sobre foto | Deformación de perspectiva del arte sobre la prenda | Proyección UV sobre mesh 3D |
| **Cambio de color** | Swap de foto por color (foto roja, azul, negra, etc.) | Color tinting dinámico con CSS/Canvas | Material color en tiempo real |
| **Texto personalizado** | Input → renderizado sobre canvas | Con fuentes, curvas y efectos | Texto sobre superficie 3D |
| **Zoom** | Pinch-to-zoom en la imagen | Zoom con detalle de textura | Zoom 3D con LOD |
| **Compartir** | Captura PNG del canvas → descarga/share | Link con preview social | Link + animación 360° |
| **Tech** | HTML5 Canvas + JavaScript puro | Fabric.js o Konva.js | Three.js + texturas |

### 🏗️ Complejidad Técnica

```
Fase 1 (MVP):  ███░░░░░░░ 30% — Canvas 2D, fotos de sesión, alcanzable rápido
Fase 2:        ██████░░░░ 60% — Fabric.js/Konva.js, perspectiva, más sofisticado
Fase 3:        ██████████ 100% — Three.js, modelos 3D, texturas, WebGL
```

### 📱 Experiencia Mobile por Fase

| Fase | Mobile Experience |
|------|-------------------|
| **Fase 1** | Foto del producto + botones para agregar logo/texto + swatches de color. Simple, rápido, funcional |
| **Fase 2** | Misma experiencia pero con preview más realista. Touch para mover/escalar el arte |
| **Fase 3** | Modelo 3D touch-rotable. Requiere optimización de performance para dispositivos de gama media |

### 💡 Recomendación del Equipo Técnico

> **Arrancar con Fase 1 es lo correcto.** Las fotos de la sesión BoxesMedia son el asset perfecto: foto del producto en fondo limpio + Canvas 2D para superponer logo/texto/diseño AI del usuario. Esto cubre el 80% del valor con el 30% del esfuerzo.

> **La Fase 2 es un upgrade natural** cuando Kaze valide que los clientes usan el mockup. Fabric.js o Konva.js permiten deformación de perspectiva, sombras y efectos más realistas sin saltar a 3D.

> **La Fase 3 solo tiene sentido** si Kaze crece a un volumen donde el 3D justifique la inversión en modelado de cada prenda. Owayo vende ropa deportiva a medida (tickets altos), eso justifica su inversión en 3D.

### 🔒 Consideraciones de Seguridad

- **Canvas tainted**: Si se cargan imágenes externas al canvas, CORS debe estar configurado para permitir `toDataURL()` (exportar resultado)
- **Tamaño de exports**: Limitar resolución del PNG exportado para no saturar storage
- **Sanitización de texto**: El input de texto del usuario debe sanitizarse contra XSS antes de renderizar

---

## PREFERENCIA #004 — Rótulos Luminosos / Signage como Vertical Principal + Protagonista del Hero

**Fuentes**: Kings of Neon (kingsofneon.com) + Custom Signs Makers (customsignsmakers.com)  
**Prioridad**: 🔴 CRÍTICA (Vertical principal del negocio — Kaze ha invertido en equipo)  
**Decisión clave**: ⭐ **Los rótulos luminosos deben ser protagonistas de la sección Hero**

### 📸 Lo que se observa en las referencias

**Kings of Neon** (premium, B2C+B2B):
- Hero con fondo oscuro y tipografía bold: "STAND OUT" — el neón brilla sobre la oscuridad
- CTA doble: "Design Your Neon" + "Upload Your Logo"
- Trust badges: 4.9★ con 1000+ reviews, logos de marcas (Lollapalooza, NFL)
- Categorías de producto: Neon Signs, Acrylic Backlit, 3D Letter Signs, Lightbox
- Ofrecen **mockup 3D gratuito en 24h** como gancho de conversión
- Case studies por industria: Weddings, Retail, Fitness, Cafes, Events, Corporate
- Propuesta de valor en 3 puntos: Design Consultants, Instant Quotes, 7-Day Turnarounds
- Learning Hub con guías educativas (precio, instalación, tecnología)

**Custom Signs Makers** (B2B, catálogo amplio):
- CTA directo: "Drop Your Design Here" + "GET A FREE QUOTE"
- Catálogo exhaustivo de 12 tipos de señalización
- Flujo simplificado: Comparte tu visión → Mockup gratuito → Producción y envío
- Stats de confianza: 10,000+ signs shipped, 5,000+ happy customers
- 4 pilares: Expert Consultation, Design & Production, Project Management, Fulfillment

### 🧠 Contexto de Aplicación en Kaze

Esto **no es una funcionalidad más** — es **el core del negocio**. Kaze ha invertido en equipamiento para producir rótulos luminosos. El sitio web debe reflejar esto como la capacidad principal.

**Impacto en la arquitectura del sitio:**

1. **Hero Section** → Los rótulos luminosos deben ser **uno de los protagonistas**. En el video hero, además de ropa personalizada, debe aparecer un rótulo neón brillando en un ambiente oscuro (efecto wow inmediato)
2. **Sección dedicada** → Página completa para el servicio de rótulos con:
   - Catálogo visual de tipos de señalización
   - Galería de trabajos realizados
   - Configurador básico (texto + color + tamaño)
   - CTA de cotización
3. **Trust building** → Case studies, fotos de instalaciones, testimonios

### 📌 Categorías de Señalización que Kaze puede ofrecer

Basado en ambas referencias y la inversión de Kaze en equipo:

| Categoría | Descripción | Ejemplo de uso | Prioridad MVP |
|-----------|-------------|----------------|---------------|
| **LED Neon Signs** | Letras/formas con tubo LED flex neón | Cafeterías, bares, salones de belleza | 🔴 ALTA |
| **Acrylic Backlit** | Letras acrílicas con retroiluminación LED | Logos de empresas, recepciones | 🔴 ALTA |
| **3D Channel Letters** | Letras 3D con iluminación frontal/trasera | Fachadas de tiendas | 🟡 MEDIA |
| **Lightbox Signs** | Cajas de luz con diseño impreso | Restaurantes, menús, directorios | 🟡 MEDIA |
| **Metal Backlit** | Letras metálicas con efecto halo | Hoteles, oficinas corporativas | 🟢 FUTURA |
| **Interior Office Signs** | Señalización interior sin iluminación | Recepciones, salas de juntas | 🟢 FUTURA |

### ⭐ Impacto en el Hero Section (DECISIÓN CRÍTICA)

El hero del MVP debe mostrar **dos verticales protagónicos**:

```
┌─────────────────────────────────────────────────┐
│  HERO VIDEO — Loop de 10-12 segundos              │
│                                                   │
│  ACTO 1-3: Ropa personalizada                     │
│  (prenda → color → diseño, como Spreadshirt)      │
│                                                   │
│  ACTO 4: TRANSICIÓN A NEON  ⭐                     │
│  ┌───────────────────────────────────────┐ │
│  │  Fondo se oscurece...                       │ │
│  │  Un rótulo neón se ENCIENDE con el logo     │ │
│  │  del cliente. Brillo, reflejos, ambiente.   │ │
│  │  💡✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨💡    │ │
│  └───────────────────────────────────────┘ │
│                                                   │
│  ACTO 5: CTA con gradiente animado                │
│  "Cotiza tu proyecto"                              │
└─────────────────────────────────────────────────┘
```

Esto comunica en un solo hero: **"Kaze personaliza tu ropa Y hace brillar tu marca con rótulos luminosos"**.

### ⚙️ Funcionalidad Técnica para el Vertical de Rótulos

| Aspecto | Implementación MVP | Implementación Futura |
|---------|--------------------|-----------------------|
| **Catálogo visual** | Grid de fotos con tipos de rótulos + descripción | Filtros por tipo, material, uso |
| **Cotización** | Formulario: tipo + texto + tamaño aprox + color + upload logo | Cotizador instantáneo con cálculo automático |
| **Preview/Mockup** | Mockup manual enviado en 24h (como Kings of Neon) | Preview en tiempo real tipo canvas |
| **Galería** | Carrusel de trabajos realizados con fotos reales | Case studies interactivos por industria |
| **Confianza** | Testimonios + números (X proyectos realizados) | Reviews verificados + Google Reviews |

### 🏗️ Complejidad Técnica

```
MVP:       ████░░░░░░ 40% — Página de servicio + formulario + galería
Completo:  ██████████ 100% — Configurador interactivo + cotizador automático + case studies
```

### 💡 Sugerencias Proactivas del Equipo Técnico

> **Efecto neón en CSS**: Para el sitio web, podemos crear un efecto de brillo neón puro con CSS (`text-shadow` + `box-shadow` + animación de pulso). Esto refuerza visualmente el servicio sin necesidad de fotos. Es muy impactante en dark mode.

> **Mockup gratuito como lead magnet**: Copiar la estrategia de Kings of Neon — "Sube tu logo y recibe un mockup 3D gratis en 24h". Esto convierte visitantes curiosos en leads calificados.

> **Foto vs Video para Hero neón**: Un rótulo neón encendido en la oscuridad es visualmente poderoso incluso como foto estática. En mobile, una foto de neón con efecto glow CSS es suficiente para impactar.

> **SEO local**: "Rótulos luminosos [ciudad]" es una búsqueda con intención comercial alta. Crear landing pages por ciudad/servicio.

---

## PREFERENCIA #005 — Carrusel Horizontal de Proyectos Recientes con Color Filter + Reviews

**Fuente**: Custom Signs Makers — Sección "Our Recent Projects"  
**Prioridad**: 🔴 ALTA (Social proof + portafolio en un solo componente)

### 📸 Lo que se observa

Un **carrusel horizontal automático** sobre fondo oscuro (negro) que combina galería de trabajos con testimonios de clientes:

- **Cards grandes** con foto del rótulo instalado (bordes redondeados ~16px)
- **Color filter overlay** → Un tinte verde/oliva semi-transparente aplicado sobre las fotos, dando cohesión visual a imágenes con iluminaciones muy distintas
- **Scroll horizontal continuo** → Se mueve automáticamente de izquierda a derecha, dinámico pero no frenético
- **Datos en cada card**:
  - Nombre del cliente (ej: "Tiffany Sadler", "Sharon", "Diana Yin")
  - Rating de 5 estrellas (★★★★★)
  - Review corto de 1-2 líneas
- **Peek effect** → Las cards de los extremos se cortan parcialmente, indicando que hay más contenido horizontal
- **Fondo negro** que hace que las fotos (con su filtro de color) brillen visualmente

### 🧠 Contexto de Aplicación en Kaze

Este componente resuelve **dos necesidades críticas** de Kaze en un solo lugar:

1. **Portafolio visual** → Muestra trabajos reales de Kaze (rótulos instalados, ropa entregada)
2. **Social proof** → Los testimonios con nombre y rating generan confianza instantánea
3. **Dinamismo** → El scroll automático mantiene la página viva sin requerir interacción

**Para Kaze, este patrón se aplica en:**
- **Homepage** → Sección "Nuestros Proyectos" debajo del hero
- **Página de rótulos** → Galería de trabajos de señalización
- **Página de ropa** → Entregas de uniformes/merch a empresas

### ⚙️ Funcionalidad Técnica

| Aspecto | Implementación |
|---------|----------------|
| **Scroll** | CSS `animation: scroll` con `@keyframes` translateX, o libreria como Embla/Swiper con autoplay |
| **Color filter** | CSS `filter` o pseudo-elemento `::after` con `background: rgba(color, 0.3)` + `mix-blend-mode: multiply` |
| **Cards** | Grid flex horizontal, `overflow-x: hidden` en contenedor, `gap: 16-24px` |
| **Peek effect** | `overflow: hidden` en contenedor con padding negativo o cards más anchas que el viewport |
| **Stars** | SVG icons o CSS unicode (★) con color dorado |
| **Responsive** | 4 cards desktop → 2 cards tablet → 1.5 cards mobile (medio card visible = peek) |
| **Pausa en hover** | `animation-play-state: paused` al hacer hover (accesibilidad) |

### 🎨 Color Filter — Detalle técnico

El filtro verde/oliva de Custom Signs Makers unifica fotos con iluminaciones muy distintas. Para Kaze:

```css
/* Opción 1: Pseudo-elemento con blend mode */
.project-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(100, 140, 80, 0.25); /* tinte verde suave */
  mix-blend-mode: multiply;
  border-radius: inherit;
  pointer-events: none;
}

/* Opción 2: Filter CSS directo */
.project-card img {
  filter: sepia(15%) saturate(120%) hue-rotate(30deg);
}
```

> **Nota**: El color del filtro deberá alinearse con la paleta final de Kaze. El verde de Custom Signs Makers funciona porque es su color de marca. Kaze podría usar un tinte basado en su accent color (teal `#1f7a8c` o rojo `#c8333f`).

### 🏗️ Complejidad Técnica

```
MVP:       ██░░░░░░░░ 20% — CSS puro + HTML estático, alcanzable en 1 día
Completo:  ████░░░░░░ 40% — Datos dinámicos + admin para agregar proyectos
```

### 💡 Sugerencia Proactiva

> **Infinite scroll CSS puro**: Este carrusel se puede hacer sin JavaScript usando `@keyframes` con `translateX` y duplicando las cards para crear un loop visual seamless. Es la implementación más liviana posible y funciona perfectamente en mobile.

---

## PREFERENCIA #006 — Timeline de Proceso + CTA con Fondo Animado 3D

**Fuente**: Custom Signs Makers — Secciones "Your Order's Timeline" + "Get Your Sign Quote Today"  
**Prioridad**: 🔴 ALTA (Transparencia de proceso + conversión visual)

### 📸 Lo que se observa

**A) Order's Timeline:**
- Fondo negro con layout de dos columnas: fotos a la izquierda, pasos a la derecha
- **4 fases con días explícitos**: Day 1 → Day 2 → Day 3-4 → Day 5-7
- Cada fase tiene:
  - Número de día en texto color highlight (verde/amarillo)
  - Título bold (Expert Consultation, Design & Production, Project Management, Fulfillment)
  - Ícono decorativo en estilo outline (monocromático)
  - Descripción de 2-3 líneas
- Fotos laterales muestran el proceso real (diseñadores trabajando, almacén)

**B) CTA "Get Your Sign Quote Today":**
- **Fondo**: Foto de rótulo neón ("COCKTAILS") con efecto de movimiento/parallax
- La imagen de fondo tiene un **sutil movimiento 3D** — se desplaza lentamente o responde al scroll, creando profundidad
- Texto centrado con tipografía bold + subtítulo en cursiva
- Botón CTA con borde simple (estilo outline) sobre el fondo
- El glow del neón en la foto genera contraste natural con el texto

### 🧠 Contexto de Aplicación en Kaze

**Timeline → Genera confianza y reduce fricción:**
El mayor miedo de un cliente al cotizar es: "¿y luego qué pasa?". Un timeline visual le dice exactamente qué esperar. Para Kaze, los pasos serían:

| Fase | Días | Nombre Kaze | Descripción |
|------|------|-------------|-------------|
| 1 | Día 1 | **Consulta y Diseño** | Revisamos tu logo/idea y creamos un mockup digital gratuito |
| 2 | Día 2-3 | **Aprobación y Producción** | Apruebas el diseño y arrancamos la producción |
| 3 | Día 4-6 | **Fabricación** | Tu producto cobra vida en nuestro taller |
| 4 | Día 7-10 | **Entrega e Instalación** | Recogida o instalación profesional en tu espacio |

**CTA con fondo 3D → Cierre de conversión:**
Colocar esta sección justo después del timeline. El visitante lee "así funciona" y abajo ve "cotiza ahora" con un fondo visualmente poderoso.

### 🌐 Sobre Efectos 3D en Web — Mi Opinión Técnica

**Sí, lo recomiendo.** Los efectos 3D son tendencia en 2025-2026, pero hay que usarlos con estrategia:

| Efecto 3D | Dónde usarlo en Kaze | Complejidad | Tecnología |
|-----------|----------------------|-------------|------------|
| **Parallax en scroll** | CTA de cotización, hero background | 🟢 Baja | CSS `background-attachment: fixed` o JS `translateY` basado en scroll |
| **Tilt on hover** | Cards de proyectos, cards de servicios | 🟢 Baja | CSS `perspective` + `rotateX/Y` en hover, o libreria vanilla-tilt.js (3KB) |
| **Profundidad en capas** | Hero section (fondo + producto + overlay a diferentes velocidades) | 🟡 Media | CSS `transform: translateZ()` con `perspective` en contenedor padre |
| **Floating elements** | Íconos del timeline, badges de servicios | 🟢 Baja | CSS `@keyframes float { transform: translateY(-10px) }` |
| **3D card flip** | Servicios (frente: icono, reverso: descripción) | 🟡 Media | CSS `rotateY(180deg)` con `backface-visibility: hidden` |

**Dónde NO usarlo:**
- No en toda la página (fatiga visual)
- No en textos largos o formularios (distracción)
- No en mobile sin `prefers-reduced-motion` check (accesibilidad + batería)

### ⚙️ Implementación Técnica

**Timeline (scroll-triggered):**
```css
/* Cada paso aparece con fade + slide al hacer scroll */
.timeline-step {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.6s ease-out;
}
.timeline-step.visible {
  opacity: 1;
  transform: translateY(0);
}
```

**CTA con parallax 3D:**
```css
.cta-section {
  position: relative;
  overflow: hidden;
  perspective: 1000px;
}
.cta-background {
  position: absolute;
  inset: -20%; /* extra size para movimiento */
  background-image: url('neon-sign.webp');
  background-size: cover;
  transform: translateZ(-1px) scale(1.5);
  /* Parallax: se mueve más lento que el scroll */
}
.cta-content {
  position: relative;
  z-index: 2;
  /* Glassmorphism overlay */
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
}
```

**Tilt hover en cards (vanilla-tilt.js):**
```html
<div class="project-card" data-tilt data-tilt-max="8" data-tilt-speed="400" data-tilt-glare data-tilt-max-glare="0.2">
  <!-- card content -->
</div>
<!-- vanilla-tilt.js = solo 3KB, sin dependencias -->
```

### 🏗️ Complejidad Técnica

```
Timeline:     ██░░░░░░░░ 20% — HTML/CSS + IntersectionObserver para scroll trigger
CTA Parallax: ███░░░░░░░ 30% — CSS transforms + foto de neón de fondo
3D Cards:     ██░░░░░░░░ 20% — vanilla-tilt.js (3KB) o CSS puro
```

### 💡 Sugerencias Proactivas

> **El timeline es una máquina de confianza**: Los clientes de personalización temen procesos largos e inciertos. Mostrar "Día 1: Mockup gratis" elimina la barrera de entrada.

> **Foto de neón para el CTA**: Usar una foto real de un trabajo de Kaze como fondo del CTA. Si aún no hay portfolio, una foto de stock de neón funciona temporalmente, pero el impacto se multiplica con trabajo propio.

> **3D sutil > 3D agresivo**: Un tilt de 5-8 grados en hover es elegante. 20 grados es un juego de feria. Menos es más.

---

## PREFERENCIA #007 — *(Pendiente — siguiente enlace del cliente)*

---

| Decisión | Estado | Notas |
|----------|--------|-------|
| Hero cinematográfico como pieza central | ✅ Confirmada | Referencia: Spreadshirt |
| Video pre-producido para MVP | 📋 Propuesta | Iterar a interactivo en v2 |
| Glassmorphism para overlays de UI | ✅ Confirmada | Consistente con tendencias 2026 |
| CTA con gradiente multicolor animado | ✅ Confirmada | Referencia: Spreadshirt |
| Remotion para producción de video | 💡 Sugerida | Pendiente aprobación |
| Transformación AI de fotos como servicio | ✅ Confirmada | Referencia: La Tostadora |
| Sección "Diseña con tu foto" en homepage | ✅ Confirmada | Diferenciador competitivo |
| Upload seguro de fotos de usuario | 📋 Requerido | Validación MIME + size + NSFW filter |
| Rate limiting en API de AI | 📋 Requerido | Control de costos |
| Mockup de producto MVP en Canvas 2D | ✅ Confirmada | Fase 1: fotos BoxesMedia + overlay |
| Configurador 3D tipo Owayo | 🟡 Fase 3 | Solo si el negocio escala y lo justifica |
| Roadmap de mockup en 3 fases | ✅ Confirmada | 2D → 2.5D → 3D |
| ⭐ Rótulos luminosos = protagonista del Hero | ✅ Confirmada | Kings of Neon + Custom Signs Makers |
| Vertical de signage como servicio principal | ✅ Confirmada | Kaze ha invertido en equipo |
| Mockup gratuito de rótulo como lead magnet | 💡 Sugerida | Estrategia Kings of Neon |
| Página dedicada a rótulos luminosos | 📋 Requerido | Con catálogo visual + formulario |
| Carrusel horizontal de proyectos + reviews | ✅ Confirmada | Ref: Custom Signs Makers |
| Color filter unificador en galería | ✅ Confirmada | Tinte alineado con paleta Kaze |
| Timeline de proceso ("Your Order's Timeline") | ✅ Confirmada | 4 fases con días explícitos |
| CTA con fondo neón + parallax 3D | ✅ Confirmada | Sección de alta conversión |
| Efectos 3D sutiles en el sitio | ✅ Confirmada | Tilt, parallax, float — solo en puntos clave |

---

## Stack Técnico Preliminar *(se irá definiendo con más preferencias)*

> ⚠️ **Nota**: El stack no está definido aún. Se consolidará cuando se tengan suficientes preferencias para tomar decisiones informadas sobre las herramientas necesarias.

| Capa | Candidatos | Decisión |
|------|-----------|----------|
| Framework | Next.js 15+ / Vite + React | Pendiente |
| Styling | Vanilla CSS + CSS Custom Properties | Pendiente |
| Animaciones | CSS Animations + Framer Motion / GSAP | Pendiente |
| Video/3D | HTML5 Video + Canvas API / Three.js | Pendiente |
| AI / Image Processing | Replicate / Stability AI / Google Imagen | Pendiente — Requiere evaluación de costos |
| File Storage | Firebase Storage / Cloudflare R2 / S3 | Pendiente — Para uploads de fotos |
| Backend | Firebase / Supabase | Pendiente |
| Deployment | Vercel / Firebase Hosting | Pendiente |

---

*Este documento se actualiza con cada nueva referencia proporcionada por el cliente.*
