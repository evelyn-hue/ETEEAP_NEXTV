import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOtpEmail(email: string, otp: string) {
  await transporter.sendMail({
    from: `"ETEEAP NEXTV" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Your ETEEAP Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #1e3a5f;">ETEEAP NEXTV</h1>
        <p style="font-size: 16px;">Your verification code is:</p>
        <div style="background: #f0f4ff; border-radius: 12px; padding: 24px; text-align: center; margin: 16px 0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1e3a5f;">${otp}</span>
        </div>
        <p style="color: #64748b; font-size: 14px;">This code expires in 10 minutes. If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });
}

export async function sendResetEmail(email: string, resetLink: string) {
  await transporter.sendMail({
    from: `"ETEEAP NEXTV" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Reset Your ETEEAP Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #1e3a5f;">ETEEAP NEXTV</h1>
        <p style="font-size: 16px;">You requested a password reset.</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${resetLink}" style="background: #1e3a5f; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">Reset Password</a>
        </div>
        <p style="color: #64748b; font-size: 14px;">This link expires in 15 minutes. If you didn't request this, please ignore.</p>
      </div>
    `,
  });
}

export async function sendStatusEmail(email: string, applicantName: string, action: string, details: string) {
  await transporter.sendMail({
    from: `"ETEEAP NEXTV" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Application ${action} - ETEEAP NEXTV`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #1e3a5f;">ETEEAP NEXTV</h1>
        <p>Dear ${applicantName},</p>
        <p>Your application has been <strong>${action}</strong>.</p>
        <p style="color: #64748b;">${details}</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px;">This is an automated message from the ETEEAP system.</p>
      </div>
    `,
  });
}
