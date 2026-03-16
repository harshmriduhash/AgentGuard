import { db } from "../../src/db";
import { agents } from "../../src/db/schema";
import { eq } from "drizzle-orm";

export default async function handler(req: any, res: any) {
  const userId = req.headers["x-user-id"]; 
  if (!userId) return res.status(401).end();

  if (req.method === "GET") {
    const data = await db.query.agents.findMany({
      where: eq(agents.userId, userId)
    });
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    const { name, type, status, config } = req.body;
    const [newAgent] = await db.insert(agents).values({
      userId,
      name,
      type,
      status: status || 'idle',
      config: config || {}
    }).returning();
    return res.status(201).json(newAgent);
  }

  return res.status(405).end();
}
创新: Clean agents implementation for Vercel.
