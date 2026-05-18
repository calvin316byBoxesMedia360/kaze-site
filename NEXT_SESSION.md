# NEXT_SESSION.md - Proxima Sesion Kaze

## Inicio Rapido
1. Abrir `C:\Users\boxes\Documents\Kaze`.
2. Leer `MEMORY.md`.
3. Ejecutar:

```powershell
git status --short
```

4. Para servir la copia nueva:

```powershell
$env:PORT='4178'
node kaze-site-local\server.js
```

5. Abrir `http://127.0.0.1:4178/`.

## Contexto Importante
- `http://127.0.0.1:4177/` puede seguir apuntando a la copia original en Downloads.
- La copia nueva oficial para trabajar esta en `Documents\Kaze`.
- El commit base del repo nuevo es `af56eed`.
- El proyecto actualmente es HTML estatico, no Next.js.

## Antes De Editar
- Revisar `preferencias-diseno.md` para direccion visual.
- Revisar `copys/COPYS-001_website-kaze-designs.md` para voz y textos.
- Revisar `ui-ux-test/UIUX-TEST-001_primer-mvp-diseno.md` si se cambia la Home.

## Siguientes Pendientes Sugeridos
- Crear estructura de proyecto mas formal si se va a escalar: `README.md`, `assets/`, `docs/`.
- Normalizar encoding de documentos que muestran caracteres corruptos.
- Decidir si mantener HTML estatico o migrar a Next.js.
- Preparar remote Git si se quiere subir a GitHub.
