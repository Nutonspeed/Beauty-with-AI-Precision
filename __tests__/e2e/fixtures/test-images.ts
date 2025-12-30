import path from 'path'

export const TEST_IMAGES = {
  // Valid skin analysis images
  validSkinImage: {
    path: path.join(__dirname, '../assets/test-skin-front.jpg'),
    name: 'test-skin-front.jpg',
    type: 'image/jpeg',
    size: 1024 * 1024 // 1MB
  },
  
  // Multiple angle images
  multiAngleImages: [
    path.join(__dirname, '../assets/test-skin-front.jpg'),
    path.join(__dirname, '../assets/test-skin-left.jpg'),
    path.join(__dirname, '../assets/test-skin-right.jpg')
  ],
  
  // Invalid files for error testing
  invalidFiles: {
    textFile: path.join(__dirname, '../assets/invalid.txt'),
    largeImage: path.join(__dirname, '../assets/large-image.jpg'), // 10MB
    corruptedImage: path.join(__dirname, '../assets/corrupted.jpg')
  }
}

// Helper to get test image as buffer
export async function getTestImageBuffer(imageName: string): Promise<Buffer> {
  const fs = await import('fs/promises')
  const imagePath = path.join(__dirname, '../assets', imageName)
  return fs.readFile(imagePath)
}

// Create test images directory if not exists
export async function ensureTestImagesDirectory() {
  const fs = await import('fs/promises')
  const dir = path.join(__dirname, '../assets')
  
  try {
    await fs.access(dir)
  } catch {
    await fs.mkdir(dir, { recursive: true })
  }
}
