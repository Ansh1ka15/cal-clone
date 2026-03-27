const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendBookingConfirmation = async ({ bookerName, bookerEmail, eventTitle, date, startTime, endTime }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
  await transporter.sendMail({
    from: `"Cal Clone" <${process.env.EMAIL_FROM}>`,
    to: bookerEmail,
    subject: `Confirmed: ${eventTitle}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
        <h2 style="margin-bottom:0.5rem;color:#111827;">Booking Confirmed</h2>
        <p style="color:#4b5563;">Hi ${bookerName}, your booking has been confirmed.</p>
        <p style="color:#4b5563;margin:0.75rem 0;">${eventTitle}</p>
        <p style="margin:0.25rem 0;color:#374151;"><strong>Date:</strong> ${date}</p>
        <p style="margin:0.25rem 0;color:#374151;"><strong>Time:</strong> ${startTime} - ${endTime}</p>
      </div>
    `,
  });
};

const sendCancellationEmail = async ({ bookerName, bookerEmail, eventTitle, date, startTime }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
  await transporter.sendMail({
    from: `"Cal Clone" <${process.env.EMAIL_FROM}>`,
    to: bookerEmail,
    subject: `Cancelled: ${eventTitle}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
        <h2 style="color:#111827;">Booking Cancelled</h2>
        <p style="color:#4b5563;">Hi ${bookerName}, your booking has been cancelled.</p>
        <p style="color:#374151;margin:0.25rem 0;"><strong>Date:</strong> ${date}</p>
        <p style="color:#374151;margin:0.25rem 0;"><strong>Time:</strong> ${startTime}</p>
      </div>
    `,
  });
};

const sendRescheduleEmail = async ({ bookerName, bookerEmail, eventTitle, oldDate, oldTime, newDate, newTime }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
  await transporter.sendMail({
    from: `"Cal Clone" <${process.env.EMAIL_FROM}>`,
    to: bookerEmail,
    subject: `Rescheduled: ${eventTitle}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
        <h2 style="color:#111827;">Booking Rescheduled</h2>
        <p style="color:#4b5563;">Hi ${bookerName}, your booking has been updated.</p>
        <p style="color:#374151;margin:0.25rem 0;"><strong>Old:</strong> ${oldDate} at ${oldTime}</p>
        <p style="color:#374151;margin:0.25rem 0;"><strong>New:</strong> ${newDate} at ${newTime}</p>
      </div>
    `,
  });
};

module.exports = { sendBookingConfirmation, sendCancellationEmail, sendRescheduleEmail };
