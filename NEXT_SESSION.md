# NEXT_SESSION.md - Próxima Sesión Kaze

## Inicio Rápido (Nueva Terminal o Computadora)
Si vas a continuar el desarrollo desde otro terminal físico usando la misma cuenta:

1. **Clonar y Acceder:**
   ```bash
   git clone https://github.com/calvin316byBoxesMedia360/kaze-site.git
   cd kaze-site
   ```
2. **Instalar dependencias:**
   ```bash
   npm install
   cd kaze-studio
   npm install
   cd ..
   ```
3. **Configurar Entorno Local:**
   Crea un archivo `.env` en la raíz (dentro de `kaze-site-local/` si aplica o cárgalo en tu terminal):
   ```text
   RESEND_API_KEY=tu_api_key_de_resend
   NOTIFICATION_EMAIL=kazecustomdesign@yahoo.com
   ```
4. **Levantar Servidores:**
   * Para probar el sitio estático y la API localmente:
     ```powershell
     $env:PORT="4178"
     node kaze-site-local/server.js
     ```
     Abre: [http://localhost:4178/](http://localhost:4178/) y [http://localhost:4178/studio/](http://localhost:4178/studio/).
   * Para editar y previsualizar Kaze Studio en tiempo real:
     ```bash
     cd kaze-studio
     npm run dev
     ```

---

## Contexto del Proyecto
* **Producción:** Todo se compila y aloja en **Railway**: [https://kazedesignswtv1-production.up.railway.app](https://kazedesignswtv1-production.up.railway.app).
* **Integración Continua:** El servicio está vinculado al repositorio de GitHub. Cualquier `git push origin main` compilará y desplegará en minutos.
* **Kaze Studio:** La herramienta interactiva React se compila hacia `kaze-site-local/studio/` con `npm run build` en la carpeta `kaze-studio/`.
* **Correo:** Las cotizaciones se envían automáticamente al correo `kazecustomdesign@yahoo.com`.

---

## Siguientes Pasos Sugeridos
1. **Verificación de Resend en Producción:** Asegurarse de que la variable de entorno `RESEND_API_KEY` esté configurada correctamente en el panel de Railway para que los correos reales se envíen desde producción.
2. **Roadmap v2.0 (Next.js):** El código inicial de Next.js está en la carpeta `kaze-web/` para futuras migraciones de la landing page estática hacia una aplicación React server-side.
3. **Marketing y Contenido:** Agregar testimonios reales de clientes locales y fotos de trabajos de letreros instalados en Watsonville.
4. **Video de Presentación:** Generar una animación interactiva utilizando la acción **`genera presentacion remotion`** para mostrar la herramienta a nuevos usuarios.
