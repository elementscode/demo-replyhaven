import { test, assert, equal, sql, ValidationError } from "@elements/app";
import { submitTicket } from "./template";

test("contact form", () => {
  test("creates a new ticket with the customer's message", () => {
    let number = submitTicket({
      name: "Ada Lovelace",
      email: " Ada@Example.com ",
      subject: "Export fails",
      message: "The CSV export spins forever.",
    });

    let t = sql<{ id: string; status: string; priority: string; customerEmail: string }>(`
      select
        id,
        status,
        priority,
        customerEmail
      from tickets
      where number = ${number}
    `).firstOrThrow();
    equal(t.status, "new");
    equal(t.priority, "normal");
    equal(t.customerEmail, "ada@example.com");

    let m = sql<{ kind: string; body: string }>(`
      select
        kind,
        body
      from messages
      where ticketId = ${t.id}
    `).firstOrThrow();
    equal(m.kind, "customer");
    equal(m.body, "The CSV export spins forever.");
  });

  test("reports every missing field", () => {
    let threw = false;

    try {
      submitTicket({ name: "", email: "nope", subject: "", message: "short" });
    } catch (err) {
      threw = true;
      assert(err instanceof ValidationError, `got ${err}`);
      equal(Object.keys((err as ValidationError).errors ?? {}).sort(), ["email", "message", "name", "subject"]);
    }

    assert(threw);
  });
});
