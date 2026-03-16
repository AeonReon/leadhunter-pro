#!/bin/bash
# Start LeadHunter Pro locally with a simple web server
# Double-click this file to launch

cd "$(dirname "$0")"
echo "Starting LeadHunter Pro on http://localhost:8080"
echo "Press Ctrl+C to stop the server"
echo ""
open "http://localhost:8080"
python3 -m http.server 8080
