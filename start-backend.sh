#!/bin/bash
# Get the local IP address
IP=$(hostname -I | awk '{print $1}')

echo "------------------------------------------------"
echo "Starting Next.js Backend on $IP"
echo "Make sure your phone is on the SAME WiFi network."
echo "------------------------------------------------"

# Run Next.js with host binding
npx next dev -H 0.0.0.0
