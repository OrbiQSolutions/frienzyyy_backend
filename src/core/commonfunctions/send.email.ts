import * as nodemailer from 'nodemailer';
import { message } from '../constants/message.constants';

export async function sendEmail(to: string, subject: string, text: string, html?: String) {
  try {
    const host = process.env.EMAIL_HOST;
    const port = parseInt(process.env.EMAIL_PORT || '587');
    const user = process.env.EMAIL_USERNAME;
    const pass = process.env.EMAIL_PASSWORD;

    if (!host || !user || !pass) {
      throw new Error('Missing email config');
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    await transporter.verify();

    const mailOptions = {
      from: `"No Reply" <${process.env.EMAIL_USERNAME}>`,
      to,
      subject,
      text,
      html: html || text,
    };
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('Email send failed:', err);
    throw new Error(err.message || message.INTERNAL_SERVER_ERROR);
  }
}