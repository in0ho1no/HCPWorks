#!/usr/bin/env node

// package.json の overrides が今も必要かを判定する。
// 各エントリを 1 つずつ外した package.json を一時ディレクトリで解決し直し、
// 監査結果(既存の check-audit.mjs をそのまま利用)と解決バージョンの変化を比較する。
// 実プロジェクトの package.json / package-lock.json は書き換えない。

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(scriptDir, '..');

// 既定は情報提供のみ。CI の定期実行では削除できる override が残っていたら失敗させる。
const failOnRemovable = process.argv.includes('--fail-on-removable');

const pkg = JSON.parse(fs.readFileSync(path.join(projectDir, 'package.json'), 'utf8'));
const overrides = pkg.overrides || {};
const names = Object.keys(overrides);

if (names.length === 0) {
  console.log('No overrides defined in package.json. Nothing to check.');
  process.exit(0);
}

const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'check-overrides-'));
process.on('exit', () => fs.rmSync(workDir, { recursive: true, force: true }));

fs.copyFileSync(path.join(projectDir, 'package-lock.json'), path.join(workDir, 'package-lock.json'));
fs.mkdirSync(path.join(workDir, 'scripts'));
fs.copyFileSync(path.join(scriptDir, 'check-audit.mjs'), path.join(workDir, 'scripts', 'check-audit.mjs'));

function resolvedVersions() {
  const lock = JSON.parse(fs.readFileSync(path.join(workDir, 'package-lock.json'), 'utf8'));
  const found = new Map(names.map((name) => [name, new Set()]));

  for (const [location, entry] of Object.entries(lock.packages || {})) {
    if (!entry.version) continue;
    for (const name of names) {
      if (location === `node_modules/${name}` || location.endsWith(`/node_modules/${name}`)) {
        found.get(name).add(entry.version);
      }
    }
  }

  return new Map([...found].map(([name, versions]) => [name, [...versions].sort()]));
}

function evaluate(nextOverrides) {
  const nextPkg = { ...pkg };
  if (Object.keys(nextOverrides).length > 0) {
    nextPkg.overrides = nextOverrides;
  } else {
    delete nextPkg.overrides;
  }
  fs.writeFileSync(path.join(workDir, 'package.json'), JSON.stringify(nextPkg, null, 2));

  try {
    execFileSync('npm', ['install', '--package-lock-only', '--ignore-scripts', '--no-audit', '--no-fund'], {
      cwd: workDir,
      stdio: 'pipe',
    });
  } catch {
    return { resolvable: false };
  }

  let auditJson = '{}';
  try {
    auditJson = execFileSync('npm', ['audit', '--json'], { cwd: workDir, stdio: ['ignore', 'pipe', 'ignore'] }).toString();
  } catch (error) {
    // npm audit は脆弱性検出時に非 0 終了するが、JSON は stdout に出力される。
    if (error.stdout) auditJson = error.stdout.toString();
  }
  fs.writeFileSync(path.join(workDir, 'audit.json'), auditJson);

  let auditPassed = true;
  try {
    execFileSync('node', ['scripts/check-audit.mjs', 'audit.json'], { cwd: workDir, stdio: 'pipe' });
  } catch {
    auditPassed = false;
  }

  return { resolvable: true, auditPassed, versions: resolvedVersions() };
}

console.log(`Evaluating ${names.length} override(s) in ${projectDir}`);
console.log('Resolving baseline...');
const baseline = evaluate(overrides);

if (!baseline.resolvable) {
  console.error('Failed to resolve the dependency tree with the current overrides.');
  process.exit(1);
}
// 以降の判定は「override を外すと監査が落ちるか」で見るため、
// 現状で既に落ちていると全エントリが無条件に KEEP になり、判定が意味を失う。
// 誤った結果を出すより先に監査を通す必要があるので、ここで打ち切る。
if (!baseline.auditPassed) {
  console.error('The audit already fails with the current overrides, so overrides cannot be judged.');
  console.error('Fix the audit first (resolve it, or add the advisory to scripts/check-audit.mjs), then re-run.');
  process.exit(1);
}

const results = [];

for (const name of names) {
  console.log(`Resolving without "${name}"...`);
  const withoutName = { ...overrides };
  delete withoutName[name];
  const trial = evaluate(withoutName);

  const before = baseline.versions.get(name).join(', ');
  const after = trial.resolvable ? trial.versions.get(name).join(', ') : '';

  let verdict;
  let detail;
  if (!trial.resolvable) {
    verdict = 'KEEP';
    detail = 'dependency tree cannot be resolved without it';
  } else if (!trial.auditPassed) {
    verdict = 'KEEP';
    detail = 'audit fails without it';
  } else if (after === before) {
    verdict = 'REMOVE';
    detail = `no longer changes anything (${before || 'not installed'})`;
  } else {
    verdict = 'REVIEW';
    detail = `audit passes, but versions change: ${before || 'none'} -> ${after || 'none'}`;
  }

  results.push({ name, range: JSON.stringify(overrides[name]), verdict, detail });
}

console.log('');
for (const item of results) {
  console.log(`[${item.verdict}] ${item.name} (${item.range})`);
  console.log(`         ${item.detail}`);
}

const removable = results.filter((item) => item.verdict === 'REMOVE');
const review = results.filter((item) => item.verdict === 'REVIEW');
const keep = results.filter((item) => item.verdict === 'KEEP');

console.log('');
console.log(`Summary: ${keep.length} keep / ${review.length} review / ${removable.length} remove`);

// 1 件ずつの判定は「他の override があるおかげで不要」なケースを見落とすため、
// REMOVE 候補が複数あるときはまとめて外した状態でもう一度確認する。
let deletable = removable;
if (removable.length > 1) {
  console.log('');
  console.log('Verifying the removal candidates all at once...');
  const withoutAll = { ...overrides };
  for (const item of removable) delete withoutAll[item.name];
  const combined = evaluate(withoutAll);

  const stillFine =
    combined.resolvable &&
    combined.auditPassed &&
    removable.every((item) => combined.versions.get(item.name).join(', ') === baseline.versions.get(item.name).join(', '));

  if (!stillFine) {
    console.log('They are NOT removable together (each one only looks redundant while the others remain).');
    console.log('Delete them one at a time and re-run this script after each deletion.');
    deletable = [];
  }
}

if (deletable.length > 0) {
  console.log('');
  console.log('The following overrides can be deleted from package.json:');
  for (const item of deletable) {
    console.log(`- ${item.name}`);
  }
  console.log('Run "npm install" afterwards to refresh package-lock.json.');
}
if (review.length > 0) {
  console.log('');
  console.log('REVIEW entries no longer affect the audit result, but still force versions.');
  console.log('Delete them only if they were not added for compatibility reasons, and re-run the tests.');
}

reportToGitHubActions(deletable);

if (failOnRemovable && deletable.length > 0) {
  process.exitCode = 1;
}

// GitHub Actions 上では注釈と Job Summary にも出す。ローカル実行では何もしない。
function reportToGitHubActions(entries) {
  for (const item of entries) {
    console.log(`::warning title=Removable override::${item.name} (${item.range}) can be deleted from package.json.`);
  }

  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryPath) return;

  const lines = [
    '## Overrides review',
    '',
    '| Verdict | Package | Range | Detail |',
    '| --- | --- | --- | --- |',
    ...results.map((item) => `| ${item.verdict} | \`${item.name}\` | \`${item.range}\` | ${item.detail} |`),
    '',
  ];

  if (entries.length > 0) {
    lines.push('These overrides can be deleted from `package.json` (run `npm install` afterwards):', '');
    lines.push(...entries.map((item) => `- \`${item.name}\``));
  } else {
    lines.push('No override can be deleted right now.');
  }
  lines.push('');

  fs.appendFileSync(summaryPath, lines.join('\n'));
}
