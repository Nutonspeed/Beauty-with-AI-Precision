# Beauty AI DeepFace Service

Advanced facial analysis service powered by DeepFace AI for Beauty with AI Precision platform.

## Features

- **Face Detection & Analysis**: Age, gender, race, emotion detection
- **Skin Quality Analysis**: Texture, tone, smoothness metrics
- **Beauty Metrics**: Comprehensive beauty scoring system
- **Face Comparison**: Similarity matching between faces
- **Batch Processing**: Analyze multiple images simultaneously
- **Caching**: Redis-based caching for improved performance
- **Docker Support**: Containerized deployment

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Python 3.9+ (for local development)

### Installation

1. Clone and navigate to the service directory:
```bash
cd ai-service/deepface
```

2. Start the service:
```bash
./start.sh
```

Or manually:
```bash
docker-compose up -d
```

### API Documentation

Once running, visit:
- **API Endpoint**: http://localhost:8001
- **Interactive Docs**: http://localhost:8001/docs
- **Health Check**: http://localhost:8001/health

## API Endpoints

### POST /analyze
Analyze a single face image.

**Request:**
```bash
curl -X POST "http://localhost:8001/analyze" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@face_image.jpg"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "face_detected": true,
    "confidence": 0.95,
    "age": 28,
    "gender": "Woman",
    "race": "asian",
    "emotion": "happy",
    "face_coordinates": {...},
    "skin_analysis": {
      "texture_score": 45.2,
      "smoothness": 0.78,
      "brightness": 0.65
    },
    "beauty_metrics": {
      "age_score": 0.9,
      "symmetry_score": 0.87,
      "overall_score": 0.82
    },
    "processing_time": 0.234
  }
}
```

### POST /analyze-batch
Analyze multiple face images (max 10 files).

### POST /compare-faces
Compare two face images for similarity.

## Configuration

Environment variables in `.env`:

- `DEEPFACE_MODEL_PATH`: Path to model files
- `REDIS_URL`: Redis connection URL
- `API_WORKERS`: Number of worker processes
- `MAX_IMAGE_SIZE`: Maximum image size in bytes

## Testing

Run the test suite:
```bash
cd tests
python -m pytest test_api.py -v
```

## Performance

- **Processing Time**: ~200ms per image
- **Concurrent Requests**: Up to 4 simultaneous
- **Cache TTL**: 1 hour for repeated analyses
- **Memory Usage**: ~2GB with models loaded

## Monitoring

- Health checks at /health
- Logs stored in ./logs/
- Redis metrics available via Redis CLI

## Security

- Input validation for file types and sizes
- CORS configuration
- Optional API key authentication
- Rate limiting capabilities

## Integration with Main App

The service integrates with the main Next.js application via HTTP API calls. Update your environment variables:

```bash
DEEPFACE_API_URL=http://localhost:8001
DEEPFACE_API_TIMEOUT=30000
```

## Troubleshooting

### Common Issues

1. **Service won't start**: Check Docker is running
2. **Model download fails**: Ensure internet connection for first run
3. **High memory usage**: Reduce API_WORKERS in config
4. **Slow processing**: Enable Redis caching

### Logs

View service logs:
```bash
docker-compose logs -f deepface-api
```

## License

This service is part of Beauty with AI Precision platform.
