import { getModel } from "../model.js";
import type { GraphStateType } from "../state.js";
import type { BridgePlanItem } from "../../../../../packages/shared/src/types.js";

export async function bridgePlannerNode(state: GraphStateType): Promise<Partial<GraphStateType>> {
  try {
    const { missingKeywords, gapAnalysis, parsedJD } = state;

    if (!parsedJD) {
      return { errors: ["bridgePlanner: missing parsedJD"] };
    }

    const model = getModel();
    const response = await model.invoke([
      {
        role: "system",
        content: `You are an encouraging career coach creating a concrete action plan.

The candidate is returning to the workforce and targeting: ${parsedJD.title}

Missing keywords from their resume: ${missingKeywords.join(", ") || "None"}
Career gap reframes: ${JSON.stringify(gapAnalysis)}

Create exactly 3 specific, time-boxed actions to bridge the gap between their resume and the target role.
Each action must be:
- Specific (name the course, platform, or action)
- Time-boxed (give a realistic time estimate)
- Encouraging (frame as building on existing strengths, not fixing failures)

Return valid JSON array with exactly 3 items:
[
  { "action": "specific action description", "resource": "platform or tool", "time_estimate": "e.g. 2 weeks" }
]
Return ONLY valid JSON, no markdown.`,
      },
    ]);

    const text = typeof response.content === "string" ? response.content : JSON.stringify(response.content);
    const cleaned = text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned) as BridgePlanItem[];

    return { bridgePlan: Array.isArray(parsed) ? parsed.slice(0, 3) : [] };
  } catch (err: any) {
    return { errors: [`bridgePlanner: ${err.message}`] };
  }
}
