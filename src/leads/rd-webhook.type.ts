interface RdWebhookContact {
  uuid?: string;
  email?: string;
  name?: string;
  personal_phone?: string;
  mobile_phone?: string;
  [key: string]: unknown;
}

export interface RdWebhookPayload {
  event_type?: string;
  entity_type?: string;
  event_identifier?: string;
  timestamp?: string;
  event_timestamp?: string;
  contact?: RdWebhookContact;
  [key: string]: unknown;
}
