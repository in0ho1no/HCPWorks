@echo off
echo === Git ローカル設定の確認 ===
echo.

call :check "commit.template" "git-setup/COMMIT_TEMPLATE"
call :check "core.hooksPath" "git-setup/hooks"
call :check "fetch.prune" "true"
call :check "pull.ff" "only"
call :check "merge.ff" "false"
call :check "core.autocrlf" "false"
call :check "core.safecrlf" "warn"
call :check_optional "alias.windiff"
echo.
pause
exit /b

:check
set key=%~1
set expected=%~2
for /f "delims=" %%v in ('git config --local %key% 2^>nul') do (
  if /i "%%v"=="%expected%" (
    echo [OK] %key% = %%v
  ) else (
    echo [不一致] %key% = %%v ^(期待値: %expected%^)
  )
  exit /b
)
echo [未設定] %key% -- setup.bat を実行してください
exit /b

:check_optional
set key=%~1
for /f "delims=" %%v in ('git config --local %key% 2^>nul') do (
  echo [OK] %key% = %%v
  exit /b
)
echo [任意] %key% -- 必要な環境でのみ設定されます
exit /b
