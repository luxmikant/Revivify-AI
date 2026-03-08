import { getModel } from "../model.js";
import { jdDataSchema } from "../../../../../packages/shared/src/schemas.js";
import type { GraphStateType } from "../state.js";

export async function jdAnalyzerNode(state: GraphStateType): Promise<Partial<GraphStateType>> {
  try {
    const model = getModel();
    const response = await model.invoke([
      {
        role: "system",
        content: `You are a job description analyst. Extract structured data from the job description.
Return valid JSON with this exact shape:
{
  "title": string,
  "keywords": [string],       // key technical and soft skills mentioned
  "requirements": [string],   // required qualifications
  "seniority": "Junior" | "Mid" | "Senior" | "Lead" | "Director"
}
Extract ALL relevant keywords including tools, technologies, certifications, and soft skills.
Return ONLY valid JSON, no markdown.`,
      },
      {
        role: "user",
        content: state.jdText,
      },
    ]);

    const text = typeof response.content === "string" ? response.content : JSON.stringify(response.content);
    const cleaned = text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    const parsed = jdDataSchema.parse(JSON.parse(cleaned));

    return { parsedJD: parsed };
  } catch (err: any) {
    return { errors: [`jdAnalyzer: ${err.message}`] };
  }
}
