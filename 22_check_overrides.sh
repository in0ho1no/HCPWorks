#!/bin/bash
set -e
cd ./hcpworks

echo "Check overrides..."
node scripts/check-overrides.mjs

echo "Done."
