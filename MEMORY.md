# MEMORY.md - Memoria Viva del Proyecto Kaze

## Proposito
Este archivo es la memoria operativa corta del proyecto. Debe leerse al inicio de cada nueva sesion antes de tocar codigo o documentos.

## Regla De Uso Para Cada Sesion
Al iniciar:
1. Leer `MEMORY.md`.
2. Leer `NEXT_SESSION.md` si existe.
3. Ejecutar `git status --short`.
4. No revertir cambios existentes no hechos por la sesion actual.

Al cerrar una iteracion importante:
1. Actualizar `Ultimo Checkpoint`.
2. Agregar entrada a `Historial De Iteraciones`.
3. Actualizar docs relacionados si aplica.
4. Verificar el sitio local si hubo cambios visuales.
5. Hacer commit si fue solicitado o si se quiere asegurar el checkpoint.

## Estado Actual Del Proyecto
- Proyecto: KAZE Custom Apparel & Signs / Kaze Designs.
- Ubicacion nueva de trabajo: `C:\Users\boxes\Documents\Kaze`.
- Ubicacion original preservada: `C:\Users\boxes\Downloads\Habilidades de Agentes\proyecto Kaze`.
- Git: repo local inicializado en la ubicacion nueva, rama `main`.
- Commit base: `af56eed chore: import Kaze project`.
- Version activa para iterar: `kaze-web/`, proyecto Next.js.
- Version estatica historica: `kaze-site-local/`, HTML estatico con servidor Node simple.
- URL Next local: `http://127.0.0.1:3000/`.
- URL Kaze Shop Studio / Technical: `http://127.0.0.1:3000/technical`.
- URL informe de habilidades: `http://127.0.0.1:3000/habilidades-agentes.html`.
- Sitio estatico local nuevo: `http://127.0.0.1:4178/`.
- Sitio estatico anterior/original: `http://127.0.0.1:4177/`.
- Regla principal: trabajar desde `Documents\Kaze` para nuevas iteraciones; dejar la carpeta original como respaldo.

## Modulos Principales
- `kaze-site-local/`: sitio local entregable, contiene `index.html`, `kaze-logo.jpg` y `server.js`.
- `kaze-web/`: aplicacion Next.js activa para desarrollo. Ruta `/` conserva Version 1 y ruta `/technical` contiene la variante Kaze Shop Studio.
- `kaze-web/public/technical/`: imagenes editadas para la version tecnica/hibrida.
- `.agents/skills/`: skills locales instaladas para Kaze (`kaze-nextjs-frontend`, `kaze-technical-edition`, `kaze-responsive-ux`, `kaze-visual-ux-auditor`, `kaze-design-system`).
- `public/informe-habilidades.html`: inventario de habilidades fuente; copiado tambien a `kaze-web/public/habilidades-agentes.html` para servirlo con Next.
- `preferencias-diseno.md`: documento vivo de preferencias visuales, inspiraciones, fases y prioridades.
- `copys/`: copywriting del sitio, voz de marca, estructura y datos oficiales.
- `ui-ux-test/`: brief UI/UX del primer MVP de Home.
- `planeacion-mvp/`: planeacion del MVP funcional.
- `briefs/`: briefs de produccion, incluyendo hero/video.

## Ultimo Checkpoint
Fecha local: 2026-05-18

Resumen:
- El usuario confirmo que la version Next.js (`kaze-web/`) es la version de interes.
- Se levanto Next en `http://127.0.0.1:3000/`.
- Se creo y commiteo la primera version de Kaze Technical Edition en `/technical`.
- Se importaron imagenes editadas a `kaze-web/public/technical/`.
- Se redisenio `/technical` hacia un enfoque hibrido mas humano: `Kaze Shop Studio`.
- Se instalaron skills locales del proyecto en `.agents/skills/`.
- Se expuso el informe de habilidades en `http://127.0.0.1:3000/habilidades-agentes.html`.
- Se reemplazaron todas las imagenes placeholder de Unsplash en el MVP (landing page larga) por 16 imagenes customizadas generadas por IA, almacenadas en `assets/images`.

Verificacion:
- `npm run build` en `kaze-web/` paso correctamente despues del rediseno de `/technical`.
- `http://127.0.0.1:3000/technical` responde 200.
- `http://127.0.0.1:3000/habilidades-agentes.html` responde 200.
- `npm run lint` falla por un error heredado en `kaze-web/src/app/page.tsx:25` (`react-hooks/set-state-in-effect`) y una advertencia de fuente en `layout.tsx`; no es causado por la ultima modificacion de `/technical`.

## Decisiones Vigentes
- La fuente de trabajo desde ahora debe ser `C:\Users\boxes\Documents\Kaze`.
- La carpeta original en Downloads queda como respaldo historico.
- Para cambios nuevos, trabajar principalmente en `kaze-web/`.
- Mantener Version 1 en `/` intacta salvo instruccion explicita.
- Usar `/technical` como variante paralela Kaze Shop Studio: tecnico, editorial, brillante en mobile, pero con tono humano/local.
- Para revisar Next usar `http://127.0.0.1:3000/`.
- Para revisar la copia estatica usar `PORT=4178 node server.js` dentro de `kaze-site-local`, solo si se necesita comparar o rescatar contenido.
- El objetivo del sitio es generacion de leads y cotizaciones, no ecommerce.
- El hero y narrativa deben priorizar letreros luminosos y senaletica, con apparel como segunda vertical.
- Los datos oficiales del cliente son: 347 Main Street, Watsonville, CA; 831-319-1837; Instagram `@kaze_designs`.
- Aplicar GEO/SEO local en todas las versiones: Kaze debe posicionarse como tienda fisica en Watsonville, CA, sirviendo Monterey Bay / Santa Cruz County y negocios locales cercanos.

## Reglas Criticas
- No borrar ni sobrescribir la carpeta original sin confirmacion explicita.
- No commitear logs locales, secretos, credenciales ni archivos temporales.
- No asumir que `4177` es la copia nueva; actualmente `4177` corresponde al servidor original.
- Antes de cambios visuales, revisar `preferencias-diseno.md`, `copys/COPYS-001_website-kaze-designs.md` y `ui-ux-test/UIUX-TEST-001_primer-mvp-diseno.md`.
- Para cambios Next, revisar `kaze-web/AGENTS.md` y las skills locales relevantes en `.agents/skills/`.
- Mantener el tono de marca: directo, calido, experto, urbano y profesional.
- No volver la version tecnica demasiado fria o repetitiva; balancear precision con trato humano, negocio local y guia al cliente.
- No eliminar ni diluir la estrategia de ubicacion: mencionar de forma natural Watsonville, Main Street, Monterey Bay, Santa Cruz County y la atencion local cuando aplique.
- **AL ACTUALIZAR EL INFORME HTML (`INFORME_PROYECTO_KAZE.html`), NUNCA SOBRESCRIBIR LA VERSIÓN ACTUAL.** Crear siempre una nueva pestaña de versión (ej. `v3.0`) y archivar la versión anterior como pestaña histórica para mantener la bitácora intacta.

## Pendientes Conocidos
- Crear un README completo si el proyecto se compartira con otro editor/equipo.
- Decidir si se commitean las skills locales `.agents/skills/` y el informe `kaze-web/public/habilidades-agentes.html`.
- Corregir lint heredado en `kaze-web/src/app/page.tsx:25`.
- Revisar visualmente `/technical` en desktop y mobile con navegador/screenshot.
- Decidir que elementos de `Kaze Shop Studio` migraran eventualmente a Version 1.
- Implementar una pasada GEO/SEO local en `kaze-web/`: metadata, JSON-LD, copy visible, contacto, mapa/ubicacion, areas atendidas y CTAs de tienda local.
- Confirmar assets definitivos: version vectorial del logo y posibles videos (ya se integraron placeholders 4K por IA).
- Si se sigue trabajando en `4178`, actualizar logs/servidores para evitar confusion con `4177`.
- Corregir mojibake/encoding en algunos documentos heredados si se van a entregar o publicar.

## Historial De Iteraciones

### 2026-05-17 - Copia a Documents y Git local
- Se copio `C:\Users\boxes\Downloads\Habilidades de Agentes\proyecto Kaze` a `C:\Users\boxes\Documents\Kaze`.
- Se inicializo Git en la copia nueva.
- Se creo `.gitignore`.
- Se hizo commit base `af56eed chore: import Kaze project`.
- Se verifico la copia nueva en `http://127.0.0.1:4178/`.

### 2026-05-18 - Next.js y Kaze Technical Edition
- Se confirmo que la version Next.js `kaze-web/` es la version principal de interes.
- Se levanto la app en `http://127.0.0.1:3000/`.
- Se creo la ruta `/technical` como variante paralela de diseno.
- Se agregaron imagenes editadas en `kaze-web/public/technical/`.
- Se hizo commit `9a6a4e0 feat: add Kaze Technical Edition`.

### 2026-05-18 - Kaze Shop Studio e instalacion de skills locales
- Se analizo `public/informe-habilidades.html`.
- Se crearon skills locales en `.agents/skills/` para frontend Next, Technical Edition, responsive UX, auditoria visual y sistema de diseno.
- Se copio el informe a `kaze-web/public/habilidades-agentes.html`.
- Se redisenio `/technical` para recuperar calidez humana: `Kaze Shop Studio`, seccion `Built Around People`, copy menos robotico y overlays mas utiles.
- Verificacion: `npm run build` paso; `/technical` y `/habilidades-agentes.html` responden 200.

### 2026-05-18 - Nota GEO y estrategia de ubicacion
- El usuario pidio no olvidar aplicar GEO y estrategia de ubicacion para la tienda.
- Regla agregada: Kaze debe reforzar Watsonville, CA, Main Street, Monterey Bay / Santa Cruz County, tienda fisica, servicios locales y cotizacion cercana sin sonar artificial.

### 2026-05-18 - Reemplazo de Placeholders y Landing Page Larga
- Se reviso el MVP inicial (`index.html`) que funcionaba como landing page larga.
- Se detectaron 16 imagenes placeholder de Unsplash de baja fidelidad.
- Se generaron 16 imagenes nuevas con IA (4K, fotorrealistas) para las secciones Hero, Servicios, Proyectos, Historia y Catalogos.
- Se reemplazaron las URLs y se guardaron los assets localmente en `assets/images`.
