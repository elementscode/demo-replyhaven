import { test, assert, equal, sql, AuthError, ForbiddenError, ValidationError } from "@elements/app";
import { makeTicket, makeUser, signInAs } from "#app/shared/testing/fixtures";
import { Ticket, messages, tickets } from "./tickets";

interface TicketRow {
  status: string;
  assigneeId: string | null;
  firstRepliedAt: Date | null;
  solvedAt: Date | null;
}

function row(id: string): TicketRow {
  return sql<TicketRow>(`
    select
      status,
      assigneeId,
      firstRepliedAt,
      solvedAt
    from tickets
    where id = ${id}
  `).firstOrThrow();
}

test("tickets", () => {
  test("a reply stamps the first reply, waits on the customer, and takes ownership", () => {
    let sam = makeUser("Sam Rivera");
    let t = makeTicket();
    signInAs(sam);

    messages.view({ ticketId: t.id }).insert({ ticketId: t.id, kind: "reply", body: "On it." });

    let after = row(t.id);
    assert(after.firstRepliedAt !== null, "firstRepliedAt set");
    equal(after.status, "pending");
    equal(after.assigneeId, sam.id);

    let author = sql<{ id: string; authorName: string }>(`
      select
        id,
        authorName
      from messages
      where ticketId = ${t.id}
    `).firstOrThrow();
    equal(author.authorName, "Sam Rivera");

    let jobs = sql<{ n: number }>(`
      select count(*)::int as n
      from elements.jobs
      where
        path like '%SendReplyJob%'
        and fields->>'messageId' = ${author.id}
    `).firstOrThrow();
    assert(jobs.n >= 1, "reply email job scheduled");
  });

  test("an internal note leaves the ticket as it was", () => {
    let sam = makeUser("Sam Rivera");
    let t = makeTicket();
    signInAs(sam);

    messages.view({ ticketId: t.id }).insert({ ticketId: t.id, kind: "note", body: "Checking logs." });

    let after = row(t.id);
    equal(after.status, "new");
    equal(after.firstRepliedAt, null);
    equal(after.assigneeId, null);
  });

  test("a visitor cannot post to a ticket", () => {
    let t = makeTicket();
    let threw = false;

    try {
      messages.view({ ticketId: t.id }).insert({ ticketId: t.id, kind: "reply", body: "hi" });
    } catch (err) {
      threw = true;
      assert(err instanceof AuthError, `got ${err}`);
    }

    assert(threw);
  });

  test("agents cannot post as the customer", () => {
    let t = makeTicket();
    signInAs(makeUser("Sam Rivera"));
    let threw = false;

    try {
      messages.view({ ticketId: t.id }).insert({ ticketId: t.id, kind: "customer", body: "hi" });
    } catch (err) {
      threw = true;
      assert(err instanceof ValidationError, `got ${err}`);
    }

    assert(threw);
  });

  test("assigning a new ticket opens it, and solving stamps the time", () => {
    let priya = makeUser("Priya Natarajan");
    let t = makeTicket();
    signInAs(priya);

    let view = tickets.view({ id: t.id });
    let current = view.at(0) as Ticket;
    view.update({ ...current, assigneeId: priya.id, tags: ["Billing", "billing", " Late Fees "] });

    let assigned = row(t.id);
    equal(assigned.status, "open");
    equal(assigned.assigneeId, priya.id);

    let tags = sql<{ tags: string[] }>(`
      select tags
      from tickets
      where id = ${t.id}
    `).firstOrThrow();
    equal(tags.tags, ["billing", "late-fees"]);

    view.update({ ...(view.at(0) as Ticket), status: "solved" });
    assert(row(t.id).solvedAt !== null, "solvedAt set");

    view.update({ ...(view.at(0) as Ticket), status: "open" });
    equal(row(t.id).solvedAt, null);
  });

  test("tickets cannot be deleted", () => {
    let t = makeTicket();
    signInAs(makeUser("Sam Rivera"));
    let view = tickets.view({ id: t.id });
    let threw = false;

    try {
      view.delete(view.at(0) as Ticket);
    } catch (err) {
      threw = true;
      assert(err instanceof ForbiddenError, `got ${err}`);
    }

    assert(threw);
  });
});
