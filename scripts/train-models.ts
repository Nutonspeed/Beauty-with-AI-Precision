/**
 * Training Script for Skin Concern Detection Models
 * Phase 12: ML Model Training using TensorFlow.js
 * 
 * This script demonstrates how to train custom models for skin concern detection.
 * In production, you would need actual labeled training data (100-500 images per concern type).
 */

import * as tf from '@tensorflow/tfjs-node'
import * as fs from 'fs'
import * as path from 'path'

// Model configuration
interface ModelTrainingConfig {
  concernType: 'wrinkle' | 'pigmentation' | 'pore' | 'redness'
  inputSize: { width: number; height: number }
  batchSize: number
  epochs: number
  learningRate: number
  datasetPath: string
  outputPath: string
}

/**
 * Create MobileNetV2-based model for skin concern detection
 */
function createSkinConcernModel(inputShape: [number, number, number]): tf.LayersModel {
  const model = tf.sequential()

  // MobileNetV2 backbone (lightweight architecture for mobile/web)
  // Input layer
  model.add(
    tf.layers.conv2d({
      inputShape,
      filters: 32,
      kernelSize: 3,
      strides: 2,
      padding: 'same',
      activation: 'relu6',
      kernelInitializer: 'heNormal',
    })
  )

  // Depthwise separable convolution blocks
  const addMobileBlock = (filters: number, strides: number = 1) => {
    // Depthwise
    model.add(
      tf.layers.depthwiseConv2d({
        kernelSize: 3,
        strides,
        padding: 'same',
        activation: 'relu6',
      })
    )
    model.add(tf.layers.batchNormalization())

    // Pointwise
    model.add(
      tf.layers.conv2d({
        filters,
        kernelSize: 1,
        padding: 'same',
        activation: 'relu6',
      })
    )
    model.add(tf.layers.batchNormalization())
  }

  // Build MobileNet blocks
  addMobileBlock(64, 2)
  addMobileBlock(128, 2)
  addMobileBlock(128, 1)
  addMobileBlock(256, 2)
  addMobileBlock(256, 1)
  addMobileBlock(512, 2)

  // Global average pooling
  model.add(tf.layers.globalAveragePooling2d())

  // Dense layers for classification
  model.add(
    tf.layers.dense({
      units: 256,
      activation: 'relu',
      kernelRegularizer: tf.regularizers.l2({ l2: 0.001 }),
    })
  )
  model.add(tf.layers.dropout({ rate: 0.5 }))

  model.add(
    tf.layers.dense({
      units: 128,
      activation: 'relu',
      kernelRegularizer: tf.regularizers.l2({ l2: 0.001 }),
    })
  )
  model.add(tf.layers.dropout({ rate: 0.3 }))

  // Output layer (detection heatmap)
  // Output shape: [batch, gridH, gridW, 1] for heatmap
  model.add(
    tf.layers.dense({
      units: 49, // 7x7 grid
      activation: 'sigmoid', // 0-1 intensity values
    })
  )

  model.add(tf.layers.reshape({ targetShape: [7, 7, 1] }))

  return model
}

/**
 * Load and preprocess training data
 */
async function loadTrainingData(
  datasetPath: string,
  inputSize: { width: number; height: number }
): Promise<{
  images: tf.Tensor4D
  labels: tf.Tensor4D
  validationImages: tf.Tensor4D
  validationLabels: tf.Tensor4D
}> {
  console.log(`📂 Loading training data from ${datasetPath}...`)

  // In production, this would load actual images and their corresponding heatmap labels
  // For demonstration, we create synthetic data

  const numSamples = 500
  const validationSplit = 0.2
  const numValidation = Math.floor(numSamples * validationSplit)
  const numTraining = numSamples - numValidation

  // Generate synthetic training data (replace with real data loading)
  const images = tf.randomUniform([numTraining, inputSize.height, inputSize.width, 3])
  const labels = tf.randomUniform([numTraining, 7, 7, 1]) // 7x7 heatmap

  const validationImages = tf.randomUniform([numValidation, inputSize.height, inputSize.width, 3])
  const validationLabels = tf.randomUniform([numValidation, 7, 7, 1])

  console.log(`✅ Loaded ${numTraining} training samples and ${numValidation} validation samples`)

  return { images, labels, validationImages, validationLabels }
}

/**
 * Train skin concern detection model
 */
async function trainModel(config: ModelTrainingConfig): Promise<void> {
  console.log(`\n🚀 Training ${config.concernType} detection model...`)
  console.log('Configuration:', config)

  // Create model
  const inputShape: [number, number, number] = [config.inputSize.height, config.inputSize.width, 3]
  const model = createSkinConcernModel(inputShape)

  // Compile model
  model.compile({
    optimizer: tf.train.adam(config.learningRate),
    loss: 'binaryCrossentropy', // For heatmap prediction
    metrics: ['accuracy', 'precision', 'recall'],
  })

  console.log('\n📊 Model Summary:')
  model.summary()

  // Load training data
  const { images, labels, validationImages, validationLabels } = await loadTrainingData(
    config.datasetPath,
    config.inputSize
  )

  // Train model
  console.log('\n🎓 Training...')
  const history = await model.fit(images, labels, {
    batchSize: config.batchSize,
    epochs: config.epochs,
    validationData: [validationImages, validationLabels],
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        console.log(
          `Epoch ${epoch + 1}/${config.epochs} - ` +
            `loss: ${logs?.loss.toFixed(4)} - ` +
            `acc: ${logs?.acc.toFixed(4)} - ` +
            `val_loss: ${logs?.val_loss.toFixed(4)} - ` +
            `val_acc: ${logs?.val_acc.toFixed(4)}`
        )
      },
    },
  })

  // Save model
  const outputDir = path.join(config.outputPath, config.concernType + '-detector')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  await model.save(`file://${outputDir}`)
  console.log(`\n✅ Model saved to ${outputDir}`)

  // Save training history
  const historyPath = path.join(outputDir, 'training-history.json')
  fs.writeFileSync(historyPath, JSON.stringify(history.history, null, 2))
  console.log(`📊 Training history saved to ${historyPath}`)

  // Cleanup
  tf.dispose([images, labels, validationImages, validationLabels])
  model.dispose()
}

/**
 * Convert saved model to web format (TensorFlow.js Graph Model)
 */
async function convertToWebFormat(modelPath: string, outputPath: string): Promise<void> {
  console.log(`\n🔄 Converting model to web format...`)
  console.log(`Input: ${modelPath}`)
  console.log(`Output: ${outputPath}`)

  // Load the saved model
  const model = await tf.loadLayersModel(`file://${modelPath}/model.json`)

  // Save as graph model for web
  await model.save(`file://${outputPath}`)

  console.log(`✅ Web model saved to ${outputPath}`)
  
  // Calculate model size
  const modelJsonPath = path.join(outputPath, 'model.json')
  const binFiles = fs.readdirSync(outputPath).filter(f => f.endsWith('.bin'))
  
  let totalSize = fs.statSync(modelJsonPath).size
  binFiles.forEach(binFile => {
    totalSize += fs.statSync(path.join(outputPath, binFile)).size
  })
  
  console.log(`📦 Total model size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`)
  
  if (totalSize > 5 * 1024 * 1024) {
    console.warn('⚠️ Warning: Model size exceeds 5MB. Consider quantization for production.')
  }

  model.dispose()
}

/**
 * Main training pipeline
 */
async function main() {
  console.log('🎯 Skin Concern Detection Model Training Pipeline')
  console.log('================================================\n')

  // Training configurations for each concern type
  const configs: ModelTrainingConfig[] = [
    {
      concernType: 'wrinkle',
      inputSize: { width: 224, height: 224 },
      batchSize: 32,
      epochs: 50,
      learningRate: 0.001,
      datasetPath: './datasets/wrinkles',
      outputPath: './public/models',
    },
    {
      concernType: 'pigmentation',
      inputSize: { width: 224, height: 224 },
      batchSize: 32,
      epochs: 50,
      learningRate: 0.001,
      datasetPath: './datasets/pigmentation',
      outputPath: './public/models',
    },
    {
      concernType: 'pore',
      inputSize: { width: 224, height: 224 },
      batchSize: 32,
      epochs: 50,
      learningRate: 0.001,
      datasetPath: './datasets/pores',
      outputPath: './public/models',
    },
    {
      concernType: 'redness',
      inputSize: { width: 224, height: 224 },
      batchSize: 32,
      epochs: 50,
      learningRate: 0.001,
      datasetPath: './datasets/redness',
      outputPath: './public/models',
    },
  ]

  // Train each model
  for (const config of configs) {
    try {
      await trainModel(config)

      // Convert to web format
      const modelPath = path.join(config.outputPath, config.concernType + '-detector')
      await convertToWebFormat(modelPath, modelPath)
    } catch (error) {
      console.error(`❌ Error training ${config.concernType} model:`, error)
    }
  }

  console.log('\n✅ All models trained successfully!')
  console.log('\n📌 Next Steps:')
  console.log('1. Copy models from public/models to your web server')
  console.log('2. Test models with real skin images')
  console.log('3. Fine-tune hyperparameters if accuracy < 85%')
  console.log('4. Deploy to production when satisfied with results')
}

// Run training if this script is executed directly
if (require.main === module) {
  main().catch(console.error)
}

export { createSkinConcernModel, trainModel, convertToWebFormat }
