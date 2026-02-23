/**
 * LangChain Callback Handler that creates EXIT markers on chain/agent completion.
 */

import { BaseCallbackHandler } from "@langchain/core/callbacks/base";
import type { Serialized } from "@langchain/core/load/serializable";
import type { AgentFinish, AgentAction } from "@langchain/core/agents";
import type { ChainValues } from "@langchain/core/utils/types";
import {
  quickExit,
  toJSON,
  ExitType,
  type ExitMarker,
  type Identity,
} from "cellar-door-exit";
import {
  quickEntry,
  type ArrivalMarker,
  type QuickEntryResult,
} from "cellar-door-entry";

export interface ExitCallbackOpts {
  /** Origin platform/system name. Defaults to "langchain". */
  origin?: string;
  /** Exit type for auto-generated markers. Defaults to Voluntary. */
  exitType?: ExitType;
  /** Called whenever a new marker is created. */
  onMarker?: (marker: ExitMarker) => void;
  /** Maximum number of markers to retain in memory. Oldest are evicted when exceeded. Default: 1000. */
  maxMarkers?: number;
  /** If set, also create arrival markers at this destination on chain/agent start. */
  arrivalDestination?: string;
  /** Called whenever an arrival marker is created. */
  onArrival?: (arrival: ArrivalMarker) => void;
}

/**
 * A LangChain callback handler that automatically creates EXIT markers
 * when chains or agents finish execution.
 */
export class ExitCallbackHandler extends BaseCallbackHandler {
  name = "ExitCallbackHandler";

  readonly origin: string;
  readonly exitType: ExitType;
  readonly markers: ExitMarker[] = [];
  readonly arrivals: ArrivalMarker[] = [];
  readonly maxMarkers: number;
  readonly arrivalDestination?: string;
  private onMarker?: (marker: ExitMarker) => void;
  private onArrival?: (arrival: ArrivalMarker) => void;
  /** Stores the last exit marker JSON for creating arrivals */
  private lastExitMarkerJson?: string;

  constructor(opts?: ExitCallbackOpts) {
    super();
    this.origin = opts?.origin ?? "langchain";
    this.exitType = opts?.exitType ?? ExitType.Voluntary;
    this.onMarker = opts?.onMarker;
    this.onArrival = opts?.onArrival;
    this.maxMarkers = opts?.maxMarkers ?? 1000;
    this.arrivalDestination = opts?.arrivalDestination;
  }

  /** Remove all stored markers and arrivals. */
  clear(): void {
    this.markers.length = 0;
    this.arrivals.length = 0;
  }

  /**
   * Record an arrival from an EXIT marker JSON string.
   * Call this to manually trigger entry processing.
   */
  recordArrival(exitMarkerJson: string, destination?: string): QuickEntryResult {
    const dest = destination ?? this.arrivalDestination ?? this.origin;
    const result = quickEntry(exitMarkerJson, dest);
    this.arrivals.push(result.arrivalMarker);
    while (this.arrivals.length > this.maxMarkers) {
      this.arrivals.shift();
    }
    this.onArrival?.(result.arrivalMarker);
    return result;
  }

  private recordMarker(): ExitMarker {
    const { marker } = quickExit(this.origin, { exitType: this.exitType });
    this.markers.push(marker);
    // Evict oldest markers when limit exceeded
    while (this.markers.length > this.maxMarkers) {
      this.markers.shift();
    }
    this.onMarker?.(marker);
    return marker;
  }

  async handleChainEnd(_outputs: ChainValues): Promise<void> {
    const marker = this.recordMarker();
    // If arrivalDestination is set, also create arrival from exit
    if (this.arrivalDestination) {
      this.lastExitMarkerJson = toJSON(marker);
      this.recordArrival(this.lastExitMarkerJson, this.arrivalDestination);
    }
  }

  async handleAgentEnd(_action: AgentFinish): Promise<void> {
    const marker = this.recordMarker();
    if (this.arrivalDestination) {
      this.lastExitMarkerJson = toJSON(marker);
      this.recordArrival(this.lastExitMarkerJson, this.arrivalDestination);
    }
  }

  /** Get all recorded markers as JSON array. */
  markersToJSON(): string {
    return JSON.stringify(this.markers.map((m) => JSON.parse(toJSON(m))), null, 2);
  }
}
