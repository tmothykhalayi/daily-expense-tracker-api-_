import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from '../mail/mail.controller';
import { ConfigModule } from '@nestjs/config';
@Module({

  providers: [MailService],
  exports: [MailService],
  controllers: [MailController],
})
export class MailModule {}
