# Creating Workflows — Contributor Guide

This guide explains how to add a new workflow to the Public Service Prompt Gallery.
It covers the full data model from scratch: building blocks, quality gates, workflow
files, and how to wire them together.

Audience: semi-technical contributors and LLMs generating content for this project.

---

## How it all fits together

Content in this project is structured in three layers:

```
Building Blocks  →  combined into  →  Workflows
Quality Gates    →  inserted into  →  Workflows
```

**Building Blocks** are reusable prompt templates. Each one does a single job:
generate a draft, define a role, format an output, analyse a set of inputs.

**Quality Gates** are a specialised kind of building block. They verify, challenge,
or check the output of a previous step rather than generating new content.

**Workflows** are ordered sequences of steps. Each step references a building block
or quality gate by ID and adds workflow-specific metadata: what trust to place in
the output, whether the step is optional, what the user should do after it, and
how the output feeds into later steps.

A workflow step never contains the prompt itself — it always points to a building
block or quality gate. This means a block can be reused across multiple workflows.

---

## File layout

```
data/
  building-blocks/        ← one JSON file per building block
    bb-stk-001.json
    bb-gen-001.json
    ...
  quality-gates/          ← one JSON file per quality gate
    qg-trust-001.json
    qg-challenge-001.json
    ...
  workflows/              ← one JSON file per workflow
    wf-pol-001-briefing-note.json
    wf-eng-001-stakeholder-analysis.json
    ...
src/pages/workflows/      ← one Astro page per workflow
    briefing-note.astro
    stakeholder-analysis.astro
    ...
```

---

## Naming conventions

### IDs

| Entity | Pattern | Example |
|---|---|---|
| Building block | `BB-{domain}-{number}` | `BB-STK-001` |
| Quality gate | `QG-{type}-{number}` | `QG-TRUST-001` |
| Workflow | `WF-{domain}-{number}` | `WF-ENG-001` |

Domain codes used in IDs:

| Domain | Code |
|---|---|
| Policy development | `POL` |
| Stakeholder engagement | `ENG` |
| Program delivery | `PRG` |
| Data analysis | `DAT` |
| Compliance / governance | `COM` |
| General productivity | `GEN` |

Use the next sequential number after the highest existing ID in that domain.

### Filenames

Building blocks and quality gates: `{lowercase-id}.json`
→ `bb-stk-001.json`, `qg-trust-001.json`

Workflows: `{lowercase-id}-{short-slug}.json`
→ `wf-eng-001-stakeholder-analysis.json`

Astro pages (in `src/pages/workflows/`): `{slug}.astro`
→ `stakeholder-analysis.astro`

---

## Controlled vocabularies (allowed values)

Use only values from these lists. Adding new values requires updating the
architecture doc (`notes/aps-genai-prompt-library-architecture.md`) first.

**Domains** (used in `domains`, `domain`)
- `policy_development`
- `program_delivery`
- `stakeholder_engagement`
- `data_analysis`
- `compliance_governance`
- `general_productivity`

**Block types** (building blocks only)
- `role_definition` — sets up an expert persona
- `context_setter` — provides background/framing
- `generation` — produces a substantive output
- `format_template` — shapes the structure or format
- `refinement` — improves or edits an earlier output

**Gate types** (quality gates only)
- `factual_accuracy` — checks claims against verifiable facts
- `completeness` — checks for missing content or analysis
- `bias_balance` — checks for one-sided framing
- `compliance` — checks against legislative/policy frameworks
- `tone_audience` — checks plain language and audience fit
- `challenge` — adversarial review / red-team

**Trust levels**
- `high` — output is structural, formatting, or process-oriented; low hallucination risk
- `medium` — output contains factual claims that need human verification
- `low` — output involves significant inference or prediction; treat as hypothesis only

**Step types** (workflow steps only)
- `generation` — step uses a building block to produce content
- `quality_gate` — step uses a quality gate to verify or challenge
- `refinement` — step uses a building block to improve existing output
- `user_input` — step prompts the user to do something (no AI call)

**Complexity**
- `beginner`
- `intermediate`
- `advanced`

**APS levels**
- `aps3_4`
- `aps5_6`
- `el1`
- `el2`
- `ses`

**Compliance frameworks**
- `pgpa_act`
- `pspf`
- `privacy_act`
- `aps_values`
- `foi_act`
- `pspf_ai_advisory`
- `apsc_performance_framework`

**Gate severity** (quality gates only)
- `required` — must be run before output is finalised
- `recommended` — should be run; acceptable to skip with reason
- `optional` — additional verification for advanced users

**Security classification**
- `unclassified`
- `official`
- `official_sensitive`
- `protected`

---

## Variable syntax

Prompt templates use `{{variable_name}}` for substitution:

```
Analyse the following initiative for {{agency}}: {{initiative}}
```

Optional sections that only render when a variable is present:

```
{{#if key_documents}}
<reference_documents>
{{key_documents}}
</reference_documents>
{{/if}}
```

Variable names must be lowercase with underscores. Every `{{variable}}` referenced
in a prompt must be declared in the `variables` array of the same building block.

---

## Step 1 — Create building blocks

Create one JSON file per building block in `data/building-blocks/`.

**Full schema:**

```json
{
  "id": "BB-STK-001",
  "name": "Stakeholder Analysis: Map Stakeholders",
  "description": "One-sentence description of what this block produces.",
  "version": "1.0",
  "last_reviewed": "YYYY-MM-DD",

  "block_type": "generation",
  "domains": ["stakeholder_engagement"],

  "prompt_template": "<role>\nYou are a senior Australian Public Service policy analyst ...\n</role>\n\n<task>\n...\n</task>",

  "variables": [
    {
      "name": "agency",
      "description": "Your agency or portfolio context",
      "type": "text",
      "required": true,
      "examples": ["Department of Social Services", "Department of Infrastructure"]
    },
    {
      "name": "initiative",
      "description": "The policy initiative or decision being analysed",
      "type": "text",
      "required": true,
      "examples": ["NDIS review implementation", "new aged care standards rollout"]
    },
    {
      "name": "key_documents",
      "description": "Paste publicly available background. Do not paste OFFICIAL: Sensitive material.",
      "type": "long_text",
      "required": false,
      "placeholder": "Paste relevant publicly available content here..."
    }
  ],

  "trust_level": "medium",

  "skill_adaptations": {
    "beginner": {
      "notes": "What a beginner should watch out for and how to use the output.",
      "prompt_modification": null
    },
    "intermediate": {
      "notes": "What intermediate users should focus on.",
      "prompt_modification": null
    },
    "advanced": {
      "notes": "How advanced users can extend or chain this block.",
      "prompt_modification": "Optional extra text to append to the prompt for advanced use."
    }
  },

  "tags": ["stakeholder", "mapping", "engagement"],
  "contributed_by": null,
  "known_limitations": [
    "The model's knowledge of specific organisations may be outdated.",
    "Local or niche groups are likely to be missed.",
    "Influence ratings are estimated, not based on your agency's intelligence."
  ]
}
```

**Variable types:**
- `text` — short single-line input
- `long_text` — multi-paragraph paste (e.g. document contents)
- `select` — choose from a fixed list (include an `options` array)

**Tips for writing good prompts:**
- Use `<role>` and `<task>` XML tags to separate persona from instructions. This
  is the Claude-native format; the platform reformatter converts it for other tools.
- Be specific about output format — numbered lists, tables, headings.
- Use explicit markers like `[VERIFY]` and `[INSERT DATA]` to signal where AI output
  needs human review. Establish these in the custom instructions so the model uses
  them consistently.
- Quality gates do not need a `<role>` tag — they inherit the persona from the
  workflow's custom instructions. They run after a generation step; the model
  already has the context of the prior output in the conversation.

---

## Step 2 — Create quality gates (if needed)

Quality gates are structured exactly like building blocks with a few extra fields.
Create them in `data/quality-gates/`.

New workflows can reuse the three existing quality gates without creating new ones:

| ID | Name | Use when |
|---|---|---|
| `QG-TRUST-001` | Claim Verification Gate | Any step that produces factual claims |
| `QG-CHALLENGE-001` | Red-Team Challenge | Any substantive analysis or recommendation |
| `QG-COMPLIANCE-001` | PGPA/PSPF/Privacy Check | Final check on any policy document |

**Only create a new quality gate if none of the existing three fit.** A new gate
should verify something distinct — bias/balance, completeness, tone/audience fit.

**Quality gate schema** (additions on top of building block schema):

```json
{
  "id": "QG-BIAS-001",
  "name": "Balance and Perspectives Check",
  "description": "Checks whether a draft presents multiple perspectives fairly.",
  "version": "1.0",
  "last_reviewed": "YYYY-MM-DD",

  "gate_type": "bias_balance",
  "severity": "recommended",

  "prompt_template": "...",

  "variables": [],

  "trust_pattern": "adversarial_review",
  "compliance_frameworks": ["aps_values"],

  "skill_adaptations": { ... },

  "tags": ["bias", "balance", "quality-gate"],
  "known_limitations": [...]
}
```

Quality gate prompts are typically short. They run in an ongoing conversation so
they don't need to restate context — they analyse what came before. Example pattern:

```
Review the analysis above and identify:
1. Any perspectives that are underrepresented or missing
2. Assumptions presented as facts
3. Framing that could be seen as one-sided

For each issue found, provide: Issue | Why it matters | How to address it
```

---

## Step 3 — Create the workflow file

Create one JSON file in `data/workflows/`. The filename must follow the convention:
`wf-{domain-code}-{number}-{slug}.json`

### Top-level metadata

```json
{
  "id": "WF-ENG-002",
  "name": "Community Consultation Planning",
  "description": "Two-sentence description of what the workflow produces and who it is for.",
  "version": "1.0",
  "last_reviewed": "YYYY-MM-DD",

  "domain": "stakeholder_engagement",
  "task_type": "consultation_planning",
  "typical_user_level": ["aps5_6", "el1"],
  "complexity": "intermediate",
  "estimated_time": "30–45 minutes with review",

  "security_classification": "official",
  "compliance_frameworks": ["pgpa_act", "privacy_act", "aps_values"],

  "tags": ["consultation", "engagement", "planning"],
  "contributed_by": null
}
```

`task_type` is a free-form string that describes the specific output — use
snake_case and be specific: `briefing_note`, `stakeholder_analysis`,
`consultation_plan`, `data_summary`.

### inputs_required

These are the variables the user fills in before starting. They are passed into
the building blocks as `{{variable_name}}` substitutions.

```json
"inputs_required": [
  {
    "name": "agency",
    "label": "Agency",
    "description": "Your agency or portfolio context",
    "type": "text",
    "required": true,
    "placeholder": "e.g. Department of Social Services"
  },
  {
    "name": "initiative",
    "label": "Initiative",
    "description": "The policy initiative or program being consulted on",
    "type": "text",
    "required": true,
    "placeholder": "e.g. Aged care standards review 2026"
  },
  {
    "name": "key_documents",
    "label": "Background materials (optional)",
    "description": "Paste publicly available background. Do not paste OFFICIAL: Sensitive material into public AI tools.",
    "type": "long_text",
    "required": false,
    "placeholder": "Paste relevant publicly available content here..."
  }
]
```

Every variable name listed here must match the `{{variable_name}}` placeholders
used in the building blocks this workflow references.

### steps

Each step references one building block or one quality gate. The prompt itself
lives in the building block — the step adds workflow-level metadata.

```json
"steps": [
  {
    "order": 1,
    "id": "step-1",
    "name": "Map Stakeholders",
    "step_type": "generation",
    "building_block_id": "BB-STK-001",
    "description": "One sentence: what this step produces.",
    "trust_level": "medium",
    "is_optional": false,
    "user_action_after": "Review the map critically. Add any groups your agency knows are relevant but the model missed. Adjust influence ratings based on your direct knowledge.",
    "output_feeds_to": [2]
  },
  {
    "order": 2,
    "id": "step-2",
    "name": "Analyse Positions & Interests",
    "step_type": "generation",
    "building_block_id": "BB-STK-002",
    "description": "Deepens understanding of priority stakeholders — interests, red lines, and common ground.",
    "trust_level": "medium",
    "is_optional": false,
    "user_action_after": "Note where the model's read differs from your direct knowledge. Flag any positions you know to be wrong.",
    "output_feeds_to": [3, 4]
  },
  {
    "order": 3,
    "id": "step-3",
    "name": "Challenge the Analysis",
    "step_type": "quality_gate",
    "quality_gate_id": "QG-CHALLENGE-001",
    "description": "Red-team the analysis — who's been missed, what assumptions are hidden.",
    "trust_level": "medium",
    "is_optional": true,
    "user_action_after": "Review the critique. Add any stakeholders flagged as missing to your revised map.",
    "output_feeds_to": [4]
  },
  {
    "order": 4,
    "id": "step-4",
    "name": "Engagement Strategy",
    "step_type": "generation",
    "building_block_id": "BB-STK-003",
    "description": "Recommends tailored engagement approaches for each priority stakeholder.",
    "trust_level": "medium",
    "is_optional": false,
    "user_action_after": "Adjust sequencing based on your political read and existing relationships. Finalise with your manager before commencing engagement.",
    "output_feeds_to": []
  }
]
```

**Key rules for steps:**

- Use `building_block_id` for generation/refinement steps and `quality_gate_id`
  for quality gate steps. Never use both in the same step.
- Every step must have `user_action_after`. This is the human-in-the-loop
  instruction — what the officer needs to do, check, or decide before moving on.
  Write it in plain English, addressed to the user directly.
- `output_feeds_to` is an array of step order numbers. Use `[]` for the final step.
  Use `[2, 3]` if the output of this step flows into both step 2 and step 3.
- At least one step should be a quality gate (`step_type: "quality_gate"`) before
  the final output. Workflows without verification are not acceptable.
- Optional steps (`is_optional: true`) are shown as skippable in the UI.

**Per-step platform tips (optional):**

If a step works differently on a specific platform, add a `platform_tips` object:

```json
"platform_tips": {
  "copilot": "Use Copilot in Word to run this step — paste the prompt directly into the chat pane to draft inline.",
  "chatgpt": "If you are using the ChatGPT canvas feature, paste the previous output into canvas before running this prompt."
}
```

Only add `platform_tips` where there is genuinely useful platform-specific advice.
Leave the field out if there is nothing specific to say.

### skill_level_guidance

Defines which steps to recommend at each skill level.

```json
"skill_level_guidance": {
  "beginner": {
    "recommended_steps": [1, 2, 4],
    "skip_steps": [3],
    "notes": "Start with the stakeholder map and position analysis, then go straight to the engagement strategy. Return to the challenge step once you are comfortable with the workflow."
  },
  "intermediate": {
    "recommended_steps": [1, 2, 3, 4],
    "skip_steps": [],
    "notes": "Run the full workflow. The challenge step often surfaces dynamics that were missed."
  },
  "advanced": {
    "recommended_steps": [1, 2, 3, 4],
    "skip_steps": [],
    "notes": "Consider running Step 1 twice — once from the agency's perspective, once from the most affected community group's perspective. The gap between these maps reveals where the real engagement risk sits."
  }
}
```

### custom_instructions

Custom instructions are pasted into the AI platform before the workflow starts.
They establish the expert persona and the rules the model should follow throughout.

Provide instructions for all four platforms. The content is the same in substance
but formatted differently for each platform.

```json
"custom_instructions": {
  "claude": {
    "setup_guidance": "Create a Claude Project called '{Workflow Name}'. Paste the instructions below into the Project Instructions field. You can upload standing context documents to the Project knowledge base.",
    "content": "You are an experienced Australian Public Service (APS) policy analyst at the EL1 level...\n\nWhen producing output:\n- Flag assumptions with [VERIFY]\n- Flag gaps with [INSERT DATA]\n- Do not fabricate names, figures, or dates",
    "document_handling": "Upload relevant standing context — previous analyses, templates, policy frameworks — to the Project knowledge base."
  },
  "chatgpt": {
    "setup_guidance": "Create a ChatGPT Project called '{Workflow Name}'. Paste the instructions into the Project instructions field.",
    "content": "## Role\nYou are an experienced APS policy analyst at the EL1 level...\n\n## Rules\n- Flag assumptions with [VERIFY]\n- Flag gaps with [INSERT DATA]\n- Do not fabricate names, figures, or dates",
    "document_handling": "Upload standing context to the ChatGPT Project. Reference files by name in your prompts."
  },
  "copilot": {
    "setup_guidance": "Go to Settings > Personalization > Custom Instructions and paste the preferences below.",
    "content": "I am an APS policy officer. Write analytically and impartially. Flag unverified assumptions with [VERIFY] and information gaps with [INSERT DATA]. Do not fabricate names or figures.",
    "document_handling": "Keep reference documents in SharePoint or OneDrive. Use the / key in Copilot to reference them."
  },
  "other": {
    "setup_guidance": "Paste the instructions below at the start of each new conversation before running any workflow steps.",
    "content": "Role: You are an experienced APS policy analyst at the EL1 level.\n\nRules:\n- Flag unverified assumptions with [VERIFY]\n- Flag information gaps with [INSERT DATA]\n- Do not fabricate names, figures, or dates",
    "document_handling": "Paste relevant context directly into prompts at the steps where you need to reference it."
  }
}
```

**Guidelines for writing custom instructions:**

- Claude uses XML-style natural prose. ChatGPT uses `## Section` headers.
  Copilot and Other are brief — one paragraph.
- Every platform's instructions must establish: the expert role, the output style,
  and the three core rules: flag with `[VERIFY]`, flag gaps with `[INSERT DATA]`,
  never fabricate specific facts.
- `setup_guidance` is shown to the user in the UI before the workflow. Keep it
  to two or three sentences.
- `document_handling` explains where to put reference documents for each platform.

### known_limitations

List three to five limitations specific to this workflow. Be honest and specific.

```json
"known_limitations": [
  "The model's knowledge of specific organisations and their current positions may be outdated.",
  "Local, niche, or recently formed groups are likely to be missed — supplement with your agency's stakeholder intelligence.",
  "The model cannot know your existing relationships, which significantly affects appropriate engagement approaches.",
  "This workflow produces AI-assisted analysis. You remain responsible for the quality of engagement decisions."
]
```

### worked_example (optional but strongly recommended)

```json
"worked_example": {
  "scenario": "An EL1 in the Department of Social Services uses this workflow to prepare for public consultation on new aged care standards. They run Steps 1–4 over 35 minutes, identify three stakeholder groups the initial map missed, and revise the engagement sequencing based on the red-team critique.",
  "note": "This example uses fictitious agency details. Your workflow will produce different results depending on the initiative and context you provide."
}
```

---

## Step 4 — Create the Astro page

Each workflow needs a page in `src/pages/workflows/`. The simplest approach is to
copy an existing page and update the data import and metadata.

```astro
---
import WorkflowLayout from '../../layouts/WorkflowLayout.astro';
import workflowData from '../../../data/workflows/wf-eng-002-consultation-planning.json';
---

<WorkflowLayout workflow={workflowData} />
```

The `WorkflowLayout` component handles all rendering: steps, platform selector,
skill level toggle, progress bar, custom instructions, and platform tips.

**Important Astro conventions for this project:**

- Do not use TypeScript generic annotations (`Record<string, string>`,
  `Array<string>`) in `.astro` frontmatter. Astro 5 compiles frontmatter as TSX
  and misreads generic syntax as JSX elements. Use plain object literals.
- Do not use `define:vars` to pass complex objects to client scripts. Use
  `<script type="application/json" id="...">` + `set:html={JSON.stringify(...)}`
  and read with `JSON.parse(document.getElementById(...).textContent)`.
- Import paths from `src/pages/workflows/` to `data/`: use `'../../../data/...'`
  (three levels up).

Then add a link to the new workflow on the index page (`src/pages/index.astro`).

---

## Checklist before submitting

**Building blocks:**
- [ ] Single clear purpose — one thing well
- [ ] Prompt tested on at least one AI platform
- [ ] All `{{variables}}` declared in the `variables` array
- [ ] `known_limitations` filled in (at least three items)
- [ ] `skill_adaptations` filled in for all three levels

**Quality gates:**
- [ ] Gate type and severity set correctly
- [ ] Prompt produces structured, actionable output
- [ ] Limitations acknowledge that the model is checking its own work

**Workflows:**
- [ ] Every step references a real building block or quality gate ID
- [ ] `user_action_after` on every step
- [ ] At least one quality gate before the final output
- [ ] `skill_level_guidance` filled in for all three levels
- [ ] `custom_instructions` filled in for all four platforms
- [ ] `known_limitations` filled in
- [ ] `compliance_frameworks` tagged correctly
- [ ] Astro page created and linked from index

---

## Quick reference — minimal valid workflow

This is the smallest valid structure for a two-step workflow. Expand from here.

```json
{
  "id": "WF-GEN-002",
  "name": "My New Workflow",
  "description": "What it does and who it is for.",
  "version": "1.0",
  "last_reviewed": "2026-03-12",

  "domain": "general_productivity",
  "task_type": "my_task_type",
  "typical_user_level": ["aps5_6"],
  "complexity": "beginner",
  "estimated_time": "15–20 minutes",

  "security_classification": "official",
  "compliance_frameworks": ["aps_values"],

  "inputs_required": [
    {
      "name": "topic",
      "label": "Topic",
      "description": "What you are working on",
      "type": "text",
      "required": true,
      "placeholder": "e.g. monthly performance report"
    }
  ],

  "steps": [
    {
      "order": 1,
      "id": "step-1",
      "name": "Generate Draft",
      "step_type": "generation",
      "building_block_id": "BB-GEN-003",
      "description": "Produces the initial draft.",
      "trust_level": "medium",
      "is_optional": false,
      "user_action_after": "Review the draft. Correct any facts the model got wrong before proceeding.",
      "output_feeds_to": [2]
    },
    {
      "order": 2,
      "id": "step-2",
      "name": "Verify Claims",
      "step_type": "quality_gate",
      "quality_gate_id": "QG-TRUST-001",
      "description": "Checks factual claims in the draft.",
      "trust_level": "medium",
      "is_optional": false,
      "user_action_after": "Work through each claim flagged as POTENTIALLY FABRICATED. Check against authoritative sources before finalising.",
      "output_feeds_to": []
    }
  ],

  "skill_level_guidance": {
    "beginner": {
      "recommended_steps": [1, 2],
      "skip_steps": [],
      "notes": "Run both steps. The verification step is essential."
    },
    "intermediate": {
      "recommended_steps": [1, 2],
      "skip_steps": [],
      "notes": "Run both steps."
    },
    "advanced": {
      "recommended_steps": [1, 2],
      "skip_steps": [],
      "notes": "Consider adding QG-CHALLENGE-001 between steps 1 and 2 for a more thorough review."
    }
  },

  "custom_instructions": {
    "claude": {
      "setup_guidance": "Create a Claude Project. Paste the instructions below into the Project Instructions field.",
      "content": "You are an experienced APS officer. Flag assumptions with [VERIFY] and gaps with [INSERT DATA]. Do not fabricate specific facts.",
      "document_handling": "Upload relevant reference documents to the Project knowledge base."
    },
    "chatgpt": {
      "setup_guidance": "Create a ChatGPT Project. Paste the instructions below.",
      "content": "## Role\nYou are an experienced APS officer.\n\n## Rules\n- Flag assumptions with [VERIFY]\n- Flag gaps with [INSERT DATA]\n- Do not fabricate specific facts",
      "document_handling": "Upload reference documents to the ChatGPT Project."
    },
    "copilot": {
      "setup_guidance": "Go to Settings > Personalization > Custom Instructions and paste the preferences below.",
      "content": "I am an APS officer. Flag unverified assumptions with [VERIFY] and gaps with [INSERT DATA]. Do not fabricate specific facts.",
      "document_handling": "Keep reference documents in SharePoint or OneDrive and reference them with the / key."
    },
    "other": {
      "setup_guidance": "Paste the instructions below at the start of each new conversation.",
      "content": "Role: You are an experienced APS officer.\nRules: Flag assumptions with [VERIFY], gaps with [INSERT DATA], do not fabricate specific facts.",
      "document_handling": "Paste relevant context directly into prompts as needed."
    }
  },

  "known_limitations": [
    "AI output requires human verification before use in official documents.",
    "The model's knowledge may be outdated for recent developments.",
    "You remain responsible for the quality and accuracy of final outputs."
  ],

  "tags": ["general", "drafting"]
}
```

---

## Guidance for LLMs generating content

If you are an LLM generating new building blocks, quality gates, or workflows for
this project, follow these rules:

1. **Read the existing files first.** Check `data/building-blocks/`,
   `data/quality-gates/`, and `data/workflows/` before creating anything new.
   Reuse existing building blocks and quality gates wherever possible.

2. **Use exact values from the controlled vocabularies.** Do not invent new
   domain codes, block types, gate types, or complexity levels.

3. **Every `{{variable}}` in a prompt must be declared** in the `variables` array
   of the same building block. Variables used in the workflow's `inputs_required`
   must match what the referenced building blocks expect.

4. **Quality gates do not need their own variables.** They operate on the
   conversation context. Their `variables` array should be `[]`.

5. **Do not add fields that are not in the schema.** The UI renders only known
   fields. Unknown fields are silently ignored but create confusion.

6. **`user_action_after` must be written for the officer, not the model.**
   It is a human-readable instruction about what the person using the workflow
   should do, check, or decide. It is not a prompt.

7. **Prompts should use XML tags** (`<role>`, `<task>`, `<reference_documents>`)
   for Claude-native format. The platform reformatter converts these to the
   appropriate format for other tools at render time.

8. **The `custom_instructions.content` field for Claude should be natural prose.**
   For ChatGPT it should use `## Section` headers. For Copilot and Other it should
   be a compact paragraph. All four versions cover the same ground: role, style,
   and rules (`[VERIFY]`, `[INSERT DATA]`, no fabrication).

9. **Test your IDs.** If you create `BB-ENG-001`, make sure no file named
   `bb-eng-001.json` already exists and no existing block has `"id": "BB-ENG-001"`.

10. **One building block, one job.** Do not combine a stakeholder mapping prompt
    with an engagement strategy prompt into a single block. Split them. Workflows
    compose blocks — that is the point.
