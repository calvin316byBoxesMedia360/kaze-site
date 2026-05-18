# 🎨 BRIEF UI/UX — Primer Test de Diseño MVP
## Kaze Designs · Sitio Web

> **Documento**: UIUX-TEST-001  
> **Tipo**: Primer prototipo / test de diseño visual  
> **Estado**: Listo para equipo de diseño  
> **Fecha**: 15 mayo 2026  
> **Entregable esperado**: Mockup de alta fidelidad (Figma) de la página Home únicamente  
> **No es**: El diseño final — es un primer test para validar dirección visual

---

## CONTEXTO RÁPIDO DEL PROYECTO

**Cliente**: KAZE Custom Apparel & Signs  
**Ubicación**: 347 Main Street, Watsonville, CA  
**Teléfono**: 831-319-1837 · **Instagram**: @kaze_designs  
**Qué hace**: Letreros luminosos, bordado, serigrafía, apparel personalizado, stickers y merchandising  
**Distribución**: 70% del hero debe hablar de Letreros / 30% Apparel  
**Objetivo del sitio**: Generar cotizaciones — no es ecommerce, es generación de leads  

---

## LO QUE EL DISEÑADOR NECESITA SABER

### El cliente en una frase
> Empresa local de 10+ años, experta, que trata a sus clientes como socios — no como números. Quieren transmitir calidad, experiencia y calidez profesional.

### Lo que el visitante debe entender en 5 segundos
1. Kaze hace letreros luminosos y ropa personalizada
2. Tienen experiencia real (no son improvisados)
3. Puedo cotizar fácil y rápido

### Tono visual
- **Urbano y creativo** — no corporativo ni frío
- **Blanco y limpio** como base — no oscuro ni recargado
- Contrastes fuertes con los acentos de color
- Sensación premium pero accesible

---

## IDENTIDAD VISUAL

### Logo

**Archivo**: `KAZE LOGO.jpg` (en carpeta `assets-originales/`)  
**Descripción**: Letras "KAZE" grandes con "Custom Apparel & Signs" en cursiva — marco circular con patrón griego — **todo en dorado sobre fondo negro**  
**Importante**: El logo tiene su propio estilo premium. Debe respetarse tal cual en el sitio.

### Paleta de colores

```
--white:   #ffffff    → Fondo principal del sitio
--paper:   #f7f8f5    → Fondo de secciones alternas
--ink:     #1a1a1a    → Texto principal
--red:     #c8333f    → Acento 1 · CTAs · Highlights · Urgencia
--green:   #22c55e    → Acento 2 · Badges activos · Éxito · Checks
--gold:    #D4A843    → Del logo · Detalles premium · Quote decorativo
--dark:    #101820    → Secciones oscuras (hero neón, footer)
```

**Gradiente animado del CTA principal:**
```css
background: linear-gradient(90deg, #e83e8c, #ff3b30, #0066ff, #00d084);
```

### Tipografía sugerida

| Uso | Fuente | Peso |
|-----|--------|------|
| Headlines | **Inter** o **Outfit** | 700 (Bold) |
| Subheadlines | Inter | 500 (Medium) |
| Body / copy | Inter | 400 (Regular) |
| Labels pequeños | Inter | 500, uppercase + letter-spacing |

*(Ambas fuentes son Google Fonts — gratis y de carga rápida)*

### Estilo de UI components

| Componente | Especificación |
|------------|----------------|
| **Bordes redondeados** | 12-20px en cards, 8px en botones |
| **Sombras** | Sutiles — `0 4px 24px rgba(0,0,0,0.08)` |
| **Glassmorphism** | En overlays del hero video: `rgba(255,255,255,0.15)` + `blur(16px)` |
| **Spacing base** | 8px grid |
| **Iconos** | Lucide Icons o Heroicons (outline style) |

---

## ENTREGABLE — SOLO PÁGINA HOME

El equipo de diseño debe producir **únicamente el mockup del Homepage** en esta primera iteración.

### Secciones del Home (en orden)

---

### SECCIÓN 1 — HERO (pantalla completa)

**Desktop (1440px):**
```
┌──────────────────────────────────────────────────────┐
│  [NAVBAR: Logo Kaze | Letreros | Apparel | Portafolio | Cotizar →]  │
├──────────────────────────────────────────────────────┤
│                                                      │
│     FONDO: Video o foto oscura con letrero neón      │
│            encendido en ambiente oscuro              │
│                                                      │
│   Tu marca,                                          │
│   hecha realidad.          [Glassmorphism card:      │
│                             "Letreros · Apparel      │
│   Letreros luminosos,       Bordado · Señalética"]   │
│   uniformes y más —                                  │
│   diseñados en Watsonville.                          │
│                                                      │
│   [Cotiza tu proyecto]  [Ver nuestros trabajos]      │
│   (botón rojo)           (botón outline)             │
│                                                      │
│   +10 años · 347 Main St, Watsonville · 831-319-1837 │
└──────────────────────────────────────────────────────┘
```

**Mobile (390px):**
```
┌────────────────────────┐
│ [Logo]    [☰ Menú]     │
├────────────────────────┤
│                        │
│  Foto vertical premium │
│  (prenda o letrero)    │
│                        │
│  Tu marca,             │
│  hecha realidad.       │
│                        │
│  [Cotiza tu proyecto]  │
│  [831-319-1837]        │
│                        │
└────────────────────────┘
```

**Notas para el diseñador:**
- El fondo del hero puede ser una foto oscura (ambiente de letrero encendido) o la foto de la sesión BoxesMedia con overlay oscuro
- El texto del headline va sobre el fondo oscuro — blanco o dorado
- El botón CTA principal lleva el gradiente multicolor animado
- Los datos de contacto (+10 años, dirección) van pequeños debajo de los CTAs

---

### SECCIÓN 2 — LO QUE HACEMOS (4 cards)

```
┌──────────────────────────────────────────────────────┐
│     Personalización completa para tu negocio          │
│   Desde el letrero de tu local hasta la camiseta     │
│              de tu equipo — Kaze lo hace.             │
├────────────┬───────────┬───────────┬─────────────────┤
│ 💡         │ 👕         │ 🪡         │ ✂️              │
│ Letreros   │ Ropa       │ Bordado &  │ Stickers,       │
│ Luminosos  │ Personali- │ Silkscreen │ Vinil & Más     │
│            │ zada       │            │                 │
│ Rótulos LED│ Camisetas, │ Acabados   │ Stickers de     │
│ neón,      │ hoodies,   │ premium    │ corte, vinil    │
│ acrílico   │ gorras y   │ con maq.   │ adhesivo y      │
│ retroil.   │ uniformes  │ industrial │ merch corp.     │
│            │            │            │                 │
│ Ver →      │ Ver →      │ Conocer →  │ Ver →           │
└────────────┴───────────┴────────────┴─────────────────┘
```

**Notas:**
- Fondo blanco o paper (#f7f8f5)
- Cards con sombra sutil y borde redondeado 16px
- El ícono de cada card puede llevar el color acento correspondiente
- "Ver →" en rojo (#c8333f)

---

### SECCIÓN 3 — CÓMO TRABAJAMOS (Timeline)

```
┌──────────────────────────────────────────────────────┐
│           Así de simple es trabajar con nosotros     │
│          Sin complicaciones. Sin sorpresas.           │
│                                                      │
│  [DÍA 1]        [DÍA 2-3]      [DÍA 4-6]  [DÍA 7-10]│
│  Consulta       Diseño          Producción  Entrega   │
│  Nos cuentas    Creamos el      Manos a     Listo     │
│  tu idea        mockup          la obra     para ti   │
│                                                      │
│  (línea conectora entre pasos con puntos o iconos)   │
└──────────────────────────────────────────────────────┘
```

**Notas:**
- Fondo oscuro (#101820) para contraste con las secciones blancas
- Números de día en color rojo o dorado
- Animación sugerida: cada paso aparece con fade al hacer scroll
- En mobile: los 4 pasos van en columna vertical

---

### SECCIÓN 4 — PROYECTOS / PORTAFOLIO (Carrusel)

```
┌──────────────────────────────────────────────────────┐
│      Lo que hemos construido para otros negocios     │
│         Cada proyecto es diferente. Todos            │
│          tienen algo en común: los clientes vuelven. │
│                                                      │
│  [◄]  [FOTO] ★★★★★  [FOTO] ★★★★★  [FOTO] ★★★★★  [►]│
│       "Nombre"        "Nombre"        "Nombre"       │
│       "Review corto"  "Review corto"  "Review corto" │
│                                                      │
│              ¿Tu proyecto podría ser el siguiente?   │
│              [Empieza aquí →]                        │
└──────────────────────────────────────────────────────┘
```

**Notas:**
- Fondo negro (#000000 o #101820)
- Cards con color filter overlay rojo o verde (a testear cuál se ve mejor con fotos de Kaze)
- Peek effect: las cards de los extremos se cortan a la mitad
- Stars en dorado (#D4A843)
- El carrusel se mueve automáticamente

---

### SECCIÓN 5 — ¿POR QUÉ KAZE? (Trust)

```
┌──────────────────────────────────────────────────────┐
│     Más de 10 años haciendo que los                   │
│           negocios se vean bien                       │
│                                                      │
│  [Copy de historia breve — 3 párrafos]               │
│                                                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐      │
│  │  +10 años  │  │ 30-50 ped  │  │ 6-10 pers  │      │
│  │ Experiencia│  │ /semana    │  │ en tu proy │      │
│  └────────────┘  └────────────┘  └────────────┘      │
│                                                      │
│  ╔════════════════════════════════════════════════╗  │
│  ║ "Nuestros clientes no son clientes, son socios ║  │
│  ║  Y eso se nota en cada proyecto." — KAZE       ║  │
│  ╚════════════════════════════════════════════════╝  │
└──────────────────────────────────────────────────────┘
```

**Notas:**
- Fondo blanco o paper
- Los 3 números van en cards con acento rojo o verde
- El quote va destacado — fondo dorado o borde izquierdo dorado grueso

---

### SECCIÓN 6 — CTA FINAL

```
┌──────────────────────────────────────────────────────┐
│     FONDO: Foto de letrero neón encendido            │
│            con overlay oscuro semitransparente       │
│                                                      │
│          ¿Listo para hacer realidad                  │
│               tu proyecto?                          │
│                                                      │
│    Cuéntanos qué necesitas y te respondemos          │
│                  el mismo día.                       │
│                                                      │
│    [Cotiza ahora — es gratis]  [831-319-1837]        │
│    (botón gradiente)           (botón outline)       │
└──────────────────────────────────────────────────────┘
```

**Notas:**
- Sección de alto impacto — foto real de letrero de Kaze si existe, sino foto de stock neón
- El botón principal lleva el gradiente multicolor animado
- El botón de teléfono en blanco outline

---

### NAVBAR (fija en scroll)

```
[LOGO KAZE]    Letreros Luminosos    Apparel & Bordado    Nuestro Trabajo    ¿Quiénes somos?    [Cotizar →]
```

**Notas:**
- Navbar transparente sobre el hero, blanca con sombra al hacer scroll
- El botón "Cotizar →" siempre en rojo (#c8333f) con texto blanco
- En mobile: hamburger menu lateral (drawer)

---

### FOOTER

```
┌──────────────────────────────────────────────────────┐
│ FONDO: #101820 (oscuro)                              │
│                                                      │
│ [LOGO]          Servicios       Contacto    Navegar  │
│ KAZE Custom     • Letreros      347 Main St Home     │
│ Apparel & Signs • Apparel       Watsonville Portafolio│
│ Watsonville, CA • Bordado       831-319-1837¿Quiénes?│
│ Desde 2014      • Stickers      @kaze_designs Cotizar│
│                 • Merch                              │
│                                                      │
│ "Calidad, Eficiencia y Dedicación — en cada proyecto"│
│                                                      │
│ © 2026 KAZE Custom Apparel & Signs · BoxesMedia360  │
└──────────────────────────────────────────────────────┘
```

---

## REFERENCIAS VISUALES PARA EL DISEÑADOR

| Concepto | Referencia |
|----------|------------|
| **Hero cinematográfico con overlays** | Spreadshirt.es — sección hero homepage |
| **Carrusel de proyectos con color filter** | customsignsmakers.com — sección "Our Recent Projects" |
| **Timeline de proceso** | customsignsmakers.com — "Your Order's Timeline" |
| **Efecto neón + dark section** | kingsofneon.com — hero y CTA section |
| **Glassmorphism** | glassmorphism.com (generador interactivo) |

---

## ESPECIFICACIONES TÉCNICAS DE ENTREGA

### Lo que el diseñador debe entregar

```
📂 UIUX-TEST-001-entregables/
├── 📄 kaze-home-desktop.fig       ← Archivo Figma (o link de Figma)
├── 📄 kaze-home-mobile.fig        ← Vista mobile del mismo frame
├── 🖼️ preview-desktop.png         ← Export PNG del mockup completo
├── 🖼️ preview-mobile.png          ← Export PNG mobile
└── 📄 notas-diseñador.md          ← Decisiones tomadas y preguntas
```

### Formatos de entrega

| Archivo | Especificación |
|---------|----------------|
| **Figma** | Frame 1440px desktop + 390px mobile |
| **Preview PNG** | 2x resolution, PNG |
| **Plazo sugerido** | 3-5 días hábiles |

---

## ASSETS DISPONIBLES PARA EL DISEÑADOR

| Asset | Estado | Dónde encontrarlo |
|-------|--------|-------------------|
| Logo KAZE (JPG) | ✅ Disponible | `assets-originales/KAZE LOGO.jpg` |
| Fotos sesión BoxesMedia | ✅ En Google Drive | Solicitar acceso al líder de proyecto |
| Paleta de colores | ✅ Definida | Este documento, sección "Identidad Visual" |
| Copys de todas las secciones | ✅ Disponibles | `copys/COPYS-001_website-kaze-designs.md` |
| Logo vectorial (SVG/AI) | ❌ Pendiente | Solicitar al cliente |

---

## PREGUNTAS ABIERTAS PARA EL CLIENTE

Antes de finalizar el diseño, estas preguntas deben responderse:

1. **Logo vectorial**: ¿Existe un archivo SVG o AI del logo, o solo el JPG?
2. **Foto principal del hero**: ¿Hay una foto de un letrero encendido en ambiente oscuro del portafolio de Kaze?
3. **Horario de atención**: ¿Cuál es el horario exacto de la tienda? (para el footer y contacto)
4. **Testimonios reales**: ¿Hay 3-5 reviews de clientes con nombre y texto que podamos usar en el carrusel?
5. **Verde del logo**: El logo actual es dorado/negro. ¿El verde brillante (#22c55e) es una dirección nueva o ya existe en algún material de marca?

---

## CHECKLIST DE REVISIÓN DEL MOCKUP

Antes de entregar el mockup, el diseñador debe verificar:

- [ ] Las 6 secciones del home están presentes (Hero, Servicios, Timeline, Carrusel, Trust, CTA)
- [ ] Existe versión desktop (1440px) Y mobile (390px)
- [ ] La paleta de colores corresponde exactamente a los tokens definidos
- [ ] El logo KAZE se ve correcto y no pixelado
- [ ] El gradiente del CTA principal está aplicado
- [ ] El efecto glassmorphism está presente en el hero (al menos 1 panel)
- [ ] Las secciones alternas rompen monotonía (blanca → oscura → blanca → oscura)
- [ ] Los textos usan el copy del documento COPYS-001 (no placeholders Lorem Ipsum)
- [ ] El número de teléfono 831-319-1837 y la dirección son visibles en footer
- [ ] El navbar tiene el botón "Cotizar →" en rojo

---

*Brief preparado por BoxesMedia360 · Proyecto Kaze Designs · 15 mayo 2026*  
*Cualquier duda sobre el brief, contactar al líder de proyecto antes de comenzar el diseño.*
