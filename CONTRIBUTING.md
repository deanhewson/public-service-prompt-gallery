# Contributing to the APS GenAI Prompt Gallery

Thank you for your interest in contributing. This library exists to help Australian Public Service staff use AI tools more effectively and responsibly. Every contribution (a workflow, a building block, or a quality gate) makes it more useful for more people.

---

## Why contributions matter

The library is most valuable when it reflects real APS work. Contributors bring domain expertise that no single author can replicate: the specific conventions of a portfolio, the compliance pressures of a particular role, the edge cases that only come from doing the task for years. Good contributions make the difference between a generic AI prompt and something that actually fits how government works.

---

## Two ways to contribute

### Path 1: Non-technical - submit via GitHub issue

You don't need to know how to code or write JSON. If you have an idea for a workflow or building block, open a GitHub issue using one of the templates below:

- **New workflow idea** → [Submit a workflow](../../issues/new?template=workflow-submission.md)
- **New building block or quality gate** → [Submit a building block](../../issues/new?template=building-block-submission.md)

Fill in the fields as best you can. The maintainer will review it, may ask questions, and will handle turning it into a JSON file if it's accepted.

### Path 2: Technical - fork, add JSON, open a PR

If you're comfortable editing JSON files:

1. Fork this repository
2. Create a branch: `git checkout -b add-my-workflow-name`
3. Add your content as a JSON file in `data/workflows/` or `data/building_blocks/`
4. Follow the schemas below (or the full schemas in `notes/aps-genai-prompt-library-architecture.md`)
5. Open a pull request with a short description of what you've added and why

---

## JSON schema: workflow

The key fields for a workflow. See the full schema in `notes/aps-genai-prompt-library-architecture.md` (section 2.3).

```json
{
  "id": "WF-POL-003",
  "name": "Your Workflow Name",
  "description": "One or two sentences: what task does this address, and for whom?",
  "version": "1.0",
  "last_reviewed": "YYYY-MM-DD",

  "domain": "policy_development",
  "complexity": "intermediate",
  "typical_user_level": ["aps6", "el1"],
  "estimated_time": "30-45 minutes with review",

  "source": "upstream",
  "status": "draft",

  "steps": [
    {
      "order": 1,
      "name": "Step name",
      "step_type": "generation",
      "description": "What this step does",
      "is_optional": false,
      "trust_level": "medium",
      "prompt_template": "Your prompt here. Use {{variable_name}} for user inputs.",
      "user_action_after": "What the officer should do before moving to step 2.",
      "known_limitations": ["Limitation 1", "Limitation 2"]
    }
  ],

  "compliance_frameworks": ["pgpa_act", "aps_values"],
  "contributed_by": "Your name or GitHub handle (optional)",
  "known_limitations": ["Workflow-level limitation 1", "Workflow-level limitation 2"]
}
```

**Valid values for key fields:**

| Field | Options |
|---|---|
| `domain` | `policy_development`, `program_delivery`, `stakeholder_engagement`, `data_analysis`, `compliance_governance`, `general_productivity`, `career_performance` |
| `complexity` | `beginner`, `intermediate`, `advanced` |
| `typical_user_level` | `aps3_4`, `aps5_6`, `el1`, `el2`, `ses` |
| `step_type` | `generation`, `quality_gate`, `refinement`, `user_input` |
| `trust_level` | `high`, `medium`, `low` |
| `status` | `draft`, `published`, `archived` |
| `source` | `upstream`, `agency` |
| `compliance_frameworks` | `pgpa_act`, `pspf`, `privacy_act`, `aps_values`, `foi_act`, `pspf_ai_advisory`, `apsc_performance_framework` |

---

## JSON schema: building block

The key fields for a reusable building block or quality gate. See the full schema in `notes/aps-genai-prompt-library-architecture.md` (sections 2.1 and 2.2).

```json
{
  "id": "BB-ROLE-007",
  "name": "Your Building Block Name",
  "description": "What this block does and when to use it.",
  "version": "1.0",
  "last_reviewed": "YYYY-MM-DD",

  "block_type": "role_definition",
  "domains": ["policy_development"],

  "source": "upstream",
  "status": "draft",

  "prompt_template": "Your prompt text. Use {{variable_name}} for inputs.",

  "variables": [
    {
      "name": "variable_name",
      "description": "What this variable is for",
      "type": "text",
      "required": true,
      "examples": ["Example value 1", "Example value 2"]
    }
  ],

  "known_limitations": ["Limitation 1", "Limitation 2"],
  "contributed_by": "Your name or GitHub handle (optional)"
}
```

**Valid values for `block_type`:** `role_definition`, `context_setter`, `generation`, `format_template`, `refinement`

---

## Quality bar — what makes a good contribution

The maintainer will review contributions against these criteria before merging:

**A good workflow has:**
- A clearly defined task that APS staff actually do repeatedly
- Steps in a logical order, with a quality gate (verification or challenge step) before the final output
- Trust levels assigned to every step — don't skip this, it's core to the library's value
- Known limitations listed honestly — if the AI tends to hallucinate in this domain, say so
- A `user_action_after` on every step — this is what makes it actionable, not just a prompt dump
- At least one worked example scenario in the description or notes (can be fictitious)
- Compliance frameworks to consider tagged where relevant 

**A good building block has:**
- A single, reusable purpose (if it's doing two things, split it into two blocks)
- A prompt template that actually works — test it before submitting
- Known limitations — especially any domain where the block tends to fail or mislead

**What will be asked of you:**
- If your submission references a specific piece of legislation or a statistic, provide the source
- If you're submitting a quality gate, explain what type of error it's designed to catch
- If your workflow is for a specific portfolio or agency context, say so clearly — it helps others decide whether it's relevant to them

---

## Review process

1. You open an issue or pull request
2. The maintainer reviews it — usually within a few days
3. They may ask questions or request changes (especially around trust levels, limitations, and compliance tagging)
4. On approval, it gets merged to `master` and goes live on the site automatically via Netlify

There's no formal SLA on review time: this is a small project. If you haven't heard back in a week, feel free to comment on your issue or PR.

---

## Licence

This project is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) (Creative Commons Attribution). You are free to use, share, and adapt the content as long as you credit the source. By contributing, you agree that your contribution will be published under CC BY 4.0.

---

## Questions?

Open an issue with the label `question`, or reach out via the contact link on the site.
