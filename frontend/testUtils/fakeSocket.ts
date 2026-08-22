type Listener = (...args: any[]) => void;

export class FakeSocket {
  private listeners: Record<string, Listener[]> = {};
  public emitted: { event: string; args: any[] }[] = [];
  public disconnected = false;

  on(event: string, listener: Listener) {
    this.listeners[event] = this.listeners[event] || [];
    this.listeners[event].push(listener);
    return this;
  }

  once(event: string, listener: Listener) {
    return this.on(event, listener);
  }

  off(event: string, listener?: Listener) {
    if (!this.listeners[event]) return this;
    this.listeners[event] = listener
      ? this.listeners[event].filter((l) => l !== listener)
      : [];
    return this;
  }

  emit(event: string, ...args: any[]) {
    this.emitted.push({ event, args });
    return this;
  }

  disconnect() {
    this.disconnected = true;
  }

  // Test-only helper: simulate the "server" pushing an event to this client.
  __trigger(event: string, ...args: any[]) {
    (this.listeners[event] || []).forEach((listener) => listener(...args));
  }
}