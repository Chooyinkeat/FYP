import { WebSocket, WebSocketServer } from "ws";
import { IncomingMessage } from "http";
const connectedClients = new Map<number, WebSocket>(); // userId -> WebSocket

export function SOCKET(
  client: WebSocket,
  request: IncomingMessage,
  server: WebSocketServer,
  context: { params: Record<string, string | string[]> },
) {
  const url = new URL(request.url || "", `http://${request.headers.host}`);
  const userId = Number(url.searchParams.get("userId"));

  if (userId) {
    connectedClients.set(userId, client);
    console.log(`Client ${userId} connected`);
  } else {
    console.log("Client connected without userId");
  }

  client.on("message", (message) => {
    const parsedMessage = JSON.parse(message.toString());

    // Example: If message has a receiver_id
    if (parsedMessage.type === "chat" && parsedMessage.receiver_id) {
      const receiverSocket = connectedClients.get(parsedMessage.receiver_id);
      if (receiverSocket && receiverSocket.readyState === WebSocket.OPEN) {
        receiverSocket.send(message);
        console.log(
          `Message sent from ${userId} to ${parsedMessage.receiver_id}`,
        );
      } else {
        console.log(
          `Receiver ${parsedMessage.receiver_id} not found or not open.`,
        );
        // Handle case where receiver is offline (e.g., store message for later)
      }
    } else {
      // Your current broadcast logic for other message types or if no receiver_id
      for (const other of server.clients)
        if (client !== other && other.readyState === other.OPEN)
          other.send(message);
    }
    client.send(message); // Echo back
  });

  client.on("close", () => {
    console.log("A client disconnected");
    // Remove from connectedClients map
    if (userId && connectedClients.get(userId) === client) {
      connectedClients.delete(userId);
      console.log(`Client ${userId} disconnected`);
    }
  });
}
