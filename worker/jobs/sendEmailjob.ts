import nodemailer from "nodemailer";

export default async function sendEmail(data: {
  email: string;
  images: string[];
  userEmail: string;
  location: string;
  date: string;
  time: string;
  contact: string;
}) {
  const { email, images, userEmail, location, date, time, contact } = data;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

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
    subject: "📅 Appointment Scheduled: Lost Item Found",
    html: `
    <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; border: 1px solid #ddd;">
        
        <div style="background-color: #4f46e5; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">Lost Item Appointment Scheduled</h2>
        </div>

        <div style="padding: 20px;">
          <p>Hello,</p>
          <p>Someone has booked an appointment to return your lost item. Here are the details:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px; font-weight: bold;">📅 Date:</td>
              <td style="padding: 8px;">${date}</td>
            </tr>
            <tr style="background-color: #f3f4f6;">
              <td style="padding: 8px; font-weight: bold;">⏰ Time:</td>
              <td style="padding: 8px;">${time}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">📍 Location:</td>
              <td style="padding: 8px;">${location}</td>
            </tr>
            <tr style="background-color: #f3f4f6;">
              <td style="padding: 8px; font-weight: bold;">📧 Finder Email:</td>
              <td style="padding: 8px;">${userEmail}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">📞 Contact:</td>
              <td style="padding: 8px;">${contact}</td>
            </tr>
          </table>

          <h3 style="margin-bottom: 10px;">🖼 Found Item Images:</h3>
          <div style="display: flex; flex-wrap: wrap; gap: 10px;">
            ${imageHtml}
          </div>

          <p style="margin-top: 20px;">
            Please make sure to arrive on time for the appointment. If you need to make changes, contact the finder directly.
          </p>

          <p style="font-size: 12px; color: #888; text-align: center; margin-top: 20px;">
            This is an automated message from the Lost & Found platform. Please do not reply to this email.
          </p>
        </div>
      </div>
    </div>
  `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`📧 Email with image(s) sent to ${email}`);
}
