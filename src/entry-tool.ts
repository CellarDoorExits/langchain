/**
 * LangChain Tool for creating ENTRY (arrival) markers via cellar-door-entry.
 */

import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { quickEntry } from "cellar-door-entry";

const entryToolSchema = z.object({
  exitMarkerJson: z.string().describe("JSON string of the EXIT marker to verify and admit"),
  destination: z.string().describe("The platform or system where the agent is arriving"),
});

/**
 * Creates a LangChain tool that verifies an EXIT marker and creates a signed arrival.
 */
export function createEntryTool() {
  return new DynamicStructuredTool({
    name: "verify_and_create_arrival",
    description:
      "Verify a cryptographically signed EXIT marker and create a linked arrival marker at this destination. " +
      "Returns the signed arrival marker with continuity verification.",
    schema: entryToolSchema,
    func: async (input) => {
      const result = quickEntry(input.exitMarkerJson, input.destination);
      return JSON.stringify({
        arrivalMarker: result.arrivalMarker,
        exitMarkerId: result.exitMarker.id,
        continuity: result.continuity,
      });
    },
  });
}
