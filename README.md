# APS GenAI Prompt Gallery

A structured prompt library for Australian Public Service staff, designed to help you use generative AI tools more effectively and safely.

**Live site:** [public-service-prompt-gallery.netlify.app](https://public-service-prompt-gallery.netlify.app)

Note: this is very early in development and all aspects need more work. The key purpose at this stage is to demonstrate the potential of structured workflows in this domain.
---

## What is this?

Most GenAI guidance focuses on individual prompts. This library goes further: it provides **structured workflows**, multi-step sequences of prompts that produce better outputs than a single prompt can, with quality checks built in at each stage.

Three types of content:

- **Workflows:** end-to-end sequences for common APS tasks (briefing notes, QT briefs, stakeholder analysis, and more)
- **Building blocks:** reusable prompt components (role definitions, context setters, format templates) that you can combine yourself
- **Quality gates:** verification prompts that challenge outputs before you rely on them (factual checks, red-team reviews, compliance checks)

Every step carries a trust level, so you always know what to verify yourself.

---

## Who is it for?

APS staff at all levels (APS 3-4 through SES) across policy and operational domains.

The library adapts to your experience level:
- **Getting started:** simple workflows, clear copy-paste prompts, minimal complexity
- **Full workflow:** complete multi-step sequences with quality gates
- **Expert mode:** parallel analysis chains, custom role definitions, iterative verification

Works with **Claude**, **ChatGPT**, and **Microsoft Copilot (M365)**.

---

## What's available

### Workflows (5 live)

| Name | Domain | Level |
|---|---|---|
| Briefing Note | Policy Development | Intermediate |
| Question Time Brief | Policy Development | Advanced |
| Stakeholder Analysis | Stakeholder Engagement | Intermediate |
| Plain Language Rewrite | Stakeholder Engagement | Beginner |
| Meeting Preparation | General Productivity | Beginner |

### Building blocks and quality gates

A library of reusable prompt components is in development. Schema and seed data are ready; a browseable interface is coming in Phase 2.

---

## How to use it

1. Go to the live site and pick a workflow that matches your task.
2. At the top of the workflow page, choose your experience level and AI tool.
3. Read the first step, then copy its prompt into your AI tool.
4. Review the output, copy the next step's prompt, and keep going in the same conversation.

**About classification:** These workflows are designed for OFFICIAL-level work using public AI tools. Do not use public AI tools (Claude, ChatGPT, Copilot) for OFFICIAL: Sensitive or higher-classified content without checking your agency's policy first.

---

## Design principles

1. **Workflows over prompts:** multi-step sequences produce better, more accountable outputs
2. **Trust must be explicit:** every output carries a trust level; users always know what to verify
3. **Quality gates are mandatory:** not optional extras, they are the accountability layer
4. **Compliance is built in:** PGPA Act, PSPF, Privacy Act, and APS Values considerations are embedded, not bolted on
5. **Skill-adaptive:** the same workflow adapts to beginners and experts through progressive disclosure
6. **Platform-aware:** prompts adapt to Claude, ChatGPT, and Copilot
7. **Human judgement is irreplaceable:** the library amplifies officer expertise, it does not replace it
8. **Open and improvable:** prompts are in version-controlled JSON; anyone can suggest improvements

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for full details.

Two paths:
- **Non-technical:** open a GitHub Issue using one of the submission templates (no coding required)
- **Technical:** fork the repo, create or edit JSON in `data/`, open a pull request

Feedback without a GitHub account: use the feedback form on any workflow page on the live site.

---

## Roadmap

The current site is a working proof of concept with 5 workflows live. Future directions, roughly in priority order:

**Short term**
- Building blocks and quality gates browseable in the UI
- Worked example added to at least one workflow page
- README, licence, and repo description finalised for public launch

**Medium term**
- Custom instructions per workflow and AI tool, to help users configure their AI environment before starting a workflow
- More workflows: Data Summary, Compliance Review
- Search and filter by domain, task type, and APS level
- Privacy-respecting analytics (GoatCounter)

**Longer term, depending on interest**
- Agency self-hosting: deploy as an Azure Static Web Apps instance inside your agency tenant, with Entra ID authentication and Australian data residency. Agencies can extend the library with their own workflows and building blocks without affecting the shared upstream resource.
- Classification-aware mode: prompts that adapt based on the classification of information you are working with, with appropriate guardrails
- Structured contribution pipeline for community-submitted workflows

If you are interested in contributing workflows, self-hosting inside your agency, or anything else, open an issue or reach out via [LinkedIn](https://www.linkedin.com/in/deanhewson).

---

## Licence

[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Content and code are free to use, adapt, and share with attribution.

---

*This is an independent project. It is not an official Australian Government resource.*
