# KAZE Custom Apparel & Signs / Kaze Designs

Repositorio y documentación oficial para el sitio web y la herramienta interactiva de personalización de KAZE Custom Apparel & Signs.

## 🚀 Despliegue en Vivo
* **Producción (Railway):** [https://kazedesignswtv1-production.up.railway.app](https://kazedesignswtv1-production.up.railway.app)
* **Estudio 3D (WrapStudio):** [https://kazedesignswtv1-production.up.railway.app/wrapstudio/](https://kazedesignswtv1-production.up.railway.app/wrapstudio/)
* **Destinatario de Cotizaciones:** `calvin316@boxesmedia360.com` (temporal para pruebas en Resend Sandbox)

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
  * `kaze-site-local/server.js`: Servidor Node.js (express) que maneja las cotizaciones a través de Resend y sirve las SPAs de Kaze Studio y WrapStudio.
  * `kaze-site-local/studio/`: Archivos compilados en producción de Kaze Studio (el personalizador interactivo 2D, actualmente retirado del menú principal).
  * `kaze-site-local/wrapstudio/`: Archivos compilados en producción de WrapStudio (el estudio 3D y simulador de rotulado).
  * `kaze-site-local/assets/mockups/`: Prendas e imágenes base optimizadas por IA.
* `kaze-studio/`: Código fuente de la aplicación interactiva de diseño 2D (React + Vite + TypeScript). Compila directamente hacia `kaze-site-local/studio/`.
* `wrapstudio-mockup/`: Código fuente de la herramienta interactiva de diseño 3D y rotulación de vehículos (React + Vite + TypeScript). Compila directamente hacia `kaze-site-local/wrapstudio/`.
* `kaze-web/`: Aplicación en Next.js (conservada para el roadmap de la versión 2.0).

### 3. Instalación de Dependencias
Ejecuta la instalación en los entornos clave:
```bash
# Servidor Principal
npm install

# Entorno de Desarrollo de Kaze Studio (2D)
cd kaze-studio
npm install
cd ..

# Entorno de Desarrollo de WrapStudio (3D & Autos)
cd wrapstudio-mockup
npm install
cd ..
```

### 4. Ejecución en Local
* **Servidor Backend y Sitio Web:**
  ```powershell
  $env:PORT="4178"
  node kaze-site-local/server.js
  ```
  Abre [http://localhost:4178/](http://localhost:4178/) y [http://localhost:4178/wrapstudio/](http://localhost:4178/wrapstudio/).

* **Desarrollo del Personalizador (Live Reload):**
  ```bash
  cd kaze-studio
  npm run dev
  ```

* **Desarrollo de WrapStudio (Live Reload):**
  ```bash
  cd wrapstudio-mockup
  npm run dev
  ```

### 5. Compilación del Studio y WrapStudio
Si realizas cambios en los editores, compílalos para mover los archivos de producción al servidor de producción:
```bash
# Compilar Kaze Studio (2D)
cd kaze-studio
npm run build
cd ..

# Compilar WrapStudio (3D & Autos)
cd wrapstudio-mockup
npm run build
cd ..
```

---

## 🛠️ Integración con Railway
El servicio de producción está configurado con **GitHub Auto-Deploy** en la rama `main` del repositorio `calvin316byBoxesMedia360/kaze-site`. 
Cualquier cambio empujado con `git push origin main` iniciará automáticamente una nueva compilación y despliegue.

### Variables de Entorno Requeridas en Railway:
* `PORT`: Puerto asignado automáticamente por Railway (ej. `8080`).
* `NOTIFICATION_EMAIL`: Correo de destino para cotizaciones (por defecto `calvin316@boxesmedia360.com` en Sandbox).
* `RESEND_API_KEY`: API Key oficial de Resend para el envío real de correos.

---

## 📄 Documentación del Proyecto
* `MEMORY.md`: Estado actual y bitácora operativa de la sesión.
* `NEXT_SESSION.md`: Instrucciones paso a paso para retomar el desarrollo.
* `INFORME_PROYECTO_KAZE.html`: Reporte interactivo con pestañas de versiones v1.0 a v6.0.
* `preferencias-diseno.md`: Dirección visual, colores y tokens de marca oficiales de KAZE.
