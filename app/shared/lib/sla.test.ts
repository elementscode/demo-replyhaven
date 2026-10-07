import { test, assert, equal } from "@elements/app";
import { SlaTicket, byPriorityThenAge, dueLabel, fillCanned, isOverdue } from "./sla";

const HOUR = 60 * 60 * 1000;
const now = new Date("2026-10-06T12:00:00Z");

function ticket(priority: SlaTicket["priority"], hoursAgo: number, replied = false): SlaTicket {
  return {
    status: "new",
    priority,
    createdAt: new Date(+now - hoursAgo * HOUR),
    firstRepliedAt: replied ? now : null,
  };
}

test("sla", () => {
  test("each priority has its own first reply target", () => {
    assert(isOverdue(ticket("urgent", 1.5), now), "urgent at 1.5h");
    assert(!isOverdue(ticket("high", 3), now), "high at 3h");
    assert(isOverdue(ticket("high", 5), now), "high at 5h");
    assert(!isOverdue(ticket("normal", 7), now), "normal at 7h");
    assert(isOverdue(ticket("low", 25), now), "low at 25h");
  });

  test("a replied or solved ticket is never overdue", () => {
    assert(!isOverdue(ticket("urgent", 5, true), now));
    assert(!isOverdue({ ...ticket("urgent", 5), status: "solved" }, now));
  });

  test("due label counts down to the target", () => {
    equal(dueLabel(ticket("urgent", 0.5), now), "due in 30m");
    equal(dueLabel(ticket("urgent", 2), now), "");
  });

  test("queue sorts by priority, then oldest first", () => {
    let rows = [ticket("low", 30), ticket("urgent", 1), ticket("urgent", 3), ticket("normal", 2)];
    let sorted = rows.sort(byPriorityThenAge).map((t) => `${t.priority}:${(+now - +t.createdAt) / HOUR}`);

    equal(sorted, ["urgent:3", "urgent:1", "normal:2", "low:30"]);
  });

  test("canned replies fill in the names", () => {
    equal(fillCanned("Hi {{first_name}}, {{agent}}", "Dana Whitfield", "Sam Rivera"), "Hi Dana, Sam");
  });
});
