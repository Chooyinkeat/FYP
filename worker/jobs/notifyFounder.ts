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
    subject: "Someone found your lost item",
    html: `
      <h2>Hello, someone found your lost item!</h2>
      <p>Please check the results below:</p>
        <p>${results}</p>
      <p>Kindly contact the finder through the app or support team.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`📧 Email sent to ${email}`);
}
