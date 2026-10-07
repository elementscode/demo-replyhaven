import { Request, Response, sql } from "@elements/app";
import invite from "./template";

export default function route(req: Request, res: Response) {
  let token = String(req.params.token ?? "");

  let pending = sql<{ email: string; name: string }>(`
    select
      email,
      name
    from users
    where
      inviteToken = ${token}
      and passwordHash is null
  `).first();

  return new invite({
    token,
    email: pending?.email ?? "",
    name: pending?.name ?? "",
    valid: !!pending,
  });
}
