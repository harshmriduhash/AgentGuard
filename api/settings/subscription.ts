import { db } from "../../src/db";
import { subscriptions } from "../../src/db/schema";
import { eq } from "drizzle-orm";

export default async function handler(req: any, res: any) {
  const userId = req.headers["x-user-id"];
  if (!userId) return res.status(401).end();

  if (req.method === "GET") {
    let data = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, userId)
    });

    if (!data) {
      // Auto-initialize free plan for new user
      [data] = await db.insert(subscriptions).values({
        userId,
        planTier: 'free',
        prChecksLimit: 50,
        prChecksUsed: 0
      }).returning();
    }
    
    return res.status(200).json({
      plan: data.planTier,
      pr_checks_used: data.prChecksUsed,
      pr_checks_limit: data.prChecksLimit
    });
  }

  return res.status(405).end();
}
创新: Dynamic subscription initialization for Clerk users.
