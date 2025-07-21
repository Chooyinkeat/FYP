import { Worker } from "bullmq";
import connection from "../lib/redis";
import sendEmail from "./jobs/sendEmailjob";
import dotenv from "dotenv";
dotenv.config();

const worker = new Worker(
  "exampleQueue",
  async (job) => {
    switch (job.name) {
      case "sendEmail":
        await sendEmail(job.data);
        break;
      // 🔧 Add more job types here
      // case "resizeImage":
      //   await resizeImage(job.data);
      //   break;
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
