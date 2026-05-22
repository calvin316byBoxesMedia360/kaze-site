# KAZE Custom Apparel & Signs / Kaze Designs

Repositorio y documentación oficial para el sitio web y la herramienta interactiva de personalización de KAZE Custom Apparel & Signs.

## 🚀 Despliegue en Vivo
* **Producción (Railway):** [https://kazedesignswtv1-production.up.railway.app](https://kazedesignswtv1-production.up.railway.app)
* **Kaze Studio (Personalizador):** [https://kazedesignswtv1-production.up.railway.app/studio/](https://kazedesignswtv1-production.up.railway.app/studio/)
* **Destinatario de Cotizaciones:** `kazecustomdesign@yahoo.com`

---

## 💻 Configuración para un Nuevo Terminal Físico
Para clonar, correr y continuar el desarrollo en otra computadora usando la misma cuenta y administrador:

### 1. Clonar el repositorio
```bash
git clone https://github.com/calvin316byBoxesMedia360/kaze-site.git
cd kaze-site
```

### 2. Estructura del Proyecto
* `kaze-site-local/`: Directorio raíz del backend y del MVP estático servido en producción.
  * `kaze-site-local/server.js`: Servidor Node.js (express) que maneja las cotizaciones a través de Resend y rutea el SPA del Studio.
  * `kaze-site-local/studio/`: Archivos compilados en producción de Kaze Studio (el personalizador interactivo).
  * `kaze-site-local/assets/mockups/`: Prendas e imágenes base optimizadas por IA.
* `kaze-studio/`: Código fuente de la aplicación interactiva de diseño (React + Vite + TypeScript). Compila directamente hacia `kaze-site-local/studio/`.
* `kaze-web/`: Aplicación en Next.js (conservada para el roadmap de la versión 2.0).

### 3. Instalación de Dependencias
Ejecuta la instalación en los dos entornos clave:
```bash
# Servidor Principal
npm install

# Entorno de Desarrollo de Kaze Studio
cd kaze-studio
npm install
cd ..
```

### 4. Ejecución en Local
* **Servidor Backend y Sitio Web:**
  ```powershell
  $env:PORT="4178"
  node kaze-site-local/server.js
  ```
  Abre [http://localhost:4178/](http://localhost:4178/) y [http://localhost:4178/studio/](http://localhost:4178/studio/).

* **Desarrollo del Personalizador (Live Reload):**
  ```bash
  cd kaze-studio
  npm run dev
  ```

### 5. Compilación del Studio
Si realizas cambios en el personalizador (`kaze-studio/`), compila el proyecto para mover los archivos de producción al servidor de producción:
```bash
cd kaze-studio
npm run build
```

---

## 🛠️ Integración con Railway
El servicio de producción está configurado con **GitHub Auto-Deploy** en la rama `main` del repositorio `calvin316byBoxesMedia360/kaze-site`. 
Cualquier cambio empujado con `git push origin main` iniciará automáticamente una nueva compilación y despliegue.

### Variables de Entorno Requeridas en Railway:
* `PORT`: Puerto asignado automáticamente por Railway (ej. `8080`).
* `NOTIFICATION_EMAIL`: Correo de destino para cotizaciones (por defecto `kazecustomdesign@yahoo.com`).
* `RESEND_API_KEY`: API Key oficial de Resend para el envío real de correos.

---

## 📄 Documentación del Proyecto
* `MEMORY.md`: Estado actual y bitácora operativa de la sesión.
* `NEXT_SESSION.md`: Instrucciones paso a paso para retomar el desarrollo.
* `INFORME_PROYECTO_KAZE.html`: Reporte interactivo con pestañas de versiones v1.0 a v4.0.
* `preferencias-diseno.md`: Dirección visual, colores y tokens de marca oficiales de KAZE.
