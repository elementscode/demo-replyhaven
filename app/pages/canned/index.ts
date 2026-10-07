import { Request, Response, redirect } from "@elements/app";
import { currentUser } from "#app/shared/services/auth";
import { cannedReplies } from "#app/shared/services/canned";
import canned from "./template";

export default function route(req: Request, res: Response) {
  let me = currentUser();
  if (!me) {
    redirect("/signin");
    return;
  }

  return new canned({
    me,
    replies: cannedReplies.view(),
  });
}
