import 'server-only';
import { transporter } from './email';

interface EmailTemplateDetails {
  guestName: string;
  propertyName: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  amount: number;
  bookingId: string;
  invoiceNumber?: string;
  rejectionReason?: string;
  expiryReason?: string;
  paymentRef?: string;
}

const BRAND_COLOR = "#053344"; // Deep Teal
const ACCENT_COLOR = "#FCBC43"; // Warm Gold
const TEXT_MUTED = "#666666";

function buildBaseHtmlTemplate(title: string, bodyContent: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f9fa; color: #1a1a1a; -webkit-font-smoothing: antialiased;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f7f9fa; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border: 1px solid #eef1f2; border-radius: 32px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.03);">
              
              <!-- Luxury Header -->
              <tr>
                <td align="center" style="background-color: ${BRAND_COLOR}; padding: 48px 32px; text-align: center;">
                  <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                    <tr>
                      <td align="center" style="font-size: 28px; font-weight: 900; letter-spacing: -0.03em; color: #ffffff; text-transform: uppercase;">
                        Home<span style="color: ${ACCENT_COLOR};">4</span>Stay
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="font-size: 10px; font-weight: 800; letter-spacing: 0.3em; color: rgba(255,255,255,0.6); text-transform: uppercase; padding-top: 8px;">
                        Luxury Living Redefined
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Content Body -->
              <tr>
                <td style="padding: 48px 36px;">
                  ${bodyContent}
                </td>
              </tr>
              
              <!-- Luxury Footer -->
              <tr>
                <td align="center" style="background-color: #fafbfc; padding: 32px; border-top: 1px solid #f0f2f3; text-align: center;">
                  <p style="margin: 0; font-size: 12px; color: #a0aab0; line-height: 1.6;">
                    You are receiving this communication because of an active stay reservation or profile request with Home4Stay.
                  </p>
                  <p style="margin: 12px 0 0 0; font-size: 11px; color: #b0bac0; font-weight: bold; letter-spacing: 0.05em;">
                    &copy; ${new Date().getFullYear()} Home4Stay Resorts & Spas Ltd. All rights reserved.
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export async function sendBookingConfirmationEmail(email: string, details: EmailTemplateDetails) {
  const displayId = details.bookingId.substring(0, 8).toUpperCase();
  const subject = `Your luxury stay at ${details.propertyName} is CONFIRMED! (BKG-${displayId})`;
  
  const bodyContent = `
    <h2 style="font-size: 22px; font-weight: 800; color: ${BRAND_COLOR}; margin-top: 0; margin-bottom: 16px; letter-spacing: -0.02em;">Pack Your Bags, ${details.guestName}!</h2>
    <p style="font-size: 15px; line-height: 1.6; color: ${TEXT_MUTED}; margin-bottom: 32px;">
      We are delighted to let you know that your reservation holds are confirmed. Your host has verified the stay context, and your check-in code has been registered in our central PMS ledger.
    </p>

    <!-- Stay Summary Card -->
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fcfdfe; border: 1px solid #eaf0f2; border-radius: 24px; padding: 24px; margin-bottom: 32px;">
      <tr>
        <td style="padding-bottom: 16px; border-b: 1px solid #f0f4f5;">
          <span style="font-size: 10px; font-weight: 800; color: #90a0a5; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 4px;">Destination Stay</span>
          <span style="font-size: 16px; font-weight: bold; color: ${BRAND_COLOR};">${details.propertyName}</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 16px 0; border-b: 1px solid #f0f4f5;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td width="50%">
                <span style="font-size: 10px; font-weight: 800; color: #90a0a5; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 4px;">Check-In</span>
                <span style="font-size: 14px; font-weight: bold; color: #1a1a1a;">${details.checkIn}</span>
              </td>
              <td width="50%">
                <span style="font-size: 10px; font-weight: 800; color: #90a0a5; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 4px;">Check-Out</span>
                <span style="font-size: 14px; font-weight: bold; color: #1a1a1a;">${details.checkOut}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 16px 0; border-b: 1px solid #f0f4f5;">
          <span style="font-size: 10px; font-weight: 800; color: #90a0a5; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 4px;">Suite Allocated</span>
          <span style="font-size: 14px; font-weight: bold; color: #1a1a1a;">${details.roomName}</span>
        </td>
      </tr>
      <tr>
        <td style="padding-top: 16px;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td>
                <span style="font-size: 10px; font-weight: 800; color: #90a0a5; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 4px;">Confirmation Code</span>
                <span style="font-size: 14px; font-weight: 900; font-family: monospace; color: ${ACCENT_COLOR}; letter-spacing: 0.05em;">BKG-${displayId}</span>
              </td>
              <td align="right">
                <span style="font-size: 10px; font-weight: 800; color: #90a0a5; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 4px;">Paid Amount</span>
                <span style="font-size: 16px; font-weight: 900; color: ${BRAND_COLOR};">₹${details.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <div style="text-align: center; margin: 36px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://home4stay.homes"}/booking/documents/${details.bookingId}" style="background-color: ${BRAND_COLOR}; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 16px; font-weight: bold; display: inline-block; font-size: 14px; box-shadow: 0 4px 15px rgba(5,51,68,0.25);">Manage Stay Summary</a>
    </div>

    <p style="font-size: 13px; line-height: 1.6; color: #a0aab0; margin-top: 32px;">
      Need adjustments, concierge booking, or airport transfers? Contact our 24/7 guest relations line directly at support@home4stay.homes. We hope you have a spectacular stay.
    </p>
  `;

  const html = buildBaseHtmlTemplate(subject, bodyContent);
  return { subject, html };
}

export async function sendPaymentRejectedEmail(email: string, details: EmailTemplateDetails) {
  const displayId = details.bookingId.substring(0, 8).toUpperCase();
  const subject = `Attention: Payment proof declined for booking hold (BKG-${displayId})`;

  const bodyContent = `
    <h2 style="font-size: 22px; font-weight: 800; color: #d9393e; margin-top: 0; margin-bottom: 16px; letter-spacing: -0.02em;">Payment Proof Verification Failed</h2>
    <p style="font-size: 15px; line-height: 1.6; color: ${TEXT_MUTED}; margin-bottom: 32px;">
      Dear ${details.guestName}, we regret to inform you that our host relations desk could not reconcile the payment transaction proof uploaded for your stay request at <strong>${details.propertyName}</strong>.
    </p>

    <div style="background-color: #fef5f5; border: 1px solid #fde2e3; border-radius: 20px; padding: 20px; margin-bottom: 32px; color: #d9393e;">
      <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 6px;">Reason for Decline</span>
      <span style="font-size: 14px; font-weight: bold; line-height: 1.5;">${details.rejectionReason || "Uploaded UTR / transaction receipt does not match our bank settlement records."}</span>
    </div>

    <p style="font-size: 14px; line-height: 1.6; color: ${TEXT_MUTED}; margin-bottom: 32px;">
      Consequently, the temporary booking hold has been released and room capacities have been returned to our active pool. 
      If this was an error, please re-book or get in touch with our billing desk with your correct bank transaction summary reference.
    </p>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://home4stay.homes"}/explore" style="background-color: #1a1a1a; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 14px; font-weight: bold; display: inline-block; font-size: 14px;">Browse Available Properties</a>
    </div>
  `;

  const html = buildBaseHtmlTemplate(subject, bodyContent);
  return { subject, html };
}

export async function sendBookingExpiredEmail(email: string, details: EmailTemplateDetails) {
  const displayId = details.bookingId.substring(0, 8).toUpperCase();
  const subject = `Expired: Your stay reservation hold has expired (BKG-${displayId})`;

  const bodyContent = `
    <h2 style="font-size: 22px; font-weight: 800; color: #808890; margin-top: 0; margin-bottom: 16px; letter-spacing: -0.02em;">Booking Hold Expired</h2>
    <p style="font-size: 15px; line-height: 1.6; color: ${TEXT_MUTED}; margin-bottom: 32px;">
      Dear ${details.guestName}, the temporary 15-minute inventory hold allocated for your reservation request at <strong>${details.propertyName}</strong> has expired before we received transaction details.
    </p>

    <p style="font-size: 14px; line-height: 1.6; color: ${TEXT_MUTED}; margin-bottom: 32px;">
      To prevent double-booking conflicts on popular suites, hold limits are strictly enforced on our platform. 
      Your room allocation has been released back into circulation. Feel free to start a new reservation if your travel plans are still active.
    </p>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://home4stay.homes"}/explore" style="background-color: ${BRAND_COLOR}; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 14px; font-weight: bold; display: inline-block; font-size: 14px;">Re-initialize Reservation</a>
    </div>
  `;

  const html = buildBaseHtmlTemplate(subject, bodyContent);
  return { subject, html };
}

export async function sendInvoiceGeneratedEmail(email: string, details: EmailTemplateDetails) {
  const displayId = details.bookingId.substring(0, 8).toUpperCase();
  const subject = `Your Home4Stay stay invoice is generated: ${details.invoiceNumber || 'INV-PENDING'}`;

  const bodyContent = `
    <h2 style="font-size: 22px; font-weight: 800; color: ${BRAND_COLOR}; margin-top: 0; margin-bottom: 16px; letter-spacing: -0.02em;">Stay Invoice & Statement Ready</h2>
    <p style="font-size: 15px; line-height: 1.6; color: ${TEXT_MUTED}; margin-bottom: 32px;">
      Dear ${details.guestName}, your official hotel invoice statement for your stay at <strong>${details.propertyName}</strong> is now compiled and ready for your records.
    </p>

    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fafbfc; border: 1px solid #f0f2f3; border-radius: 20px; padding: 20px; margin-bottom: 32px;">
      <tr>
        <td style="padding-bottom: 12px;">
          <span style="font-size: 10px; font-weight: 800; color: #a0aab0; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 2px;">Invoice Serial Number</span>
          <span style="font-size: 14px; font-weight: bold; color: ${BRAND_COLOR};">${details.invoiceNumber || "INV-PENDING"}</span>
        </td>
        <td style="padding-bottom: 12px;" align="right">
          <span style="font-size: 10px; font-weight: 800; color: #a0aab0; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 2px;">Total Paid</span>
          <span style="font-size: 14px; font-weight: bold; color: ${BRAND_COLOR};">₹${details.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </td>
      </tr>
      <tr>
        <td style="padding-top: 12px; border-top: 1px solid #edf0f1;">
          <span style="font-size: 10px; font-weight: 800; color: #a0aab0; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 2px;">Check-In Date</span>
          <span style="font-size: 13px; font-weight: bold; color: #1a1a1a;">${details.checkIn}</span>
        </td>
        <td style="padding-top: 12px; border-top: 1px solid #edf0f1;" align="right">
          <span style="font-size: 10px; font-weight: 800; color: #a0aab0; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 2px;">Reference UTR</span>
          <span style="font-size: 13px; font-weight: bold; font-family: monospace; color: #1a1a1a;">${details.paymentRef || "Verified"}</span>
        </td>
      </tr>
    </table>

    <p style="font-size: 14px; line-height: 1.6; color: ${TEXT_MUTED}; margin-bottom: 32px;">
      For your convenience, we have attached the formal digital PDF copy of this invoice directly to this email. You can also view it online inside your document dashboard at any time.
    </p>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://home4stay.homes"}/booking/documents/${details.bookingId}" style="background-color: ${BRAND_COLOR}; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 14px; font-weight: bold; display: inline-block; font-size: 14px;">Access Stay Document Center</a>
    </div>
  `;

  const html = buildBaseHtmlTemplate(subject, bodyContent);
  return { subject, html };
}
