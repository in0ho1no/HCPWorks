#!/bin/bash
cd ../hcpworks

# CHANGELOG の更新確認
echo "Did you update the CHANGELOG? (y/n)"
read answer

# ユーザーの入力に応じて処理を続行または中断
if [ "$answer" == "n" ]; then
    echo "Process aborted."
    exit 1
fi

# パッケージングする
npx vsce package
npm run prepare-readme
npm run prepare-readme-ja
