declare module 'simple-peer' {
  export type SignalData = unknown

  export interface Instance {
    on(event: 'signal', callback: (data: SignalData) => void): Instance
    on(event: 'connect', callback: () => void): Instance
    on(event: 'error', callback: (error: Error) => void): Instance
    on(event: 'close', callback: () => void): Instance
    on(event: 'stream', callback: (stream: MediaStream) => void): Instance
    signal(data: SignalData): void
    destroy(error?: Error): void
    addStream(stream: MediaStream): void
    removeStream(stream: MediaStream): void
  }

  interface SimplePeerOptions {
    initiator?: boolean
    trickle?: boolean
    stream?: MediaStream
    config?: RTCConfiguration
    wrtc?: unknown
  }

  class SimplePeer implements Instance {
    constructor(options?: SimplePeerOptions)
    on(event: 'signal', callback: (data: SignalData) => void): Instance
    on(event: 'connect', callback: () => void): Instance
    on(event: 'error', callback: (error: Error) => void): Instance
    on(event: 'close', callback: () => void): Instance
    on(event: 'stream', callback: (stream: MediaStream) => void): Instance
    signal(data: SignalData): void
    destroy(error?: Error): void
    addStream(stream: MediaStream): void
    removeStream(stream: MediaStream): void
  }

  export default SimplePeer
}
