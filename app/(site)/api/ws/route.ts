import { WebSocket, WebSocketServer } from "ws";
import { IncomingMessage } from "http";

export function SOCKET(
  client: WebSocket,
  request: IncomingMessage,
  server: WebSocketServer,
  context: { params: Record<string, string | string[]> },
) {
  console.log("A client connected");
  client.on("message", (message) => {
    console.log("Received message:", message.toString());
    client.send(message); // Echo back the message
  });
  client.on("close", () => {
    console.log("A client disconnected");
  });
}
