import { db } from "../../src/db";
import { rules, repositories } from "../../src/db/schema";
import { eq } from "drizzle-orm";

export default async function handler(req: any, res: any) {
  const userId = req.headers["x-user-id"]; 
  if (!userId) return res.status(401).end();

  if (req.method === "GET") {
    const data = await db.select({
      id: rules.id,
      type: rules.type,
      pattern: rules.pattern,
      description: rules.description,
      active: rules.active,
      repoId: rules.repoId
    })
    .from(rules)
    .innerJoin(repositories, eq(rules.repoId, repositories.id))
    .where(eq(repositories.userId, userId));
    
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    const { repoId, type, pattern, description } = req.body;
    const [newRule] = await db.insert(rules).values({
      repoId,
      type,
      pattern,
      description,
    }).returning();
    return res.status(201).json(newRule);
  }

  return res.status(405).end();
}
