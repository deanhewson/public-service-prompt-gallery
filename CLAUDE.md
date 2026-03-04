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

Primary output: a web app deployed to GitHub Pages with static JSON data files.
See architecture doc for JSON schemas, enums, and data model.

## Current Phase
MVP: Build one complete end-to-end workflow (Briefing Note) as proof of concept,
visible on GitHub Pages.

## Tech Stack
- **Frontend**: Astro (static site generator)
- **Data**: Static JSON files in `data/`
- **Hosting**: GitHub Pages, deployed via GitHub Actions
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
