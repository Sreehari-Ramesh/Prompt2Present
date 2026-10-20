import assert from "node:assert/strict";
import { readFile, writeFile, mkdir, mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";
import JSZip from "jszip";

// Exercise the actual TypeScript data model and exporter, then inspect OOXML.
const root = process.cwd();
await mkdir(path.join(root, ".sites-runtime"), { recursive: true });
const temp = await mkdtemp(path.join(root, ".sites-runtime", "core-check-"));
try {
  for (const name of ["deck", "export"]) {
    const source = await readFile(path.join(root, "lib", `${name}.ts`), "utf8");
    const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText.replaceAll('"./deck"', '"./deck.mjs"');
    await writeFile(path.join(temp, `${name}.mjs`), compiled);
  }
  const { seedDeck, deckSchema, demoGenerate } = await import(pathToFileURL(path.join(temp, "deck.mjs")));
  const { exportPowerPoint } = await import(pathToFileURL(path.join(temp, "export.mjs")));
  assert.equal(deckSchema.safeParse(seedDeck).success, true);
  assert.equal(deckSchema.safeParse({ ...seedDeck, slides: [] }).success, false);
  assert.equal(deckSchema.safeParse({ ...seedDeck, slides: Array(21).fill(seedDeck.slides[0]) }).success, false);
  const demo = demoGenerate("Sustainable coffee", 5, "sage");
  assert.equal(demo.slides.length, 5); assert.equal(demo.theme, "sage");
  assert.equal(new Set(demo.slides.map(s => s.id)).size, 5);
  const exported = { ...structuredClone(seedDeck), title: "Forma verification" };
  exported.slides[0].title = "An edited title & a new idea";
  exported.slides[0].notes = "Speaker notes survive export.";
  process.chdir(temp);
  await exportPowerPoint(exported);
  const zip = await JSZip.loadAsync(await readFile(path.join(temp, "Forma verification.pptx")));
  const slideFiles = Object.keys(zip.files).filter(name => /^ppt\/slides\/slide\d+\.xml$/.test(name));
  assert.equal(slideFiles.length, 8);
  assert.match(await zip.file("ppt/slides/slide1.xml").async("string"), /An edited title &amp; a new idea/);
  assert.match(await zip.file("ppt/notesSlides/notesSlide1.xml").async("string"), /Speaker notes survive export/);
  assert.match(await zip.file("ppt/slides/slide3.xml").async("string"), /Intelligent tools/);
  assert.match(await zip.file("ppt/presentation.xml").async("string"), /12192000/);
  console.log("PASS: schema bounds, demo size/IDs, 8-slide editable PPTX, modified content, speaker notes, and wide slide dimensions.");
} finally {
  process.chdir(root);
  const relative = path.relative(path.join(root, ".sites-runtime"), temp);
  if (relative && !relative.startsWith("..") && !path.isAbsolute(relative)) await rm(temp, { recursive: true, force: true });
}
