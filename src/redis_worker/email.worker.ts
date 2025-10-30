import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { sendEmail } from "../core/commonfunctions/send.email";

@Processor("emails")
export class EmailWorker extends WorkerHost {
  private readonly logger = new Logger(EmailWorker.name);

  async process(job: Job): Promise<any> {
    try {
      const { to, subject, text, html } = job.data;
      if (!to || !subject) {
        throw new Error('Missing email data');
      }
      await sendEmail(to, subject, text, html || text);
      this.logger.log(`Mail sent to ${to} for user sign up`);
      return { success: true };
    } catch (err) {
      this.logger.error(`Email send failed for job ${job.id}: ${err.message}`);
      throw err;
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