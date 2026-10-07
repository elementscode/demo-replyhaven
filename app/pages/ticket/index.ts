import { NotFoundError, Request, Response, redirect, sql } from "@elements/app";
import { currentUser } from "#app/shared/services/auth";
import { cannedReplies } from "#app/shared/services/canned";
import {
  joinTicket,
  leaveTicket,
  listAgents,
  listViewers,
  messages,
  ticketPresence,
  tickets,
  ticketTyping,
} from "#app/shared/services/tickets";
import ticketPage from "./template";

export default function route(req: Request, res: Response) {
  let me = currentUser();
  if (!me) {
    redirect("/signin");
    return;
  }

  let found = sql<{ id: string }>(`
    select id
    from tickets
    where number = ${Number(req.params.number) || 0}
  `).firstOrThrow(new NotFoundError("ticket not found"));

  let ticketId = found.id;
  let userId = me.id;
  let userName = me.name;

  // One viewer row per open page; the grace period covers a reload.
  let presence = ticketPresence.listen({ filter: (e) => e.ticketId === ticketId })
    .on("connect", (l) => joinTicket(l.id, ticketId, userId, userName))
    .on("disconnect", (l) => setTimeout(() => leaveTicket(l.id, ticketId), 3000));

  return new ticketPage({
    me,
    ticketId,
    ticket: tickets.view({ id: ticketId }),
    messages: messages.view({ ticketId }),
    canned: cannedReplies.view(),
    agents: listAgents(),
    presence,
    viewers: listViewers(ticketId),
    typing: ticketTyping.listen({ filter: (p) => p.ticketId === ticketId && p.userId !== userId }),
  });
}
