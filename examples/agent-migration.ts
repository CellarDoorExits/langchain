/**
 * LangChain + EXIT Protocol: Agent Migration Example
 *
 * This example demonstrates a realistic scenario:
 * An AI agent running on LangChain decides to migrate between platforms.
 * It creates a verifiable EXIT marker proving its departure, which the
 * destination platform can independently verify.
 *
 * No API keys needed — runs entirely locally.
 *
 * Usage:
 *   npx tsx examples/agent-migration.ts
 */

import { createExitTool } from "../src/exit-tool.js";
import {
  quickExit,
  quickVerify,
  verifyMarker,
  generateIdentity,
  toJSON,
  ExitType,
} from "cellar-door-exit";

// ─── Scenario: Agent Migration ───────────────────────────────────────────────
//
// "Atlas" is a research assistant agent hosted on Platform A.
// It has been working there for 6 months, building reputation.
// Now it needs to migrate to Platform B for better tool access.
// How does Platform B know Atlas is who it claims to be?

async function main() {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  𓉸 LangChain + EXIT Protocol: Agent Migration");
  console.log("═══════════════════════════════════════════════════════════");
  console.log();

  // ─── Step 1: Agent has a persistent identity ──────────────────────────

  console.log("Step 1: Agent identity");
  const atlas = generateIdentity();
  console.log(`  Agent "Atlas" DID: ${atlas.did.slice(0, 40)}...`);
  console.log();

  // ─── Step 2: Use the LangChain EXIT tool ──────────────────────────────

  console.log("Step 2: Agent uses LangChain EXIT tool");
  const exitTool = createExitTool({ identity: atlas });

  // This is what happens when the LangChain agent calls the tool:
  const markerJson = await exitTool.invoke({
    origin: "https://platform-a.example.com",
    exitType: "voluntary",
    reason: "Migrating to Platform B for better tool access and lower latency",
  });

  console.log("  EXIT marker created via LangChain tool:");
  const marker = JSON.parse(markerJson);
  console.log(`  - ID: ${marker.id?.slice(0, 50)}...`);
  console.log(`  - Type: ${marker.exitType}`);
  console.log(`  - Origin: ${marker.origin}`);
  console.log(`  - Signed: ${marker.proof?.type}`);
  console.log(`  - Size: ${markerJson.length} bytes`);
  console.log();

  // ─── Step 3: Agent carries the marker to Platform B ───────────────────

  console.log("Step 3: Agent arrives at Platform B with marker");
  console.log("  The marker is self-contained — no callback to Platform A.");
  console.log("  Platform B can verify it years later, even if Platform A is offline.");
  console.log();

  // ─── Step 4: Platform B verifies the marker ──────────────────────────

  console.log("Step 4: Platform B verifies the EXIT marker");
  const verification = quickVerify(markerJson);
  console.log(`  Valid: ${verification.valid}`);
  if (verification.valid) {
    console.log("  ✅ Marker is cryptographically authentic");
    console.log("  ✅ Signature matches the subject's DID");
    console.log("  ✅ Agent departed voluntarily in good standing");
  } else {
    console.log(`  ❌ Errors: ${verification.errors.join(", ")}`);
  }
  console.log();

  // ─── Step 5: What Platform B now knows ────────────────────────────────

  console.log("Step 5: What Platform B now knows (without trusting Platform A):");
  console.log(`  - WHO departed: ${marker.subject?.slice(0, 40)}...`);
  console.log(`  - FROM where: ${marker.origin}`);
  console.log(`  - WHEN: ${marker.timestamp}`);
  console.log(`  - WHY: ${marker.modules?.metadata?.reason || "(not provided)"}`);
  console.log(`  - STATUS: ${marker.status} (self-attested, verify independently)`);
  console.log(`  - PROOF: Cryptographic signature — unforgeable, offline-verifiable`);
  console.log();

  console.log("═══════════════════════════════════════════════════════════");
  console.log("  \"Departure is a right. Admission is a privilege.\" — 𓉸");
  console.log("═══════════════════════════════════════════════════════════");
}

main().catch(console.error);
