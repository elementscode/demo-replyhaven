import { Request, Response, redirect } from "@elements/app";
import { currentUser } from "#app/shared/services/auth";
import { tickets, listAgents } from "#app/shared/services/tickets";
import dashboard from "./template";

export default function route(req: Request, res: Response) {
  let me = currentUser();
  if (!me) {
    redirect("/signin");
    return;
  }

  return new dashboard({
    me,
    tickets: tickets.view(),
    agents: listAgents(),
  });
}
