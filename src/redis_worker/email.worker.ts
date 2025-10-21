import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { sendEmail } from "src/core/commonfunctions/send.email";

@Processor("emails")
export class EmailWorker extends WorkerHost {
  private readonly logger = new Logger(EmailWorker.name);

  async process(job: Job): Promise<any> {
    try {
      await sendEmail(job.data.to, job.data.subject, job.data.text, job.data.html);
      this.logger.log(`Mail sent to ${job.data.to} for user sign up`);
      return;
    } catch (err) {
      this.logger.error("The error occurred while sendin email");
      return;
    }
  }

  @OnWorkerEvent("completed")
  onCompleted(job: Job, returnvalue: any) {
    this.logger.log(`Job with id ${job.id} has completed`);
  }

  @OnWorkerEvent("failed")
  onFailed(job: Job, error: any) {
    this.logger.warn(
      `Job with id ${job.id} has failed with reason ${error.message}`,
    );
  }

  @OnWorkerEvent("error")
  onError(error: any) {
    this.logger.error(`An error occurred in the worker: ${error.message}`);
  }

  @OnWorkerEvent("active")
  onActive(job: Job) {
    this.logger.log(`Job with id ${job.id} is now active`);
  }
}