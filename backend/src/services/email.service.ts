import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password',
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"Stride Fitness" <${process.env.EMAIL_USER || 'your-email@gmail.com'}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
    } catch (error) {
      console.error('Failed to send email:', error);
      // Don't throw - we don't want email failures to break the API flow
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string, userName: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL || 'https://stride-phi-one.vercel.app'}/reset-password?token=${resetToken}`;
    
    const html = this.getPasswordResetEmailTemplate(userName, resetUrl, email);
    const text = this.getPasswordResetEmailText(userName, resetUrl, email);

    await this.sendEmail({
      to: email,
      subject: 'Reset your Stride Fitness password',
      html,
      text,
    });
  }

  private getPasswordResetEmailTemplate(userName: string, resetUrl: string, email: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your Stride password</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background-color: #090d16; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .logo { text-align: center; margin-bottom: 30px; }
    .logo-box { display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #10b981, #06b6d4); border-radius: 12px; line-height: 48px; text-align: center; font-size: 24px; color: #090d16; font-weight: bold; }
    .card { background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 32px; }
    h1 { color: #ffffff; font-size: 24px; font-weight: 700; margin: 0 0 8px 0; }
    p { color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0; }
    .button { display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #10b981, #06b6d4); color: #090d16; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 14px; }
    .footer { text-align: center; margin-top: 24px; color: #64748b; font-size: 12px; }
    .link { color: #10b981; word-break: break-all; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <div class="logo-box">⚡</div>
    </div>
    <div class="card">
      <h1>Reset your password</h1>
      <p>Hi ${userName},</p>
      <p>We received a request to reset your Stride Fitness password. Click the button below to choose a new password. This link will expire in 1 hour.</p>
      <p style="text-align: center;">
        <a href="${resetUrl}" class="button">Reset Password</a>
      </p>
      <p>If you didn't request this, you can safely ignore this email. Your password won't change.</p>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p class="link">${resetUrl}</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Stride Fitness. All rights reserved.</p>
      <p>This email was sent to ${email}</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  private getPasswordResetEmailText(userName: string, resetUrl: string, email: string): string {
    return `
Reset your Stride Fitness password

Hi ${userName},

We received a request to reset your Stride Fitness password. Click the link below to choose a new password. This link will expire in 1 hour.

${resetUrl}

If you didn't request this, you can safely ignore this email. Your password won't change.

© ${new Date().getFullYear()} Stride Fitness. All rights reserved.
    `;
  }
}