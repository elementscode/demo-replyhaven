import { Channel, ForbiddenError, LiveTable, NotFoundError, ValidationError, sql, tx } from "@elements/app";
import { hostname } from "node:os";
import { agentOrThrow } from "#app/shared/services/auth";
import { PRIORITIES, Priority, STATUSES, Status } from "#app/shared/lib/sla";
import { SendReplyJob } from "#app/jobs/send-reply";

export interface Ticket {
  id: string;
  number: number;
  createdAt: Date;
  updatedAt: Date;
  subject: string;
  customerName: string;
  customerEmail: string;
  status: Status;
  priority: Priority;
  assigneeId: string | null;
  tags: string[];
  firstRepliedAt: Date | null;
  solvedAt: Date | null;
  lastMessageAt: Date;
}

export interface Message {
  id: string;
  ticketId: string;
  createdAt: Date;
  kind: "customer" | "reply" | "note";
  authorId: string | null;
  authorName: string;
  body: string;
}

export interface Agent {
  id: string;
  name: string;
}

export interface Viewer {
  ticketId: string;
  userId: string;
  userName: string;
}

export interface TypingPing {
  ticketId: string;
  userId: string;
  userName: string;
  mode: "reply" | "note";
}

export function normalizeTags(tags: string[]): string[] {
  let seen = new Set<string>();
  for (let tag of tags) {
    let t = tag.trim().toLowerCase().replace(/\s+/g, "-");
    if (t) {
      seen.add(t);
    }
  }

  return [...seen].slice(0, 12);
}

/**
 * Agents edit status, priority, assignee and tags. Tickets are created by the
 * contact form and never deleted.
 */
export let tickets: LiveTable<Ticket> = new LiveTable<Ticket>({
  insert: () => {
    throw new ForbiddenError("tickets come in through the contact form");
  },

  update: (item) => {
    agentOrThrow();

    if (!STATUSES.includes(item.status) || !PRIORITIES.includes(item.priority)) {
      throw new ValidationError("unknown status or priority");
    }

    if (item.assigneeId && !isAgent(item.assigneeId)) {
      throw new ValidationError("assignee is not an active agent");
    }

    // Assigning a new ticket opens it; solving stamps the time for reporting.
    return sql<Ticket>(`
      update tickets
      set
        status = case
          when ${item.status} = 'new' and ${item.assigneeId}::uuid is not null then 'open'
          else ${item.status}::ticketStatus
        end,
        priority = ${item.priority},
        assigneeId = ${item.assigneeId},
        tags = ${normalizeTags(item.tags)},
        solvedAt = case
          when ${item.status} = 'solved' then coalesce(solvedAt, now())
          else null
        end
      where id = ${item.id}
      returning *
    `).firstOrThrow(new NotFoundError("ticket not found"));
  },

  delete: () => {
    throw new ForbiddenError("tickets are not deleted");
  },
});

/**
 * The conversation. Agents add replies and internal notes through the view;
 * customer messages arrive through the contact form.
 */
export let messages: LiveTable<Message> = new LiveTable<Message>({
  insert: (item) => postMessage(item),

  update: () => {
    throw new ForbiddenError("messages cannot be edited");
  },

  delete: () => {
    throw new ForbiddenError("messages cannot be deleted");
  },
});

export function postMessage(item: Partial<Message>): Message {
  let me = agentOrThrow();
  let body = (item.body ?? "").trim();

  if (item.kind !== "reply" && item.kind !== "note") {
    throw new ValidationError("agents post replies or notes");
  }

  if (!body) {
    throw new ValidationError("write a message first");
  }

  return tx(() => {
    let message = sql<Message>(`
      insert into messages (
        id,
        ticketId,
        kind,
        authorId,
        authorName,
        body
      ) values (
        coalesce(${item.id}::uuid, uuidGenerateV7()),
        ${item.ticketId},
        ${item.kind},
        ${me.id},
        ${me.name},
        ${body}
      )
      returning *
    `).firstOrThrow();

    if (message.kind === "reply") {
      // A reply waits on the customer, and an unowned ticket goes to whoever answered.
      sql(`
        update tickets
        set
          firstRepliedAt = coalesce(firstRepliedAt, now()),
          status = case when status in ('new', 'open') then 'pending' else status end,
          assigneeId = coalesce(assigneeId, ${me.id}),
          lastMessageAt = now()
        where id = ${message.ticketId}
      `);

      new SendReplyJob({ messageId: message.id }).schedule();
    }

    return message;
  });
}

function isAgent(userId: string): boolean {
  return !sql(`
    select 1
    from users
    where
      id = ${userId}
      and passwordHash is not null
  `).empty();
}

export function listAgents(): Agent[] {
  return sql<Agent>(`
    select
      id,
      name
    from users
    where passwordHash is not null
    order by name
  `).all();
}

export const ticketPresence = new Channel<{ ticketId: string }>("ticketPresence");

export const ticketTyping = new Channel<TypingPing>("ticketTyping");

export function listViewers(ticketId?: string): Viewer[] {
  return sql<Viewer>(`
    select distinct on (ticketId, userId)
      ticketId,
      userId,
      userName
    from ticketViewers
    where ${ticketId ?? null}::uuid is null or ticketId = ${ticketId ?? null}::uuid
    order by
      ticketId,
      userId,
      createdAt
  `).all();
}

/** @rpc */
export function viewersOf(ticketId: string): Viewer[] {
  agentOrThrow();

  return listViewers(ticketId);
}

/** @rpc */
export function allViewers(): Viewer[] {
  agentOrThrow();

  return listViewers();
}

export function joinTicket(listenerId: string, ticketId: string, userId: string, userName: string) {
  sql(`
    insert into ticketViewers (
      listenerId,
      ticketId,
      userId,
      userName,
      host
    ) values (
      ${listenerId},
      ${ticketId},
      ${userId},
      ${userName},
      ${hostname()}
    )
    on conflict (listenerId) do nothing
  `);

  ticketPresence.notify({ ticketId });
}

export function leaveTicket(listenerId: string, ticketId: string) {
  sql(`
    delete from ticketViewers
    where listenerId = ${listenerId}
  `);

  ticketPresence.notify({ ticketId });
}

export function clearThisHost() {
  sql(`
    delete from ticketViewers
    where host = ${hostname()}
  `);
}

/** @rpc */
export function notifyTyping(ticketId: string, mode: "reply" | "note") {
  let me = agentOrThrow();

  ticketTyping.notify({
    ticketId,
    userId: me.id,
    userName: me.name,
    mode: mode === "note" ? "note" : "reply",
  });
}
