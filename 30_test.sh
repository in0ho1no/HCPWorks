#!/bin/bash
set -e
cd ./hcpworks

echo "Running unit tests..."
npm run test:unit

echo "Done."
