import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { sendEmail } from "src/core/commonfunctions/send.email";

@Processor("emails")
export class EmailWorker extends WorkerHost {
  async process(job: Job): Promise<any> {
    sendEmail(job.data.to, job.data.subject, job.data.text, job.data.html);
    console.log(`Mail sent to ${job.data.to} for user sign up`);
    return;
  }
}