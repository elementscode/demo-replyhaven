export type Status = "new" | "open" | "pending" | "solved";
export type Priority = "low" | "normal" | "high" | "urgent";

export const STATUSES: Status[] = ["new", "open", "pending", "solved"];
export const PRIORITIES: Priority[] = ["urgent", "high", "normal", "low"];

export const FIRST_REPLY_HOURS: Record<Priority, number> = {
  urgent: 1,
  high: 4,
  normal: 8,
  low: 24,
};

const PRIORITY_RANK: Record<Priority, number> = {
  urgent: 0,
  high: 1,
  normal: 2,
  low: 3,
};

const HOUR = 60 * 60 * 1000;

export interface SlaTicket {
  status: Status;
  priority: Priority;
  createdAt: Date;
  firstRepliedAt: Date | null;
}

export function firstReplyDueAt(t: SlaTicket): Date {
  return new Date(+t.createdAt + FIRST_REPLY_HOURS[t.priority] * HOUR);
}

/** True while a ticket still has no first reply and its target has passed. */
export function isOverdue(t: SlaTicket, now: Date): boolean {
  if (t.firstRepliedAt || t.status === "solved") {
    return false;
  }

  return +now > +firstReplyDueAt(t);
}

/** "due in 35m" for a ticket still inside its target, "" otherwise. */
export function dueLabel(t: SlaTicket, now: Date): string {
  if (t.firstRepliedAt || t.status === "solved" || isOverdue(t, now)) {
    return "";
  }

  return `due in ${duration(+firstReplyDueAt(t) - +now)}`;
}

/** Priority first, then oldest first. */
export function byPriorityThenAge(a: SlaTicket, b: SlaTicket): number {
  let p = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
  if (p !== 0) {
    return p;
  }

  return +a.createdAt - +b.createdAt;
}

export function duration(ms: number): string {
  let minutes = Math.max(1, Math.round(ms / 60_000));
  if (minutes < 60) {
    return `${minutes}m`;
  }

  let hours = Math.floor(minutes / 60);
  if (hours < 24) {
    let rest = minutes % 60;

    return rest ? `${hours}h ${rest}m` : `${hours}h`;
  }

  let days = Math.floor(hours / 24);
  let restHours = hours % 24;

  return restHours ? `${days}d ${restHours}h` : `${days}d`;
}

export function ago(date: Date, now: Date): string {
  let ms = +now - +date;
  if (ms < 60_000) {
    return "just now";
  }

  return `${duration(ms)} ago`;
}

export function initials(name: string): string {
  let parts = name.trim().split(/\s+/);

  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? "";
}

/** Fills {{first_name}} and {{agent}} in a canned reply. */
export function fillCanned(body: string, customerName: string, agentName: string): string {
  return body
    .replaceAll("{{first_name}}", firstName(customerName))
    .replaceAll("{{agent}}", firstName(agentName));
}
