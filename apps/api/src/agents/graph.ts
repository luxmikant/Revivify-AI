import { StateGraph, START, END } from "@langchain/langgraph";
import { GraphState } from "./state.js";
import { resumeParserNode } from "./nodes/resumeParser.js";
import { jdAnalyzerNode } from "./nodes/jdAnalyzer.js";
import { atsScorerNode } from "./nodes/atsScorer.js";
import { gapAnalyzerNode } from "./nodes/gapAnalyzer.js";
import { bridgePlannerNode } from "./nodes/bridgePlanner.js";

function buildGraph() {
  const graph = new StateGraph(GraphState)
    .addNode("resumeParser", resumeParserNode)
    .addNode("jdAnalyzer", jdAnalyzerNode)
    .addNode("atsScorer", atsScorerNode)
    .addNode("gapAnalyzer", gapAnalyzerNode)
    .addNode("bridgePlanner", bridgePlannerNode);

  // Parallel fork: resume parser + JD analyzer run concurrently
  graph.addEdge(START, "resumeParser");
  graph.addEdge(START, "jdAnalyzer");

  // Both must complete before ATS scorer
  graph.addEdge("resumeParser", "atsScorer");
  graph.addEdge("jdAnalyzer", "atsScorer");

  // Sequential: scorer → gap analyzer → bridge planner → END
  graph.addEdge("atsScorer", "gapAnalyzer");
  graph.addEdge("gapAnalyzer", "bridgePlanner");
  graph.addEdge("bridgePlanner", END);

  return graph.compile();
}

export const analysisGraph = buildGraph();
