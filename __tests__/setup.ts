import '@testing-library/jest-dom'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Cleanup after each test case
afterEach(() => {
  cleanup()
})

// Mock environment variables
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.NEXTAUTH_SECRET = 'test-secret'

// Ensure global event APIs exist when running outside browser
const globalAny = globalThis as any
if (typeof globalAny.addEventListener !== 'function') {
  const listenerMap = new Map<string, Set<EventListener | EventListenerObject>>()

  globalAny.addEventListener = (type: string, listener: EventListener | EventListenerObject) => {
    if (!listenerMap.has(type)) {
      listenerMap.set(type, new Set())
    }
    listenerMap.get(type)!.add(listener)
  }

  globalAny.removeEventListener = (type: string, listener: EventListener | EventListenerObject) => {
    listenerMap.get(type)?.delete(listener)
  }

  globalAny.dispatchEvent = (event: Event) => {
    const listeners = listenerMap.get(event.type)
    if (!listeners || listeners.size === 0) {
      return true
    }

    let defaultPrevented = false
    for (const listener of listeners) {
      if (typeof listener === 'function') {
        listener.call(globalAny, event)
      } else if (listener && typeof listener.handleEvent === 'function') {
        listener.handleEvent(event)
      }
      if ((event as any).defaultPrevented) {
        defaultPrevented = true
      }
    }
    return !defaultPrevented
  }
}

if (!('navigator' in globalAny)) {
  globalAny.navigator = {
    onLine: true,
    userAgent: 'vitest-happy-dom',
    mediaDevices: {
      getUserMedia: vi.fn().mockResolvedValue({}),
      enumerateDevices: vi.fn().mockResolvedValue([]),
    },
    geolocation: {
      getCurrentPosition: vi.fn(),
      watchPosition: vi.fn(),
      clearWatch: vi.fn(),
    },
  }
}

if (typeof globalAny.matchMedia !== 'function') {
  globalAny.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

if (typeof globalAny.requestAnimationFrame !== 'function') {
  globalAny.requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(() => cb(Date.now()), 16)
  globalAny.cancelAnimationFrame = (id: number) => clearTimeout(id)
}

// Mock ImageData (for happy-dom compatibility)
if (typeof ImageData === 'undefined') {
  globalThis.ImageData = class ImageData {
    data: Uint8ClampedArray
    width: number
    height: number
    
    constructor(dataOrWidth: Uint8ClampedArray | number, widthOrHeight: number, height?: number) {
      if (dataOrWidth instanceof Uint8ClampedArray) {
        this.data = dataOrWidth
        this.width = widthOrHeight
        this.height = height!
      } else {
        this.width = dataOrWidth
        this.height = widthOrHeight
        this.data = new Uint8ClampedArray(this.width * this.height * 4)
      }
    }
  } as any
}

// Mock browser APIs
globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock canvas API (safe check for HTMLCanvasElement)
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation(() => ({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(),
  putImageData: vi.fn(),
  createImageData: vi.fn(),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  fillText: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  strokeRect: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  transform: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
}))
}

// Mock Image constructor
globalThis.Image = class Image {
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  src = ''
  width = 800
  height = 600
  crossOrigin = ''
  
  constructor() {
    setTimeout(() => {
      if (this.onload) this.onload()
    }, 0)
  }
} as any

// Mock MediaPipe
vi.mock('@mediapipe/face_mesh', () => ({
  FaceMesh: vi.fn().mockImplementation(() => ({
    setOptions: vi.fn(),
    initialize: vi.fn(),
    send: vi.fn(),
    close: vi.fn(),
  })),
}))

// Mock TensorFlow.js
vi.mock('@tensorflow/tfjs', () => ({
  ready: vi.fn().mockResolvedValue(undefined),
  browser: {
    fromPixels: vi.fn(),
  },
  tidy: vi.fn((fn) => fn()),
  tensor4d: vi.fn(),
  image: {
    resizeBilinear: vi.fn(),
  },
  mean: vi.fn(),
  conv2d: vi.fn(),
  abs: vi.fn(),
  sum: vi.fn(),
  scalar: vi.fn(),
  less: vi.fn(),
}))
