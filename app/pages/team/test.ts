import { test, assert, equal, sql, ForbiddenError, session } from "@elements/app";
import { makeUser, signInAs } from "#app/shared/testing/fixtures";
import { inviteAgent, revokeInvite } from "./services";
import { acceptInvite } from "#app/pages/invite/template";

test("team", () => {
  test("an agent cannot invite", () => {
    signInAs(makeUser("Sam Rivera"));
    let threw = false;

    try {
      inviteAgent("new@test.dev", "");
    } catch (err) {
      threw = true;
      assert(err instanceof ForbiddenError, `got ${err}`);
    }

    assert(threw);
  });

  test("the admin invites, and the invite works once", () => {
    signInAs(makeUser("Maya Okafor", "admin"));

    let members = inviteAgent("Jordan@Test.dev", "Jordan Blake");
    let invited = members.find((m) => m.email === "jordan@test.dev")!;
    equal(invited.active, false);

    let token = sql<{ inviteToken: string }>(`
      select inviteToken
      from users
      where id = ${invited.id}
    `).firstOrThrow().inviteToken;

    session.logout();
    acceptInvite(token, "Jordan Blake", "a-good-password");
    equal(session.get("userName"), "Jordan Blake");
    equal(session.get("role"), "agent");

    let threw = false;
    try {
      acceptInvite(token, "Someone", "another-password");
    } catch {
      threw = true;
    }

    assert(threw, "a used invite is refused");
  });

  test("revoking removes only pending invites", () => {
    let maya = makeUser("Maya Okafor", "admin");
    signInAs(maya);

    let pending = inviteAgent("temp@test.dev", "").find((m) => m.email === "temp@test.dev")!;
    let after = revokeInvite(pending.id);
    assert(!after.some((m) => m.email === "temp@test.dev"));

    revokeInvite(maya.id);
    assert(revokeInvite(maya.id).some((m) => m.id === maya.id), "active accounts stay");
  });
});
