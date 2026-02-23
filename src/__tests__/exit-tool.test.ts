import { describe, it, expect } from "vitest";
import { createExitTool } from "../exit-tool.js";

describe("createExitTool", () => {
  it("creates a tool with correct metadata", () => {
    const tool = createExitTool();
    expect(tool.name).toBe("create_exit_marker");
    expect(tool.description).toContain("EXIT marker");
  });

  it("generates a valid signed marker", async () => {
    const tool = createExitTool();
    const result = await tool.invoke({ origin: "test-platform" });
    const marker = JSON.parse(result);

    expect(marker).toHaveProperty("@context");
    expect(marker).toHaveProperty("exitType", "voluntary");
    expect(marker).toHaveProperty("origin", "test-platform");
    expect(marker).toHaveProperty("proof");
    expect(marker.proof).toHaveProperty("type", "Ed25519Signature2020");
  });

  it("accepts exit type", async () => {
    const tool = createExitTool();
    const result = await tool.invoke({
      origin: "test",
      exitType: "forced",
    });
    const marker = JSON.parse(result);
    expect(marker.exitType).toBe("forced");
  });

  it("handles emergency exit with justification", async () => {
    const tool = createExitTool();
    const result = await tool.invoke({
      origin: "test",
      exitType: "emergency",
      emergencyJustification: "System shutdown imminent",
    });
    const marker = JSON.parse(result);
    expect(marker.exitType).toBe("emergency");
  });
});
