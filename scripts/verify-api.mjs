import assert from "node:assert/strict";
import { readFile, writeFile, mkdir, mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const root = process.cwd(); const runtime = path.join(root, ".sites-runtime");
await mkdir(runtime, { recursive: true });
const temp = await mkdtemp(path.join(runtime, "api-check-"));
const originalKey = process.env.OPENAI_API_KEY;
const compile = source => ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
try {
  await writeFile(path.join(temp, "deck.mjs"), compile(await readFile(path.join(root, "lib/deck.ts"), "utf8")));
  const source = compile(await readFile(path.join(root, "app/api/deck/route.ts"), "utf8")).replace('from "openai"', 'from "./mock-openai.mjs"').replace('from "@/lib/deck"', 'from "./deck.mjs"');
  await writeFile(path.join(temp, "route.mjs"), source);
  await writeFile(path.join(temp, "mock-openai.mjs"), `
export const state = { result: null, error: null, request: null };
class APIError extends Error { constructor(status) { super('Upstream error'); this.status = status; } }
export default class OpenAI { static APIError = APIError; responses = { parse: async input => { state.request = input; if (state.error) throw new APIError(state.error); return state.result; } }; }
`);
  const { seedDeck } = await import(pathToFileURL(path.join(temp, "deck.mjs")));
  const { state } = await import(pathToFileURL(path.join(temp, "mock-openai.mjs")));
  const { POST } = await import(pathToFileURL(path.join(temp, "route.mjs")));
  let identity = 0;
  const payload = { prompt: "Make the opening more concise.", operation: "revise", deck: seedDeck, selectedSlideId: seedDeck.slides[0].id, scope: "slide", slideCount: 8 };
  const request = (body = payload, extra = {}) => new Request("http://localhost/api/deck", { method: "POST", headers: { "content-type": "application/json", "oai-authenticated-user-id": `test-${identity++}`, ...extra }, body: typeof body === "string" ? body : JSON.stringify(body) });
  delete process.env.OPENAI_API_KEY;
  assert.equal((await POST(request())).status, 503);
  assert.equal((await POST(request(payload, { origin: "https://untrusted.example" }))).status, 403);
  process.env.OPENAI_API_KEY = "test-only-placeholder";
  assert.equal((await POST(request({ ...payload, prompt: "" }))).status, 400);
  assert.equal((await POST(request("x".repeat(180001)))).status, 413);
  assert.equal((await POST(request({ ...payload, selectedSlideId: "missing" }))).status, 400);
  const changed = structuredClone(seedDeck); changed.title = "Should not change"; changed.theme = "sage"; changed.slides[0].title = "A clearer opening."; changed.slides[1].title = "Must stay untouched";
  state.result = { status: "completed", output_parsed: { message: "Updated the opening.", deck: changed } };
  const response = await POST(request()); assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.deck.title, seedDeck.title); assert.equal(result.deck.theme, seedDeck.theme);
  assert.equal(result.deck.slides[0].title, "A clearer opening.");
  assert.deepEqual(result.deck.slides.slice(1), seedDeck.slides.slice(1));
  assert.equal(state.request.store, false); assert.equal(state.request.text.format.type, "json_schema");
  state.result = { status: "incomplete", output: [] }; assert.equal((await POST(request())).status, 422);
  state.result = { status: "completed", output: [{ type: "message", content: [{ type: "refusal", refusal: "Unable to create this content." }] }] };
  assert.equal((await POST(request())).status, 422);
  state.error = 401; const failed = await POST(request()); assert.equal(failed.status, 502); assert.ok(!(await failed.text()).includes("test-only-placeholder"));
  state.error = null;
  state.result = { status: "completed", output_parsed: { message: "Done.", deck: seedDeck } };
  assert.equal((await POST(request({ ...payload, operation: "generate", slideCount: 5 }))).status, 422);
  console.log("PASS: missing-key, origin, request-size and schema guards; enforced slide-only edits; structured output/privacy config; incomplete/refused/auth-error responses; generated slide count. SDK is mocked; no live API call was made.");
} finally {
  if (originalKey === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = originalKey;
  const relative = path.relative(runtime, temp);
  if (relative && !relative.startsWith("..") && !path.isAbsolute(relative)) await rm(temp, { recursive: true, force: true });
}
