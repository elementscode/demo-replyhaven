import { ValidationError, email, sql } from "@elements/app";
import { adminOrThrow, isEmail, normalizeEmail } from "#app/shared/services/auth";
import AgentInviteEmail from "#app/emails/agent-invite";

export interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: "admin" | "agent";
  active: boolean;
  invitedAt: Date | null;
  openTickets: number;
}

export function listTeam(): TeamMember[] {
  return sql<TeamMember>(`
    select
      u.id,
      u.email,
      u.name,
      u.role,
      u.passwordHash is not null as active,
      u.invitedAt,
      count(t.id)::int as openTickets
    from users u
    left join tickets t on t.assigneeId = u.id and t.status <> 'solved'
    group by u.id
    order by
      u.passwordHash is null,
      u.role,
      u.name
  `).all();
}

/** @rpc */
export function team(): TeamMember[] {
  adminOrThrow();

  return listTeam();
}

/**
 * Creates the invited account, or refreshes a pending one, and emails a
 * one-time link.
 *
 * @rpc
 */
export function inviteAgent(address: string, name: string): TeamMember[] {
  let admin = adminOrThrow();
  let to = normalizeEmail(address);

  if (!isEmail(to)) {
    throw new ValidationError("Enter a valid email address.");
  }

  let active = !sql(`
    select 1
    from users
    where
      email = ${to}
      and passwordHash is not null
  `).empty();

  if (active) {
    throw new ValidationError("That person already has an account.");
  }

  let invited = sql<{ inviteToken: string }>(`
    insert into users (
      email,
      name,
      role,
      inviteToken,
      invitedAt
    ) values (
      ${to},
      ${name.trim()},
      'agent',
      encode(gen_random_bytes(24), 'hex'),
      now()
    )
    on conflict (email) do update
    set
      name = coalesce(nullif(excluded.name, ''), users.name),
      inviteToken = excluded.inviteToken,
      invitedAt = now()
    returning inviteToken
  `).firstOrThrow();

  email({
    to,
    subject: `${admin.name} invited you to the replyhaven help desk`,
    body: new AgentInviteEmail({
      inviterName: admin.name,
      inviteUrl: `/invite/${invited.inviteToken}`,
    }),
  });

  return listTeam();
}

/** @rpc */
export function revokeInvite(userId: string): TeamMember[] {
  adminOrThrow();

  sql(`
    delete from users
    where
      id = ${userId}
      and passwordHash is null
  `);

  return listTeam();
}
