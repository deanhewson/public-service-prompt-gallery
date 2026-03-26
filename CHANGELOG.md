# Changelog

All notable changes to this project will be documented in this file.

## [0.1.2.0] - 2026-03-26

### Fixed
- Briefing note Step 1 (Scope & Research) now includes `{{length}}` so the target page length is visible in the prompt
- Briefing note Steps 1 and 2 now include the `{{key_documents}}` reference block — always shown as a nudge even when empty
- `{{key_documents}}` conditional removed from all three drafting steps so users see the placeholder and are prompted to add references after copying

### Changed
- Site title renamed from "APS GenAI Prompt Gallery" to "APS Prompt Gallery" across all pages

## [0.1.1.0] - 2026-03-25

### Added
- Monthly Performance Check-in workflow (WF-CAREER-001) marked as `tested` maturity with updated maturity note
- `key_documents` description field propagated to all building blocks
- AI use policy `known_limitations` propagated to all 6 workflows

### Changed
- Briefing note workflow (WF-POL-001) iterated toward tested status — steps tightened and improved
- Roadmap page updated with live workflow sections and contribute links in mobile menu
- Em dashes standardised to en dashes throughout all user-visible content (data/, src/)
- Abbreviations standardised: `e.g.` → `eg`, `i.e.` → `ie` throughout all user-visible content
- `.gitignore` updated with workflow iteration log and logo working files

## [0.1.0.0] - 2026-03-21

### Added
- You can now see what's coming: a `/roadmap` page lists live workflows, upcoming items, and longer-term vision — linked from the "What's coming" nav link and the status banner
- GoatCounter analytics now tracks site visits and workflow usage (copy-prompt and platform-select events), with a privacy toggle in the footer to opt out
- Copying a prompt now flashes the "what to do next" callout yellow — a small UX nudge to read the next action before moving on
- Platform tips (Copilot and ChatGPT) added for every step in QT Brief, Stakeholder Analysis, Plain Language Rewrite, and Meeting Preparation — all 5 core workflows now have step-specific platform guidance
- Build CI: GitHub Actions now runs `astro build` on every push and PR

### Changed
- Home page hero rewritten to focus on the actual hard problem: using AI consistently for complex work, not just simple tasks
- Status banner updated from "proof of concept" to "early release — 6 workflows live and tested"
- Agency callout added to home page — describes the fork-ready library model and links to CONTRIBUTING.md
