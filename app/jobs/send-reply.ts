import { Job, email, sql } from "@elements/app";
import CustomerReplyEmail from "#app/emails/customer-reply";

interface ReplyRow {
  body: string;
  authorName: string;
  number: number;
  subject: string;
  customerEmail: string;
}

/** Emails an agent's reply to the ticket's customer. */
export class SendReplyJob extends Job<{ messageId: string }> {
  static maxAttempts = 5;

  run() {
    let reply = sql<ReplyRow>(`
      select
        m.body,
        m.authorName,
        t.number,
        t.subject,
        t.customerEmail
      from messages m
      join tickets t on t.id = m.ticketId
      where
        m.id = ${this.fields.messageId}
        and m.kind = 'reply'
    `).first();

    if (!reply) {
      return;
    }

    email({
      to: reply.customerEmail,
      subject: `Re: [#${reply.number}] ${reply.subject}`,
      body: new CustomerReplyEmail({
        agentName: reply.authorName,
        body: reply.body,
        ticketNumber: reply.number,
        subject: reply.subject,
      }),
    });
  }
}
