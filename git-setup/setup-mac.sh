#!/bin/sh

echo "============================================="
echo " Git ローカル設定セットアップ"
echo "============================================="
echo ""


# ---------------------------------------------------
# 目的: コミットメッセージのテンプレートを設定する。
# 概要: git commit時にエディタへテンプレを表示するため。
# ---------------------------------------------------
git config --local commit.template git-setup/COMMIT_TEMPLATE
echo "[設定] コミットテンプレート"


# ---------------------------------------------------
# 目的: リポジトリ管理のGit hooksを有効化する。
# 概要: commit-msgなどの共通フックを全員で共有するため。
# ---------------------------------------------------
git config --local core.hooksPath git-setup/hooks
chmod +x git-setup/hooks/commit-msg 2>/dev/null || true
default_hooks_dir="$(git rev-parse --git-common-dir)/hooks"
mkdir -p "$default_hooks_dir"
cat > "$default_hooks_dir/SETUP_CREATED_core.hooksPath_changed.txt" <<'EOF'
このリポジトリでは setup により core.hooksPath を git-setup/hooks に設定しています。
標準の hooks ディレクトリ配下のフックは通常参照されません。
フックを追加・変更する場合は git-setup/hooks を編集してください。
EOF
echo "[設定] core.hooksPath"


# ---------------------------------------------------
# 目的: fetch時にリモートで削除済みのブランチをローカルからも削除する。
# 概要: ブランチの扱いで混乱が生じるのを避けるため。
# ---------------------------------------------------
git config --local fetch.prune true
echo "[設定] fetch.prune"


# ---------------------------------------------------
# 目的: pull.rebaseの設定を削除してデフォルト状態に戻す。
# 概要: pull.ff=onlyと組み合わせて、fast-forward以外のpullを抑止するため。
# ---------------------------------------------------
git config --local --unset pull.rebase
echo "[設定] pull.rebase"


# ---------------------------------------------------
# 目的: git pull時にfast-forwardのみを許可する。
# 概要: マージコミットの生成を防ぎ、履歴をシンプルに保つため。
# ---------------------------------------------------
git config --local pull.ff only
echo "[設定] pull.ff"


# ---------------------------------------------------
# 目的: git merge時にfast-forwardを行わず、必ずマージコミットを作成する。
# 概要: ブランチ単位の作業履歴を明確に残すため。
# ---------------------------------------------------
git config --local merge.ff false
echo "[設定] merge.ff"


# ---------------------------------------------------
# 目的: 改行コードを自動変換しない。
# 概要: .gitattributesにより厳密に制御しているため。
# ---------------------------------------------------
git config --local core.autocrlf false
echo "[設定] core.autocrlf"


# ---------------------------------------------------
# 目的: CRLFとLFが混じったテキストファイルのコミットに警告を出す。
# 概要: CRLFからLFへの変換でファイルが破損するリスクを抑える。
# 補足: 完全禁止は開発が止まりかねないのでtrueではなくwarnとする。
# ---------------------------------------------------
git config --local core.safecrlf warn
echo [設定] core.safecrlf


echo ""
echo "============================================="
echo " セットアップが完了しました"
echo "============================================="
