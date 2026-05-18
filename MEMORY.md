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
- Tipo de proyecto actual: sitio HTML estatico con servidor Node simple.
- Sitio local nuevo: `http://127.0.0.1:4178/`.
- Sitio local anterior/original: `http://127.0.0.1:4177/`.
- Regla principal: trabajar desde `Documents\Kaze` para nuevas iteraciones; dejar la carpeta original como respaldo.

## Modulos Principales
- `kaze-site-local/`: sitio local entregable, contiene `index.html`, `kaze-logo.jpg` y `server.js`.
- `preferencias-diseno.md`: documento vivo de preferencias visuales, inspiraciones, fases y prioridades.
- `copys/`: copywriting del sitio, voz de marca, estructura y datos oficiales.
- `ui-ux-test/`: brief UI/UX del primer MVP de Home.
- `planeacion-mvp/`: planeacion del MVP funcional.
- `briefs/`: briefs de produccion, incluyendo hero/video.

## Ultimo Checkpoint
Fecha local: 2026-05-17

Resumen:
- Se copio el proyecto desde Downloads a `C:\Users\boxes\Documents\Kaze`.
- Se inicializo Git en la nueva ubicacion.
- Se creo el primer commit base `af56eed`.
- Se confirmo que el servidor original sigue activo en `4177`.
- Se levanto la copia nueva en `4178` para distinguirla del original.
- Se agrego `.gitignore` para excluir logs locales de `kaze-site-local`.

Verificacion:
- `git status --short` limpio tras el commit base.
- `http://127.0.0.1:4178/` responde 200 con titulo `KAZE Custom Apparel & Signs | Watsonville, CA`.

## Decisiones Vigentes
- La fuente de trabajo desde ahora debe ser `C:\Users\boxes\Documents\Kaze`.
- La carpeta original en Downloads queda como respaldo historico.
- Para revisar la copia nueva usar `PORT=4178 node server.js` dentro de `kaze-site-local`, o mantener el proceso actual si sigue vivo.
- El objetivo del sitio es generacion de leads y cotizaciones, no ecommerce.
- El hero y narrativa deben priorizar letreros luminosos y senaletica, con apparel como segunda vertical.
- Los datos oficiales del cliente son: 347 Main Street, Watsonville, CA; 831-319-1837; Instagram `@kaze_designs`.

## Reglas Criticas
- No borrar ni sobrescribir la carpeta original sin confirmacion explicita.
- No commitear logs locales, secretos, credenciales ni archivos temporales.
- No asumir que `4177` es la copia nueva; actualmente `4177` corresponde al servidor original.
- Antes de cambios visuales, revisar `preferencias-diseno.md`, `copys/COPYS-001_website-kaze-designs.md` y `ui-ux-test/UIUX-TEST-001_primer-mvp-diseno.md`.
- Mantener el tono de marca: directo, calido, experto, urbano y profesional.

## Pendientes Conocidos
- Crear un README completo si el proyecto se compartira con otro editor/equipo.
- Decidir si se migrara el sitio estatico a Next.js u otro framework.
- Confirmar assets definitivos: version vectorial del logo, fotos profesionales y posibles videos.
- Si se sigue trabajando en `4178`, actualizar logs/servidores para evitar confusion con `4177`.
- Corregir mojibake/encoding en algunos documentos heredados si se van a entregar o publicar.

## Historial De Iteraciones

### 2026-05-17 - Copia a Documents y Git local
- Se copio `C:\Users\boxes\Downloads\Habilidades de Agentes\proyecto Kaze` a `C:\Users\boxes\Documents\Kaze`.
- Se inicializo Git en la copia nueva.
- Se creo `.gitignore`.
- Se hizo commit base `af56eed chore: import Kaze project`.
- Se verifico la copia nueva en `http://127.0.0.1:4178/`.
