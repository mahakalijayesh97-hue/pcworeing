#!/bin/bash

echo "------------------------------------------------"
echo "Automated SMS Reminder Engine Started"
echo "Checking for scheduled messages every 60 seconds."
echo "Press [CTRL+C] to stop."
echo "------------------------------------------------"

while true; do
  # Call the internal trigger endpoint
  curl -s http://localhost:3000/api/trigger-reminders
  
  # Wait for 1 minute
  sleep 60
done
