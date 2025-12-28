import nodemailer from "nodemailer";

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  throw new Error("EMAIL_USER or EMAIL_PASS is missing in environment variables");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendWorkerEmail = async (to, username, password, role) => {
  await transporter.sendMail({
    from: `"HaforaFlow" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your HaforaFlow Account",
    text: `Welcome to HaforaFlow!

Role: ${role}
Username: ${username}
Password: ${password}`
  });
};
