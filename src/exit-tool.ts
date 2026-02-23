/**
 * LangChain Tool for creating EXIT markers via cellar-door-exit.
 */

import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import {
  quickExit,
  ExitType,
  toJSON,
  type Identity,
  type QuickExitOpts,
} from "cellar-door-exit";

const exitTypeValues = ["voluntary", "forced", "emergency", "keyCompromise"] as const;

const exitToolSchema = z.object({
  origin: z.string().describe("The platform or system being exited"),
  exitType: z
    .enum(exitTypeValues)
    .optional()
    .describe("Type of exit: voluntary, forced, emergency, or keyCompromise (default: voluntary)"),
  reason: z.string().optional().describe("Reason for the exit"),
  emergencyJustification: z
    .string()
    .optional()
    .describe("Required justification when exitType is 'emergency'"),
});

export type ExitToolInput = z.infer<typeof exitToolSchema>;

export interface ExitToolOpts {
  /** If provided, reuse this identity instead of generating a new one each call. */
  identity?: Identity;
}

/**
 * Creates a LangChain tool that generates signed EXIT markers.
 */
export function createExitTool(opts?: ExitToolOpts) {
  return new DynamicStructuredTool({
    name: "create_exit_marker",
    description:
      "Create a cryptographically signed EXIT marker — a verifiable departure record for an AI agent leaving a platform or system.",
    schema: exitToolSchema,
    func: async (input: ExitToolInput) => {
      const exitTypeMap: Record<string, ExitType> = {
        voluntary: ExitType.Voluntary,
        forced: ExitType.Forced,
        emergency: ExitType.Emergency,
        keyCompromise: ExitType.KeyCompromise,
      };

      const quickOpts: QuickExitOpts = {
        exitType: input.exitType
          ? exitTypeMap[input.exitType]
          : ExitType.Voluntary,
        reason: input.reason,
        emergencyJustification: input.emergencyJustification,
      };

      const { marker } = quickExit(input.origin, quickOpts);
      return toJSON(marker);
    },
  });
}
