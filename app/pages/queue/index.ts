import { Request, Response, redirect } from "@elements/app";
import { currentUser } from "#app/shared/services/auth";
import { tickets, listAgents, listViewers, ticketPresence } from "#app/shared/services/tickets";
import queue, { VIEWS } from "./template";

export default function route(req: Request, res: Response) {
  let me = currentUser();
  if (!me) {
    redirect("/signin");
    return;
  }

  let requested = String(req.query.view ?? "");
  let view = VIEWS.some((v) => v.key === requested) ? requested : "all";

  // Listen before reading, so a viewer who arrives in between is not missed.
  let presence = ticketPresence.listen();

  return new queue({
    me,
    tickets: tickets.view(),
    agents: listAgents(),
    presence,
    viewers: listViewers(),
    initialView: view,
  });
}
