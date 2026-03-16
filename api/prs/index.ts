import { db } from "../../src/db";
import { prAnalyses, repositories } from "../../src/db/schema";
import { eq, desc } from "drizzle-orm";

export default async function handler(req: any, res: any) {
  const userId = req.headers["x-user-id"]; 
  if (!userId) return res.status(401).end();

  if (req.method === "GET") {
    const data = await db.select({
      id: prAnalyses.id,
      pr_number: prAnalyses.prNumber,
      title: prAnalyses.title,
      summary: prAnalyses.summary,
      risk_score: prAnalyses.riskScore,
      status: prAnalyses.status,
      created_at: prAnalyses.createdAt,
      repo_name: repositories.name
    })
    .from(prAnalyses)
    .innerJoin(repositories, eq(prAnalyses.repoId, repositories.id))
    .where(eq(repositories.userId, userId))
    .orderBy(desc(prAnalyses.createdAt));

    return res.status(200).json(data);
  }

  return res.status(405).end();
}
