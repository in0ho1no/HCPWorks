@echo off
chcp 65001 > nul

echo =============================================
echo  Git ローカル設定セットアップ
echo =============================================
echo.


rem "---------------------------------------------------"
rem "目的: コミットメッセージのテンプレートを設定する。"
rem "概要: git commit時にエディタへテンプレを表示するため。"
rem "---------------------------------------------------"
git config --local commit.template git-setup/COMMIT_TEMPLATE
echo [設定] コミットテンプレート


rem "---------------------------------------------------"
rem "目的: リポジトリ管理のGit hooksを有効化する。"
rem "概要: commit-msgなどの共通フックを全員で共有するため。"
rem "---------------------------------------------------"
git config --local core.hooksPath git-setup/hooks
for /f "delims=" %%d in ('git rev-parse --git-common-dir') do set DEFAULT_HOOKS_DIR=%%d\hooks
if not exist "%DEFAULT_HOOKS_DIR%" mkdir "%DEFAULT_HOOKS_DIR%"
powershell -NoProfile -Command "@('このリポジトリでは setup により core.hooksPath を git-setup/hooks に設定しています。','標準の hooks ディレクトリ配下のフックは通常参照されません。','フックを追加・変更する場合は git-setup/hooks を編集してください。') | Set-Content -Path '%DEFAULT_HOOKS_DIR%\SETUP_CREATED_core.hooksPath_changed.txt' -Encoding utf8"
echo [設定] core.hooksPath


rem "---------------------------------------------------"
rem "目的: fetch時にリモートで削除済みのブランチをローカルからも削除する。"
rem "概要: ブランチの扱いで混乱が生じるのを避けるため。"
rem "---------------------------------------------------"
git config --local fetch.prune true
echo [設定] fetch.prune


rem "---------------------------------------------------"
rem "目的: pull.rebaseの設定を削除してデフォルト状態に戻す。"
rem "概要: pull.ff=onlyと組み合わせて、fast-forward以外のpullを抑止するため。"
rem "---------------------------------------------------"
git config --local --unset pull.rebase
echo [設定] pull.rebase


rem "---------------------------------------------------"
rem "目的: git pull時にfast-forwardのみを許可する。"
rem "概要: マージコミットの生成を防ぎ、履歴をシンプルに保つため。"
rem "---------------------------------------------------"
git config --local pull.ff only
echo [設定] pull.ff


rem "---------------------------------------------------"
rem "目的: git merge時にfast-forwardを行わず、必ずマージコミットを作成する。"
rem "概要: ブランチ単位の作業履歴を明確に残すため。"
rem "---------------------------------------------------"
git config --local merge.ff false
echo [設定] merge.ff


rem "---------------------------------------------------"
rem "目的: 改行コードを自動変換しない。"
rem "概要: .gitattributesにより厳密に制御しているため。"
rem "---------------------------------------------------"
git config --local core.autocrlf false
echo [設定] core.autocrlf


rem "---------------------------------------------------"
rem "目的: CRLFとLFが混じったテキストファイルのコミットに警告を出す。"
rem "概要: CRLFからLFへの変換でファイルが破損するリスクを抑える。"
rem "補足: 完全禁止は開発が止まりかねないのでtrueではなくwarnとする。"
rem "---------------------------------------------------"
git config --local core.safecrlf warn
echo [設定] core.safecrlf


rem "---------------------------------------------------"
rem "目的: git windiffコマンドを使えるようにする。"
rem "概要: WinMergeによる差分比較ができるようにするため。"
rem "補足: デフォルトパスに見つからない場合はスキップする。"
rem "---------------------------------------------------"
set WINMERGE=C:\Program Files\WinMerge\WinMergeU.exe
if exist "%WINMERGE%" (
    git config --local diff.tool WinMerge
    git config --local difftool.prompt false
    git config --local difftool.WinMerge.cmd "\"C:/Program Files/WinMerge/WinMergeU.exe\" -e -r -u -x -wl -wr -dl \"a/$MERGED\" -dr \"b/$MERGED\" \"$LOCAL\" \"$REMOTE\""
    git config --local difftool.WinMerge.trustExitCode false
    git config --local alias.windiff "difftool -y -d -t WinMerge"
    echo [設定] WinMerge    ^(git windiff が使用可能です^)
) else (
    echo git windiffコマンドの設定は行いませんでした。（スキップ）
)

echo.
echo =============================================
echo  セットアップが完了しました
echo =============================================
echo.
pause
