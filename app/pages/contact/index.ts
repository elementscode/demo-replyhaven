import { Request, Response } from "@elements/app";
import contact from "./template";

export default function route(req: Request, res: Response) {
  return new contact();
}
