/**
 * ==============================================================================
 * UNDERGROUND CONNECTIVITY BUFFER & RETRY QUEUE
 * ==============================================================================
 * 
 * ARCHITECTURAL SPECIFICATION & CONNECTIVITY NOTE:
 * Underground coal mine shafts experience intermittent RF/LoRa link dropouts due to
 * geological strata, longwall shields, and heavy machinery interference.
 * 
 * SENSOR/JETSON EDGE RESPONSIBILITY:
 * 1. Sensor nodes (ESP32) and NVIDIA Jetson edge gateways MUST maintain an in-memory
 *    ring buffer (or SQLite/Flash ring buffer) of unsent readings when HTTP/LoRa POSTs fail.
 * 2. On network re-establishment, buffered readings must be flushed in batch chronologically
 *    preserving their original ISO-8601 timestamps.
 * 
 * BACKEND QUEUE HANDLER (TODO):
 * This module provides an in-memory queue buffer abstraction for server-side
 * batch retries when downstream Supabase connectivity or cloud connections fluctuate.
 */

export interface QueuedPayload {
  id: string;
  endpoint: string;
  payload: any;
  retryCount: number;
  addedAt: number;
}

class IngestionBufferQueue {
  private queue: QueuedPayload[] = [];
  private maxQueueSize = 1000;
  private isFlushing = false;

  public enqueue(endpoint: string, payload: any): void {
    if (this.queue.length >= this.maxQueueSize) {
      console.warn('⚠️ [BufferQueue] Queue limit reached; dropping oldest buffered telemetry packet.');
      this.queue.shift();
    }

    const item: QueuedPayload = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      endpoint,
      payload,
      retryCount: 0,
      addedAt: Date.now(),
    };

    this.queue.push(item);
    console.log(`📦 [BufferQueue] Buffered item (${item.id}) for endpoint ${endpoint}. Queue size: ${this.queue.length}`);
  }

  public getQueueLength(): number {
    return this.queue.length;
  }

  public flushAll(): QueuedPayload[] {
    const items = [...this.queue];
    this.queue = [];
    return items;
  }
}

export const bufferQueue = new IngestionBufferQueue();
