# 🔬 Beauty AI Analysis Service

FastAPI backend service for skin analysis using computer vision and machine learning.

## 🚀 Features

- **Spots Detection** - Hyperpigmentation, dark spots, age spots, melasma
- **Wrinkles Analysis** - Fine lines, deep wrinkles, crow's feet
- **Texture Analysis** - Skin smoothness, roughness, uniformity
- **Pores Detection** - Enlarged pores, pore density mapping
- **Multi-Mode Analysis** - Run all analyses in parallel

## 📋 Prerequisites

- Python 3.10+
- pip or conda
- (Optional) Docker & Docker Compose

## 🛠️ Installation

### Option 1: Local Development

```bash
# Clone repository
cd ai-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
copy .env.example .env

# Run server
python main.py
```

### Option 2: Docker

```bash
# Build and run with docker-compose
docker-compose up --build

# Or build manually
docker build -t beauty-ai-service .
docker run -p 8000:8000 beauty-ai-service
```

## 🌐 API Endpoints

### Health Check
```bash
GET http://localhost:8000/health
```

### Spots Detection
```bash
POST http://localhost:8000/api/analyze/spots
Content-Type: multipart/form-data
Body: file=<image.jpg>
```

### Wrinkles Detection
```bash
POST http://localhost:8000/api/analyze/wrinkles
Content-Type: multipart/form-data
Body: file=<image.jpg>
```

### Texture Analysis
```bash
POST http://localhost:8000/api/analyze/texture
Content-Type: multipart/form-data
Body: file=<image.jpg>
```

### Pores Detection
```bash
POST http://localhost:8000/api/analyze/pores
Content-Type: multipart/form-data
Body: file=<image.jpg>
```

### Multi-Mode Analysis
```bash
POST http://localhost:8000/api/analyze/multi-mode
Content-Type: multipart/form-data
Body: file=<image.jpg>
```

## 📚 API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🧪 Testing

```bash
# Test with curl
curl -X POST "http://localhost:8000/api/analyze/spots" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test-image.jpg"

# Or use Python
python test_api.py
```

## 🔧 Configuration

Edit `.env` file:

```env
# API Settings
API_TITLE="Beauty AI Analysis Service"
API_VERSION="1.0.0"

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://beauty-with-ai-precision.vercel.app

# GPU (set to true if CUDA available)
USE_GPU=false
GPU_DEVICE=0

# Processing
CONFIDENCE_THRESHOLD=0.5
MAX_IMAGE_SIZE=2048
```

## 📁 Project Structure

```
ai-service/
├── api/
│   ├── core/
│   │   ├── config.py          # Configuration
│   │   └── model_loader.py    # ML model loader
│   ├── models/
│   │   ├── spot_detector.py   # Spots detection model
│   │   ├── wrinkle_detector.py
│   │   ├── texture_analyzer.py
│   │   └── pores_detector.py
│   ├── routers/
│   │   ├── spots.py           # Spots API endpoints
│   │   ├── wrinkles.py
│   │   ├── texture.py
│   │   ├── pores.py
│   │   └── multi_mode.py      # Multi-mode analysis
│   ├── schemas/
│   │   └── analysis.py        # Pydantic models
│   └── utils/
│       └── image_processing.py # Image utilities
├── ml_models/
│   └── weights/               # Model weights (.pth files)
├── main.py                    # FastAPI application
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## 🔬 How It Works

### 1. Image Processing Pipeline
```
Upload Image → Decode → Preprocess → Normalize → Model Inference → Post-process → JSON Response
```

### 2. Detection Algorithms

**Spots Detection:**
- LAB color space analysis
- Threshold dark regions (melanin)
- Morphological operations
- Contour detection
- Size and circularity filtering

**Wrinkles Detection:**
- Grayscale conversion
- Canny edge detection
- Hough line transform
- Elongation filtering

**Texture Analysis:**
- Standard deviation (smoothness)
- Laplacian variance (roughness)
- Entropy (complexity)

**Pores Detection:**
- CLAHE enhancement
- Blob detection
- Circularity filtering
- Size classification

## 🚀 Performance

- **Spots**: ~100-300ms per image
- **Wrinkles**: ~150-400ms per image
- **Texture**: ~50-150ms per image
- **Pores**: ~200-500ms per image
- **Multi-Mode**: ~500-1500ms (parallel processing)

## 🔄 Integration with Next.js

```typescript
// lib/services/ai-analysis.ts
const response = await fetch('http://localhost:8000/api/analyze/multi-mode', {
  method: 'POST',
  body: formData
})
const result = await response.json()
```

## 📝 TODO

- [ ] Add real PyTorch models (currently using CV algorithms)
- [ ] Implement UV spots detection (requires UV imaging)
- [ ] Add red areas analysis (inflammation detection)
- [ ] Implement porphyrins detection (bacteria/acne)
- [ ] Add batch processing
- [ ] Implement caching layer (Redis)
- [ ] Add rate limiting
- [ ] Deploy to Azure/AWS

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License

## 👥 Authors

Beauty with AI Precision Team
