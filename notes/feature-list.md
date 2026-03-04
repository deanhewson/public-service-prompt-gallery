# Feature List — APS GenAI Prompt Gallery

Current state as of March 2026. Live at public-service-prompt-gallery.netlify.app

---

## Site-wide

- [x] PoC/early-release banner on every page (alert pink #F5EEF3 / #C19AB7, links to LinkedIn)
- [x] Navigation header on every page — logo + grouped dropdown (Policy Development / Stakeholder Engagement / General Productivity)
- [x] Active nav group highlighted when on a workflow in that group
- [x] Consistent dark header colour (#170a1c) across all pages
- [x] Responsive layout (nav groups hidden on mobile <680px)
- [x] No login, no accounts, no data stored anywhere

---

## Home page (index.astro)

- [x] Hero section — "Test and refine, not ask and hope" headline
- [x] Clear explanation of the differentiator (process, not just prompts)
- [x] Security reminder — OFFICIAL only, not OFFICIAL: Sensitive
- [x] Methodology section — visual flow diagram (Research → Draft → Verify → Red-Team → Revise → Submit)
- [x] Four methodology point cards explaining the approach
- [x] Workflow cards for all 5 workflows — linked, no "coming soon" items
- [x] Workflow cards show: steps, complexity, estimated time
- [x] "New" badge on recently added workflows
- [x] Section headers: Policy Development / Stakeholder Engagement / General Productivity
- [x] Footer with attribution and LinkedIn link
- [ ] Search / filter by domain, complexity, time (deferred to Phase 3)
- [ ] GoatCounter analytics (deferred to Phase 3)

---

## Workflow pages (all 5)

### Layout / chrome
- [x] Shared WorkflowLayout.astro — single source of truth for all workflow pages
- [x] Workflow title and description in header
- [x] Domain badge (Policy Development / Stakeholder Engagement / General Productivity)
- [x] Complexity badge (Beginner / Intermediate / Advanced)
- [x] Estimated time badge
- [x] No compliance framework tags (PGPA ACT, PSPF etc. removed from UI)
- [x] No classification tags (OFFICIAL removed from UI)

### Selectors
- [x] Experience level selector — Getting started / Full workflow / Expert mode
- [x] AI platform selector — Claude / ChatGPT / Copilot / Other
- [x] Both selections persist in localStorage across page loads
- [x] Skill level note shown below selectors (guidance for selected level)

### Platform behaviour
- [x] Claude: prompts shown with XML tags intact
- [x] ChatGPT / Copilot / Other: XML wrapper tags stripped at render time, content preserved
- [x] Platform preference saved to localStorage

### Progress bar
- [x] Sticky horizontal progress bar below selectors
- [x] Numbered dots for each step
- [x] States: pending (grey) / active (blue) / done (green with ✓)
- [x] Copying a step's prompt marks it as done and activates the next step
- [x] Step dots hidden when steps are hidden by skill level filter
- [x] Progress resets when skill level changes

### Customise prompts (inputs)
- [x] Collapsible "Customise prompts" accordion — starts CLOSED
- [x] Labelled as optional with clear hint: "Nothing is saved or sent anywhere"
- [x] Inputs grid — text inputs and textarea for long text
- [x] Variable substitution — filling inputs updates all prompts in real time
- [x] Unfilled variables highlighted in yellow in the prompt text
- [x] Default values pre-filled where defined in workflow JSON

### Steps / accordion
- [x] Steps listed in order with numbered circles
- [x] Quality gate steps use purple styling and ◈ icon
- [x] First step opens automatically on page load
- [x] Clicking a step opens it and closes all others (one open at a time)
- [x] Step header shows: name, description, trust badge, optional badge
- [x] Skill level filter hides/shows steps (beginner mode skips optional/advanced steps)
- [x] Optional steps shown with dashed border and reduced opacity

### Prompt box (inside each step)
- [x] Prompt shown in monospace code-style box
- [x] Variable substitution applied — filled values replace {{placeholders}}
- [x] Copy prompt button — copies plain text to clipboard
- [x] Copy button shows "Copied!" confirmation for 2 seconds
- [x] Platform transform applied to copied text (XML stripped for non-Claude)

### Trust indicators
- [x] Trust explainer banner at top of each step body
- [x] Colour-coded: green (high), amber (medium), red (low), purple (quality gate)
- [x] Trust message explains what to verify / how to use the output
- [x] "Before you move on" callout after each step's prompt

### Feedback
- [x] "Feedback on this step →" link in each step — pre-fills step context in form
- [x] Netlify feedback form at bottom of each workflow page
- [x] Form captures: workflow name, step context (from link), rating, open text
- [x] Honeypot anti-spam field included
- [x] Form submits to Netlify — no backend needed

### Limitations
- [x] "Known limitations of this step" in each step — always expanded (not collapsible)
- [x] Workflow-level limitations notice at top of page, above selectors — styled in alert colour

---

## Workflows live

| Workflow | ID | Steps | Domain | Complexity |
|---|---|---|---|---|
| Briefing Note | WF-POL-001 | 7 | Policy Development | Intermediate |
| Question Time Brief | WF-POL-002 | 5 | Policy Development | Advanced |
| Stakeholder Analysis | WF-ENG-001 | 4 | Stakeholder Engagement | Intermediate |
| Plain Language Rewrite | WF-ENG-002 | 3 | Stakeholder Engagement | Beginner |
| Meeting Preparation | WF-GEN-001 | 4 | General Productivity | Beginner |

---

## Data / prompts

- [x] All prompt templates use in-conversation step chaining (no paste-back of previous output)
- [x] Steps 2+ reference prior responses naturally ("continuing from the analysis we've just developed...")
- [x] External docs guidance in relevant steps — specifies publicly available docs only, not OFFICIAL: Sensitive
- [x] Quality gates reused across workflows (QG-TRUST-001, QG-CHALLENGE-001, QG-COMPLIANCE-001)
- [x] Skill adaptations (beginner / intermediate / advanced notes) in all building blocks
- [x] Known limitations in all building blocks and workflows
- [x] User action after each step in all workflow step definitions
- [x] Trust levels assigned to all steps

---

## Things NOT yet built (deferred)

### UI overhaul (post-feedback)
- [ ] Auto-open/close steps as user progresses through workflow
- [ ] Trust indicators rolled into prompt content variation (not just display)
- [ ] Classification selector (OFFICIAL / OFFICIAL: Sensitive / PROTECTED hard stop)
- [ ] Platform-specific tips per step (beyond XML strip — file upload, memory/context advice)
- [ ] Mobile/tablet layout pass
- [ ] Full visual design pass

### Phase 2 — Content
- [ ] Data Summary workflow
- [ ] Compliance Review workflow
- [ ] Building block browser (browse blocks independently)
- [ ] Quality gates browseable separately

### Phase 3 — Discoverability
- [ ] Search and filter by domain, complexity, time
- [ ] GoatCounter analytics + privacy toggle
- [ ] Accessibility review
- [ ] Licence decision (CC BY 4.0 recommended)
- [ ] Make repo public
- [ ] Custom domain

---

## Known issues / watch list

- Windows EBUSY error on build is harmless — Astro tries to clean a temp dir still held open; all 6 pages generate correctly
- Prompt length — some steps have long prompts. Watch feedback for signs users find them overwhelming before trimming.
- Nav groups hidden on mobile (<680px) — no mobile nav yet. Fine for now.
- Netlify feedback form only works when deployed — does nothing in local dev.
