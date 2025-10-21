import * as nodemailer from 'nodemailer';

export async function sendEmail(to: string, subject: string, text: string, html?: String) {
  console.log(process.env.EMAIL_USERNAME);
  console.log(process.env.EMAIL_PASSWORD);
  console.log(process.env.EMAIL_HOST);
  console.log(process.env.EMAIL_PORT);
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
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