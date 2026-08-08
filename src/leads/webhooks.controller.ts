import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { LeadsService } from './leads.service.js';
import type { RdWebhookPayload } from './rd-webhook.type.js';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get('rdstation/:token')
  rdstationHealth() {
    return { status: 'ok' };
  }

  @Post('rdstation/:token')
  rdstation(@Param('token') token: string, @Body() payload: RdWebhookPayload) {
    return this.leadsService.ingestFromWebhook(token, payload);
  }
}
