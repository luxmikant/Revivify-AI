import { getModel } from "../model.js";
import type { GraphStateType } from "../state.js";
import type { GapAnalysisItem } from "../../../../../packages/shared/src/types.js";

export async function gapAnalyzerNode(state: GraphStateType): Promise<Partial<GraphStateType>> {
  try {
    const { parsedResume, parsedJD } = state;

    if (!parsedResume || !parsedJD) {
      return { errors: ["gapAnalyzer: missing parsedResume or parsedJD"] };
    }

    if (parsedResume.career_gaps.length === 0) {
      return {
        gapAnalysis: [],
        hiddenStrengthsSummary: "No significant career gaps detected. Your timeline is continuous.",
      };
    }

    const model = getModel();
    const response = await model.invoke([
      {
        role: "system",
        content: `You are an empathetic career coach specializing in returnship and re-entry programs.
You believe career gaps are NOT weaknesses — they contain hidden transferable skills.

For each career gap, identify what the person likely did during that time and reframe it as a professional strength aligned to the target job.

Career gaps detected:
${JSON.stringify(parsedResume.career_gaps, null, 2)}

Target job title: ${parsedJD.title}
Target job keywords: ${parsedJD.keywords.join(", ")}

Return valid JSON with this exact shape:
{
  "gap_analysis": [
    {
      "gap_period": "Jan 2019 – Mar 2021",
      "activity": "description of likely activity",
      "hidden_strength": "the transferable reframe",
      "mapped_skill": "JD-aligned skill name"
    }
  ],
  "hidden_strengths_summary": "One encouraging paragraph summarizing all hidden strengths"
}
Be warm, encouraging, and specific. Return ONLY valid JSON, no markdown.`,
      },
    ]);

    const text = typeof response.content === "string" ? response.content : JSON.stringify(response.content);
    const cleaned = text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return {
      gapAnalysis: (parsed.gap_analysis || []) as GapAnalysisItem[],
      hiddenStrengthsSummary: parsed.hidden_strengths_summary || "",
    };
  } catch (err: any) {
    return { errors: [`gapAnalyzer: ${err.message}`] };
  }
}
