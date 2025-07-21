import { Redis } from "ioredis";

const connection = new Redis({
  host: process.env.REDIS_HOST,
  port: 6379,
  maxRetriesPerRequest: null,
});

connection.ping().then(console.log).catch(console.error);
export default connection;
