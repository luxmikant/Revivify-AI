import { Annotation } from "@langchain/langgraph";
import type { ResumeData, JDData, GapAnalysisItem, BridgePlanItem } from "../../../../packages/shared/src/types.js";

export const GraphState = Annotation.Root({
  // Inputs
  resumeText: Annotation<string>,
  jdText: Annotation<string>,

  // Parsed by parallel agents
  parsedResume: Annotation<ResumeData | null>({
    reducer: (_, b) => b,
    default: () => null,
  }),
  parsedJD: Annotation<JDData | null>({
    reducer: (_, b) => b,
    default: () => null,
  }),

  // ATS scoring
  atsScore: Annotation<number>({
    reducer: (_, b) => b,
    default: () => 0,
  }),
  missingKeywords: Annotation<string[]>({
    reducer: (_, b) => b,
    default: () => [],
  }),

  // Gap analysis
  gapAnalysis: Annotation<GapAnalysisItem[]>({
    reducer: (_, b) => b,
    default: () => [],
  }),
  hiddenStrengthsSummary: Annotation<string>({
    reducer: (_, b) => b,
    default: () => "",
  }),

  // Bridge plan
  bridgePlan: Annotation<BridgePlanItem[]>({
    reducer: (_, b) => b,
    default: () => [],
  }),

  // Errors
  errors: Annotation<string[]>({
    reducer: (prev, b) => [...prev, ...b],
    default: () => [],
  }),
});

export type GraphStateType = typeof GraphState.State;
