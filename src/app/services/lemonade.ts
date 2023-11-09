import * as assert from 'node:assert';

import { lemonadeApiUrl } from '../../config';

interface Ticket {
  readonly _id: string;
  readonly ticket_type_id: string;
  readonly ticket_type_title: string;
  readonly event_id: string;
  readonly event_name: string;
  readonly event_cover: string;
  readonly user_name: string;
  readonly user_email: string;
}

export async function getTickets(email: string) {
  if (!lemonadeApiUrl) return;

  const response = await fetch(lemonadeApiUrl + 'user/export-tickets?limit=100', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
    body: JSON.stringify({ email }),
  });

  assert.ok(response.ok);

  return await response.json() as Ticket[];
}
