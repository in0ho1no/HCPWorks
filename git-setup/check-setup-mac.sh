#!/bin/sh

echo "=== Git ローカル設定の確認 ==="
echo ""

check() {
  key="$1"
  expected="$2"
  value=$(git config --local --get "$key" 2>/dev/null)

  if [ -z "$value" ]; then
    echo "[未設定] $key -- setup.sh を実行してください"
    return
  fi

  if [ "$value" = "$expected" ]; then
    echo "[OK] $key = $value"
  else
    echo "[不一致] $key = $value (期待値: $expected)"
  fi
}

check_optional() {
  key="$1"
  value=$(git config --local --get "$key" 2>/dev/null)

  if [ -z "$value" ]; then
    echo "[任意] $key -- 必要な環境でのみ設定されます"
    return
  fi

  echo "[OK] $key = $value"
}

check "commit.template" "git-setup/COMMIT_TEMPLATE"
check "core.hooksPath" "git-setup/hooks"
check "fetch.prune" "true"
check "pull.ff" "only"
check "merge.ff" "false"
check "core.autocrlf" "false"
check "core.safecrlf" "warn"
check_optional "alias.windiff"

echo ""