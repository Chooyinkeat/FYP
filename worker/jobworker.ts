import { Worker } from "bullmq";
import connection from "../lib/redis";
import sendEmail from "./jobs/sendEmailjob";
import dotenv from "dotenv";
import notifyFounder from "./jobs/notifyFounder";
dotenv.config();

const worker = new Worker(
  "exampleQueue",
  async (job) => {
    switch (job.name) {
      case "sendEmail":
        await sendEmail(job.data);
      case "notifyFounder":
        await notifyFounder(job.data.email, job.data.results);
        break;
      default:
        throw new Error(`Unknown job: ${job.name}`);
    }
  },
  { connection },
);

worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err);
});
