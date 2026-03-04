# APS GenAI Prompt Library

> A structured prompt library for Australian Public Service staff — helping you use generative AI tools more effectively and safely.

---

## What is this?

Most GenAI guidance focuses on individual prompts. This library goes further: it provides **structured workflows** — multi-step sequences of prompts that produce better outputs than a single prompt can, with built-in quality checks at each stage.

Key concepts:

- **Workflows** — end-to-end sequences for common APS tasks (briefing notes, QT briefs, stakeholder analysis, and more)
- **Building blocks** — reusable prompt components (role definitions, context setters, format templates) that you can combine yourself
- **Quality gates** — verification prompts that challenge outputs before you rely on them (factual checks, red-team reviews, compliance checks)
- **Trust levels** — every step tells you how much to rely on the output and what you should verify yourself

---

## Who is it for?

APS staff at all levels — APS 3-4 through SES — across all policy and operational domains.

The library adapts to your experience level:
- **Getting started** — simple workflows, clear copy-paste prompts, minimal complexity
- **Full workflow** — complete multi-step sequences with quality gates
- **Expert mode** — parallel analysis chains, custom role definitions, iterative verification

Works with **Claude**, **ChatGPT**, **Microsoft Copilot (M365)**, and **GovAI Chat** (coming April 2026).

---

## How to use it

> **Live site**: *Coming soon — deploying to GitHub Pages*

1. **Set your context** — choose your AI tool and the highest information classification you'll be working with
2. **Browse or search** — find a workflow by domain, task type, or APS level
3. **Follow the steps** — each step gives you a ready-to-use prompt with your details filled in
4. **Review and verify** — quality gates prompt you to check AI outputs before relying on them

**Important**: This library covers **UNCLASSIFIED** and **OFFICIAL** information only. Do not use public GenAI tools (Claude, ChatGPT, Copilot) for OFFICIAL: Sensitive or PROTECTED content without checking your agency's specific policy.

---

## What's available

### Workflows

| Name | Domain | Level | Status |
|---|---|---|---|
| Briefing Note | Policy Development | Intermediate | In development |
| Question Time Brief | Policy Development | Advanced | Coming soon |
| Stakeholder Analysis | Stakeholder Engagement | Intermediate | Coming soon |
| Data Summary & Insights | Data Analysis | Intermediate | Coming soon |
| Meeting Preparation | General Productivity | Beginner | Coming soon |
| Compliance Review | Compliance & Governance | Intermediate | Coming soon |
| Plain Language Rewrite | Stakeholder Engagement | Beginner | Coming soon |

### Building blocks and quality gates

A library of reusable prompt components — coming with v1.

---

## Design principles

This library is built on eight principles:

1. **Workflows over prompts** — multi-step sequences produce better, more accountable outputs
2. **Trust must be explicit** — every output carries a trust level; users always know what to verify
3. **Quality gates are mandatory** — not optional extras; they are the accountability layer
4. **Compliance is built in** — PGPA, PSPF, Privacy Act, and APS Values considerations are embedded, not bolted on
5. **Skill-adaptive** — the same workflow adapts to beginners and experts; progressive disclosure, not dumbing down
6. **Platform-aware** — prompts adapt to Claude, ChatGPT, Copilot, and GovAI Chat
7. **Human judgement is irreplaceable** — the library amplifies officer expertise; it does not replace it
8. **Open and improvable** — prompts are in version-controlled JSON; anyone can suggest improvements

---

## Contributing

This project is currently in early development. Once public:

- **Bugs or issues**: [Open a GitHub Issue](../../issues)
- **Suggest a workflow or improvement**: Open an issue with the `enhancement` label
- **Submit a prompt or workflow**: Fork the repo, make your changes, and open a pull request

**Feedback** (no GitHub account needed): *Feedback form coming soon*

---

## Licence

Licence to be decided before public launch. Options under consideration include Creative Commons Attribution (CC BY 4.0) for prompts and content, and MIT for site code.

---

## Acknowledgements

Built to address a gap identified in the APS AI landscape: no resource combines domain-specific prompt workflows + quality gates + compliance awareness + skill-level adaptation for Australian public servants.

References and frameworks:
- APS AI Plan 2025
- PSPF Policy Advisory 001-2025 (Protective Security Policy Framework)
- Public Governance, Performance and Accountability Act 2013 (PGPA Act)
- Anthropic prompt engineering resources

Built with [Astro](https://astro.build). Hosted on [GitHub Pages](https://pages.github.com).

---

*This is an independent project. It is not an official Australian Government resource.*
