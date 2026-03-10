/**
 * LangChain Tool for counter-signing EXIT markers.
 */

import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import {
  fromJSON,
  toJSON,
  generateIdentity,
  sign,
  type ExitMarker,
  type WitnessAttachment,
} from "cellar-door-exit";

const countersignToolSchema = z.object({
  markerJson: z.string().describe("JSON string of the signed EXIT marker to counter-sign"),
  attestation: z
    .string()
    .optional()
    .describe("What the witness attests to. Defaults to 'Observed departure ceremony'."),
});

/**
 * Creates a LangChain tool that counter-signs an EXIT marker as a witness.
 */
export function createCounterSignTool() {
  return new DynamicStructuredTool({
    name: "countersign_exit_marker",
    description:
      "Counter-sign an EXIT marker as a witness. Generates a fresh identity and appends a witness attestation.",
    schema: countersignToolSchema,
    func: async (input) => {
      const marker = fromJSON(input.markerJson) as ExitMarker;
      const identity = generateIdentity();
      const att = input.attestation ?? "Observed departure ceremony";
      const ts = new Date().toISOString();

      const payload = new TextEncoder().encode(att + marker.id + ts);
      const sig = sign(payload, identity.privateKey);

      const witness: WitnessAttachment = {
        witnessDid: identity.did,
        attestation: att,
        timestamp: ts,
        signature: Buffer.from(sig).toString("base64"),
        signatureType: "Ed25519Signature2020",
      };

      const updated = { ...marker, witnesses: [...(marker.witnesses ?? []), witness] };
      return toJSON(updated as ExitMarker);
    },
  });
}
