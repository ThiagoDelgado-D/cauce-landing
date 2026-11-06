import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const assetsDir = 'dist/_astro';
const budgets = JSON.parse(readFileSync(new URL('./budgets.json', import.meta.url), 'utf8'));
const rules = budgets.files.map((rule) => ({
  name: rule.name,
  maxGzipKb: rule.maxGzipKb,
  regex: new RegExp(rule.pattern),
}));

const budgetFor = (file) => {
  const rule = rules.find(({ regex }) => regex.test(file));
  if (rule) return { name: rule.name, maxGzipKb: rule.maxGzipKb };
  if (file.endsWith('.js')) return { name: 'Other script', maxGzipKb: budgets.otherScriptMaxGzipKb };
  return null;
};

const kb = (bytes) => bytes / 1024;
let failed = false;

for (const file of readdirSync(assetsDir).sort()) {
  const budget = budgetFor(file);
  if (!budget) continue;

  const gzipKb = kb(gzipSync(readFileSync(join(assetsDir, file)), { level: 9 }).length);
  const over = gzipKb > budget.maxGzipKb;
  if (over) failed = true;

  const status = over ? 'OVER' : 'ok';
  console.log(
    `${status.padEnd(4)}  ${gzipKb.toFixed(1).padStart(6)} / ${budget.maxGzipKb} KB  ${budget.name}  (${file})`,
  );
}

if (failed) {
  console.error(
    '\nA file is over its gzip budget. Shrink it, or raise its budget in scripts/budgets.json with the reason in the commit.',
  );
  process.exit(1);
}
