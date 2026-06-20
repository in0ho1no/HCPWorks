#!/bin/bash
set -e
cd ./hcpworks

echo "Installing dependencies..."
npm ci

echo "Running lint..."
npm run lint

echo "Done."
