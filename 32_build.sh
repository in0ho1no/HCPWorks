#!/bin/bash
set -e
cd ./hcpworks

echo "Only perform the production build..."
npm run vscode:prepublish

echo "Done."
