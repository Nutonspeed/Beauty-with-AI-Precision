/**
 * Performance Optimization Exports
 * Centralized performance utilities
 */

export { FPSMonitor, getFPSMonitor, type FPSMetrics, type PerformanceReport } from "./fps-monitor"
export { WebGLAccelerator, getWebGLAccelerator } from "./webgl-accelerator"
export { WorkerPool, getWorkerPool, type WorkerTask, type WorkerResult } from "./worker-pool"

// Re-export existing optimizers
export { PerformanceOptimizer, getPerformanceOptimizer } from "../ai/performance-optimizer"
export { optimizeImageForAI, OPTIMAL_SIZES } from "../ai/image-optimizer"
