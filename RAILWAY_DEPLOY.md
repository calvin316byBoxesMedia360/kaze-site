# Guía de Despliegue en Railway.app con Railway CLI

Esta guía describe cómo preparar y desplegar los módulos del proyecto KAZE (**HTML MVP** y **Next.js Frontend**) utilizando la CLI de Railway (`railway`).

---

## 1. Requisitos Previos y Configuración
La CLI de Railway ya ha sido instalada globalmente en este entorno:
- **CLI Version**: `railway 4.59.0`
- **Node.js**: `v22.18.0`
- **NPM**: `10.9.3`

---

## 2. Autenticación en Railway
Para iniciar sesión desde la terminal sin necesidad de abrir un navegador gráfico local (útil para entornos de terminales remotas o integradas):

```bash
railway login --browserless
```
*Sigue las instrucciones en pantalla para copiar el código de verificación y confirmar el acceso desde tu navegador/celular.*

Si estás en una máquina local con navegador gráfico, puedes usar la autenticación estándar:
```bash
railway login
```

---

## 3. Desplegando los Módulos del Proyecto

El repositorio de KAZE contiene dos aplicaciones listas para desplegarse de manera independiente o conjunta.

### Opción A: Desplegar el MVP Estático (`kaze-site-local`)
Este es el sitio en HTML puro con las imágenes generadas por IA y el formulario con Glassmorphism.

1. **Preparación de red**: Hemos actualizado `server.js` para escuchar en `0.0.0.0` (requerido por Railway para enrutar el tráfico externo).
2. **Archivo de inicio**: Hemos agregado `package.json` en la raíz de `kaze-site-local` con el comando de inicio `"start": "node server.js"`.
3. **Instrucciones de Despliegue**:
   ```bash
   # Navega a la carpeta del sitio local
   cd kaze-site-local

   # Inicializa o vincula un proyecto de Railway existente
   railway init   # O 'railway link' si ya tienes el proyecto creado en Railway

   # Sube y despliega el proyecto
   railway up
   ```

### Opción B: Desplegar la Versión Next.js (`kaze-web`)
Este es el frontend moderno construido con Next.js (que contiene la ruta `/technical` de Kaze Shop Studio).

1. **Detección Automática**: Railway detectará la estructura de Next.js, instalará las dependencias usando `package-lock.json` y ejecutará los comandos predeterminados de Nixpacks:
   - Build: `npm run build`
   - Start: `npm run start`
2. **Instrucciones de Despliegue**:
   ```bash
   # Navega a la carpeta de Next.js
   cd kaze-web

   # Inicializa o vincula el proyecto
   railway init

   # Sube y despliega la aplicación
   railway up
   ```

---

## 4. Comandos de Utilidad Diaria

| Comando | Propósito |
| :--- | :--- |
| `railway status` | Muestra el estado del proyecto vinculado actual, entornos y servicios. |
| `railway logs` | Transmite los logs de ejecución en tiempo real del servicio activo. |
| `railway variables` | Lista las variables de entorno configuradas para el servicio. |
| `railway env` | Permite ejecutar un comando local con las variables cargadas desde Railway. |
| `railway domain` | Genera o vincula un dominio público para tu servicio en Railway. |
| `railway list` | Lista todos tus proyectos activos en tu cuenta de Railway. |

---

## 5. Prácticas Recomendadas para Producción en Railway
- **Variables de Entorno**: Configura todas tus variables como credenciales de bases de datos, tokens de correo (Resend/SendGrid) o llaves de APIs mediante la UI de Railway o con `railway variables set KEY=VAL`. Nunca guardes archivos `.env` con secretos en el repositorio.
- **Asignación de Puertos**: Railway inyecta automáticamente la variable `PORT`. Ambos módulos (`server.js` y Next.js) están configurados para leer `process.env.PORT` por defecto, por lo que no requieren configuraciones adicionales de puerto.
