-- demo data: one admin, three agents, twenty tickets with conversations

insert into users (
  id,
  email,
  name,
  role,
  passwordHash,
  acceptedAt
) values (
  '0192f000-0000-7000-8000-00000000a001',
  'maya@replyhaven.dev',
  'Maya Okafor',
  'admin',
  crypt('replyhaven', genSalt('bf', 12)),
  now() - interval '90 days'
), (
  '0192f000-0000-7000-8000-00000000a002',
  'sam@replyhaven.dev',
  'Sam Rivera',
  'agent',
  crypt('replyhaven', genSalt('bf', 12)),
  now() - interval '80 days'
), (
  '0192f000-0000-7000-8000-00000000a003',
  'priya@replyhaven.dev',
  'Priya Natarajan',
  'agent',
  crypt('replyhaven', genSalt('bf', 12)),
  now() - interval '60 days'
), (
  '0192f000-0000-7000-8000-00000000a004',
  'leo@replyhaven.dev',
  'Leo Fischer',
  'agent',
  crypt('replyhaven', genSalt('bf', 12)),
  now() - interval '30 days'
);

-- Inserted oldest first so ticket numbers rise with age.
insert into tickets (
  id,
  subject,
  customerName,
  customerEmail,
  status,
  priority,
  assigneeId,
  tags,
  createdAt,
  firstRepliedAt,
  solvedAt
)
select
  v.id::uuid,
  v.subject,
  v.customerName,
  v.customerEmail,
  v.status::ticketStatus,
  v.priority::ticketPriority,
  v.assigneeId::uuid,
  v.tags::text[],
  now() - v.createdAgo::interval,
  now() - v.repliedAgo::interval,
  now() - v.solvedAgo::interval
from (values
  ('0192f000-0000-7000-8000-000000000001', 'Charged twice for October', 'Dana Whitfield', 'dana@harborbakery.com', 'new', 'urgent', null, '{billing}', '2 hours', null, null),
  ('0192f000-0000-7000-8000-000000000002', 'SSO login loops back to the sign-in page', 'Marcus Lee', 'marcus.lee@northwind.io', 'new', 'high', null, '{sso,login}', '5 hours', null, null),
  ('0192f000-0000-7000-8000-000000000003', 'How do I bill a client in a second currency?', 'Elena Petrova', 'elena@petrova.design', 'new', 'low', null, '{multi-currency,how-to}', '3 hours', null, null),
  ('0192f000-0000-7000-8000-000000000004', 'Invoice PDF shows the wrong tax rate', 'Tom Akers', 'tom@akersplumbing.com', 'new', 'normal', '0192f000-0000-7000-8000-00000000a003', '{tax,pdf}', '9 hours', null, null),
  ('0192f000-0000-7000-8000-000000000005', 'API returns 502 on /v2/invoices', 'Kenji Watanabe', 'kenji@shipfast.dev', 'new', 'urgent', null, '{api,outage}', '25 minutes', null, null),
  ('0192f000-0000-7000-8000-000000000006', 'Recurring invoices did not send this morning', 'Grace Holloway', 'grace@hollowaylaw.com', 'open', 'high', '0192f000-0000-7000-8000-00000000a002', '{recurring,email}', '26 hours', '24 hours', null),
  ('0192f000-0000-7000-8000-000000000007', 'Accounting export is missing line items', 'Ravi Shah', 'ravi@shahconsulting.co', 'open', 'normal', '0192f000-0000-7000-8000-00000000a003', '{integrations,export}', '2 days', '43 hours', null),
  ('0192f000-0000-7000-8000-000000000008', 'Can''t invite my accountant to the workspace', 'Olivia Brandt', 'olivia@brandtstudio.com', 'open', 'normal', '0192f000-0000-7000-8000-00000000a004', '{permissions}', '6 hours', '5 hours', null),
  ('0192f000-0000-7000-8000-000000000009', 'Card payouts are not reconciling', 'Hector Alvarez', 'hector@alvarezcoffee.com', 'open', 'high', '0192f000-0000-7000-8000-00000000a002', '{payouts,payments}', '30 hours', '27 hours', null),
  ('0192f000-0000-7000-8000-000000000010', 'Does custom invoice numbering reset each year?', 'Freya Lindqvist', 'freya@lindqvist.se', 'open', 'low', '0192f000-0000-7000-8000-00000000a004', '{how-to,numbering}', '3 days', '2 days', null),
  ('0192f000-0000-7000-8000-000000000011', 'Webhook signatures failing verification', 'Nina Kowalski', 'nina@ledgerline.app', 'open', 'urgent', '0192f000-0000-7000-8000-00000000a003', '{api,webhooks}', '4 hours', '210 minutes', null),
  ('0192f000-0000-7000-8000-000000000012', 'Request: dark mode for the client portal', 'Sasha Ivanova', 'sasha@pixelmint.co', 'pending', 'low', '0192f000-0000-7000-8000-00000000a004', '{feature-request,portal}', '4 days', '3 days', null),
  ('0192f000-0000-7000-8000-000000000013', 'Late fee applied to an invoice that was paid', 'Owen Gallagher', 'owen@gallagherbuilds.ie', 'pending', 'high', '0192f000-0000-7000-8000-00000000a002', '{billing,late-fees}', '2 days', '45 hours', null),
  ('0192f000-0000-7000-8000-000000000014', 'Bulk delete for draft invoices?', 'Mei Chen', 'mei@chenandco.com', 'pending', 'normal', '0192f000-0000-7000-8000-00000000a003', '{how-to}', '28 hours', '22 hours', null),
  ('0192f000-0000-7000-8000-000000000015', 'Data export for a GDPR request', 'Lukas Weber', 'lukas@weberdigital.de', 'pending', 'normal', '0192f000-0000-7000-8000-00000000a001', '{gdpr,export}', '3 days', '62 hours', null),
  ('0192f000-0000-7000-8000-000000000016', 'Password reset email never arrives', 'Amara Okoye', 'amara@okoyefoods.ng', 'solved', 'normal', '0192f000-0000-7000-8000-00000000a002', '{login,email}', '9 hours', '7 hours', '3 hours'),
  ('0192f000-0000-7000-8000-000000000017', 'Change the billing contact on our account', 'Julia Romano', 'julia@romanowines.it', 'solved', 'low', '0192f000-0000-7000-8000-00000000a003', '{billing,account}', '30 hours', '20 hours', '19 hours'),
  ('0192f000-0000-7000-8000-000000000018', 'Duplicate client records after CSV import', 'Daniel Park', 'daniel@parkfitness.com', 'solved', 'high', '0192f000-0000-7000-8000-00000000a004', '{import,clients}', '12 hours', '10 hours', '6 hours'),
  ('0192f000-0000-7000-8000-000000000019', 'Recording a partial payment on an invoice', 'Chloe Martin', 'chloe@martinflorals.fr', 'solved', 'normal', '0192f000-0000-7000-8000-00000000a002', '{payments,how-to}', '20 hours', '15 hours', '14 hours'),
  ('0192f000-0000-7000-8000-000000000020', 'Switching from monthly to the annual plan', 'Ibrahim Haddad', 'ibrahim@haddadarch.com', 'solved', 'low', '0192f000-0000-7000-8000-00000000a003', '{billing,plans}', '9 days', '8 days', '8 days')
) as v (id, subject, customerName, customerEmail, status, priority, assigneeId, tags, createdAgo, repliedAgo, solvedAgo)
order by now() - v.createdAgo::interval;

insert into messages (
  ticketId,
  kind,
  authorId,
  authorName,
  body,
  createdAt
)
select
  ('0192f000-0000-7000-8000-0000000000' || lpad(v.ticket::text, 2, '0'))::uuid,
  v.kind::messageKind,
  v.authorId::uuid,
  v.authorName,
  v.body,
  now() - v.ago::interval
from (values
  (1, 'customer', null, 'Dana Whitfield', 'Hi, our card was charged $49 twice on October 1st for the Pro plan. Can you refund the duplicate? We''re a small bakery and it matters.', '2 hours'),

  (2, 'customer', null, 'Marcus Lee', 'Since this morning everyone on our team who signs in through SSO lands back on the Tallyhook sign-in page. No error, it just loops. Password sign-in still works for the owner account.', '5 hours'),

  (3, 'customer', null, 'Elena Petrova', 'I have a new client in Germany who wants invoices in EUR, but my account is set to USD. Is there a way to do both?', '3 hours'),

  (4, 'customer', null, 'Tom Akers', 'Invoices generated today show 7.5% sales tax on the PDF, but my settings say 8.25%. The total in the web app looks right, it''s just the PDF.', '9 hours'),
  (4, 'note', '0192f000-0000-7000-8000-00000000a003', 'Priya Natarajan', 'Looks like the PDF renderer is caching the old tax table. Asked engineering in #billing-eng.', '7 hours'),

  (5, 'customer', null, 'Kenji Watanabe', 'Every POST to /v2/invoices has returned 502 for the last 20 minutes. Our checkout depends on this. Request id: req_8f2a91.', '25 minutes'),

  (6, 'customer', null, 'Grace Holloway', 'Our 14 recurring invoices scheduled for 8am did not go out. The status says "scheduled" still.', '26 hours'),
  (6, 'reply', '0192f000-0000-7000-8000-00000000a002', 'Sam Rivera', 'Hi Grace, thanks for flagging this. We had a delay in the scheduler this morning and I''ve re-queued your invoices. They should all send within the hour. I''ll confirm once they do.', '24 hours'),
  (6, 'note', '0192f000-0000-7000-8000-00000000a002', 'Sam Rivera', 'Re-queued via admin console. 12 of 14 sent; 2 bounced on bad client addresses.', '23 hours'),
  (6, 'customer', null, 'Grace Holloway', 'Thanks Sam. Two clients say they still haven''t received theirs. Can you check?', '3 hours'),

  (7, 'customer', null, 'Ravi Shah', 'When I export invoices to my accounting software, invoices with more than 10 line items arrive with only the first 10.', '2 days'),
  (7, 'reply', '0192f000-0000-7000-8000-00000000a003', 'Priya Natarajan', 'Hi Ravi, I was able to reproduce this. It''s a limit in our accounting sync and I''ve raised it with the integrations team. In the meantime, a CSV export carries every line.', '43 hours'),
  (7, 'customer', null, 'Ravi Shah', 'CSV works, thanks. Any ETA on the fix? My bookkeeper closes the month on Friday.', '20 hours'),

  (8, 'customer', null, 'Olivia Brandt', 'I''m trying to invite my accountant but the invite button is greyed out.', '6 hours'),
  (8, 'reply', '0192f000-0000-7000-8000-00000000a004', 'Leo Fischer', 'Hi Olivia, the Starter plan includes one seat, which is why invites are disabled. You can add an accountant as a free "read-only" member under Settings, Team, Accountant access.', '5 hours'),
  (8, 'customer', null, 'Olivia Brandt', 'I don''t see "Accountant access" in my settings. Screenshot attached in my next email if needed.', '1 hour'),

  (9, 'customer', null, 'Hector Alvarez', 'Our card payout on Monday was $3,240 but Tallyhook shows only $2,980 matched. The difference doesn''t match any fee I can see.', '30 hours'),
  (9, 'reply', '0192f000-0000-7000-8000-00000000a002', 'Sam Rivera', 'Hi Hector, could you send the payout id from your payout report? I''ll trace which charges were included.', '27 hours'),
  (9, 'customer', null, 'Hector Alvarez', 'Sure: PO-58213. Thanks!', '25 hours'),
  (9, 'note', '0192f000-0000-7000-8000-00000000a002', 'Sam Rivera', 'Two refunds from last week were netted into this payout. Need to confirm with payments team that we don''t display netted refunds.', '22 hours'),

  (10, 'customer', null, 'Freya Lindqvist', 'If I use the pattern INV-{YYYY}-{0000}, does the counter reset on January 1st?', '3 days'),
  (10, 'reply', '0192f000-0000-7000-8000-00000000a004', 'Leo Fischer', 'Hi Freya, yes: when the pattern includes {YYYY}, the counter restarts at 0001 each calendar year.', '2 days'),
  (10, 'customer', null, 'Freya Lindqvist', 'Great. And can I start this year''s counter at 0140 to continue from my old system?', '2 days'),

  (11, 'customer', null, 'Nina Kowalski', 'Our webhook handler started rejecting every event at 9:12 UTC. We verify with the signing secret from the dashboard and nothing changed on our side.', '4 hours'),
  (11, 'reply', '0192f000-0000-7000-8000-00000000a003', 'Priya Natarajan', 'Hi Nina, we rotated webhook signing secrets for accounts flagged in this morning''s security review and the notice email went out late. Your new secret is in Settings, Developers. Sorry for the disruption.', '210 minutes'),
  (11, 'customer', null, 'Nina Kowalski', 'Updated the secret and events verify again. Can you resend the events we rejected between 9:12 and now?', '2 hours'),

  (12, 'customer', null, 'Sasha Ivanova', 'Our clients keep asking for a dark mode in the payment portal. Any plans?', '4 days'),
  (12, 'reply', '0192f000-0000-7000-8000-00000000a004', 'Leo Fischer', 'Hi Sasha, it''s on our roadmap for the portal refresh. I''ve added your vote. Is it OK if the product team reaches out for a short call?', '3 days'),

  (13, 'customer', null, 'Owen Gallagher', 'Invoice #2291 was paid by bank transfer on the 2nd, but a 5% late fee was added on the 3rd.', '2 days'),
  (13, 'reply', '0192f000-0000-7000-8000-00000000a002', 'Sam Rivera', 'Hi Owen, I''ve removed the late fee. The transfer was recorded on the 3rd, after the fee ran. Could you confirm the client received the corrected invoice?', '45 hours'),

  (14, 'customer', null, 'Mei Chen', 'I have about 300 old drafts. Is there a way to delete them all at once?', '28 hours'),
  (14, 'reply', '0192f000-0000-7000-8000-00000000a003', 'Priya Natarajan', 'Hi Mei, in Invoices, filter by Status: Draft, tick the header checkbox to select the page, then More, Delete. It works 100 at a time. Let me know if that does it.', '22 hours'),

  (15, 'customer', null, 'Lukas Weber', 'One of our clients made a GDPR access request. How do we export everything Tallyhook holds about them?', '3 days'),
  (15, 'reply', '0192f000-0000-7000-8000-00000000a001', 'Maya Okafor', 'Hi Lukas, open the client, then More, Export client data. It produces a zip with their profile, invoices and payments. Do you also need the email delivery logs?', '62 hours'),
  (15, 'note', '0192f000-0000-7000-8000-00000000a001', 'Maya Okafor', 'Delivery logs need a manual export from our email provider if they say yes.', '62 hours'),

  (16, 'customer', null, 'Amara Okoye', 'I requested a password reset four times and nothing arrives, not even in spam.', '9 hours'),
  (16, 'reply', '0192f000-0000-7000-8000-00000000a002', 'Sam Rivera', 'Hi Amara, your address was on our provider''s suppression list after a bounce in August. I''ve removed it. Could you try the reset again?', '7 hours'),
  (16, 'customer', null, 'Amara Okoye', 'Got it this time. All sorted, thank you!', '4 hours'),
  (16, 'reply', '0192f000-0000-7000-8000-00000000a002', 'Sam Rivera', 'Glad to hear it, Amara. I''ll close this out.', '3 hours'),

  (17, 'customer', null, 'Julia Romano', 'Please send our invoices to accounts@romanowines.it from now on.', '30 hours'),
  (17, 'reply', '0192f000-0000-7000-8000-00000000a003', 'Priya Natarajan', 'Done, Julia. The billing contact is now accounts@romanowines.it, starting with next month''s invoice.', '20 hours'),

  (18, 'customer', null, 'Daniel Park', 'I imported our client list twice by mistake and now every client appears two times.', '12 hours'),
  (18, 'reply', '0192f000-0000-7000-8000-00000000a004', 'Leo Fischer', 'Hi Daniel, I can merge them for you. The second import added 412 clients with no invoices; I''ll remove those and keep the originals.', '10 hours'),
  (18, 'note', '0192f000-0000-7000-8000-00000000a004', 'Leo Fischer', 'Ran the dedupe script against import batch 2. 412 rows removed.', '7 hours'),
  (18, 'reply', '0192f000-0000-7000-8000-00000000a004', 'Leo Fischer', 'All done, Daniel. Each client now appears once. Let us know if anything looks off.', '6 hours'),

  (19, 'customer', null, 'Chloe Martin', 'A client paid half an invoice upfront. How do I record that without marking it paid?', '20 hours'),
  (19, 'reply', '0192f000-0000-7000-8000-00000000a002', 'Sam Rivera', 'Hi Chloe, open the invoice and choose Record payment, then enter the partial amount. The invoice stays open with the balance due.', '15 hours'),

  (20, 'customer', null, 'Ibrahim Haddad', 'We''d like to move to annual billing. Do we get the discount right away?', '9 days'),
  (20, 'reply', '0192f000-0000-7000-8000-00000000a003', 'Priya Natarajan', 'Hi Ibrahim, yes: switching applies the 20% annual discount immediately and credits the unused part of this month.', '8 days')
) as v (ticket, kind, authorId, authorName, body, ago);

update tickets t
set lastMessageAt = m.lastAt
from (
  select
    ticketId,
    max(createdAt) as lastAt
  from messages
  group by ticketId
) m
where m.ticketId = t.id;

insert into cannedReplies (
  title,
  body
) values (
  'Acknowledge and investigating',
  'Hi {{first_name}},

Thanks for reaching out. I''m looking into this now and will update you as soon as I know more.

{{agent}}'
), (
  'Ask for more details',
  'Hi {{first_name}},

Thanks for the report. Could you send a screenshot and the steps that lead to the problem? The more detail, the faster we can pin it down.

{{agent}}'
), (
  'Refund issued',
  'Hi {{first_name}},

I''ve issued a refund for the duplicate charge. It should appear on your statement within 5 to 10 business days.

{{agent}}'
), (
  'SSO troubleshooting',
  'Hi {{first_name}},

Most SSO loops come from a mismatched ACS URL. In your identity provider, check that it reads https://app.tallyhook.com/sso/acs exactly, then try signing in from a private window.

{{agent}}'
), (
  'Resolved, closing',
  'Hi {{first_name}},

Glad that''s sorted. I''ll mark this ticket solved. Just reply if anything else comes up.

{{agent}}'
);
