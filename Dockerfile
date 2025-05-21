FROM python:3.11-slim

# Install system dependencies for chromium (needed for PDF generation)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        chromium \
        && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

EXPOSE 80

CMD ["python", "manage.py", "runserver", "0.0.0.0:80"]
