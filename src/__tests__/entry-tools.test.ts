import { describe, it, expect, vi } from "vitest";
import { createEntryTool } from "../entry-tool.js";
import { createAdmissionPolicyTool } from "../admission-tool.js";
import { createTransferVerificationTool } from "../transfer-tool.js";
import { ExitCallbackHandler } from "../exit-callback.js";
import { quickExit, toJSON } from "cellar-door-exit";
import { quickEntry } from "cellar-door-entry";

function makeExitJson(origin = "test-origin") {
  return toJSON(quickExit(origin).marker);
}

describe("createEntryTool", () => {
  it("creates a tool with correct metadata", () => {
    const tool = createEntryTool();
    expect(tool.name).toBe("verify_and_create_arrival");
    expect(tool.description).toContain("arrival");
  });

  it("creates arrival from EXIT marker", async () => {
    const tool = createEntryTool();
    const result = JSON.parse(
      await tool.invoke({ exitMarkerJson: makeExitJson(), destination: "dest" })
    );
    expect(result.arrivalMarker).toBeTruthy();
    expect(result.continuity.valid).toBe(true);
  });
});

describe("createAdmissionPolicyTool", () => {
  it("evaluates OPEN_DOOR", async () => {
    const tool = createAdmissionPolicyTool();
    const result = JSON.parse(
      await tool.invoke({ exitMarkerJson: makeExitJson(), policy: "OPEN_DOOR" })
    );
    expect(result.admitted).toBe(true);
  });

  it("rejects voluntary under EMERGENCY_ONLY", async () => {
    const tool = createAdmissionPolicyTool();
    const result = JSON.parse(
      await tool.invoke({ exitMarkerJson: makeExitJson(), policy: "EMERGENCY_ONLY" })
    );
    expect(result.admitted).toBe(false);
  });
});

describe("createTransferVerificationTool", () => {
  it("verifies valid transfer", async () => {
    const exitJson = makeExitJson();
    const entry = quickEntry(exitJson, "dest");
    const arrivalJson = JSON.stringify(entry.arrivalMarker);

    const tool = createTransferVerificationTool();
    const result = JSON.parse(
      await tool.invoke({ exitMarkerJson: exitJson, arrivalMarkerJson: arrivalJson })
    );
    expect(result.verified).toBe(true);
  });
});

describe("ExitCallbackHandler with arrival", () => {
  it("creates both exit and arrival when arrivalDestination is set", async () => {
    const onArrival = vi.fn();
    const handler = new ExitCallbackHandler({
      origin: "source",
      arrivalDestination: "dest",
      onArrival,
    });
    await handler.handleChainEnd({ output: "done" });

    expect(handler.markers).toHaveLength(1);
    expect(handler.arrivals).toHaveLength(1);
    expect(onArrival).toHaveBeenCalledOnce();
  });

  it("does not create arrival without arrivalDestination", async () => {
    const handler = new ExitCallbackHandler({ origin: "source" });
    await handler.handleChainEnd({ output: "done" });
    expect(handler.markers).toHaveLength(1);
    expect(handler.arrivals).toHaveLength(0);
  });
});
