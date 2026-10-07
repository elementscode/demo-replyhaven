import { session, sql } from "@elements/app";
import { User, loginAs } from "#app/shared/services/auth";

/** An active user. The hash is a placeholder; tests sign in through the session. */
export function makeUser(name: string, role: "admin" | "agent" = "agent"): User {
  return sql<User>(`
    insert into users (
      email,
      name,
      role,
      passwordHash
    ) values (
      ${name.toLowerCase().replace(/\s+/g, ".") + "." + crypto.randomUUID().slice(0, 8) + "@test.dev"},
      ${name},
      ${role},
      'not-a-real-hash'
    )
    returning
      id,
      email,
      name,
      role
  `).firstOrThrow();
}

export function signInAs(user: User) {
  loginAs(user);
}

export function makeTicket(fields: { priority?: string; status?: string; assigneeId?: string | null } = {}): { id: string; number: number } {
  return sql<{ id: string; number: number }>(`
    insert into tickets (
      subject,
      customerName,
      customerEmail,
      priority,
      status,
      assigneeId
    ) values (
      'Cannot export',
      'Dana Whitfield',
      'dana@example.com',
      ${fields.priority ?? "normal"},
      ${fields.status ?? "new"},
      ${fields.assigneeId ?? null}
    )
    returning
      id,
      number
  `).firstOrThrow();
}

export { session };
