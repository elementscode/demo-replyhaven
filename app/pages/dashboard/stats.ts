import { FIRST_REPLY_HOURS, PRIORITIES, Priority, SlaTicket, Status } from "#app/shared/lib/sla";

export interface StatTicket extends SlaTicket {
  assigneeId: string | null;
  solvedAt: Date | null;
}

const DAY = 24 * 60 * 60 * 1000;

export function median(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  let sorted = [...values].sort((a, b) => a - b);
  let mid = Math.floor(sorted.length / 2);

  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** Monday 00:00 local time of the week holding `now`. */
export function weekStart(now: Date): Date {
  let d = new Date(now);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));

  return d;
}

export function openCount(tickets: StatTicket[], status: Status, priority: Priority): number {
  return tickets.filter((t) => t.status === status && t.priority === priority).length;
}

/** First reply times, in ms, for tickets opened in the last `days`. */
export function firstReplyTimes(tickets: StatTicket[], now: Date, days = 30, priority?: Priority): number[] {
  return tickets
    .filter((t) => t.firstRepliedAt && +now - +t.createdAt <= days * DAY)
    .filter((t) => !priority || t.priority === priority)
    .map((t) => +t.firstRepliedAt! - +t.createdAt);
}

export function metTargetShare(tickets: StatTicket[], now: Date, priority: Priority): number | null {
  let times = firstReplyTimes(tickets, now, 30, priority);
  if (times.length === 0) {
    return null;
  }

  let target = FIRST_REPLY_HOURS[priority] * 60 * 60 * 1000;

  return times.filter((ms) => ms <= target).length / times.length;
}

export function solvedThisWeek(tickets: StatTicket[], agentId: string, now: Date): number {
  let start = +weekStart(now);

  return tickets.filter((t) => t.status === "solved" && t.assigneeId === agentId && t.solvedAt && +t.solvedAt >= start).length;
}

export { PRIORITIES };
