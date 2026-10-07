import { LiveTable, ValidationError, sql } from "@elements/app";
import { adminOrThrow } from "#app/shared/services/auth";

export interface CannedReply {
  id: string;
  createdAt: Date;
  title: string;
  body: string;
}

function checked(item: Partial<CannedReply>): { title: string; body: string } {
  let title = (item.title ?? "").trim();
  let body = (item.body ?? "").trim();

  if (!title || !body) {
    throw new ValidationError("a canned reply needs a title and a body");
  }

  return { title, body };
}

/** Every agent reads them; only the admin writes. */
export let cannedReplies: LiveTable<CannedReply> = new LiveTable<CannedReply>({
  insert: (item) => {
    adminOrThrow();
    let { title, body } = checked(item);

    return sql<CannedReply>(`
      insert into cannedReplies (
        id,
        title,
        body
      ) values (
        coalesce(${item.id}::uuid, uuidGenerateV7()),
        ${title},
        ${body}
      )
      returning *
    `).firstOrThrow();
  },

  update: (item) => {
    adminOrThrow();
    let { title, body } = checked(item);

    return sql<CannedReply>(`
      update cannedReplies
      set
        title = ${title},
        body = ${body}
      where id = ${item.id}
      returning *
    `).firstOrThrow();
  },

  delete: (item) => {
    adminOrThrow();

    return cannedReplies.delete(item);
  },
});
