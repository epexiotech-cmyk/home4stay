import 'server-only';
import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
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

export async function sendNewPlanAlertEmail(
  email: string,
  ownerName: string,
  planName: string,
  planDescription: string
) {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: "✨ New Subscription Plan Launched on Home4Stay!",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #000; margin: 0; font-size: 24px; font-weight: 800;">Home4Stay</h1>
        </div>
        
        <div style="background-color: #fcfcfc; border: 1px solid #f59e0b; padding: 32px; border-radius: 24px;">
          <h2 style="font-size: 20px; font-weight: 700; color: #b45309; margin-top: 0; margin-bottom: 16px;">New Plan Available: ${planName}</h2>
          <p style="line-height: 1.6; color: #4b5563; margin-bottom: 24px;">
            Hello ${ownerName || "Property Owner"},
          </p>
          <p style="line-height: 1.6; color: #4b5563; margin-bottom: 24px;">
            We are excited to inform you that we have launched a brand new subscription plan: <strong>${planName}</strong>.
          </p>
          <div style="background-color: #fff; border: 1px solid #e5e7eb; padding: 20px; border-radius: 16px; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 14px; font-weight: bold; color: #1f2937;">Description:</p>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280; line-height: 1.5;">${planDescription}</p>
          </div>
          <p style="line-height: 1.6; color: #4b5563; margin-bottom: 24px;">
            Log in to your Partner Dashboard now to explore and upgrade your subscription limits!
          </p>
        </div>
        
        <p style="text-align: center; font-size: 12px; color: #aaa; margin-top: 32px;">
          &copy; ${new Date().getFullYear()} Home4Stay. All rights reserved.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: "New plan alert email sent successfully" };
  } catch (error) {
    console.error("SMTP New Plan Alert Error:", error);
    return { success: false, message: "Failed to send email" };
  }
}

export async function sendPlanChangeAlertEmail(
  email: string,
  ownerName: string,
  currentPlanName: string,
  renewalDate: Date | string
) {
  const dateFormatted = new Date(renewalDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: "⚠️ Action Required: Subscription Plan Changes for Home4Stay",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #000; margin: 0; font-size: 24px; font-weight: 800;">Home4Stay</h1>
        </div>
        
        <div style="background-color: #fcfcfc; border: 1px solid #ef4444; padding: 32px; border-radius: 24px;">
          <h2 style="font-size: 20px; font-weight: 700; color: #b91c1c; margin-top: 0; margin-bottom: 16px;">Action Required: Plan Discontinued</h2>
          <p style="line-height: 1.6; color: #4b5563; margin-bottom: 24px;">
            Hello ${ownerName || "Property Owner"},
          </p>
          <p style="line-height: 1.6; color: #4b5563; margin-bottom: 24px;">
            We are writing to inform you that your current subscription plan (<strong>${currentPlanName}</strong>) has been discontinued.
          </p>
          <p style="line-height: 1.6; color: #4b5563; margin-bottom: 24px;">
            Your active subscription will remain valid until your next renewal date on <strong>${dateFormatted}</strong>.
          </p>
          <div style="background-color: #fef2f2; border: 1px solid #fca5a5; padding: 20px; border-radius: 16px; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 14px; font-weight: bold; color: #991b1b;">Please Note:</p>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #7f1d1d; line-height: 1.5;">
              To prevent any platform access interruptions or listing limits restrictions, please choose and switch to another active subscription plan at least one month before your renewal date.
            </p>
          </div>
          <p style="line-height: 1.6; color: #4b5563; margin-bottom: 24px;">
            Please log in to your dashboard at your earliest convenience to select an alternative pricing plan.
          </p>
        </div>
        
        <p style="text-align: center; font-size: 12px; color: #aaa; margin-top: 32px;">
          &copy; ${new Date().getFullYear()} Home4Stay. All rights reserved.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: "Plan change alert email sent successfully" };
  } catch (error) {
    console.error("SMTP Plan Change Alert Error:", error);
    return { success: false, message: "Failed to send email" };
  }
}
