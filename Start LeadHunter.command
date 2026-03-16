#!/bin/bash
# Start LeadHunter Pro locally with API proxy
# Double-click this file to launch

cd "$(dirname "$0")"
echo ""
echo "  🔥 Starting LeadHunter Pro..."
echo "  Press Ctrl+C to stop"
echo ""
open "http://localhost:8080"
node server.js
