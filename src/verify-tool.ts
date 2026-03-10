/**
 * LangChain Tool for verifying EXIT markers.
 */

import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { quickVerify, type VerificationResult } from "cellar-door-exit";

const verifyToolSchema = z.object({
  markerJson: z.string().describe("JSON string of the EXIT marker to verify"),
});

/**
 * Creates a LangChain tool that verifies EXIT marker signatures and structure.
 */
export function createVerifyTool() {
  return new DynamicStructuredTool({
    name: "verify_exit_marker",
    description:
      "Verify a cryptographically signed EXIT marker. Checks signature, structure, and integrity.",
    schema: verifyToolSchema,
    func: async (input) => {
      const result: VerificationResult = quickVerify(input.markerJson);
      return JSON.stringify({
        valid: result.valid,
        errors: result.errors ?? [],
      });
    },
  });
}
