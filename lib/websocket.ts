import { WebSocket, WebSocketServer } from "ws";
import type { IncomingMessage } from "http";

const connectedClients = new Map<number, WebSocket>();

export function initializeWebSocket(wss: WebSocketServer) {
  wss.on("connection", (client: WebSocket, request: IncomingMessage) => {
    const url = new URL(
      request.url || "",
      `http://${request.headers.host || "localhost"}`,
    );

    const userId = Number(url.searchParams.get("userId"));

    if (Number.isInteger(userId) && userId > 0) {
      connectedClients.set(userId, client);
      console.log(`Client ${userId} connected`);
    } else {
      console.log("Client connected without valid userId");
    }

    client.on("message", (message) => {
      try {
        const parsedMessage = JSON.parse(message.toString());

        if (parsedMessage.type === "chat" && parsedMessage.receiver_id) {
          const receiverId = Number(parsedMessage.receiver_id);
          const receiverSocket = connectedClients.get(receiverId);

          if (receiverSocket && receiverSocket.readyState === WebSocket.OPEN) {
            receiverSocket.send(message.toString());

            console.log(`Message sent from ${userId} to ${receiverId}`);
          } else {
            console.log(`Receiver ${receiverId} is offline`);
          }
        } else {
          // Broadcast to other connected clients
          for (const other of wss.clients) {
            if (client !== other && other.readyState === WebSocket.OPEN) {
              other.send(message.toString());
            }
          }
        }

        // Echo message back to sender
        if (client.readyState === WebSocket.OPEN) {
          client.send(message.toString());
        }
      } catch (error) {
        console.error("Invalid WebSocket message:", error);
      }
    });

    client.on("close", () => {
      if (userId && connectedClients.get(userId) === client) {
        connectedClients.delete(userId);
      }

      console.log(`Client ${userId || "unknown"} disconnected`);
    });
  });
}
