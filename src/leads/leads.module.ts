import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import { LeadsController } from './leads.controller.js';
import { WebhooksController } from './webhooks.controller.js';
import { LeadsService } from './leads.service.js';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn:
            (config.get<string>('JWT_EXPIRES_IN') as StringValue) ?? '7d',
        },
      }),
    }),
  ],
  controllers: [LeadsController, WebhooksController],
  providers: [LeadsService],
})
export class LeadsModule {}
