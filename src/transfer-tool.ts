/**
 * LangChain Tool for verifying EXIT→ENTRY transfers via cellar-door-entry.
 */

import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { verifyTransfer, validateArrivalMarker, MAX_MARKER_SIZE } from "cellar-door-entry";
import { fromJSON } from "cellar-door-exit";

const transferSchema = z.object({
  exitMarkerJson: z.string().describe("JSON string of the EXIT marker"),
  arrivalMarkerJson: z.string().describe("JSON string of the ARRIVAL marker"),
});

/**
 * Creates a LangChain tool that verifies a complete EXIT→ENTRY transfer.
 */
export function createTransferVerificationTool() {
  return new DynamicStructuredTool({
    name: "verify_transfer",
    description:
      "Verify a complete EXIT→ENTRY transfer chain: check both markers' signatures and continuity.",
    schema: transferSchema,
    func: async (input) => {
      const exitMarker = fromJSON(input.exitMarkerJson);
      let arrivalMarker: any;

      // LC-04/S-05: Validate arrival marker input with size limits and structural checks
      if (input.arrivalMarkerJson.length > MAX_MARKER_SIZE) {
        return JSON.stringify({
          verified: false,
          transferTime: null,
          errors: [`Arrival marker JSON too large: ${input.arrivalMarkerJson.length} bytes (max ${MAX_MARKER_SIZE})`],
          continuity: null,
        });
      }

      try {
        arrivalMarker = JSON.parse(input.arrivalMarkerJson);
      } catch {
        return JSON.stringify({
          verified: false,
          transferTime: null,
          errors: ["Invalid arrival marker JSON: failed to parse"],
          continuity: null,
        });
      }

      const validation = validateArrivalMarker(arrivalMarker);
      if (!validation.valid) {
        return JSON.stringify({
          verified: false,
          transferTime: null,
          errors: validation.errors.map((e: string) => `VALIDATION: ${e}`),
          continuity: null,
        });
      }
      const record = verifyTransfer(exitMarker, arrivalMarker);
      return JSON.stringify({
        verified: record.verified,
        transferTime: record.transferTime,
        errors: record.errors,
        continuity: record.continuity,
      });
    },
  });
}
