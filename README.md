# @cellar-door/langchain

[![npm version](https://img.shields.io/npm/v/@cellar-door/langchain)](https://www.npmjs.com/package/@cellar-door/langchain)
[![tests](https://img.shields.io/badge/tests-19_passing-brightgreen)]()
[![license](https://img.shields.io/badge/license-Apache--2.0-blue)](./LICENSE)
[![NIST](https://img.shields.io/badge/NIST-submitted-orange)](https://cellar-door.dev/nist/)

> **[𓉸 Passage Protocol](https://cellar-door.dev)** · [exit-door](https://github.com/CellarDoorExits/exit-door) · [entry-door](https://github.com/CellarDoorExits/entry-door) · [mcp](https://github.com/CellarDoorExits/mcp-server) · [langchain](https://github.com/CellarDoorExits/langchain) · [vercel](https://github.com/CellarDoorExits/vercel-ai-sdk) · [eliza](https://github.com/CellarDoorExits/eliza-exit) · [eas](https://github.com/CellarDoorExits/eas-adapter) · [erc-8004](https://github.com/CellarDoorExits/erc-8004-adapter) · [sign](https://github.com/CellarDoorExits/sign-protocol-adapter) · [python](https://github.com/CellarDoorExits/exit-python)

> **⚠️ Pre-release software — no formal security audit has been conducted.** This project is published for transparency, review, and community feedback. It should not be used in production systems where security guarantees are required. If you find a vulnerability, please report it to hawthornhollows@gmail.com.

Add verifiable departure and arrival records to your LangChain agents.

## Ecosystem

| Package | Language | Description |
|---------|----------|-------------|
| [cellar-door-exit](https://github.com/CellarDoorExits/exit-door) | TypeScript | Core protocol (reference impl) |
| [cellar-door-exit](https://github.com/CellarDoorExits/exit-python) | Python | Core protocol |
| [cellar-door-entry](https://github.com/CellarDoorExits/entry-door) | TypeScript | Arrival/entry markers |
| **[@cellar-door/langchain](https://github.com/CellarDoorExits/langchain)** | **TypeScript** | **LangChain integration ← you are here** |
| [cellar-door-langchain](https://github.com/CellarDoorExits/cellar-door-langchain-python) | Python | LangChain integration |
| [@cellar-door/vercel-ai-sdk](https://github.com/CellarDoorExits/vercel-ai-sdk) | TypeScript | Vercel AI SDK |
| [@cellar-door/mcp-server](https://github.com/CellarDoorExits/mcp-server) | TypeScript | MCP server |
| [@cellar-door/eliza](https://github.com/CellarDoorExits/eliza-exit) | TypeScript | ElizaOS plugin |
| [@cellar-door/eas](https://github.com/CellarDoorExits/eas-adapter) | TypeScript | EAS attestation anchoring |
| [@cellar-door/erc-8004](https://github.com/CellarDoorExits/erc-8004-adapter) | TypeScript | ERC-8004 identity/reputation |
| [@cellar-door/sign-protocol](https://github.com/CellarDoorExits/sign-protocol-adapter) | TypeScript | Sign Protocol attestation |

**[Paper](https://cellar-door.dev/paper/) · [Website](https://cellar-door.dev)**

## Quick Start

```bash
npm install @cellar-door/langchain @langchain/core cellar-door-exit cellar-door-entry
```

```typescript
import { createExitTool } from "@cellar-door/langchain";

// Add to any LangChain agent
const exitTool = createExitTool();

// The agent can now create signed EXIT markers:
// "Create a departure record for did:web:platform.example"
// → Returns a signed, verifiable EXIT marker
```

### Automatic EXIT on chain completion

```typescript
import { ExitCallbackHandler } from "@cellar-door/langchain";

const handler = new ExitCallbackHandler({
  origin: "my-app",
  onMarker: (marker) => console.log("Departed:", marker.id),
});

const result = await chain.invoke(input, { callbacks: [handler] });
// EXIT marker created automatically when the chain finishes
```

## EXIT Tools

### Exit Tool

```ts
import { createExitTool } from "@cellar-door/langchain";

const tool = createExitTool();
// Use with any LangChain agent
```

### Exit Callback Handler

```ts
import { ExitCallbackHandler } from "@cellar-door/langchain";

const handler = new ExitCallbackHandler({
  origin: "my-app",
  onMarker: (marker) => console.log("Departed:", marker.id),
});
```

## ENTRY Tools

### Entry Tool

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
  arrivalDestination: "platform-b",
  onMarker: (marker) => console.log("EXIT:", marker.id),
  onArrival: (arrival) => console.log("ARRIVAL:", arrival.id),
});

// handler.markers — all EXIT markers
// handler.arrivals — all ARRIVAL markers
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
