#!/bin/bash

# Clear the terminal
clear

# Run the scan script and forward all arguments
npm run scan -- "$@"

# If scan succeeds, run the analyze script
if [ $? -eq 0 ]; then
  npm run analyze -- "$@"
else
  echo "Scan failed. Skipping analysis."
  exit 1
fi
