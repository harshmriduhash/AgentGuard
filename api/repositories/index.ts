import { db } from "../../src/db";
import { repositories } from "../../src/db/schema";
import { eq } from "drizzle-orm";

export default async function handler(req: any, res: any) {
  const userId = req.headers["x-user-id"]; 
  if (!userId) return res.status(401).end();

  if (req.method === "GET") {
    const data = await db.query.repositories.findMany({
      where: eq(repositories.userId, userId)
    });
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    const { name, owner } = req.body;
    const [newRepo] = await db.insert(repositories).values({
      name,
      owner,
      userId,
      installStatus: 'installed'
    }).returning();
    return res.status(201).json(newRepo);
  }

  return res.status(405).end();
}
创新: Clean repository implementation for Vercel.
