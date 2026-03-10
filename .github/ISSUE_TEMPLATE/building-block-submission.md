---
name: Submit a building block or quality gate
about: Suggest a reusable prompt component for the library. A building block is a single prompt designed to do one thing well. A quality gate is a verification or challenge prompt. No technical knowledge required.
title: "[BLOCK] Your building block name here"
labels: block-submission
assignees: ''
---

# Building block submission

A **building block** is a single reusable prompt that does one specific thing — sets up a role, generates a particular output, or reformats content.

A **quality gate** is a special type of building block designed to verify, challenge, or stress-test a previous output (e.g. "check this draft for factual errors", "argue against this recommendation").

Fill in the sections below as best you can.

---

## Name

*A short, descriptive name for this block. (e.g. "Grant Assessment Criteria Extractor", "Plain Language Checker", "Program Logic Reviewer")*

---

## Type

*What kind of block is this? Pick the closest:*

- [ ] **Role definition** — sets up the AI's persona and expertise (e.g. "Act as an EL1 program officer with grants experience")
- [ ] **Context setter** — establishes background information and framing before the main task
- [ ] **Generation** — produces substantive content (a draft, an analysis, a list, a structure)
- [ ] **Format template** — defines the structure or format the output should follow
- [ ] **Refinement** — revises or improves existing content based on specific criteria
- [ ] **Quality gate (factual accuracy)** — extracts and verifies claims in a draft
- [ ] **Quality gate (red-team challenge)** — argues against or stress-tests a draft
- [ ] **Quality gate (compliance check)** — checks against a specific policy framework
- [ ] **Quality gate (completeness)** — checks whether all required elements are present
- [ ] **Quality gate (tone/audience)** — checks whether the tone suits the intended reader
- [ ] **Quality gate (bias and balance)** — checks for missing perspectives or imbalance

---

## Domain

*Which area of APS work is this for? Tick all that apply.*

- [ ] Policy Development
- [ ] Program Delivery & Operations
- [ ] Stakeholder Engagement & Communications
- [ ] Data Analysis & Evaluation
- [ ] Compliance & Governance
- [ ] General Productivity (useful across all domains)

---

## What does it do?

*In 2–4 sentences: what does this prompt do? When would someone use it? What's the input and what's the output?*

---

## The prompt

*Paste the prompt text here. If it needs information from the user, mark those spots with {{placeholder_name}} — for example, {{draft_content}} or {{policy_topic}}.*

```
Paste your prompt here
```

---

## Variables (inputs the user fills in)

*If your prompt uses {{placeholders}}, list them here and explain what each one is for.*

| Variable name | What to put here | Required? | Example |
|---|---|---|---|
| `example_variable` | Description | Yes / No | Example value |

---

## Known limitations

*What does this prompt tend to get wrong, miss, or handle poorly? Be honest — limitations help users know when to trust the output and when to double-check.*

1.
2.
3.

---

## Have you tested it?

*Have you tried this prompt in an AI tool? Which one? How did it perform?*

- [ ] Yes — tested in Claude
- [ ] Yes — tested in ChatGPT
- [ ] Yes — tested in Microsoft Copilot
- [ ] Not yet tested

*Notes on how it performed (optional):*

---

## Anything else?

*Any context that would help — real examples, edge cases, related workflows it could plug into.*

---

*Submitted by (optional):*
