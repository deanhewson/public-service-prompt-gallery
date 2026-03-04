# Project Plan — APS GenAI Prompt Library

## Goal & Success Criteria

**Goal**: A publicly accessible web app where APS staff can browse, understand, and copy structured AI prompts and multi-step workflows for common public service tasks.

**MVP done when**:
- [ ] One complete workflow (Briefing Note) is live on Netlify
- [ ] Workflow shows steps, trust indicators, skill level toggle, and copyable prompts
- [ ] Classification and platform selectors work
- [ ] JSON data file validates against the architecture schema
- [ ] At least one colleague has used it and given feedback

**v1 done when**:
- [ ] All 7 priority workflows built and live
- [ ] Building block browser works
- [ ] Search/filter by domain, APS level, complexity
- [ ] Feedback form live for non-GitHub users
- [ ] GoatCounter analytics running with privacy toggle

---

## Phases

### Phase 0 — Foundation (current)
- [x] Project directory, git, GitHub (private repo)
- [x] Research and architecture documents
- [x] Obsidian vault in `notes/`
- [x] CLAUDE.md with project context and conventions
- [x] .gitignore
- [x] README.md created (iterate as we go)
- [ ] Node.js installed
- [ ] Astro scaffolded

### Phase 1 — MVP (Briefing Note workflow)
- [ ] `data/workflows/wf-pol-001-briefing-note.json` — first data file
- [ ] Astro site reads JSON and renders workflow steps
- [x] Netlify auto-deploys from GitHub on push to master
- [ ] Trust indicators visible in UI
- [ ] Skill level toggle (beginner / intermediate / advanced)
- [ ] Copy-to-clipboard on prompt text
- [ ] Classification selector (gates content, injects warnings)
- [ ] Platform selector (adapts prompt formatting and chain advice)

### Phase 2 — Content expansion
- [ ] Remaining 6 priority workflows (QT Brief, Stakeholder Analysis, Data Summary, Meeting Prep, Compliance Review, Plain Language Rewrite)
- [ ] Building block browser
- [ ] Quality gates browseable separately

### Phase 3 — Discoverability & feedback
- [ ] Search and filter
- [ ] Feedback form (Tally.so — see below)
- [ ] GoatCounter analytics + privacy toggle
- [ ] Accessibility check
- [ ] Licence decision and README update
- [ ] Make repo public

---

## Tech Stack Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Frontend framework | Astro | Static output, good templating, real patterns, GitHub Pages compatible |
| Data storage (MVP) | Static JSON files | No backend needed, Astro reads natively, easy to edit |
| Hosting | Netlify | Free tier, deploys from private GitHub repo, auto-deploys on push |
| Deployment | Netlify CI | Triggered automatically on push to master. No GitHub Actions needed. |
| Notes | Obsidian | Vault lives in `notes/`, git-tracked |
| Prompt template syntax | `{{variable_name}}` | Defined in architecture doc, consistent throughout |
| Analytics | GoatCounter | Privacy-first (no cookies, respects DNT), free for open source, no cookie banner needed. Upgrade to GA4 later if needed. |
| Feedback (non-GitHub users) | Tally.so | Clean UX, free, embeddable. Paired with GitHub Issues for technical feedback. |

---

## Selector System Design

Two global selectors set when a user arrives, persisted in localStorage.

### Selector 1: Classification Level

> "What's the highest classification of information you'll use in this session?"

| Selection | Effect |
|---|---|
| UNCLASSIFIED | No restrictions. All tools allowed. |
| OFFICIAL *(default)* | Standard trust warnings. All public tools allowed. |
| OFFICIAL: Sensitive | Warning banner on all outputs. Compliance gate becomes required. Prompts include `{{classification_reminder}}`. Links to agency policy. |
| PROTECTED | Hard stop. Site cannot help with PROTECTED content. Links to PSPF guidance and approved tools (GovAI Chat from April 2026). |

**How it changes prompts:**
- Injects `{{classification_reminder}}` variable: e.g., "Note: Do not include OFFICIAL: Sensitive information in this prompt unless your agency has approved this tool for that purpose."
- Changes trust indicator emphasis (more prominent at Sensitive level)
- Compliance quality gate changes from recommended → required at Sensitive level

### Selector 2: AI Platform

> "Which AI tool are you using?"

| Selection | Key effects |
|---|---|
| Claude *(default)* | Keep XML tags. Mention Claude Projects for multi-session context. System prompts available. |
| Microsoft Copilot (M365) | Strip XML → plain markdown. Add "use @references to pull org files." Mention file upload capability. |
| ChatGPT | Strip XML → plain prose instructions. Note: free tier lacks persistent memory. |
| GovAI Chat | Flag as upcoming (April 2026 trial). Handles OFFICIAL: Sensitive. Minimal notes until available. |
| Other / Generic | Plain text. No platform-specific advice. |

**How it changes prompts and chains:**
- XML → markdown transform applied at render time
- Injects `{{platform_specific_tip}}` variable per step
- Chain handoff instructions change: "Start a new conversation and paste..." vs "Continue in the same conversation..."
- File/document upload advice per step (Copilot M365 only)
- Memory/context advice: Claude Projects and ChatGPT Plus persist context; others don't

**Other variables these selectors drive:**
- `{{classification_reminder}}` — injected into every prompt template
- `{{platform_specific_tip}}` — platform-specific guidance at each step
- "What to do next" chain guidance text
- Trust indicator color/prominence

*Note: Architecture doc will need updating to reflect these new system-level variables.*

---

## Content Roadmap

Priority order (from architecture doc):

1. **Briefing Note** (WF-POL-001) — highest priority, most universal APS task ← MVP
2. **Question Time Brief** — high visibility, tightly constrained format
3. **Stakeholder Analysis** — cross-domain utility
4. **Data Summary** — useful for analysts and generalists alike
5. **Meeting Prep** — quick win, high frequency task
6. **Compliance Review** — important, addresses trust concerns directly
7. **Plain Language Rewrite** — quick win, high impact for comms/accessibility

---

## Feedback & User Testing

**User testing (initial):**
- Owner + partner (first users)
- CoPilot initiative colleagues at owner's APS organisation
- Capture via feedback form + informal conversation
- No formal recruitment process needed at this stage

**Feedback mechanisms:**
- **GitHub Issues** — for contributors and technical feedback (GitHub account required)
- **Tally.so form** — for general users (no account needed, embeds cleanly in the site)
- Both linked in README and site footer

---

## Analytics

**Tool**: GoatCounter ([goatcounter.com](https://www.goatcounter.com))
- No cookies, no GDPR complexity, no cookie consent banner
- Free for open source
- Respects browser Do Not Track setting automatically
- Can have a public stats dashboard
- Simple event API for click-level tracking

**What to track:**
- Pageviews per workflow
- "Copy prompt" button clicks per step
- Platform selector choices (aggregate)
- Classification selector choices (aggregate)

**Privacy toggle:**
- Footer link: "Don't count my visits"
- Sets `aps_notrack=true` in localStorage
- Prevents GoatCounter script from loading for that user
- No server-side changes needed

**Upgrade path**: Add GA4 later if more detailed funnel analysis is needed.

---

## Governance

| Stage | Who can add content | Review process |
|---|---|---|
| Now | Owner only | Direct commit to main |
| Public (v1+) | Anyone via pull request | Owner reviews and merges |
| Later | TBD if it scales | May need additional process |

---

## Going Public

**Target**: MVP live approximately 1 week from project start (aspirational).

**Before going public:**
- [ ] Licence decision made and added to README
- [ ] No personal details in any public-facing file (README, site content)
- [ ] `notes/` folder reviewed — this is git-tracked and will be public. Consider whether project-plan.md needs scrubbing of personal context.
- [ ] Site functional on Netlify
- [ ] TODO: move to permanent custom domain (e.g. prompts.deanhewson.com.au)
- [ ] Repo description and topics set on GitHub

**Files that are public when repo goes public:**
- README.md ← designed for public
- CLAUDE.md ← contains project conventions, fine to be public
- notes/ ← contains planning docs, review before making public
- data/ ← JSON content files, intended to be public
- src/ ← Astro source code, intended to be public

---

## Doc Maintenance Convention

When adding new features or making significant decisions, flag what needs updating:

| Doc | Update when... |
|---|---|
| `README.md` | New workflows go live, new features, site URL changes, licence decided |
| `project-plan.md` | New decisions made, phases completed, open questions resolved |
| `CLAUDE.md` | Tech stack changes, new conventions, new key files |
| Architecture doc | Schema changes, new enums, new design patterns |

---

## Open Questions

- **Licence**: Decide before going public. Options: CC BY 4.0 (standard for open gov content), MIT + CC BY 4.0 (dual licence for code + content), or CC0 (public domain, maximum adoption).
- **notes/ visibility when public**: Should project-plan.md be in a separate private repo or scrubbed before going public? Currently contains internal planning context.
- **Feedback form platform**: Tally.so preferred — set up when Phase 3 begins.
- **GoatCounter public dashboard**: Decide whether to make the stats page public (nice for transparency, aligns with open government values).
- **GovAI Chat**: Monitor April 2026 trial announcement and update platform notes.

---

## Decisions Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-03-04 | Astro for frontend | Static output, Netlify compatible, good learning curve |
| 2026-03-04 | Static JSON for MVP data | No backend needed, simple to start, easy to migrate |
| 2026-03-04 | Netlify for hosting | Free tier supports private repos; GitHub Pages does not without paid plan |
| 2026-03-04 | Briefing Note as MVP workflow | Most universal APS task, already fully specified in architecture doc |
| 2026-03-04 | GoatCounter for analytics | Privacy-first, no cookie banner, free for open source, fits public service values |
| 2026-03-04 | Tally.so for feedback form | Clean UX, free, embeddable, no GitHub account required |
| 2026-03-04 | Classification selector design | Gates content and injects warnings; PROTECTED is a hard stop |
| 2026-03-04 | Platform selector design | Adapts prompt formatting and chain advice per tool |
| 2026-03-04 | Governance: owner-only now, PRs when public | Appropriate for solo early-stage project |
| 2026-03-04 | Plan for public from the start | README created now, notes/ to be reviewed before public launch |
| 2026-03-04 | Licence: TBD | Decide before public launch |

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

**Commit messages:**
- `add briefing note json data`
- `scaffold astro site`
- `add github actions deploy workflow`
- `add classification selector`

---

## Resources & References

- Architecture doc: `notes/aps-genai-prompt-library-architecture.md`
- Research doc: `notes/aps-genai-prompt-library-research-1.md`
- Astro docs: https://docs.astro.build
- Netlify + Astro: https://docs.astro.build/en/guides/deploy/netlify/
- GoatCounter: https://www.goatcounter.com
- Tally.so: https://tally.so
- APS AI Plan 2025: referenced in research doc
- PSPF Policy Advisory 001-2025: referenced in research doc
