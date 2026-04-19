type Listener = (event: string, data: string) => void;

class SSEBroadcaster {
  private listeners: Set<Listener> = new Set();

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(event: string, data: object): void {
    const json = JSON.stringify(data);
    for (const listener of this.listeners) {
      listener(event, json);
    }
  }
}

// Global singleton (survives across API route invocations in the same process)
const globalForSSE = globalThis as unknown as { sseBroadcaster?: SSEBroadcaster };
export const broadcaster = globalForSSE.sseBroadcaster ??= new SSEBroadcaster();
