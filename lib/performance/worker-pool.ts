/**
 * Web Worker Pool for Parallel Processing
 * Distribute heavy computations across multiple workers
 */

export interface WorkerTask {
  id: string
  type: string
  data: any
  priority?: number
}

export interface WorkerResult {
  id: string
  result: any
  error?: string
  processingTime: number
}

export class WorkerPool {
  private workers: Worker[] = []
  private availableWorkers: Worker[] = []
  private taskQueue: WorkerTask[] = []
  private pendingTasks: Map<
    string,
    {
      resolve: (result: any) => void
      reject: (error: Error) => void
      startTime: number
    }
  > = new Map()

  private readonly maxWorkers: number
  private readonly workerScript: string

  constructor(maxWorkers: number = navigator.hardwareConcurrency || 4, workerScript = "/workers/analysis-worker.js") {
    this.maxWorkers = Math.min(maxWorkers, 8) // Cap at 8 workers
    this.workerScript = workerScript
  }

  /**
   * Initialize worker pool
   */
  async initialize(): Promise<void> {
    console.log(`[v0] Initializing worker pool with ${this.maxWorkers} workers`)

    for (let i = 0; i < this.maxWorkers; i++) {
      try {
        const worker = new Worker(this.workerScript)

        worker.onmessage = (e: MessageEvent<WorkerResult>) => {
          this.handleWorkerMessage(worker, e.data)
        }

        worker.onerror = (error) => {
          console.error("[v0] Worker error:", error)
        }

        this.workers.push(worker)
        this.availableWorkers.push(worker)
      } catch (error) {
        console.error(`[v0] Failed to create worker ${i}:`, error)
      }
    }

    console.log(`[v0] Worker pool initialized with ${this.workers.length} workers`)
  }

  /**
   * Execute task in worker pool
   */
  async execute(task: WorkerTask): Promise<any> {
    return new Promise((resolve, reject) => {
      this.pendingTasks.set(task.id, {
        resolve,
        reject,
        startTime: performance.now(),
      })

      // Add to queue
      this.taskQueue.push(task)

      // Sort by priority (higher first)
      this.taskQueue.sort((a, b) => (b.priority || 0) - (a.priority || 0))

      // Process queue
      this.processQueue()
    })
  }

  /**
   * Process task queue
   */
  private processQueue(): void {
    while (this.taskQueue.length > 0 && this.availableWorkers.length > 0) {
      const task = this.taskQueue.shift()!
      const worker = this.availableWorkers.shift()!

      // Send task to worker
      worker.postMessage(task)
    }
  }

  /**
   * Handle worker message
   */
  private handleWorkerMessage(worker: Worker, result: WorkerResult): void {
    const pending = this.pendingTasks.get(result.id)

    if (!pending) {
      console.warn("[v0] Received result for unknown task:", result.id)
      return
    }

    // Calculate processing time
    const processingTime = performance.now() - pending.startTime
    result.processingTime = processingTime

    // Resolve or reject promise
    if (result.error) {
      pending.reject(new Error(result.error))
    } else {
      pending.resolve(result.result)
    }

    // Clean up
    this.pendingTasks.delete(result.id)

    // Return worker to available pool
    this.availableWorkers.push(worker)

    // Process next task
    this.processQueue()
  }

  /**
   * Get pool statistics
   */
  getStats(): {
    totalWorkers: number
    availableWorkers: number
    queuedTasks: number
    pendingTasks: number
  } {
    return {
      totalWorkers: this.workers.length,
      availableWorkers: this.availableWorkers.length,
      queuedTasks: this.taskQueue.length,
      pendingTasks: this.pendingTasks.size,
    }
  }

  /**
   * Terminate all workers
   */
  dispose(): void {
    this.workers.forEach((worker) => worker.terminate())
    this.workers = []
    this.availableWorkers = []
    this.taskQueue = []
    this.pendingTasks.clear()
  }
}

// Singleton instance
let workerPoolInstance: WorkerPool | null = null

export function getWorkerPool(): WorkerPool {
  if (!workerPoolInstance) {
    workerPoolInstance = new WorkerPool()
  }
  return workerPoolInstance
}
