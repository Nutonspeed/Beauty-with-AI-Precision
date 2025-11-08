/**
 * Inline Worker Factory
 * Creates a Web Worker from inline code for Next.js compatibility
 */

export function createInlineWorker(workerCode: string): Worker {
  const blob = new Blob([workerCode], { type: 'application/javascript' })
  const workerUrl = URL.createObjectURL(blob)
  return new Worker(workerUrl, { type: 'module' })
}
