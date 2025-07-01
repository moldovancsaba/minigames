#!/bin/bash

# Get user info
echo "Getting user info..."
USER_INFO=$(curl -s http://localhost:3000/api/test-user)
echo "User info response: $USER_INFO"

# Extract user ID using grep and sed
USER_ID=$(echo $USER_INFO | grep -o '"_id":"[^"]*"' | sed 's/"_id":"\([^"]*\)"/\1/')
echo "Extracted user ID: $USER_ID"

if [ -z "$USER_ID" ]; then
  echo "Failed to get user ID. Make sure you're logged in as admin@example.com"
  exit 1
fi

# Create test organization
echo "Creating test organization..."
curl -X POST http://localhost:3000/api/test-org \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test Organization\",
    \"slug\": \"test-org-$(date +%s)\",
    \"userId\": \"$USER_ID\"
  }"
