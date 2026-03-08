import { getModel } from "../model.js";
import { semanticBonusSchema } from "../../../../../packages/shared/src/schemas.js";
import type { GraphStateType } from "../state.js";

export async function atsScorerNode(state: GraphStateType): Promise<Partial<GraphStateType>> {
  try {
    const { parsedResume, parsedJD, resumeText } = state;

    if (!parsedResume || !parsedJD) {
      return { errors: ["atsScorer: missing parsedResume or parsedJD"] };
    }

    // Step 1: Deterministic keyword overlap
    const resumeLower = resumeText.toLowerCase();
    const keywords = parsedJD.keywords;
    const matched = keywords.filter((kw) => resumeLower.includes(kw.toLowerCase()));
    const missing = keywords.filter((kw) => !resumeLower.includes(kw.toLowerCase()));
    const overlapScore = keywords.length > 0 ? (matched.length / keywords.length) * 85 : 0;

    // Step 2: Gemini semantic bonus (0–15)
    const model = getModel();
    const response = await model.invoke([
      {
        role: "system",
        content: `You evaluate transferable skills between a resume and a job description.
The JD requires: ${parsedJD.requirements.join(", ")}
The resume lists skills: ${parsedResume.skills.join(", ")}
The resume has roles: ${parsedResume.roles.map((r) => r.title).join(", ")}

On a scale of 0–15, assign a semantic bonus for transferable skills that don't match exact keywords but demonstrate equivalent competence.
For example: "Managed 4-person household/volunteer group" maps to "Team Lead" (bonus: 10).
Return ONLY valid JSON: { "semantic_bonus": <number 0-15> }`,
      },
    ]);

    const text = typeof response.content === "string" ? response.content : JSON.stringify(response.content);
    const cleaned = text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    let bonus = 0;
    try {
      const parsed = semanticBonusSchema.parse(JSON.parse(cleaned));
      bonus = parsed.semantic_bonus;
    } catch {
      bonus = 5; // safe fallback
    }

    const finalScore = Math.min(100, Math.round(overlapScore + bonus));

    return {
      atsScore: finalScore,
      missingKeywords: missing,
    };
  } catch (err: any) {
    return { errors: [`atsScorer: ${err.message}`] };
  }
}
