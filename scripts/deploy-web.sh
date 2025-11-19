#!/bin/bash

# Deploy web build to DreamHost
# This script builds the web app and uploads it to DreamHost via SFTP

set -e

echo "🚀 Starting web deployment to DreamHost..."

# Load environment variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo "❌ Error: .env file not found"
  exit 1
fi

# Check required environment variables
if [ -z "$DREAMHOST_HOST" ] || [ -z "$DREAMHOST_USERNAME" ] || [ -z "$DREAMHOST_PASSWORD" ] || [ -z "$DREAMHOST_DIRECTORY" ]; then
  echo "❌ Error: Missing DreamHost configuration in .env"
  echo "Required: DREAMHOST_HOST, DREAMHOST_USERNAME, DREAMHOST_PASSWORD, DREAMHOST_DIRECTORY"
  exit 1
fi

# Build the web app
echo "📦 Building web app..."
npx expo export --platform web

# Check if dist folder exists
if [ ! -d "dist" ]; then
  echo "❌ Error: dist folder not found"
  exit 1
fi

echo "📤 Uploading to DreamHost via SFTP..."

# Create SFTP batch file
cat > /tmp/sftp-commands.txt << EOF
cd $DREAMHOST_DIRECTORY
put -r dist/*
bye
EOF

# Upload using SFTP with password
sshpass -p "$DREAMHOST_PASSWORD" sftp -oBatchMode=no -b /tmp/sftp-commands.txt "$DREAMHOST_USERNAME@$DREAMHOST_HOST"

# Clean up
rm /tmp/sftp-commands.txt

echo "✅ Deployment complete!"
echo "🌐 Your app should be live at: https://$DREAMHOST_DIRECTORY"
