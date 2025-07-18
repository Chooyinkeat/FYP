// worker/jobWorker.ts
import { Worker } from "bullmq";
import connection from "../lib/redis";

const worker = new Worker(
  "exampleQueue",
  async (job) => {
    console.log(`Processing job ID ${job.id}`, job.data);

    // Your background job logic here
    await new Promise((resolve) => setTimeout(resolve, 2000)); // simulate delay

    console.log(`Job ${job.id} done!`);
  },
  { connection },
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed`, err);
});
