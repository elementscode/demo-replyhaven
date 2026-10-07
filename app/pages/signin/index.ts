import { Request, Response, redirect, session } from "@elements/app";
import signin, { DemoLogin } from "./template";

const DEMO_LOGINS: DemoLogin[] = [
  { name: "Maya Okafor", email: "maya@replyhaven.dev", role: "admin" },
  { name: "Sam Rivera", email: "sam@replyhaven.dev", role: "agent" },
  { name: "Priya Natarajan", email: "priya@replyhaven.dev", role: "agent" },
  { name: "Leo Fischer", email: "leo@replyhaven.dev", role: "agent" },
];

export default function route(req: Request, res: Response) {
  if (session.isLoggedIn()) {
    redirect("/");
    return;
  }

  return new signin({
    demoLogins: DEMO_LOGINS,
    demoPassword: "replyhaven",
  });
}
