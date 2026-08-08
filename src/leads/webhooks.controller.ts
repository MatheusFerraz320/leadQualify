import { Body, Controller, Get, Logger, Param, Post } from '@nestjs/common';
import { LeadsService } from './leads.service.js';
import type { RdWebhookPayload } from './rd-webhook.type.js';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(private readonly leadsService: LeadsService) {}

  @Get('rdstation/:token')
  rdstationHealth() {
    return { status: 'ok' };
  }

  @Post('rdstation/:token')
  rdstation(@Param('token') token: string, @Body() payload: RdWebhookPayload) {
    this.logger.log(
      `POST rdstation recebido | evento: ${payload.event_type ?? '?'} | corpo: ${JSON.stringify(
        payload,
      ).slice(0, 500)}`,
    );
    return this.leadsService.ingestFromWebhook(token, payload);
  }
}
