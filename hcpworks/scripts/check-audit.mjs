#!/usr/bin/env node

import fs from 'node:fs';

const SEVERITY_RANK = {
  info: 0,
  low: 1,
  moderate: 2,
  high: 3,
  critical: 4,
};

const auditLevel = process.env.AUDIT_LEVEL || 'high';
const threshold = SEVERITY_RANK[auditLevel] ?? SEVERITY_RANK.high;

// 上流(devDependencies の推移的依存)が対応するまで許容する advisory。
// 対応版が出たら該当行を削除して、監査が通ることを確認する。
// 何を見送ったかを差分として残すため、ここだけで管理する(環境変数からは渡さない)。
const allowlist = new Set([
  // brace-expansion の DoS。mocha -> glob -> minimatch -> brace-expansion の経路で high として伝播する。
  // @vscode/test-cli の依存チェーン上にあり、こちらでは解決できない。
  'GHSA-mh99-v99m-4gvg',
]);

const filePath = process.argv[2] || 'audit.json';
const raw = fs.readFileSync(filePath, 'utf8');
const report = JSON.parse(raw);
const vulnerabilities = report.vulnerabilities || {};

const cache = new Map();

function extractGhsa(url) {
  if (!url) return null;
  const m = url.match(/GHSA-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}/i);
  return m ? m[0] : null;
}

function isSeverityFailing(severity) {
  const rank = SEVERITY_RANK[severity] ?? 0;
  return rank >= threshold;
}

function advisoryAllowed(viaItem) {
  if (!viaItem || typeof viaItem === 'string') return false;
  const id = extractGhsa(viaItem.url);
  return Boolean(id && allowlist.has(id));
}

function isAllowedByChain(name, seen = new Set()) {
  if (cache.has(name)) return cache.get(name);

  if (seen.has(name)) {
    return true;
  }

  const vuln = vulnerabilities[name];
  if (!vuln) {
    cache.set(name, false);
    return false;
  }

  if (!isSeverityFailing(vuln.severity)) {
    cache.set(name, true);
    return true;
  }

  const nextSeen = new Set(seen);
  nextSeen.add(name);

  const via = Array.isArray(vuln.via) ? vuln.via : [];
  if (via.length === 0) {
    cache.set(name, false);
    return false;
  }

  const allowed = via.every((item) => {
    if (typeof item === 'string') {
      return isAllowedByChain(item, nextSeen);
    }
    return advisoryAllowed(item);
  });

  cache.set(name, allowed);
  return allowed;
}

const failing = [];
for (const [name, vuln] of Object.entries(vulnerabilities)) {
  if (!isSeverityFailing(vuln.severity)) {
    continue;
  }
  if (!isAllowedByChain(name)) {
    failing.push({ name, severity: vuln.severity });
  }
}

if (failing.length > 0) {
  console.error('Security audit failed: non-allowlisted vulnerabilities detected.');
  for (const item of failing) {
    console.error(`- ${item.name} (${item.severity})`);
  }
  process.exit(1);
}

const total = Object.values(vulnerabilities).filter((v) => isSeverityFailing(v.severity)).length;
if (total === 0) {
  console.log('Security audit passed: no vulnerabilities at or above threshold.');
} else {
  console.log('Security audit passed with allowlisted upstream vulnerabilities only.');
}
