# @cellar-door/langchain

LangChain integration for [`cellar-door-exit`](https://www.npmjs.com/package/cellar-door-exit) and [`cellar-door-entry`](https://www.npmjs.com/package/cellar-door-entry) — cryptographically signed, verifiable agent departure and arrival markers.

Part of the [EXIT Protocol](https://github.com/CellarDoorExits/exit-door).

## Installation

```bash
npm install @cellar-door/langchain @langchain/core cellar-door-exit cellar-door-entry
```

## EXIT Tools

### Exit Tool

```ts
import { createExitTool } from "@cellar-door/langchain";

const tool = createExitTool();
// Use with any LangChain agent — creates signed EXIT markers
```

### Exit Callback Handler

```ts
import { ExitCallbackHandler } from "@cellar-door/langchain";

const handler = new ExitCallbackHandler({
  origin: "my-app",
  onMarker: (marker) => console.log("Departed:", marker.id),
});

const result = await chain.invoke(input, { callbacks: [handler] });
```

## ENTRY Tools

### Entry Tool — Verify and Create Arrival

```ts
import { createEntryTool } from "@cellar-door/langchain";

const entryTool = createEntryTool();
// Agent calls with { exitMarkerJson, destination }
// Returns signed arrival marker with continuity verification
```

### Admission Policy Tool

```ts
import { createAdmissionPolicyTool } from "@cellar-door/langchain";

const admissionTool = createAdmissionPolicyTool();
// Agent calls with { exitMarkerJson, policy: "OPEN_DOOR" | "STRICT" | "EMERGENCY_ONLY" }
```

### Transfer Verification Tool

```ts
import { createTransferVerificationTool } from "@cellar-door/langchain";

const transferTool = createTransferVerificationTool();
// Agent calls with { exitMarkerJson, arrivalMarkerJson }
// Returns { verified, transferTime, errors, continuity }
```

### Callback Handler with Arrival

```ts
import { ExitCallbackHandler } from "@cellar-door/langchain";

const handler = new ExitCallbackHandler({
  origin: "platform-a",
  arrivalDestination: "platform-b", // Automatically create arrivals too
  onMarker: (marker) => console.log("EXIT:", marker.id),
  onArrival: (arrival) => console.log("ARRIVAL:", arrival.id),
});

// handler.markers — all EXIT markers
// handler.arrivals — all ARRIVAL markers
// handler.recordArrival(exitJson, dest?) — manually trigger entry
```

## API

### EXIT

- **`createExitTool(opts?)`** — `DynamicStructuredTool` for creating EXIT markers
- **`ExitCallbackHandler`** — Callback handler for automatic EXIT (and optionally ENTRY) markers

### ENTRY

- **`createEntryTool()`** — Tool to verify EXIT + create arrival
- **`createAdmissionPolicyTool()`** — Tool to evaluate admission policies
- **`createTransferVerificationTool()`** — Tool to verify EXIT→ENTRY transfers

## ⚠️ Disclaimer

> **WARNING:** Automated admission decisions should be reviewed by platform operators. This integration does not constitute legal advice. Platforms are responsible for their own admission policies and the consequences of admitting agents.

## License

Apache-2.0
