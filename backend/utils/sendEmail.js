// utils/sendEmail.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // the 16-character App Password you created
  },
});

// Optional: verify transporter once at startup
transporter.verify().then(() => {
  console.log("Mailer: Gmail transporter verified");
}).catch(err => {
  console.error("Mailer verification failed:", err);
});

export async function sendEmail({ to, subject, html, text }) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
    text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to} — messageId: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error("❌ Error sending email:", err);
    throw err;
  }
}
