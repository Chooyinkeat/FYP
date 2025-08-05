import nodemailer from "nodemailer";

export default async function notifyFounder(email: string, results: string) {
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
    subject: "Someone is trying to claim your item",
    html: `
    <h2>Hello, someone is trying to claim your item!</h2>
    <p>Please check the similarity results below to verify the claim:</p>
    <p>${results}</p>
    <p>If you recognize the claimant or their images, please respond through the app or contact the support team.</p>
  `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`📧 Email sent to ${email}`);
}
