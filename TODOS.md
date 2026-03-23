# TODOS

Deferred work captured during /plan-eng-review on 2026-03-21 (branch: feature/v1-sprint).

---

## Roadmap page content + navbar issues

**What:** Review and fix known issues with the /roadmap page and navigation bar.

Known issues to address:
- Roadmap content: priority bucketing should be reviewed — "Building blocks browser" appears as "short term" in README but "longer term" on the page (README now fixed; verify page matches intent)
- Roadmap content: descriptions of upcoming workflows need review for accuracy
- Navbar: specific issues not yet documented — note them here when discovered during next review session
- Roadmap page has no "last updated" indicator — visitors can't tell if it's current

**Why:** Deferred from v1 sprint to avoid scope creep. Should be resolved before any GovAI/AI CoLab demo or institutional handoff.

**Depends on / blocked by:** v1 sprint shipped.

---

## Post-training: analytics review

**What:** After the training session, review GoatCounter data and refine the custom event strategy.

**Why:** Real usage data will reveal which events are actually useful — per-step copy tracking, platform selector choices, privacy toggle adoption. Rushing this before training risks instrumentation that doesn't match real behaviour.

**Pros:** Data-driven decisions about what to track. Avoids over-engineering analytics before you know what questions you're trying to answer.

**Cons:** One more follow-up task after an already busy sprint.

**Context:** GoatCounter is live with pageviews + custom events (copy-prompt, platform-change) as of the v1 sprint. After training, review the dashboard and decide: are the events granular enough? Are there gaps? Is the privacy toggle being used?

**Depends on / blocked by:** Training session completion (next week).

---

## UI/UX design overhaul

**What:** A dedicated design sprint to improve the visual design, component consistency, typography hierarchy, and mobile experience.

**Why:** The current design is functional but was built incrementally. A focused design pass would lift the credibility of the site for the GovAI/AI CoLab audience and make it more polished for agency adoption.

**Pros:** Raises perceived credibility. Better mobile experience. More consistent component library.

**Cons:** Large scope. Risk of breaking working UI. Needs a clear design brief before starting.

**Context:** Explicitly deferred from v1 sprint (Approach C). The UX improvements in v1 (accordion fade, banner rewrite, home page story) are targeted fixes, not a systematic overhaul. Use /design-consultation to create a DESIGN.md first, then /design-review to execute.

**Depends on / blocked by:** v1 sprint shipped and stable. DESIGN.md created via /design-consultation.

---

## CMS / AI-assisted contribution method for non-GitHub users

**What:** A way for APS staff without GitHub experience to submit new workflows, suggest edits, or flag issues — without needing to use git or GitHub.

**Why:** The current CONTRIBUTING.md process requires GitHub familiarity. Most APS staff who would benefit from contributing don't have this. Lowering the barrier is critical for the project to grow beyond the core technical audience.

**Pros:** Opens contribution to a much wider pool. Aligns with the project's goal of being accessible to APS 3–EL2.

**Cons:** Non-trivial to build. Options range from a simple Google Form to a full form-to-PR automation or lightweight CMS layer. Needs a proper /office-hours session to scope.

**Context:** Explicitly deferred from v1 sprint. Raised by the user as a post-v1 priority. Start with an /office-hours session to define the narrowest wedge (e.g. a simple issue template or a form that emails a draft workflow to the maintainer).

**Depends on / blocked by:** v1 sprint shipped. /office-hours session to scope approach.
