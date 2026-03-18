# Public Service Prompt Gallery

## Project Overview
Building a structured prompt library for Australian Public Service (APS) staff.
Goal: address key GenAI productivity pain points with a curated, well-structured
resource that covers both standalone prompts and multi-step workflows.

The library should be:
- A solid base set of high-quality, tested workflows (not just prompts)
- Extensible — easy to add new domains, building blocks, and quality gates
- Accessible to varied APS skill levels (APS 3-4 through SES)
- Compliant-aware (PGPA, PSPF, Privacy Act, APS Values)

Primary output: a web app deployed to Netlify with static JSON data files.
See architecture doc for JSON schemas, enums, and data model.

## Current Phase
**5 workflows live with full platform-aware UI.** Moving toward contribution-ready v1.

Live workflows: Briefing Note, QT Brief, Stakeholder Analysis, Plain Language Rewrite,
Meeting Preparation.

**UI features complete:**
- Trust indicators, skill level toggle, platform selector, progress bar, per-step limitations, Netlify feedback forms
- Platform prompt reformatter: Claude (XML intact), ChatGPT (## headers), Copilot (plain prose), Other (labelled)
- Step 0 setup card: platform-specific custom instructions, collapsible, teal styling, above workflow steps
- Per-step platform tips: base type×platform table in code + step-specific JSON additions; dark blue badge icon
- Platform transition notes between steps (non-Claude platforms)
- `custom_instructions` populated for all 5 workflows × 4 platforms

See `notes/feature-list.md` for complete current feature state.

**Next priorities:**
- Seed content — review `scripts/output/` building blocks and quality gates, move to `data/` after editing pass
- Add `platform_tips` to remaining 4 workflows (step-specific tips currently seeded for Briefing Note only)

**Done (contribution-ready v1):**
- Contribution process — CONTRIBUTING.md + `.github/ISSUE_TEMPLATE/` (workflow-submission.md, building-block-submission.md)

## Multi-Agency Architecture
The project is designed as a shared public upstream library that agencies can fork and
extend with their own private content.

**Schema additions (not yet in data files — schema docs only for now):**
- `source` field on all entities: `"upstream"` | `"agency"` — default `"upstream"` for this repo
- `status` field on all entities: `"draft"` | `"published"` | `"archived"` — default `"published"` for existing content

Do not add these fields to existing workflow JSON files yet. Add to schema docs
(`notes/aps-genai-prompt-library-architecture.md`) first. Apply to new data files going forward.

**Agency deployment path:** Azure Static Web Apps (Entra ID auth, Australian data
residency, low attack surface for read-only static site).

## Tech Stack
- **Frontend**: Astro (static site generator)
- **Data**: Static JSON files in `data/`
- **Hosting**: Netlify (auto-deploys from GitHub on push to master)
- **Notes**: Obsidian vault in `notes/`
- **Prompt templates**: `{{variable_name}}` syntax throughout

## Tooling Split
- **Claude Projects** (this project) — planning, architecture decisions, content strategy
- **Claude Code** — implementation: code, JSON data files, config, file edits
- **LM Studio** — batch content generation (building blocks, prompt drafts, seed data)

**Local LLM setup:** LM Studio running Qwen 2.5 14B Instruct (Q4_K_M) via
OpenAI-compatible API at `http://localhost:1234/v1`. Used for content generation tasks
separate from Claude Code sessions. Not used for code.

## Key Files & Structure
- `notes/aps-genai-prompt-library-research-1.md` — Research, gap analysis, trust model, skill matrix
- `notes/aps-genai-prompt-library-architecture.md` — JSON schemas, seed data, UI/UX patterns
- `notes/project-plan.md` — Planning doc, decisions log, open questions
- `notes/feature-list.md` — Complete current feature state (authoritative)
- `data/` — JSON content files
- `CLAUDE.md` — This file: project context for Claude Code sessions

## Conventions
- Commit messages: imperative, lowercase, short (e.g. `add briefing note workflow`)
- JSON data files go in `data/`, keyed to the schemas in the architecture doc
- Prompt templates use `{{variable_name}}` syntax
- Ask before adding new npm dependencies or changing the tech stack
- Don't refactor working code without being asked
- One thing at a time — small focused changes over big sweeping ones

## Astro conventions (learned in Phase 1+)
- **No TypeScript generic annotations in `.astro` frontmatter.** Astro 5 compiles
  frontmatter as TSX; generic syntax like `Record<string, string>` or `Array<string>`
  gets misread as JSX elements and causes cryptic esbuild parse errors. Use plain
  object literals and let TypeScript infer, or annotate with non-generic types only.
- **Don't use `define:vars` for complex objects.** Pass server data to client scripts
  via `<script type="application/json" id="...">` + `set:html={JSON.stringify(...)}`,
  then read it with `JSON.parse(document.getElementById(...).textContent)`.
- **Import paths from nested pages.** `data/` is at the project root. From
  `src/pages/workflows/*.astro`, that's three levels up: `'../../../data/...'`.
- **Use `:global()` for dynamically-injected CSS.** Astro scopes CSS with data
  attributes at build time. Elements inserted via `innerHTML` in JavaScript don't
  get those attributes, so scoped styles won't apply. Wrap CSS rules targeting
  JS-injected content in `:global(.classname) { ... }`. Example: step-zero body
  elements and `.tip-icon-badge` in `WorkflowLayout.astro`.

## Schema notes
- **New compliance framework value:** `apsc_performance_framework` — added for the Career & Performance domain. Represents the APSC non-SES Performance Framework (commenced January 2026). Needs to be added to the canonical enum in the architecture doc when that's next updated.
- **Paste-back placeholders:** BB-CAREER-002 and BB-CAREER-004 contain literal placeholders (`[Paste or reference the output from Step 1]` and `[Full output from Steps 1-3]`) instead of template variables. This is intentional for the current copy-paste UX. If paste-back or chaining functionality is built, add `{{activity_inventory}}` and `{{check_in_content}}` variables to these building blocks and wire them into the step output flow.
- **Career building blocks:** BB-CAREER-001 through BB-CAREER-005 were created alongside the WF-CAREER-001 workflow (one per step). The original proposal intended three reusable blocks (BB-ROLE-007, BB-CTX-CAREER-001, BB-FMT-CAREER-001) plus QG-CAREER-001. The per-step approach works but reduces cross-workflow composability. When building WF-CAREER-002+, consider whether to refactor toward the proposal's reusable block model.
