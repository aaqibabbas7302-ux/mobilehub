# Deploying whatsapp-backend to Render

This service runs a small Express-based WhatsApp backend using `whatsapp-web.js`. For long-lived sessions you must persist the auth data directory so the WhatsApp session survives restarts.

Recommended approach: Deploy as a Web Service on Render using the provided `Dockerfile`, and attach a Persistent Disk to store `WA_DATA_PATH`.

Steps

- Create a new Web Service on Render.
- Choose "Docker" as the environment and connect your repo.
- Set the build and start commands to use the Dockerfile (Render will detect it).
- Under Environment, add these variables:
  - `PORT` — optional (Render sets this automatically). The app falls back to 3001.
  - `WA_DATA_PATH` — path inside container where auth data will be stored. For example `/data/wwebjs_auth`.
  - `PUPPETEER_EXECUTABLE_PATH` — optional, default is `/usr/bin/chromium` set in the Dockerfile.

Persistent Disk

- Create and attach a Persistent Disk to the service. Mount it at the same path you set in `WA_DATA_PATH` (e.g. `/data`).
- Ensure the container has read/write permission for that mount.

Notes

- The container installs Chromium so puppeteer can run headless. If you prefer a smaller image, adjust the Dockerfile.
- Exposed port is 3001 inside the container; Render will map externally.
- The `.wwebjs_auth` directory contains the WhatsApp session credentials; if lost, you'll need to re-scan the QR code.

Endpoints

- `GET /status` — returns readiness and auth status.
- `GET /qr` — returns the QR string when authentication is required.
- `POST /send` — { phone, message } to send a message.
- `POST /logout` — logs out and clears session.
