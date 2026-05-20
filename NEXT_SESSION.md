# NEXT_SESSION.md - Proxima Sesion Kaze

## Inicio Rapido
1. Abrir `C:\Users\boxes\Documents\Kaze`.
2. Leer `MEMORY.md`.
3. Ejecutar:

```powershell
git status --short
```

4. Para trabajar la version Next.js activa:

```powershell
cd kaze-web
npm run dev -- --hostname 127.0.0.1 --port 3000
```

5. Abrir:

```text
http://127.0.0.1:3000/
http://127.0.0.1:3000/technical
http://127.0.0.1:3000/habilidades-agentes.html
```

## Contexto Importante
- `http://127.0.0.1:4177/` puede seguir apuntando a la copia original en Downloads.
- La copia nueva oficial para trabajar esta en `Documents\Kaze`.
- Repo GitHub privado: `https://github.com/calvin316byBoxesMedia360/kaze-site`.
- Railway proyecto/servicio: `kaze-site`, ambiente `production`, root directory `kaze-site-local`.
- Railway esta configurado con repo `calvin316byBoxesMedia360/kaze-site`, branch `main`; falta completar/autorizar Railway GitHub App para que auto-deploy funcione con el repo privado.
- El commit base del repo nuevo es `af56eed`.
- El usuario confirmo que la version de interes es `kaze-web/` en Next.js.
- Version 1 vive en `/`.
- La variante paralela vive en `/technical` y actualmente se llama conceptualmente `Kaze Shop Studio`.
- La primera Technical Edition fue commiteada en `9a6a4e0 feat: add Kaze Technical Edition`.
- Despues del commit se redisenio `/technical` hacia un enfoque hibrido mas humano; esos cambios aun pueden estar sin commit.
- Hay skills locales del proyecto en `.agents/skills/`.
- No olvidar GEO/SEO local: Kaze es tienda fisica en Watsonville, CA, en Main Street, con enfoque en Monterey Bay / Santa Cruz County y negocios locales.

## Antes De Editar
- Revisar `preferencias-diseno.md` para direccion visual.
- Revisar `copys/COPYS-001_website-kaze-designs.md` para voz y textos.
- Revisar `ui-ux-test/UIUX-TEST-001_primer-mvp-diseno.md` si se cambia la Home.
- Revisar `kaze-web/AGENTS.md` antes de tocar codigo Next.
- Si se trabaja `/technical`, revisar `.agents/skills/kaze-technical-edition/SKILL.md` y `.agents/skills/kaze-responsive-ux/SKILL.md`.
- Si se toca copy, metadata o home, aplicar estrategia de ubicacion: Watsonville, CA; 347 Main Street; Monterey Bay; Santa Cruz County; servicio local para negocios, equipos y eventos.

## Siguientes Pendientes Sugeridos
- Revisar visualmente `/technical` en desktop y mobile; ajustar crop, jerarquia y copy si algo se siente frio o repetitivo.
- Hacer pasada GEO/SEO local en `kaze-web/`: metadata, JSON-LD, copy visible, contacto, areas atendidas y CTAs de cotizacion local.
- Corregir lint heredado en `kaze-web/src/app/page.tsx:25`.
- Decidir si commitear `.agents/skills/`, `kaze-web/public/habilidades-agentes.html` y el rediseño actual de `/technical`.
- Decidir que partes del enfoque `Kaze Shop Studio` se migraran a Version 1.
- Crear estructura de docs mas formal si se va a escalar: `README.md`, `assets/`, `docs/`.
- Normalizar encoding de documentos que muestran caracteres corruptos.
- Preparar remote Git si se quiere subir a GitHub.
- Completar conexion Railway GitHub App, luego desplegar desde source y generar dominio publico.

## Referencia Estatica
Si se necesita revisar la version estatica historica:

```powershell
$env:PORT='4178'
node kaze-site-local\server.js
```

Abrir `http://127.0.0.1:4178/`.
