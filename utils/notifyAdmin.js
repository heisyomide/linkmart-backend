import nodemailer from "nodemailer";

export const notifyAdmin = async (subject, campaign) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.ADMIN_EMAIL,
      pass: process.env.ADMIN_EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"LinkMart Notifications" <${process.env.ADMIN_EMAIL}>`,
    to: process.env.ADMIN_EMAIL,
    subject: subject,
    text: `
New manual campaign submitted:

Platform: ${campaign.platform}
Goal: ${campaign.goal}
Budget: ${campaign.budget}
User ID: ${campaign.user}
Created At: ${campaign.createdAt}

Review it on the Admin Dashboard.
    `,
  });
};