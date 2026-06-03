const http = require("http");
const fs = require("fs");
const path = require("path");

// Load local environment variables from .env if present
try {
  const envPath = path.join(__dirname, ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    envContent.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        if (key && valueParts.length > 0) {
          process.env[key.trim()] = valueParts.join("=").trim();
        }
      }
    });
    console.log("Local .env file loaded successfully");
  }
} catch (e) {
  console.error("Failed to load local .env file:", e);
}

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

        const toEmail = process.env.NOTIFICATION_EMAIL || "boxesmedia360@gmail.com";
        const apiKey = process.env.RESEND_API_KEY;

        let responseDetail = "Simulated quote reception in development mode.";

        if (apiKey) {
          const servicesHtml = Array.isArray(formData.servicio) 
            ? formData.servicio.map(s => `<span style="background: rgba(204, 255, 0, 0.1); border: 1px solid rgba(204, 255, 0, 0.3); color: #ccff00; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; margin-right: 4px; display: inline-block; text-transform: uppercase;">${s}</span>`).join("")
            : `<span style="background: rgba(204, 255, 0, 0.1); border: 1px solid rgba(204, 255, 0, 0.3); color: #ccff00; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; display: inline-block; text-transform: uppercase;">${formData.servicio || 'Otro'}</span>`;

          let imgTag = "";
          const attachments = [];
          
          if (formData.mockupImage) {
            imgTag = `
              <div style="background-color: #18181b; border-radius: 12px; padding: 20px; border: 1px solid #27272a; margin-bottom: 16px;">
                <h3 style="color: #ffffff; font-size: 14px; margin-top: 0; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #27272a; padding-bottom: 8px;">Diseño Adjunto</h3>
                <div style="border: 1px solid #27272a; border-radius: 8px; background: #09090b; padding: 10px; text-align: center;">
                  <img src="cid:mockup-image" style="max-width: 100%; height: auto; border-radius: 6px;" alt="Diseño Adjunto" />
                  <p style="color: #a1a1aa; font-size: 11px; margin: 8px 0 0 0;">kaze-diseño.png (adjuntado al correo)</p>
                </div>
              </div>
            `;
            const base64Data = formData.mockupImage.split(";base64,").pop();
            attachments.push({
              filename: "kaze-diseño.png",
              content: base64Data,
              content_id: "mockup-image",
              disposition: "inline"
            });
          }

          const htmlContent = `
            <div style="background-color: #0d0d11; padding: 30px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e4e4e7; max-width: 600px; margin: 0 auto; border-radius: 16px; border: 1px solid #27272a; border-top: 4px solid #ccff00;">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em;">KAZE <span style="color: #ccff00;">DESIGNS</span></span>
                <p style="color: #a1a1aa; font-size: 13px; margin: 4px 0 0 0;">Nueva solicitud de cotización recibida</p>
              </div>
              
              <div style="background-color: #18181b; border-radius: 12px; padding: 20px; border: 1px solid #27272a; margin-bottom: 24px;">
                <h3 style="color: #ffffff; font-size: 14px; margin-top: 0; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #27272a; padding-bottom: 8px;">Información del Cliente</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                  <tr>
                    <td style="padding: 6px 0; color: #a1a1aa; width: 140px; font-weight: 500;">Nombre:</td>
                    <td style="padding: 6px 0; color: #ffffff; font-weight: 600;">${formData.name || 'No proporcionado'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #a1a1aa;">Email:</td>
                    <td style="padding: 6px 0; color: #ccff00; font-weight: 600;"><a href="mailto:${formData.email}" style="color: #ccff00; text-decoration: none;">${formData.email || 'No proporcionado'}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #a1a1aa;">Teléfono / WhatsApp:</td>
                    <td style="padding: 6px 0; color: #ffffff; font-weight: 600;">${formData.phone || 'No proporcionado'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #a1a1aa;">Preferencia de Contacto:</td>
                    <td style="padding: 6px 0;"><span style="background-color: #27272a; color: #ffffff; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold;">${formData.contactPref || 'No especificada'}</span></td>
                  </tr>
                </table>
              </div>

              <div style="background-color: #18181b; border-radius: 12px; padding: 20px; border: 1px solid #27272a; margin-bottom: 24px;">
                <h3 style="color: #ffffff; font-size: 14px; margin-top: 0; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #27272a; padding-bottom: 8px;">Detalles del Proyecto</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 16px;">
                  <tr>
                    <td style="padding: 6px 0; color: #a1a1aa; width: 140px; font-weight: 500;">Servicios:</td>
                    <td style="padding: 6px 0;">${servicesHtml}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #a1a1aa;">Piezas solicitadas:</td>
                    <td style="padding: 6px 0; color: #ffffff; font-weight: 600;">${formData.pieces || 'No especificada'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #a1a1aa;">Estado del Logo:</td>
                    <td style="padding: 6px 0; color: #ffffff; font-weight: 600;">${formData.logoStatus || 'No especificado'}</td>
                  </tr>
                </table>
                
                <p style="color: #a1a1aa; font-size: 13px; font-weight: 500; margin-bottom: 8px; margin-top: 0;">Descripción de la Idea:</p>
                <div style="background: #09090b; padding: 12px 15px; border-left: 3px solid #ccff00; border-radius: 0 8px 8px 0; font-size: 13px; color: #e4e4e7; line-height: 1.5; border: 1px solid #27272a;">
                  ${(formData.idea || '').replace(/\n/g, '<br>') || 'Sin descripción'}
                </div>
              </div>

              ${imgTag}
              
              <div style="text-align: center; font-size: 11px; color: #71717a; margin-top: 30px; border-top: 1px solid #27272a; padding-top: 15px;">
                Mensaje automático enviado desde el cotizador web de KAZE Designs.
              </div>
            </div>
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
              html: htmlContent,
              attachments: attachments.length > 0 ? attachments : undefined
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
          console.log(`[DEV MODE] Email to ${toEmail} simulated with payload:`, {
            ...formData,
            mockupImage: formData.mockupImage ? "[Base64 PNG Image]" : undefined
          });
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
      if (!urlPath.endsWith("/")) {
        res.writeHead(301, { "Location": urlPath + "/" });
        res.end();
        return;
      }
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
