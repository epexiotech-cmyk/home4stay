import 'server-only';
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Ensure logs only run once in dev
const globalForEmail = global as unknown as { __smtp_initialized?: boolean };

if (!globalForEmail.__smtp_initialized) {
  transporter.verify((error) => {
    if (error) {
      console.error("❌ SMTP connection failed:", error.message);
    } else {
      console.log("✅ SMTP connected");
    }
  });
  globalForEmail.__smtp_initialized = true;
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://home4stay.homes";
  const resetLink = `${appUrl}/auth/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Reset your Home4Stay password",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #000; margin: 0; font-size: 24px; font-weight: 800;">Home4Stay</h1>
        </div>
        
        <div style="background-color: #fcfcfc; border: 1px solid #f0f0f0; padding: 32px; border-radius: 24px;">
          <h2 style="font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px;">Password Reset Request</h2>
          <p style="line-height: 1.6; color: #666; margin-bottom: 24px;">
            We received a request to reset the password for your account. Please use one of the links below to choose a new password.
          </p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetLink}" style="background-color: #000; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block; font-size: 14px;">Reset Password</a>
          </div>
          
          <p style="font-size: 14px; color: #888; text-align: center; margin-top: 24px;">
            This link will expire in <strong>15 minutes</strong> for your security.
          </p>
          
          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #f0f0f0;">
            <p style="font-size: 12px; color: #aaa; margin-bottom: 8px;">If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="font-size: 11px; color: #000; word-break: break-all;">${resetLink}</p>
          </div>
        </div>
        
        <p style="text-align: center; font-size: 12px; color: #aaa; margin-top: 32px;">
          If you didn't request this, you can safely ignore this email. No changes will be made to your account.
        </p>
        <p style="text-align: center; font-size: 12px; color: #aaa; margin-top: 8px;">
          &copy; ${new Date().getFullYear()} Home4Stay. All rights reserved.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: "Reset email sent successfully" };
  } catch (error) {
    console.error("SMTP Error:", error);
    return { success: false, message: "Failed to send email" };
  }
}
