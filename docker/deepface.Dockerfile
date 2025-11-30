# DeepFace API Docker Image
# =========================
# Build: docker build -t deepface-api -f docker/deepface.Dockerfile .
# Run: docker run -p 5000:5000 deepface-api

FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgl1-mesa-glx \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for caching
COPY python/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY python/deepface_api.py .

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Run server
CMD ["uvicorn", "deepface_api:app", "--host", "0.0.0.0", "--port", "5000"]
