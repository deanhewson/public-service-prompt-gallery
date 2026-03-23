# APS GenAI Prompt Library — Technical Architecture
## Data Schemas, Component Relationships & Seed Content

**Purpose:** Provide the structural foundation for building the prompt library as a working application. Everything here is designed to be directly translatable into code — JSON schemas, relationship models, enums, and seed data.

---

## 1. Core Data Model

The library has four primary entity types that compose together. Think of it like a component system: Building Blocks are atoms, Workflows are molecules, Quality Gates are test suites, and Skill Adaptations are variants.

```
┌─────────────────────────────────────────────────────┐
│                    WORKFLOW                          │
│  (end-to-end task sequence)                         │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │  STEP 1  │→ │  STEP 2  │→ │  STEP 3  │→ ...     │
│  │(building │  │(building │  │(quality  │          │
│  │  block)  │  │  block)  │  │  gate)   │          │
│  └──────────┘  └──────────┘  └──────────┘          │
│       ↑              ↑             ↑                │
│  ┌─────────────────────────────────────┐            │
│  │      SKILL ADAPTATION LAYER        │            │
│  │  (beginner / intermediate / adv)   │            │
│  └─────────────────────────────────────┘            │
└─────────────────────────────────────────────────────┘
```

### Entity Relationships

```
Workflow ──has many──→ WorkflowStep (ordered)
WorkflowStep ──references──→ BuildingBlock | QualityGate
BuildingBlock ──has many──→ SkillAdaptation
Workflow ──tagged with──→ Domain, ComplianceFramework[]
BuildingBlock ──tagged with──→ BlockType, Domain[]
QualityGate ──tagged with──→ GateType, ComplianceFramework[]
```

---

## 2. JSON Schemas

### 2.1 Building Block

The atomic unit. A single reusable prompt that can be composed into workflows.

```json
{
  "id": "BB-ROLE-001",
  "name": "Senior Policy Analyst Role",
  "description": "Sets Claude's persona as an experienced APS policy analyst. Use as a prefix for any policy-related task.",
  "version": "1.0",
  "last_reviewed": "2026-03-01",
  
  "block_type": "role_definition",
  "domains": ["policy_development", "compliance_governance"],
  
  "prompt_template": "<role>You are an experienced Australian Public Service policy analyst at the EL1 level, working in {{agency}}. You have 8+ years of experience in {{policy_area}}. You write in formal but clear APS style — concise, evidence-based, and impartial. You understand the machinery of government including ministerial, parliamentary, and cabinet processes.</role>",
  
  "variables": [
    {
      "name": "agency",
      "description": "The agency or portfolio context",
      "type": "text",
      "required": true,
      "examples": ["Department of Social Services", "Department of Finance", "Department of Health and Aged Care"]
    },
    {
      "name": "policy_area",
      "description": "The specific policy domain",
      "type": "text",
      "required": true,
      "examples": ["aged care reform", "digital government", "Indigenous affairs"]
    }
  ],
  
  "skill_adaptations": {
    "beginner": {
      "notes": "For users new to GenAI — this block can be used standalone to improve any policy-related prompt. Just paste it before your question.",
      "prompt_modification": null
    },
    "intermediate": {
      "notes": "Combine with a context block and specific instructions for better results.",
      "prompt_modification": null
    },
    "advanced": {
      "notes": "Consider customising the role definition for your specific branch/team conventions. Add specific frameworks or legislation the analyst should be familiar with.",
      "prompt_modification": "Add after the role block: <expertise>You are particularly familiar with {{frameworks}} and routinely prepare advice that accounts for {{considerations}}.</expertise>"
    }
  },
  
  "platform_notes": {
    "claude": "XML tags are processed natively. Use as-is.",
    "chatgpt": "Remove XML tags and convert to plain instructions: 'Act as an experienced APS policy analyst...'",
    "copilot": "Use as system-level instructions where possible, or prefix to your prompt.",
    "govai_chat": "Pending — test when available (April 2026 trial)."
  },
  
  "tags": ["role", "policy", "reusable", "prefix"],
  "contributed_by": null,
  "source": "upstream",
  "status": "published",
  "known_limitations": [
    "Role assignment improves tone and framing but does not give the model actual APS experience or access to internal knowledge.",
    "The model may still produce content that sounds authoritative but is fabricated — role prompts increase this risk if not paired with verification steps."
  ]
}
```

### 2.2 Quality Gate

A specialised building block designed to verify, challenge, or validate output from a previous step.

```json
{
  "id": "QG-TRUST-001",
  "name": "Claim Verification Gate",
  "description": "Extracts every factual claim from a draft and categorises each by verifiability. Designed to make the trust boundary visible — what can you rely on vs. what needs human verification.",
  "version": "1.0",
  "last_reviewed": "2026-03-01",
  
  "gate_type": "factual_accuracy",
  "severity": "recommended",
  
  "prompt_template": "<instructions>\nReview the following draft and extract every specific factual claim — statistics, dates, program names, legislative references, organisational details, and causal assertions.\n\nFor each claim, categorise it as:\n\n1. **VERIFIABLE**: A specific, checkable fact (provide suggested verification source)\n2. **PLAUSIBLE BUT UNVERIFIED**: Sounds reasonable but you're not certain — needs human verification\n3. **INFERRED**: A conclusion or inference drawn from context, not a direct fact\n4. **POTENTIALLY FABRICATED**: A specific detail (name, number, date) that may be hallucinated\n\nPresent as a numbered table with columns: Claim | Category | Verification Action\n\nAt the end, provide a TRUST SUMMARY:\n- Total claims: X\n- Verified/verifiable: X\n- Needs checking: X\n- Risk level: LOW / MEDIUM / HIGH\n</instructions>\n\n<draft>\n{{draft_content}}\n</draft>",
  
  "variables": [
    {
      "name": "draft_content",
      "description": "The draft text to verify",
      "type": "long_text",
      "required": true
    }
  ],
  
  "trust_pattern": "extraction_and_categorisation",
  "compliance_frameworks": ["pgpa_act"],
  
  "skill_adaptations": {
    "beginner": {
      "notes": "This is the single most important quality gate. If you only use one verification step, use this one. Copy the output of your draft, paste it into this prompt.",
      "prompt_modification": "Add to the end of the prompt: 'Explain each categorisation in plain language so I can understand why you flagged it.'"
    },
    "intermediate": {
      "notes": "Use after any substantive drafting step. Pay particular attention to POTENTIALLY FABRICATED items — these are the highest risk.",
      "prompt_modification": null
    },
    "advanced": {
      "notes": "Chain this with the Compliance Gate and Bias Gate for comprehensive verification. Consider running this gate twice — once on the draft, once on the revised version — to catch introduced errors.",
      "prompt_modification": null
    }
  },
  
  "tags": ["verification", "trust", "factual", "essential"],
  "contributed_by": null,
  "source": "upstream",
  "status": "published",
  "known_limitations": [
    "The model is checking its own work — it may not catch its own hallucinations. This gate surfaces claims for HUMAN verification, not AI self-verification.",
    "Cannot actually verify claims against external sources in a standard chat interface. The value is in making claims explicit so the officer can check them."
  ]
}
```

### 2.3 Workflow

A complete end-to-end sequence composed of building blocks and quality gates.

```json
{
  "id": "WF-POL-001",
  "name": "Briefing Note",
  "description": "Produce a draft briefing note on a policy topic for senior executive review. Follows standard APS briefing note conventions with built-in quality checks.",
  "version": "1.0",
  "last_reviewed": "2026-03-01",
  
  "domain": "policy_development",
  "task_type": "briefing_note",
  "typical_user_level": ["aps6", "el1"],
  "complexity": "intermediate",
  "estimated_time": "30-45 minutes with review",
  
  "inputs_required": [
    {
      "name": "topic",
      "description": "The policy topic for the briefing note",
      "type": "text",
      "required": true
    },
    {
      "name": "audience",
      "description": "Who will read this (e.g., First Assistant Secretary, Deputy Secretary)",
      "type": "text",
      "required": true
    },
    {
      "name": "purpose",
      "description": "What the brief is for (e.g., Senate Estimates prep, stakeholder meeting, decision)",
      "type": "text",
      "required": true
    },
    {
      "name": "agency",
      "description": "Agency or portfolio context",
      "type": "text",
      "required": true
    },
    {
      "name": "length",
      "description": "Target length",
      "type": "text",
      "required": false,
      "default": "2 pages"
    },
    {
      "name": "key_documents",
      "description": "Any reference documents to provide as context (paste or summarise)",
      "type": "long_text",
      "required": false
    }
  ],
  
  "steps": [
    {
      "order": 1,
      "name": "Scope & Research",
      "step_type": "generation",
      "building_block_id": "BB-GEN-001",
      "description": "Identify key issues relevant to the topic and portfolio",
      "is_optional": false,
      "user_action_after": "Review the issues list. Remove irrelevant items, add anything missing from your own knowledge. This is where your domain expertise matters most.",
      "output_feeds_to": [2]
    },
    {
      "order": 2,
      "name": "Structure",
      "step_type": "generation",
      "building_block_id": "BB-GEN-002",
      "description": "Propose briefing note structure using APS conventions",
      "is_optional": false,
      "user_action_after": "Confirm the structure works for your audience and purpose. Adjust headings or emphasis as needed.",
      "output_feeds_to": [3]
    },
    {
      "order": 3,
      "name": "Draft",
      "step_type": "generation",
      "building_block_id": "BB-GEN-003",
      "description": "Generate the full briefing note draft",
      "is_optional": false,
      "user_action_after": "Read the draft critically. Note anything that feels wrong, missing, or that you couldn't defend if asked.",
      "output_feeds_to": [4, 5]
    },
    {
      "order": 4,
      "name": "Claim Verification",
      "step_type": "quality_gate",
      "quality_gate_id": "QG-TRUST-001",
      "description": "Extract and categorise all factual claims for verification",
      "is_optional": false,
      "user_action_after": "Work through the verification table. Check flagged items against authoritative sources. This is your accountability step under the PGPA Act.",
      "output_feeds_to": [6]
    },
    {
      "order": 5,
      "name": "Red-Team Challenge",
      "step_type": "quality_gate",
      "quality_gate_id": "QG-CHALLENGE-001",
      "description": "Stress-test the draft from a sceptical senior executive perspective",
      "is_optional": false,
      "user_action_after": "Review the critique. Decide which issues to address (not all may be relevant to your context).",
      "output_feeds_to": [6]
    },
    {
      "order": 6,
      "name": "Revise",
      "step_type": "generation",
      "building_block_id": "BB-GEN-004",
      "description": "Revise draft incorporating verification and challenge feedback",
      "is_optional": false,
      "user_action_after": "Final review. Ensure [VERIFY] and [INSERT DATA] placeholders are resolved.",
      "output_feeds_to": [7]
    },
    {
      "order": 7,
      "name": "Compliance Check",
      "step_type": "quality_gate",
      "quality_gate_id": "QG-COMPLIANCE-001",
      "description": "Check against PGPA, PSPF, Privacy Act, and APS Values",
      "is_optional": false,
      "user_action_after": "Address any compliance issues flagged. This is your final sign-off check.",
      "output_feeds_to": []
    }
  ],
  
  "skill_level_guidance": {
    "beginner": {
      "recommended_steps": [1, 3, 4],
      "skip_steps": [2, 5],
      "notes": "Start with research, draft, and claim verification. The structure step and red-team are valuable but add complexity — try them once you're comfortable with the basics. The compliance check (step 7) is always recommended."
    },
    "intermediate": {
      "recommended_steps": [1, 2, 3, 4, 5, 6, 7],
      "skip_steps": [],
      "notes": "Run the full workflow. Focus on the user actions after each step — that's where your expertise adds the most value."
    },
    "advanced": {
      "recommended_steps": [1, 2, 3, 4, 5, 6, 7],
      "skip_steps": [],
      "notes": "Consider adding parallel analysis chains (economic, social, legal perspectives) before the draft step. Customise the role definition for your specific branch. Run the claim verification gate on both the initial and revised drafts."
    }
  },
  
  "compliance_frameworks": ["pgpa_act", "pspf", "privacy_act", "aps_values"],
  "security_classification": "official",
  
  "worked_example": {
    "scenario": "APS 6 policy officer in the Department of Social Services preparing a briefing note on the National Disability Insurance Scheme (NDIS) participant satisfaction trends for a First Assistant Secretary ahead of a stakeholder roundtable.",
    "note": "This is a fictitious scenario using publicly available information only."
  },
  
  "tags": ["policy", "briefing", "core", "popular"],
  "contributed_by": null,
  "source": "upstream",
  "status": "published",
  "known_limitations": [
    "Cannot access current departmental data, internal reports, or classified information.",
    "Statistics and program details may be outdated or fabricated — always verify.",
    "The draft will follow general APS conventions but may not match your agency's specific template or style guide."
  ],

  "custom_instructions": {
    "description": "Suggested persistent instructions to configure in the user's AI tool before starting this workflow. Reduces the need to re-establish context at each step. Content and format vary by platform.",
    "by_platform": {
      "claude": {
        "format": "Project Instructions (Claude.ai Projects) or system prompt",
        "setup_guidance": "In Claude.ai, create a Project for this workflow type and paste these instructions into the Project Instructions field. They will apply to every conversation in the project.",
        "content": "{{workflow-specific system prompt for Claude — e.g., APS policy analyst persona, PGPA accountability framing, APS writing conventions}}"
      },
      "chatgpt": {
        "format": "Custom Instructions — 'How would you like ChatGPT to respond?'",
        "setup_guidance": "Go to Settings → Custom Instructions and paste this into the second field ('How would you like ChatGPT to respond?'). This will apply to all your ChatGPT conversations until changed.",
        "content": "{{workflow-specific custom instructions for ChatGPT — plain prose, no XML, adapted to ChatGPT's instruction style}}"
      },
      "copilot": {
        "format": "Session context — paste at the start of a new Copilot chat",
        "setup_guidance": "Microsoft Copilot (M365) does not support persistent custom instructions. Paste this at the start of each new chat session to establish context.",
        "content": "{{workflow-specific context block for Copilot — plain markdown, reference org files where relevant}}"
      },
      "other": {
        "format": "Session context — paste at the start of a new conversation",
        "setup_guidance": "Paste this at the beginning of each new session with your AI tool to establish context and constraints for the workflow.",
        "content": "{{plain-text workflow context for generic tools — no platform-specific formatting}}"
      }
    }
  }
}
```

---

## 3. Enums & Controlled Vocabularies

These are the valid values for key fields. Useful for dropdowns, filters, and validation.

```json
{
  "domains": [
    {
      "id": "policy_development",
      "label": "Policy Development",
      "description": "Briefing notes, policy options papers, regulatory impact assessments, international comparisons, Question Time briefs"
    },
    {
      "id": "program_delivery",
      "label": "Program Delivery & Operations",
      "description": "Program logic, grant assessments, process improvement, risk assessment, incident summaries"
    },
    {
      "id": "stakeholder_engagement",
      "label": "Stakeholder Engagement & Communications",
      "description": "Stakeholder analysis, consultation summaries, comms plans, plain language rewrites, ministerial correspondence"
    },
    {
      "id": "data_analysis",
      "label": "Data Analysis & Evaluation",
      "description": "Data exploration, evaluation frameworks, survey analysis, performance reporting, evidence reviews"
    },
    {
      "id": "compliance_governance",
      "label": "Compliance & Governance",
      "description": "PSPF checks, PGPA alignment, privacy impact assessments, AI ethics assessments, internal policy reviews"
    },
    {
      "id": "general_productivity",
      "label": "General Productivity",
      "description": "Meetings, emails, document review, agendas, onboarding"
    },
    {
      "id": "career_performance",
      "label": "Career & Performance",
      "description": "Performance check-ins, capability development, career planning, performance conversations aligned to the APSC Performance Framework"
    }
  ],

  "block_types": [
    { "id": "role_definition", "label": "Role Definition", "description": "Sets the AI's persona and expertise context" },
    { "id": "context_setter", "label": "Context Setter", "description": "Provides background information and situational framing" },
    { "id": "generation", "label": "Generation", "description": "Produces substantive content (drafts, analysis, structures)" },
    { "id": "format_template", "label": "Format Template", "description": "Defines output structure and formatting requirements" },
    { "id": "refinement", "label": "Refinement", "description": "Revises or improves existing content based on feedback" }
  ],

  "gate_types": [
    { "id": "factual_accuracy", "label": "Factual Accuracy", "description": "Verifies claims, flags potential hallucinations" },
    { "id": "completeness", "label": "Completeness", "description": "Checks all required aspects are addressed" },
    { "id": "bias_balance", "label": "Bias & Balance", "description": "Assesses multiple perspectives and stakeholder representation" },
    { "id": "compliance", "label": "Compliance", "description": "Checks against specific legislative/policy frameworks" },
    { "id": "tone_audience", "label": "Tone & Audience", "description": "Validates appropriateness for intended readers" },
    { "id": "challenge", "label": "Red-Team Challenge", "description": "Adversarial review from a sceptical perspective" }
  ],

  "complexity_levels": [
    { "id": "beginner", "label": "Beginner", "description": "New to GenAI. Simple, standalone prompts. Clear instructions on what to copy-paste." },
    { "id": "intermediate", "label": "Intermediate", "description": "Comfortable with GenAI basics. Ready for multi-step workflows and prompt customisation." },
    { "id": "advanced", "label": "Advanced", "description": "Experienced user. Parallel chains, custom role definitions, iterative verification loops." }
  ],

  "aps_levels": [
    { "id": "aps3_4", "label": "APS 3-4" },
    { "id": "aps5_6", "label": "APS 5-6" },
    { "id": "el1", "label": "EL1" },
    { "id": "el2", "label": "EL2" },
    { "id": "ses", "label": "SES" }
  ],

  "compliance_frameworks": [
    { "id": "pgpa_act", "label": "PGPA Act", "description": "Public Governance, Performance and Accountability Act 2013 — proper use of resources, accountability for advice" },
    { "id": "pspf", "label": "PSPF", "description": "Protective Security Policy Framework — information classification, handling requirements" },
    { "id": "privacy_act", "label": "Privacy Act", "description": "Privacy Act 1988, Australian Privacy Principles — personal information handling" },
    { "id": "aps_values", "label": "APS Values", "description": "Impartial, committed to service, accountable, respectful, ethical" },
    { "id": "foi_act", "label": "FOI Act", "description": "Freedom of Information Act 1982 — document discoverability" },
    { "id": "pspf_ai_advisory", "label": "PSPF AI Advisory", "description": "Policy Advisory 001-2025 on OFFICIAL Information Use with Generative AI" },
    { "id": "apsc_performance_framework", "label": "APSC Performance Framework", "description": "APSC non-SES Performance Framework (commenced January 2026) — performance conversations, check-ins, capability development" }
  ],

  "security_classifications": [
    { "id": "unclassified", "label": "UNCLASSIFIED" },
    { "id": "official", "label": "OFFICIAL" },
    { "id": "official_sensitive", "label": "OFFICIAL: Sensitive", "note": "NOT permitted with public GenAI tools" },
    { "id": "protected", "label": "PROTECTED", "note": "Requires enterprise tools like GovAI Chat (from April 2026)" }
  ],

  "step_types": [
    { "id": "generation", "label": "Generation", "description": "Produces new content" },
    { "id": "quality_gate", "label": "Quality Gate", "description": "Verifies or challenges previous output" },
    { "id": "refinement", "label": "Refinement", "description": "Improves content based on feedback" },
    { "id": "user_input", "label": "User Input", "description": "Pauses for human review, decision, or data entry" }
  ],

  "trust_levels": [
    { "id": "high", "label": "High Trust", "description": "Output type where GenAI is generally reliable (e.g., structuring, formatting, brainstorming)" },
    { "id": "medium", "label": "Medium Trust", "description": "Output useful as a starting point but needs verification (e.g., drafting, analysis summaries)" },
    { "id": "low", "label": "Low Trust", "description": "Output likely to contain errors — always verify (e.g., specific statistics, legislative references, current events)" }
  ],

  "status_values": [
    { "id": "draft", "label": "Draft", "description": "Content is under development or awaiting review. Not shown publicly on the live site.", "default": false },
    { "id": "published", "label": "Published", "description": "Content is live and available to users. Default for all upstream content in this repo.", "default": true },
    { "id": "archived", "label": "Archived", "description": "Content has been superseded or withdrawn. Hidden from browse/search but preserved in data files for reference." }
  ],

  "source_values": [
    { "id": "upstream", "label": "Upstream", "description": "Content from this shared public library. Default for all content in this repo.", "default": true },
    { "id": "agency", "label": "Agency", "description": "Content added by an agency in their own fork. Agency-specific content should not be submitted to the upstream repo." }
  ]
}
```

---

## 4. The Trust & Verification Pattern

This is the system for making trust boundaries explicit. Every step in a workflow carries a trust level that tells the user how much to rely on the output.

### Trust Model

```
┌─────────────────────────────────────────────────────────────┐
│                    TRUST HIERARCHY                          │
│                                                             │
│  HIGH TRUST (use with light review)                         │
│  ├── Structuring & organising information                   │
│  ├── Formatting & style consistency                         │
│  ├── Brainstorming & ideation                               │
│  ├── Plain language rewrites                                │
│  └── Summarising content YOU provided                       │
│                                                             │
│  MEDIUM TRUST (use as starting point, verify key claims)    │
│  ├── Drafting prose from an outline                         │
│  ├── Stakeholder analysis                                   │
│  ├── Identifying issues & considerations                    │
│  ├── Comparative analysis                                   │
│  └── Generating meeting agendas from notes                  │
│                                                             │
│  LOW TRUST (always verify before using)                     │
│  ├── Specific statistics or data points                     │
│  ├── Legislative references & section numbers               │
│  ├── Current events or recent developments                  │
│  ├── Named individuals' roles or positions                  │
│  ├── Program details (funding amounts, dates, eligibility)  │
│  └── Quotes or attributed statements                        │
└─────────────────────────────────────────────────────────────┘
```

### How Trust Levels Map to Quality Gates

```json
{
  "trust_to_gate_mapping": {
    "high": {
      "required_gates": [],
      "recommended_gates": ["tone_audience"],
      "verification_effort": "Light review — scan for obvious errors"
    },
    "medium": {
      "required_gates": ["factual_accuracy"],
      "recommended_gates": ["completeness", "bias_balance"],
      "verification_effort": "Check key claims against authoritative sources. Pay attention to [VERIFY] flags."
    },
    "low": {
      "required_gates": ["factual_accuracy"],
      "recommended_gates": ["compliance"],
      "verification_effort": "Independently verify every specific claim before including in any document. Do not rely on the model's output for these items."
    }
  }
}
```

---

## 5. Skill Adaptation System

The same workflow can be presented differently based on the user's experience level. This isn't about dumbing down — it's about progressive disclosure.

### How It Works

```json
{
  "skill_adaptation_model": {
    "beginner": {
      "display_name": "Getting Started",
      "approach": "Show simplified workflow with fewer steps. Provide copy-paste-ready prompts with minimal customisation. Include explanatory notes on what each step does and why.",
      "workflow_behaviour": {
        "show_optional_steps": false,
        "show_advanced_customisation": false,
        "show_platform_notes": false,
        "show_parallel_chains": false,
        "prompt_style": "Complete prompts ready to paste. Variables highlighted with clear instructions.",
        "trust_guidance": "Explicit warnings on every output: 'Remember to verify all specific claims before using this in official documents.'"
      }
    },
    "intermediate": {
      "display_name": "Full Workflow",
      "approach": "Show the complete workflow with all steps. Allow variable customisation. Explain quality gates and their purpose.",
      "workflow_behaviour": {
        "show_optional_steps": true,
        "show_advanced_customisation": false,
        "show_platform_notes": true,
        "show_parallel_chains": false,
        "prompt_style": "Prompts with clearly marked variables. Guidance on how to customise.",
        "trust_guidance": "Trust levels shown per step. Verification actions provided but not forced."
      }
    },
    "advanced": {
      "display_name": "Expert Mode",
      "approach": "Full workflow plus advanced options — parallel analysis chains, custom role definitions, iterative verification loops, prompt chaining across sessions.",
      "workflow_behaviour": {
        "show_optional_steps": true,
        "show_advanced_customisation": true,
        "show_platform_notes": true,
        "show_parallel_chains": true,
        "prompt_style": "Modular prompts designed for composition. Guidance on creating your own building blocks.",
        "trust_guidance": "Trust metadata available but minimal hand-holding. User is expected to apply judgement."
      }
    }
  }
}
```

### Skill Level as a Domain Concept

One important nuance: skill level has two axes.

1. **GenAI skill** — how comfortable is the user with prompting, chaining, and evaluating AI outputs?
2. **Domain skill** — how well does the user know the subject matter (e.g., policy analysis, program evaluation, PSPF requirements)?

A highly experienced EL2 policy officer who is new to GenAI (high domain, low GenAI skill) needs different support than an APS 5 who's been experimenting with Claude for months (low domain, higher GenAI skill).

```json
{
  "skill_matrix": {
    "high_domain_low_genai": {
      "label": "Expert practitioner, GenAI beginner",
      "typical_profile": "Senior policy officer who knows their area deeply but hasn't used AI tools much",
      "recommended_approach": "beginner GenAI workflow, but with domain-expert-level quality gates. Trust their subject matter judgement, help them with the prompting mechanics.",
      "key_risk": "May over-trust plausible-sounding AI output because it matches their expectations, or may reject GenAI entirely after one poor result.",
      "key_opportunity": "Their domain expertise makes the quality gate outputs much more valuable — they can spot errors the AI can't."
    },
    "low_domain_low_genai": {
      "label": "Junior officer, new to both",
      "typical_profile": "APS 3-5, new to the policy area and to GenAI",
      "recommended_approach": "Beginner workflow with maximum guardrails. Emphasis on verification and checking with supervisor.",
      "key_risk": "May trust AI output as authoritative without the domain knowledge to evaluate it.",
      "key_opportunity": "Learning prompting skills early will compound over their career."
    },
    "low_domain_high_genai": {
      "label": "Technically savvy, new to domain",
      "typical_profile": "Officer who's moved to a new policy area but is comfortable with AI tools",
      "recommended_approach": "Advanced GenAI workflow with extra domain-specific quality gates and compliance checks.",
      "key_risk": "May produce polished-looking output that misses domain-specific nuance.",
      "key_opportunity": "Can build sophisticated prompt chains quickly — pair with domain expert for review."
    },
    "high_domain_high_genai": {
      "label": "Expert in both",
      "typical_profile": "Experienced officer who has integrated AI into their workflow",
      "recommended_approach": "Expert mode. Likely building custom workflows and contributing back to the library.",
      "key_risk": "Automation bias — may stop critically reviewing outputs over time.",
      "key_opportunity": "Can mentor others and contribute improved prompts and workflows."
    }
  }
}
```

---

## 6. Component Relationships (for the data model)

### Database Schema (Relational)

```sql
-- Core tables
CREATE TABLE building_blocks (
    id TEXT PRIMARY KEY,          -- e.g., 'BB-ROLE-001'
    name TEXT NOT NULL,
    description TEXT,
    block_type TEXT NOT NULL,     -- FK to block_types enum
    prompt_template TEXT NOT NULL,
    version TEXT DEFAULT '1.0',
    last_reviewed DATE,
    known_limitations TEXT[],     -- array of strings
    tags TEXT[],
    contributed_by TEXT,
    status TEXT DEFAULT 'published',  -- 'draft' | 'published' | 'archived'
    source TEXT DEFAULT 'upstream'    -- 'upstream' | 'agency'
);

CREATE TABLE quality_gates (
    id TEXT PRIMARY KEY,          -- e.g., 'QG-TRUST-001'
    name TEXT NOT NULL,
    description TEXT,
    gate_type TEXT NOT NULL,      -- FK to gate_types enum
    severity TEXT DEFAULT 'recommended',  -- 'required' | 'recommended' | 'optional'
    prompt_template TEXT NOT NULL,
    trust_pattern TEXT,
    version TEXT DEFAULT '1.0',
    last_reviewed DATE,
    known_limitations TEXT[],
    tags TEXT[],
    status TEXT DEFAULT 'published',  -- 'draft' | 'published' | 'archived'
    source TEXT DEFAULT 'upstream'    -- 'upstream' | 'agency'
);

CREATE TABLE workflows (
    id TEXT PRIMARY KEY,          -- e.g., 'WF-POL-001'
    name TEXT NOT NULL,
    description TEXT,
    domain TEXT NOT NULL,         -- FK to domains enum
    task_type TEXT,
    complexity TEXT DEFAULT 'intermediate',
    estimated_time TEXT,
    security_classification TEXT DEFAULT 'official',
    version TEXT DEFAULT '1.0',
    last_reviewed DATE,
    known_limitations TEXT[],
    tags TEXT[],
    contributed_by TEXT,
    status TEXT DEFAULT 'published',  -- 'draft' | 'published' | 'archived'
    source TEXT DEFAULT 'upstream'    -- 'upstream' | 'agency'
);

CREATE TABLE workflow_steps (
    id SERIAL PRIMARY KEY,
    workflow_id TEXT REFERENCES workflows(id),
    step_order INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    step_type TEXT NOT NULL,      -- 'generation' | 'quality_gate' | 'refinement' | 'user_input'
    building_block_id TEXT REFERENCES building_blocks(id),
    quality_gate_id TEXT REFERENCES quality_gates(id),
    is_optional BOOLEAN DEFAULT false,
    trust_level TEXT,             -- 'high' | 'medium' | 'low'
    user_action_after TEXT,       -- guidance for the human after this step
    UNIQUE(workflow_id, step_order)
);

CREATE TABLE step_outputs (
    from_step_id INTEGER REFERENCES workflow_steps(id),
    to_step_id INTEGER REFERENCES workflow_steps(id),
    PRIMARY KEY (from_step_id, to_step_id)
);

-- Variables for templates
CREATE TABLE template_variables (
    id SERIAL PRIMARY KEY,
    parent_type TEXT NOT NULL,    -- 'building_block' | 'quality_gate'
    parent_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    var_type TEXT DEFAULT 'text', -- 'text' | 'long_text' | 'select' | 'number'
    is_required BOOLEAN DEFAULT true,
    default_value TEXT,
    examples TEXT[]
);

-- Skill adaptations
CREATE TABLE skill_adaptations (
    id SERIAL PRIMARY KEY,
    parent_type TEXT NOT NULL,    -- 'building_block' | 'quality_gate' | 'workflow'
    parent_id TEXT NOT NULL,
    skill_level TEXT NOT NULL,   -- 'beginner' | 'intermediate' | 'advanced'
    notes TEXT,
    prompt_modification TEXT,
    recommended_steps INTEGER[], -- for workflow adaptations
    skip_steps INTEGER[]         -- for workflow adaptations
);

-- Tagging / categorisation
CREATE TABLE entity_domains (
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    domain_id TEXT NOT NULL,
    PRIMARY KEY (entity_type, entity_id, domain_id)
);

CREATE TABLE entity_compliance (
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    framework_id TEXT NOT NULL,
    PRIMARY KEY (entity_type, entity_id, framework_id)
);
```

---

## 7. Seed Data: Initial Building Blocks

These are the foundational building blocks to populate first. Each would follow the full JSON schema from section 2.1.

### Role Definitions
| ID | Name | Domain | Description |
|---|---|---|---|
| BB-ROLE-001 | Senior Policy Analyst | Policy | EL1-level policy analyst with machinery-of-government knowledge |
| BB-ROLE-002 | Program Delivery Officer | Program | APS 6 program officer focused on implementation and operations |
| BB-ROLE-003 | Comms Adviser | Stakeholder | EL1 communications adviser skilled in plain language and stakeholder messaging |
| BB-ROLE-004 | Data Analyst | Data | APS 6-EL1 data analyst familiar with government reporting requirements |
| BB-ROLE-005 | Compliance Reviewer | Compliance | EL1-EL2 governance officer with PSPF, PGPA, and Privacy Act expertise |
| BB-ROLE-006 | Sceptical Senior Executive | Cross-domain | Deputy Secretary / FAS red-teaming any piece of work |

### Quality Gates
| ID | Name | Gate Type | Severity | Description |
|---|---|---|---|---|
| QG-TRUST-001 | Claim Verification | Factual Accuracy | Required | Extracts and categorises all factual claims |
| QG-CHALLENGE-001 | Red-Team Challenge | Challenge | Recommended | Sceptical senior executive review |
| QG-COMPLIANCE-001 | PGPA/PSPF/Privacy Check | Compliance | Required | Checks against core APS frameworks |
| QG-BIAS-001 | Balance & Perspectives | Bias & Balance | Recommended | Checks stakeholder representation and impartiality |
| QG-TONE-001 | Audience Fit | Tone & Audience | Optional | Validates tone, jargon level, and appropriateness |
| QG-COMPLETE-001 | Completeness Check | Completeness | Recommended | Verifies all requested elements are addressed |

### Priority Workflows to Build
| ID | Name | Domain | Complexity | Why Priority |
|---|---|---|---|---|
| WF-POL-001 | Briefing Note | Policy | Intermediate | Highest-volume APS document type |
| WF-POL-002 | Question Time Brief | Policy | Advanced | High-stakes, time-sensitive |
| WF-STAKE-001 | Stakeholder Analysis | Stakeholder | Intermediate | Cross-domain utility |
| WF-DATA-001 | Data Summary & Insights | Data | Intermediate | Growing demand area |
| WF-PROD-001 | Meeting Preparation | General | Beginner | Low-risk entry point for new users |
| WF-COMP-001 | Compliance Review | Compliance | Intermediate | Directly addresses trust concerns |
| WF-COMMS-001 | Plain Language Rewrite | Stakeholder | Beginner | Quick win, high impact |

---

## 8. UI/UX Considerations for the App

### Core User Flows

**Flow 1: Browse & Use a Workflow**
```
Landing → Browse by Domain → Select Workflow → Set Skill Level 
→ See Steps (filtered by skill) → Step 1: Fill Variables → 
Copy Prompt → Paste into AI Tool → Paste Response Back (optional) 
→ Step 2: ... → Complete
```

**Flow 2: Use a Building Block Standalone**
```
Landing → Building Blocks → Filter by Type → Select Block → 
Fill Variables → Copy Prompt → Use
```

**Flow 3: Compose a Custom Workflow**
```
Landing → Build Custom → Select Building Blocks → Arrange Order → 
Insert Quality Gates → Set Variables → Save as Custom Workflow
```

### Key UI Patterns

1. **Trust indicators**: Every step and output should show its trust level (green/amber/red or equivalent). Make the trust boundary impossible to miss.

2. **Progressive disclosure**: Skill level selector controls what's visible. Beginners see a clean, simple path. Advanced users see everything.

3. **Copy-to-clipboard**: Every prompt should be one click to copy, with variables already filled in where the user has provided them.

4. **"What to do next" guidance**: After each step, clear human-language guidance on what the user should do before proceeding. This is where the PGPA accountability story lives.

5. **Prompt preview with variables highlighted**: Show the full prompt with `{{variables}}` highlighted in a different colour. Users should see exactly what they're about to send.

6. **Workflow progress tracker**: Visual indicator of where you are in a multi-step workflow. Which steps are done, which are next, which are optional.

7. **Platform selector**: Toggle between Claude/ChatGPT/Copilot/GovAI Chat to see platform-adapted versions of the prompt.

---

## 9. Technical Notes for Implementation

### Prompt Template Rendering

Templates use `{{variable_name}}` syntax. Rendering is straightforward string interpolation, but consider:

- **Conditional sections**: Some prompt sections should only appear if a variable is provided. E.g., `{{#if key_documents}}<reference_documents>{{key_documents}}</reference_documents>{{/if}}`
- **Platform adaptation**: When target platform is not Claude, strip XML tags and convert to plain-text instructions. This could be a render-time transformation.
- **Chaining**: If the app captures the AI's response (paste-back or API), it should be injected as `{{previous_step_output}}` into the next step's template.

### Storage Options

For a first version, the library content could be:
- **Static JSON files** — simplest, version-controlled in Git, deployed as part of the app
- **Lightweight database** (SQLite, Supabase) — if you want user customisation, saved workflows, usage tracking
- **Markdown + frontmatter** — good middle ground, human-readable, parseable

### What to Build First (MVP)

1. **Workflow viewer** — browse workflows by domain, see steps, copy prompts
2. **Variable filling** — form that populates template variables
3. **Skill level toggle** — filters steps and adjusts guidance
4. **Trust indicators** — visual trust level on every step
5. **Building block browser** — standalone prompt library for quick use

**Defer to v2:**
- Custom workflow builder
- Paste-back-response integration
- Usage analytics
- Community contributions
- API integration (direct AI calls from the app)

---

*Document version: 0.1 — Technical Architecture*
*Created: March 2026*
*Companion to: aps-genai-prompt-library-research.md*
*Status: Ready for implementation prototyping*