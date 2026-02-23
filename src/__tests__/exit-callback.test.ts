import { describe, it, expect, vi } from "vitest";
import { ExitCallbackHandler } from "../exit-callback.js";

describe("ExitCallbackHandler", () => {
  it("records a marker on handleChainEnd", async () => {
    const handler = new ExitCallbackHandler({ origin: "test-chain" });
    await handler.handleChainEnd({ output: "done" });

    expect(handler.markers).toHaveLength(1);
    expect(handler.markers[0]).toHaveProperty("origin", "test-chain");
    expect(handler.markers[0]).toHaveProperty("proof");
  });

  it("records a marker on handleAgentEnd", async () => {
    const handler = new ExitCallbackHandler();
    await handler.handleAgentEnd({
      returnValues: { output: "finished" },
      log: "Agent finished",
    });

    expect(handler.markers).toHaveLength(1);
  });

  it("calls onMarker callback", async () => {
    const onMarker = vi.fn();
    const handler = new ExitCallbackHandler({ onMarker });
    await handler.handleChainEnd({});

    expect(onMarker).toHaveBeenCalledTimes(1);
    expect(onMarker).toHaveBeenCalledWith(
      expect.objectContaining({ exitType: "voluntary" })
    );
  });

  it("serializes markers to JSON", async () => {
    const handler = new ExitCallbackHandler();
    await handler.handleChainEnd({});
    await handler.handleChainEnd({});

    const json = handler.markersToJSON();
    const parsed = JSON.parse(json);
    expect(parsed).toHaveLength(2);
  });
});
