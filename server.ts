import next from "next";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { initializeWebSocket } from "./lib/websocket";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = Number(process.env.PORT) || 3000;

// Initialize Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Initialize WebSocket server
const wss = new WebSocketServer({
  noServer: true,
});

// Initialize your WebSocket logic
initializeWebSocket(wss);

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  // Handle WebSocket upgrade requests
  server.on("upgrade", (request, socket, head) => {
    const url = new URL(
      request.url || "",
      `http://${request.headers.host || "localhost"}`,
    );

    if (url.pathname === "/api/ws") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    }
  });

  server.listen(port, hostname, () => {
    console.log(`> Server running at http://${hostname}:${port}`);
  });
});
