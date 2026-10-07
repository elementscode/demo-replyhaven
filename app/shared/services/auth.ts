import { sql, session, AuthError, ForbiddenError } from "@elements/app";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "agent";
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isEmail(email: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

/** The signed-in user, or undefined for a visitor or a removed account. */
export function currentUser(): User | undefined {
  let userId = session.get("userId");
  if (!userId) {
    return undefined;
  }

  return sql<User>(`
    select
      id,
      email,
      name,
      role
    from users
    where
      id = ${userId}
      and passwordHash is not null
  `).first();
}

export function agentOrThrow(): User {
  let user = currentUser();
  if (!user) {
    throw new AuthError("sign in to continue");
  }

  return user;
}

export function adminOrThrow(): User {
  let user = agentOrThrow();
  if (user.role !== "admin") {
    throw new ForbiddenError("admin access required");
  }

  return user;
}

export function loginAs(user: User) {
  session.login({
    userId: user.id,
    userName: user.name,
    role: user.role,
  });
}

/** @rpc */
export function signin(email: string, password: string) {
  let address = normalizeEmail(email);

  if (!address || !password) {
    throw new AuthError("enter your email and password");
  }

  let user = sql<User>(`
    select
      id,
      email,
      name,
      role
    from users
    where
      email = ${address}
      and passwordHash = crypt(${password}, passwordHash)
  `).firstOrThrow(new AuthError("invalid email or password"));

  loginAs(user);
}

/** @rpc */
export function signout() {
  session.logout();
}
