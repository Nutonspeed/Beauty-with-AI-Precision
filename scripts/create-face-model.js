const { Scene, PerspectiveCamera, WebGLRenderer, Mesh, MeshBasicMaterial, SphereGeometry, BoxGeometry, DirectionalLight, AmbientLight, GLTFExporter } = require('three');
const fs = require('fs');
const path = require('path');

// Create a simple face model
const scene = new Scene();

// Head (sphere)
const headGeometry = new SphereGeometry(1, 32, 32);
const headMaterial = new MeshBasicMaterial({ color: 0xffccaa });
const head = new Mesh(headGeometry, headMaterial);
scene.add(head);

// Eyes
const eyeGeometry = new SphereGeometry(0.15, 16, 16);
const eyeMaterial = new MeshBasicMaterial({ color: 0x000000 });

const leftEye = new Mesh(eyeGeometry, eyeMaterial);
leftEye.position.set(-0.3, 0.1, 0.8);
head.add(leftEye);

const rightEye = new Mesh(eyeGeometry, eyeMaterial);
rightEye.position.set(0.3, 0.1, 0.8);
head.add(rightEye);

// Nose (simple triangle)
const noseGeometry = new BoxGeometry(0.2, 0.1, 0.4);
const nose = new Mesh(noseGeometry, eyeMaterial);
nose.position.set(0, -0.1, 1);
head.add(nose);

// Mouth (simple line/box)
const mouthGeometry = new BoxGeometry(0.6, 0.05, 0.1);
const mouth = new Mesh(mouthGeometry, eyeMaterial);
mouth.position.set(0, -0.4, 0.7);
head.add(mouth);

// Add some lighting
const ambientLight = new AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Export as GLB
const exporter = new GLTFExporter();

exporter.parse(
  scene,
  (glb) => {
    const outputPath = path.join(__dirname, '../public/models/face/face-model.glb');
    fs.writeFileSync(outputPath, Buffer.from(glb));
    console.log('Face model saved to:', outputPath);
  },
  (error) => {
    console.error('Error exporting GLB:', error);
  },
  { binary: true }
);
