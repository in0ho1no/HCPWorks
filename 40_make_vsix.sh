#!/bin/bash
set -e
cd ./hcpworks

# --- 作業確認 ---
check() {
    echo "$1 (y/n)"
    read answer
    if [ "$answer" != "y" ]; then
        echo "Process aborted."
        exit 1
    fi
}

check "Did you update the README if needed?"
check "Did you update the CHANGELOG?"
check "Did you update the version in package.json?"
check "Did you run 'npm install' and commit the updated package-lock.json if dependencies changed?"

# --- パッケージング ---
echo "Packaging extension..."
npm run package-ext

echo "Done."
