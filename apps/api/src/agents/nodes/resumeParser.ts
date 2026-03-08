import { getModel } from "../model.js";
import { resumeDataSchema } from "../../../../../packages/shared/src/schemas.js";
import type { GraphStateType } from "../state.js";

export async function resumeParserNode(state: GraphStateType): Promise<Partial<GraphStateType>> {
  try {
    const model = getModel();
    const response = await model.invoke([
      {
        role: "system",
        content: `You are a resume parsing specialist. Extract structured data from the resume text.
Return valid JSON with this exact shape:
{
  "roles": [{ "title": string, "company": string, "start_date": "YYYY-MM", "end_date": "YYYY-MM" or "present", "description": string }],
  "skills": [string],
  "career_gaps": [{ "from": "YYYY-MM", "to": "YYYY-MM", "duration_months": number }],
  "education": [{ "institution": string, "degree": string, "year": string }]
}
Detect career gaps: any period > 3 months between roles where no employment is listed.
If dates are ambiguous, make reasonable inferences. Return ONLY valid JSON, no markdown.`,
      },
      {
        role: "user",
        content: state.resumeText,
      },
    ]);

    const text = typeof response.content === "string" ? response.content : JSON.stringify(response.content);
    const cleaned = text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    const parsed = resumeDataSchema.parse(JSON.parse(cleaned));

    return { parsedResume: parsed };
  } catch (err: any) {
    return { errors: [`resumeParser: ${err.message}`] };
  }
}
