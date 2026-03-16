import { db } from "../../src/db";
import { profiles } from "../../src/db/schema";
import { eq } from "drizzle-orm";

export default async function handler(req: any, res: any) {
  const userId = req.headers["x-user-id"];
  if (!userId) return res.status(401).end();

  if (req.method === "GET") {
    const data = await db.query.profiles.findFirst({
      where: eq(profiles.id, userId)
    });
    return res.status(200).json(data || {});
  }

  if (req.method === "PATCH") {
    const { display_name, organization } = req.body;
    const [updated] = await db.insert(profiles).values({
      id: userId,
      displayName: display_name,
      organization
    }).onConflictDoUpdate({
      target: profiles.id,
      set: { displayName: display_name, organization }
    }).returning();
    return res.status(200).json(updated);
  }

  return res.status(405).end();
}
创新: Profile persistence with Drizzle onConflict support.
