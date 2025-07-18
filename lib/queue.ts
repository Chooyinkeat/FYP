import { Queue } from "bullmq";
import connection from "./redis";

export const exampleQueue = new Queue("exampleQueue", { connection });
