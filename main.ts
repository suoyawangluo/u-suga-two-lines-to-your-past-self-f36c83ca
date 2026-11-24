// Two Lines to Your Past Self — make.fun entry
// Writes exactly two lines to /output/entry.txt (MAKEFUN_OUTPUT_DIR or ./output).
// Line 1 warns the past self about one specific moment; line 2 says why it
// mattered and what changed because of it. Gate: 1-280 UTF-8 characters,
// not only whitespace, exactly two lines.

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LINES = [
  "Don't send the 2 a.m. email where you quit your job over a typo in the subject line.",
  "You would have spent three years apologizing for a resignation you never meant, instead of the one afternoon it took to write 'ignore that, I was tired'.",
];

function checkGate(text: string): void {
  // Gate from the kit's RULES.txt: /output/entry.txt is UTF-8 text of 1 to 280
  // characters, not only white space; the brief requires exactly two lines,
  // line one one sentence warning the past self, line two one sentence on why
  // it mattered.
  const trimmed = text.trim();
  if (trimmed.length === 0) throw new Error("gate: entry is only whitespace");
  const codePoints = [...trimmed].length;
  if (codePoints < 1 || codePoints > 280) {
    throw new Error(`gate: ${codePoints} code points, must be 1-280`);
  }
  const lines = trimmed.split("\n");
  if (lines.length !== 2) throw new Error(`gate: ${lines.length} lines, must be exactly 2`);
  for (const line of lines) {
    if (line.trim().length === 0) throw new Error("gate: a line is blank");
  }
  // Each line is a single sentence: exactly one sentence-ending mark at the end
  // (abbreviations like "a.m." / "p.m." carry periods that are not sentence ends).
  for (const line of lines) {
    const stripped = line.replace(/\b[ap]\.m\./gi, "");
    const ends = (stripped.match(/[.!?]/g) ?? []).length;
    if (ends !== 1 || !/[.!?]$/.test(line)) {
      throw new Error(`gate: line is not a single sentence: ${JSON.stringify(line)}`);
    }
  }
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? join(process.cwd(), "output");
mkdirSync(outDir, { recursive: true });
const text = LINES.join("\n") + "\n";
checkGate(text);
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, text, "utf8");

// Read the file back and verify byte-for-byte what was written.
const readBack = readFileSync(outPath, "utf8");
if (readBack !== text) throw new Error("read-back mismatch: file differs from entry text");
checkGate(readBack);

const codePoints = [...text.trimEnd()].length;
const sha256 = createHash("sha256").update(text, "utf8").digest("hex");
console.log(`wrote ${outPath} (${codePoints} code points, sha256 ${sha256}), verified: ${JSON.stringify(text.trimEnd())}`);
