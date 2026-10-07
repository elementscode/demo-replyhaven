![Replyhaven, a help desk for a software company's support team built with Elements: the shared ticket queue sorted by priority, with overdue badges, status pills, assignees, and the agents viewing each ticket.](https://elements.dev/demos/01a1140a-7e05-7a74-87f2-ca8732597a3f/poster?v=d027e8da369b)

# Replyhaven

> A demo app built with [Elements](https://elements.dev).

A live ticket queue with overdue badges, email replies, internal notes, canned replies, and who is viewing or typing on each ticket.

**Demo:** [Replyhaven](https://elements.dev/demos/01a1140a-7e05-7a74-87f2-ca8732597a3f)

## Agent specs

- **Agent:** Claude Code, Opus 5.5 Medium
- **Time:** 16 min
- **Cost:** $6.19 at API rates, October 2026

## Get started

```bash
elements create replyhaven -scaffold=elementscode/demo-replyhaven
```

## How it's built

Replyhaven needed a shared queue that reorders itself as tickets arrive, conversations that stay current in every open window, email both ways with customers, and a way for agents to see who else is on a ticket. Each of those is a part of Elements, so the agent spent its 16 minutes on the help desk itself.

### What Elements gave the app

- **A live queue and conversations.** Tickets, messages and canned replies are LiveTables. A database trigger announces every change, so a new ticket from the contact form lands in each agent's queue, sorted by priority then age, and a reply appears in every open copy of the ticket.

- **First reply targets.** Each priority has a target, from one hour for urgent to 24 for low. The queue counts down to each ticket's target, marks it overdue once the time passes, and the dashboard reports the median first reply and the share that met the target.

- **Who is viewing and typing.** A presence channel records each open ticket page, which shows "Priya is also viewing this ticket" and an eye with avatars on the queue row. A typing channel carries "is writing a reply" between agents on the same ticket.

- **Email both ways.** The public contact form opens a ticket and emails the customer a confirmation. An agent's reply schedules a background job that emails it to the customer, and internal notes stay with the agents.

- **Server calls as function calls.** The contact form, invites and presence lookups call server functions straight from the page with `@rpc`, with types checked from the template to the database.

- **Sessions and roles.** The admin invites agents by email and manages canned replies, and every server call checks the signed-in role with one shared guard. Migrations define the schema and seed one admin, three agents and 20 tickets with their conversations.

### What the project server gave the agent

The project server runs alongside the agent and answers as soon as a file is saved: it type-checks the templates, TypeScript and SQL, applies migrations and reruns the tests, so every question came back right away and the agent kept building.

### What shipped

The app type-checks with zero errors and all 20 tests pass. Every page works on desktop and phone, and the queue, conversations and who is viewing update live across tabs.

## Demo accounts

The seed creates 20 tickets across every status and priority, each with a
conversation, plus five canned replies, and four accounts. Every account's
password is `replyhaven`, and the sign-in page lists them. Customers write in
at `/contact`.

| Email                  | Role  |
| ---------------------- | ----- |
| maya@replyhaven.dev    | admin |
| sam@replyhaven.dev     | agent |
| priya@replyhaven.dev   | agent |
| leo@replyhaven.dev     | agent |

**Demo:** [Replyhaven](https://elements.dev/demos/01a1140a-7e05-7a74-87f2-ca8732597a3f)

## License

MIT. See [LICENSE](LICENSE).
