import { Controller, Post, Body } from '@nestjs/common';
import { MailService } from '../mail/mail.service';


@Controller()
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send-email')
  async sendEmail(
    @Body() body: { to: string; subject: string; text: string; html?: string }
  ) {
    return this.mailService.sendMail(body.to, body.subject, body.text, body.html);
  }
}
