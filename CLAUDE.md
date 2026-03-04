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
MVP: Build one complete end-to-end workflow (Briefing Note) as proof of concept,
visible on Netlify.

## Tech Stack
- **Frontend**: Astro (static site generator)
- **Data**: Static JSON files in `data/`
- **Hosting**: Netlify (auto-deploys from GitHub on push to master)
- **Notes**: Obsidian vault in `notes/`
- **Prompt templates**: `{{variable_name}}` syntax throughout

## Key Files & Structure
- `notes/aps-genai-prompt-library-research-1.md` — Research, gap analysis, trust model, skill matrix
- `notes/aps-genai-prompt-library-architecture.md` — JSON schemas, seed data, UI/UX patterns
- `notes/project-plan.md` — Planning doc, decisions log, open questions
- `data/` — JSON content files (to be created)
- `CLAUDE.md` — This file: project context for Claude Code sessions

## Conventions
- Commit messages: imperative, lowercase, short (e.g. `add briefing note workflow`)
- JSON data files go in `data/`, keyed to the schemas in the architecture doc
- Prompt templates use `{{variable_name}}` syntax
- Ask before adding new npm dependencies or changing the tech stack
- Don't refactor working code without being asked
- One thing at a time — small focused changes over big sweeping ones

## Astro conventions (learned in Phase 1)
- **No TypeScript generic annotations in `.astro` frontmatter.** Astro 5 compiles
  frontmatter as TSX; generic syntax like `Record<string, string>` or `Array<string>`
  gets misread as JSX elements and causes cryptic esbuild parse errors. Use plain
  object literals and let TypeScript infer, or annotate with non-generic types only.
- **Don't use `define:vars` for complex objects.** Pass server data to client scripts
  via `<script type="application/json" id="...">` + `set:html={JSON.stringify(...)}`,
  then read it with `JSON.parse(document.getElementById(...).textContent)`.
- **Import paths from nested pages.** `data/` is at the project root. From
  `src/pages/workflows/*.astro`, that's three levels up: `'../../../data/...'`.
