/**
 * LangChain Tool for evaluating admission policies via cellar-door-entry.
 */

import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import {
  evaluateAdmission,
  OPEN_DOOR,
  STRICT,
  EMERGENCY_ONLY,
  type AdmissionPolicy,
} from "cellar-door-entry";
import { fromJSON } from "cellar-door-exit";

const presets: Record<string, AdmissionPolicy> = { OPEN_DOOR, STRICT, EMERGENCY_ONLY };

const admissionSchema = z.object({
  exitMarkerJson: z.string().describe("JSON string of the EXIT marker to evaluate"),
  policy: z
    .enum(["OPEN_DOOR", "STRICT", "EMERGENCY_ONLY"])
    .describe("Admission policy preset to evaluate against"),
});

/**
 * Creates a LangChain tool that evaluates admission policies.
 */
export function createAdmissionPolicyTool() {
  return new DynamicStructuredTool({
    name: "evaluate_admission_policy",
    description:
      "Evaluate whether an EXIT departure marker meets an admission policy. " +
      "Does not create an arrival — just checks the policy.",
    schema: admissionSchema,
    func: async (input) => {
      try {
        const exitMarker = fromJSON(input.exitMarkerJson);
        const result = evaluateAdmission(exitMarker, presets[input.policy]);
        return JSON.stringify({ ...result, policy: input.policy });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        // Distinguish parse/validation errors from unexpected failures
        if (message.includes("Invalid JSON") || message.includes("Validation")) {
          return JSON.stringify({
            admitted: false,
            error: `Marker parsing failed: ${message}`,
            policy: input.policy,
          });
        }
        return JSON.stringify({
          admitted: false,
          error: `Admission evaluation failed: ${message}`,
          policy: input.policy,
        });
      }
    },
  });
}
