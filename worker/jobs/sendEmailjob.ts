import nodemailer from "nodemailer";

// export default async function sendEmail(data: { email: string }) {
//   const { email } = data;

//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: email,
//     subject: "Hello, someone found your lost item",
//     text: "Hello, someone found your lost item. Please contact them.",
//   };

//   await transporter.sendMail(mailOptions);
//   console.log(`📧 Email sent to ${email}`);
// }
export default async function sendEmail(data: {
  email: string;
  images: string[];
}) {
  const { email, images } = data;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Generate HTML content for the email
  const imageHtml = images.length
    ? images
        .map(
          (url) =>
            `<img src="${url}" style="max-width: 300px; margin: 10px;" />`,
        )
        .join("")
    : "<p>No images provided.</p>";

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Someone found your lost item",
    html: `
      <h2>Hello, someone found your lost item!</h2>
      <p>Please check the image(s) below:</p>
      ${imageHtml}
      <p>Kindly contact the finder through the app or support team.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`📧 Email with image(s) sent to ${email}`);
}
