import nodemailer from "nodemailer";

export default async function sendEmail(data: { email: string }) {
  const { email } = data;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Hello, someone found your lost item",
    text: "Hello, someone found your lost item. Please contact them.",
  };

  await transporter.sendMail(mailOptions);
  console.log(`📧 Email sent to ${email}`);
}
