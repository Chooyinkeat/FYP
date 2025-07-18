import { Redis } from "ioredis";

const connection = new Redis({
  host: "127.0.0.1", // or your Redis server URL
  port: 6379,
});

export default connection;
