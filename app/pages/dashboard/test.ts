import { test, equal } from "@elements/app";
import { StatTicket, firstReplyTimes, median, metTargetShare, solvedThisWeek, weekStart } from "./stats";

const HOUR = 60 * 60 * 1000;
const now = new Date(2026, 9, 7, 15, 0);

function t(fields: Partial<StatTicket>): StatTicket {
  return {
    status: "open",
    priority: "normal",
    createdAt: new Date(+now - 10 * HOUR),
    firstRepliedAt: null,
    assigneeId: null,
    solvedAt: null,
    ...fields,
  };
}

test("dashboard stats", () => {
  test("median", () => {
    equal(median([]), null);
    equal(median([5, 1, 3]), 3);
    equal(median([1, 2, 3, 4]), 2.5);
  });

  test("the week starts on Monday", () => {
    let start = weekStart(now);
    equal(start.getDay(), 1);
    equal(start.getDate(), 5);
  });

  test("solved this week counts by assignee since Monday", () => {
    let rows = [
      t({ status: "solved", assigneeId: "a", solvedAt: new Date(2026, 9, 6) }),
      t({ status: "solved", assigneeId: "a", solvedAt: new Date(2026, 9, 2) }),
      t({ status: "solved", assigneeId: "b", solvedAt: new Date(2026, 9, 7) }),
    ];

    equal(solvedThisWeek(rows, "a", now), 1);
    equal(solvedThisWeek(rows, "b", now), 1);
  });

  test("first reply times and target share", () => {
    let created = new Date(+now - 10 * HOUR);
    let rows = [
      t({ priority: "high", createdAt: created, firstRepliedAt: new Date(+created + 2 * HOUR) }),
      t({ priority: "high", createdAt: created, firstRepliedAt: new Date(+created + 6 * HOUR) }),
      t({ priority: "high", createdAt: created }),
    ];

    equal(firstReplyTimes(rows, now, 30, "high"), [2 * HOUR, 6 * HOUR]);
    equal(metTargetShare(rows, now, "high"), 0.5);
    equal(metTargetShare(rows, now, "low"), null);
  });
});
