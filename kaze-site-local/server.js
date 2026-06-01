const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT || 4177);

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".ogv": "video/ogg",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".glb": "model/gltf-binary",
  ".gltf": "model/gltf+json"
};

http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split("?")[0]);

  // Handle Quote submissions
  if (req.method === "POST" && urlPath === "/api/quote") {
    let body = "";
    req.on("data", chunk => {
      body += chunk.toString();
    });
    req.on("end", async () => {
      try {
        const formData = JSON.parse(body);
        console.log("Received Quote Request:", formData);

        const toEmail = process.env.NOTIFICATION_EMAIL || "kazecustomdesign@yahoo.com";
        const apiKey = process.env.RESEND_API_KEY;

        let responseDetail = "Simulated quote reception in development mode.";

        if (apiKey) {
          const services = Array.isArray(formData.servicio) ? formData.servicio.join(", ") : (formData.servicio || "Ninguno");
          const htmlContent = `
            <h2>Nueva Cotización desde KAZE Website</h2>
            <p><strong>Nombre:</strong> ${formData.name || 'No proporcionado'}</p>
            <p><strong>Email:</strong> ${formData.email || 'No proporcionado'}</p>
            <p><strong>Teléfono:</strong> ${formData.phone || 'No proporcionado'}</p>
            <p><strong>Preferencia de Contacto:</strong> ${formData.contactPref || 'No especificada'}</p>
            <p><strong>Servicios requeridos:</strong> ${services}</p>
            <p><strong>Cantidad aproximada de piezas:</strong> ${formData.pieces || 'No especificada'}</p>
            <p><strong>Estado del Logo:</strong> ${formData.logoStatus || 'No especificado'}</p>
            <p><strong>Detalle de la Idea/Proyecto:</strong></p>
            <blockquote style="background: #f4f4f4; padding: 10px; border-left: 3px solid #d4a843;">
              ${(formData.idea || '').replace(/\n/g, '<br>') || 'Sin descripción'}
            </blockquote>
          `;

          const resendResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              from: "KAZE Web <onboarding@resend.dev>",
              to: [toEmail],
              subject: `Nueva Cotización: ${formData.name || 'Sin nombre'}`,
              html: htmlContent
            })
          });

          if (resendResponse.ok) {
            responseDetail = "Email sent successfully via Resend.";
          } else {
            const errBody = await resendResponse.text();
            console.error("Error from Resend API:", errBody);
            throw new Error(`Resend error: ${errBody}`);
          }
        } else {
          console.log(`[DEV MODE] Email to ${toEmail} simulated with payload:`, formData);
        }

        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ success: true, message: responseDetail }));
      } catch (err) {
        console.error("Error handling quote:", err);
        res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ success: false, error: err.message || "Error interno del servidor" }));
      }
    });
    return;
  }

  const safePath = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
  const isRoot = safePath === "/" || safePath === "\\" || safePath === "";
  const filePath = path.join(root, isRoot ? "index.html" : safePath);

  fs.stat(filePath, (err, stats) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    let finalPath = filePath;
    let finalStats = stats;

    if (stats.isDirectory()) {
      finalPath = path.join(filePath, "index.html");
      try {
        finalStats = fs.statSync(finalPath);
        if (!finalStats.isFile()) {
          throw new Error("Not a file");
        }
      } catch (e) {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Not found");
        return;
      }
    }

    const ext = path.extname(finalPath).toLowerCase();
    const contentType = types[ext] || "application/octet-stream";
    const fileSize = finalStats.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize || start > end) {
        res.writeHead(416, {
          "Content-Range": `bytes */${fileSize}`,
          "Content-Type": "text/plain; charset=utf-8"
        });
        res.end("Requested range not satisfiable");
        return;
      }

      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(finalPath, { start, end });
      const head = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": contentType
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        "Content-Length": fileSize,
        "Content-Type": contentType,
        "Accept-Ranges": "bytes"
      };
      res.writeHead(200, head);
      fs.createReadStream(finalPath).pipe(res);
    }
  });
}).listen(port, "0.0.0.0", () => {
  console.log(`KAZE site running at http://0.0.0.0:${port}/`);
});
