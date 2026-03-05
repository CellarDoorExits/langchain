import { describe, it, expect } from "vitest";
import { createAdmissionPolicyTool } from "../admission-tool.js";
import { quickExit, toJSON } from "cellar-door-exit";

describe("createAdmissionPolicyTool", () => {
  const tool = createAdmissionPolicyTool();

  it("evaluates a valid marker against OPEN_DOOR", async () => {
    const { marker } = quickExit("did:example:test");
    const result = await tool.invoke({
      exitMarkerJson: toJSON(marker),
      policy: "OPEN_DOOR",
    });
    const data = JSON.parse(result);
    expect(data.admitted).toBe(true);
    expect(data.policy).toBe("OPEN_DOOR");
  });

  it("returns error for invalid JSON instead of throwing", async () => {
    const result = await tool.invoke({
      exitMarkerJson: "not valid json {{{",
      policy: "STRICT",
    });
    const data = JSON.parse(result);
    expect(data.admitted).toBe(false);
    expect(data.error).toContain("Marker parsing failed");
    expect(data.policy).toBe("STRICT");
  });

  it("returns error for valid JSON but invalid marker", async () => {
    const result = await tool.invoke({
      exitMarkerJson: '{"not": "a marker"}',
      policy: "OPEN_DOOR",
    });
    const data = JSON.parse(result);
    expect(data.admitted).toBe(false);
    expect(data.error).toBeTruthy();
  });

  it("returns error for empty string", async () => {
    const result = await tool.invoke({
      exitMarkerJson: "",
      policy: "OPEN_DOOR",
    });
    const data = JSON.parse(result);
    expect(data.admitted).toBe(false);
    expect(data.error).toBeTruthy();
  });
});
