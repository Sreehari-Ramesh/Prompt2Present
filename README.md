# Forma — AI Presentation Studio

A professional presentation editor with a live 16:9 slide canvas, natural-language AI creation and revisions, and editable PowerPoint export.

## Run locally

Requires Node.js 22.13 or later.

```powershell
cd slide-studio
npm install
npm run dev
```

Open http://localhost:5173. The application works in a clearly labelled offline demo mode without an API key.

## Connect OpenAI

Create an ignored `.dev.vars` file in this directory, using `.env.example` for the variable names:

```dotenv
OPENAI_API_KEY=your_project_api_key
OPENAI_MODEL=gpt-6-astra
```

Restart the development server after changing these values. For Sites hosting, set the same variables using Sites runtime configuration, mark the API key secret, and redeploy. Never add keys to frontend code, `NEXT_PUBLIC_*`, `VITE_*`, the hosting manifest, or source control. The interface reports connection status using a server health endpoint; a configured key does not by itself verify API access or billing.

The server uses the official OpenAI JavaScript SDK and Responses API with Zod Structured Outputs, server-side validation, `store: false`, bounded input/output sizes, a timeout, retry handling, refusal handling, and a basic per-instance rate limit. The default model is configurable on the server. API requests include the current deck so manual changes remain part of the context. Single-slide revisions are enforced server-side. Generation does not browse the web and is instructed not to invent statistics or citations.

Official references: [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs), [production best practices](https://developers.openai.com/api/docs/guides/production-best-practices).

## Working in the editor

- **New presentation:** describe a topic, audience, and tone; choose 3–20 slides and a theme.
- **Direct edits:** click slide text and edit it. Click outside the field to commit. Plain text is used throughout.
- **AI co-creator:** choose one slide or the whole presentation, then submit a request. Stop cancels a pending request without applying it.
- **Design:** choose among four palettes and five slide layouts. Add, duplicate, delete, and reorder slides using the toolbar.
- **Speaker notes:** expand the notes area to edit notes; they are included in the exported PowerPoint.
- **Undo/redo:** use the toolbar or Ctrl+Z / Ctrl+Shift+Z when outside a text field. Up to 40 deck states are retained in memory.
- **Present:** preview slides in the app. Use arrow keys and Escape to navigate and exit.
- **Export:** creates a `.pptx` containing editable text and shapes, with speaker notes. PowerPoint font rendering may differ slightly from the browser preview.
- **Projects:** the menu can save and open `.forma.json` files. Files are validated before loading. This app does not import arbitrary existing `.pptx` files.

The latest deck is saved in this browser’s local storage. Save a Forma project for a portable backup. Starting a new deck replaces the active deck, retaining the previous one in undo history. Chat and undo history last for the current page session. There is no multi-user collaboration or cloud deck database.

Offline templates are deliberately generic, visibly labelled examples; natural-language AI writing and revision require a configured OpenAI project key.

## Verification and deployment

```powershell
npx tsc --noEmit
npm test
npm run build
```

Built with React, TypeScript, Vinext/Vite, OpenAI, Zod, and PptxGenJS. The Sites starter integration in `vite.config.ts` and `worker/index.ts` supports private Cloudflare Workers hosting. `.openai/hosting.json` retains the Site identity. API routes rely on Sites private access control in hosted use; keep the deployment private. For a public or shared production service, add authorization, distributed per-user rate limits, budget enforcement, and durable user-owned storage before opening access. The existing rate limiter is per worker instance and is not a distributed quota.
