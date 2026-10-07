import { Request, Response, redirect } from "@elements/app";
import { currentUser } from "#app/shared/services/auth";
import { listTeam } from "./services";
import teamPage from "./template";

export default function route(req: Request, res: Response) {
  let me = currentUser();
  if (!me) {
    redirect("/signin");
    return;
  }

  // The nav hides Team from agents; a typed url lands back on the queue.
  if (me.role !== "admin") {
    redirect("/");
    return;
  }

  return new teamPage({ me, members: listTeam() });
}
