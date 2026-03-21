# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0.0] - 2026-03-21

### Added
- Roadmap page (`/roadmap`) — live workflows, upcoming items, longer-term vision, ecosystem/agency callout
- "What's coming" nav link across all pages (desktop + mobile)
- GoatCounter analytics — pageview tracking, custom events for copy-prompt and platform-select
- Privacy toggle in footer — opt out of tracking, preference persisted in localStorage
- Yellow flash animation on "what to do next" callout when user copies a prompt
- `platform_tips` field added to all 4 remaining workflows (QT Brief, Stakeholder Analysis, Plain Language Rewrite, Meeting Preparation) — Copilot and ChatGPT tips per step
- Build smoke test (`npm test` → `astro build`) and GitHub Actions CI workflow
- `TODOS.md` — deferred sprint items (roadmap content/nav issues, analytics review, UI/UX overhaul, CMS contribution method)
- `VERSION` and `CHANGELOG.md` files (first versioned release)

### Changed
- Home page hero rewritten — clearer, more direct explanation of the library's purpose
- Status banner updated from "proof of concept" to "early release — 6 workflows live and tested"
- Agency callout added to home page — fork-ready library explanation with link to CONTRIBUTING.md
