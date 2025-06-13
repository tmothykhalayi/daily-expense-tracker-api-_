import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST') || 'localhost',
      port: +(this.configService.get<number>('MAIL_PORT') || 587),
      secure: +(this.configService.get<number>('MAIL_PORT') || 587) === 465,
      auth: {
        user: this.configService.get<string>('MAIL_USER') || '',
        pass: this.configService.get<string>('MAIL_PASS') || '',
      },
    });
  }

  /**
   * Generic method to send an email
   */
  async sendMail(
    to: string,
    subject: string,
    text: string,
    html?: string,
  ): Promise<void> {
    const from = `"Your App" <${this.configService.get<string>('MAIL_FROM')}>`;

    try {
      await this.transporter.sendMail({
        from,
        to,
        subject,
        text,
        html,
      });

      this.logger.log(`Email sent to ${to} with subject "${subject}"`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Convenience method to send a welcome email
   */
  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const subject = 'Welcome to Our App!';
    const text = `Hi ${name}, welcome to our platform! We’re glad to have you.`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Hello ${name},</h2>
        <p>Welcome to <strong>Your App</strong>! 🎉</p>
        <p>We're excited to have you on board. If you have any questions, feel free to reach out.</p>
        <p>Cheers,<br/>The Your App Team</p>
      </div>
    `;

    await this.sendMail(to, subject, text, html);
  }
}
