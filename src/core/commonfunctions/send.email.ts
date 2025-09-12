import * as nodemailer from 'nodemailer';

export function sendEmail(to: string, subject: string, text: string, html?: String) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false, // true for 465, false for other ports
    auth
      : {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"No Reply" <${process.env.EMAIL_USERNAME}>`,
    to,
    subject,
    text,
    html: html,
  };
  return transporter.sendMail(mailOptions);
}