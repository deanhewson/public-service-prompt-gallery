# Project Plan — APS GenAI Prompt Library

## Goal & Success Criteria

**Goal**: A publicly accessible web app where APS staff can browse, understand, and copy structured AI prompts and multi-step workflows for common public service tasks.

**MVP done when**:
- [ ] One complete workflow (Briefing Note) is live on GitHub Pages
- [ ] Workflow shows steps, trust indicators, skill level toggle, and copyable prompts
- [ ] JSON data file validates against the architecture schema
- [ ] At least one colleague has used it and given feedback

**v1 done when**:
- [ ] All 7 priority workflows are built and live
- [ ] Building block browser works
- [ ] Search/filter by domain, APS level, complexity
- [ ] Feedback mechanism exists (even if just a GitHub issue link)

---

## Phases

### Phase 0 — Foundation (current)
- [x] Project directory, git, GitHub (private repo)
- [x] Research and architecture documents
- [x] Obsidian vault in `notes/`
- [x] CLAUDE.md with project context
- [ ] .gitignore
- [ ] Node.js installed
- [ ] Astro scaffolded

### Phase 1 — MVP (Briefing Note workflow)
- [ ] `data/workflows/wf-pol-001-briefing-note.json` — first data file
- [ ] Astro site reads JSON and renders workflow steps
- [ ] GitHub Actions deploys to GitHub Pages on push to main
- [ ] Trust indicators visible in UI
- [ ] Skill level toggle (beginner / intermediate / advanced)
- [ ] Copy-to-clipboard on prompt text

### Phase 2 — Content expansion
- [ ] Remaining 6 priority workflows (QT Brief, Stakeholder Analysis, Data Summary, Meeting Prep, Compliance Review, Plain Language Rewrite)
- [ ] Building block browser
- [ ] Quality gates browseable separately

### Phase 3 — Discoverability & feedback
- [ ] Search and filter
- [ ] Feedback mechanism
- [ ] README for public release (if going public)
- [ ] Accessibility check

---

## Tech Stack Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Frontend framework | Astro | Static output, good templating, real patterns, GitHub Pages compatible |
| Data storage (MVP) | Static JSON files | No backend needed, Astro reads natively, easy to edit |
| Hosting | GitHub Pages | Free, version-controlled, fits "keep it in GitHub" goal |
| Deployment | GitHub Actions | Automates build + deploy on push |
| Notes | Obsidian | Already in use, vault lives in `notes/` |
| Prompt template syntax | `{{variable_name}}` | Defined in architecture doc, consistent throughout |

---

## Content Roadmap

Priority order from architecture doc:

1. **Briefing Note** (WF-POL-001) — highest priority, most universal APS task
2. **Question Time Brief** — high visibility, tightly constrained format
3. **Stakeholder Analysis** — cross-domain utility
4. **Data Summary** — useful for analysts and generalists alike
5. **Meeting Prep** — quick win, high frequency task
6. **Compliance Review** — important but niche
7. **Plain Language Rewrite** — good for accessibility/comms

---

## Open Questions

- **Feedback mechanism**: GitHub Issues? A form? Email? Needs a decision before v1.
- **User testing**: Who are the first testers? How do we recruit them? How do we capture what works?
- **Classification handling**: Site only covers UNCLASSIFIED and OFFICIAL. How do we make this clear without being alarming?
- **Going public**: Repo is currently private. When/if it goes public, what review is needed?
- **Governance**: Who can add new prompts? Is there a review process?
- **Platform notes**: Architecture doc has platform-specific notes (Claude vs ChatGPT vs Copilot). Do we surface these in the UI?
- **Analytics**: Do we want to know what gets used most? Privacy implications?

---

## Decisions Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-03-04 | Astro for frontend | Static output, GitHub Pages compatible, good learning curve |
| 2026-03-04 | Static JSON for MVP data | No backend needed, simple to start, easy to migrate |
| 2026-03-04 | GitHub Pages for hosting | Free, version-controlled, fits project constraints |
| 2026-03-04 | Briefing Note as MVP workflow | Most universal APS task, already fully specified in architecture doc |

---

## Working Norms with Claude Code

**How to get the best results:**
- Start each session by checking CLAUDE.md is up to date — it's Claude's memory
- One task per request — "add the briefing note JSON file" beats "build the whole site"
- Review every diff before approving — you don't need to understand every line, but understand the shape of the change
- If something looks wrong, say so — Claude will adjust

**Branching approach:**
- `main` — always deployable, don't push broken code here
- Feature branches for new workflows or UI changes (e.g. `add-qt-brief-workflow`)
- Merge to main when working and tested

**Commit messages to use:**
- `add briefing note json data`
- `scaffold astro site`
- `add github actions deploy workflow`
- `add skill level toggle to workflow view`

---

## Resources & References

- Architecture doc: `notes/aps-genai-prompt-library-architecture.md`
- Research doc: `notes/aps-genai-prompt-library-research-1.md`
- Astro docs: https://docs.astro.build
- GitHub Pages + Astro: https://docs.astro.build/en/guides/deploy/github/
- APS AI Plan 2025: referenced in research doc
