interface RdWebhookConversion {
  content?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface RdWebhookLead {
  id?: string;
  email?: string;
  name?: string;
  phone?: string;
  personal_phone?: string;
  mobile_phone?: string;
  company?: string;
  job_title?: string;
  first_conversion?: RdWebhookConversion;
  last_conversion?: RdWebhookConversion;
  [key: string]: unknown;
}

interface RdWebhookContact {
  uuid?: string;
  email?: string;
  name?: string;
  personal_phone?: string;
  mobile_phone?: string;
  [key: string]: unknown;
}

export interface RdWebhookPayload {
  leads?: RdWebhookLead[];
  event_type?: string;
  entity_type?: string;
  event_identifier?: string;
  timestamp?: string;
  event_timestamp?: string;
  contact?: RdWebhookContact;
  [key: string]: unknown;
}
