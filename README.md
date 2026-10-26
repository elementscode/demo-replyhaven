![A help desk with a live ticket queue, built by Claude Code on Elements: the shared ticket queue sorted by priority, with overdue badges, status pills, assignees, and the agents viewing each ticket.](https://elements.dev/demos/01a1140a-7e05-7a74-87f2-ca8732597a3f/poster?v=d027e8da369b)

# A help desk with a live ticket queue, built by Claude Code on Elements

> Replyhaven is a full-stack app built with Claude Code on Elements.

A live ticket queue with overdue badges, email replies, internal notes, canned replies, and who is viewing or typing on each ticket.

[Run this app on your machine](https://elements.dev/demos/01a1140a-7e05-7a74-87f2-ca8732597a3f). Use this demo as inspiration, or as the starting point for your own app. Your agent creates a new app with this one as the scaffold, and you prompt it to add whatever features you want.

## How it's built

Replyhaven needed a shared queue that reorders itself as tickets arrive, conversations that stay current in every open window, email both ways with customers, and a way for agents to see who else is on a ticket. Each of those is a part of Elements, so the agent spent its 16 minutes on the help desk itself.

- **A live queue and conversations.** Tickets, messages and canned replies are LiveTables. A database trigger announces every change, so a new ticket from the contact form lands in each agent's queue, sorted by priority then age, and a reply appears in every open copy of the ticket.

- **First reply targets.** Each priority has a target, from one hour for urgent to 24 for low. The queue counts down to each ticket's target, marks it overdue once the time passes, and the dashboard reports the median first reply and the share that met the target.

- **Who is viewing and typing.** A presence channel records each open ticket page, which shows "Priya is also viewing this ticket" and an eye with avatars on the queue row. A typing channel carries "is writing a reply" between agents on the same ticket.

- **Email both ways.** The public contact form opens a ticket and emails the customer a confirmation. An agent's reply schedules a background job that emails it to the customer, and internal notes stay with the agents.

- **Server calls as function calls.** The contact form, invites and presence lookups call server functions straight from the page with `@rpc`, with types checked from the template to the database.

- **Sessions and roles.** The admin invites agents by email and manages canned replies, and every server call checks the signed-in role with one shared guard. Migrations define the schema and seed one admin, three agents and 20 tickets with their conversations.

## Why Elements

Elements is an integrated full-stack app framework and a project server. The project server checks the agent's work as it builds: it type-checks the server and browser code, analyzes the program, applies migrations and runs the tests, then reports the results to the agent. A security mistake, such as calling a server-only function from the browser, is a compile error. The agent reads the report and fixes its own mistakes before it tells you a feature is done. The same checks run on every feature you ask for next.
