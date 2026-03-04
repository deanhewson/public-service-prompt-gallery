# GenAI Prompt Library for the Australian Public Service
## Research Starting Point & Framework Design

**Purpose:** Establish a structured, reusable prompt library that brings the rigour and methodology of IT/development-grade prompt engineering into everyday APS productivity — policy development, program delivery, stakeholder engagement, data analysis, compliance, and general office work.

**Ambition:** Move APS GenAI use from ad-hoc "type a question and hope" toward disciplined, chainable, testable prompt workflows — the knowledge-work equivalent of what developers already do with structured prompting, test-driven development, and CI/CD pipelines.

---

## 1. The Problem This Solves

### The Gap Between Dev and Non-Dev GenAI Use

In software development, GenAI use has matured rapidly. Developers routinely use structured system prompts, chain-of-thought reasoning, few-shot examples, prompt chaining across API calls, and automated evaluation of outputs. The discipline has a name — prompt engineering — and a growing body of best practice.

In public service productivity, the picture is different. The APS AI Plan 2025 (released November 2025) commits to foundational AI literacy for all staff and access to tools like GovAI Chat. The DTA's staff guidance provides clear principles on *what* you can and can't do with public GenAI tools. But there's a missing layer: **structured guidance on *how* to prompt well** — how to get consistently useful outputs, how to iterate and refine, how to chain prompts for complex tasks, and how to build quality checks into the process.

This gap matters because:

- **Generic outputs waste time.** A public servant who prompts "write me a brief on X" and gets a mediocre first draft may conclude GenAI isn't useful, rather than learning to prompt more effectively.
- **Quality is inconsistent.** Without structured approaches, the same task done by two people produces wildly different results depending on their intuitive prompting skill.
- **Compliance isn't embedded.** PSPF, PGPA, Privacy Act, APS Values — these aren't afterthoughts but core constraints. Prompts should build compliance checking *into* the workflow, not leave it as a manual step.
- **Institutional knowledge doesn't accumulate.** When everyone writes their own prompts from scratch, the organisation never learns. Good approaches aren't captured, shared, or improved.

### What the APS AI Plan Says (But Doesn't Yet Deliver)

The APS AI Plan 2025 is built on three pillars: Trust, People, and Tools. It mandates foundational AI literacy training, requires agencies to appoint Chief AI Officers, and is rolling out GovAI Chat for PROTECTED-level information by April 2026. The PSPF Policy Advisory 001-2025 now explicitly allows OFFICIAL information to be used with approved GenAI tools (including Claude and ChatGPT), which removes a major blocker.

What the plan doesn't yet provide is the *how* layer — the practical methodology for getting good results. GovAI's Interactive Learning Environment offers bite-sized modules, and the APS Use Case Library captures examples, but there's no structured prompt library, no prompt chaining methodology, and no quality framework for evaluating outputs.

This project aims to fill that gap.

---

## 2. What Good Prompts Look Like

### Anatomy of a Good Prompt

Drawing from Anthropic's prompting best practices, general prompt engineering literature, and the specific needs of APS work, a good prompt has these characteristics:

**Clarity and Specificity**
The prompt defines what to do, how to do it, who the audience is, and what format the output should take. Vague prompts produce vague outputs. Instead of "summarise this report," a good prompt specifies the audience (e.g., "for an SES Band 1 who has 5 minutes"), the format (e.g., "3 paragraphs, no bullet points"), and what matters (e.g., "focus on budget implications and implementation risks").

**Context and Role**
Providing relevant context — the type of document, the policy area, the decision it supports — dramatically improves output quality. Role assignment (e.g., "You are an experienced APS policy analyst") focuses the model's behaviour and tone. In APS work, this means specifying not just *what* you want but *why* — "this briefing note will go to the Minister's office as part of Question Time preparation" produces fundamentally different output than "summarise this policy area."

**Constraints and Guardrails**
Good prompts include what to avoid, not just what to include. For APS work, this means specifying: security classification boundaries, whether the output should be suitable for external audiences, whether it should reflect settled government policy or explore options, and whether it needs to account for specific legislative frameworks.

**Structure via XML Tags or Clear Sections**
Claude and other models respond well to structured prompts that separate instructions, context, input data, and output format. Anthropic's best practice recommends wrapping different types of content in descriptive tags (e.g., `<context>`, `<instructions>`, `<input>`) to reduce ambiguity. This is especially valuable for complex APS tasks where you're providing background documents alongside instructions.

**Examples (Few-Shot Prompting)**
Showing the model 2-3 examples of the desired output is one of the most reliable ways to steer quality. For APS work, this means maintaining example outputs (e.g., a well-written briefing note intro, a good stakeholder analysis table) that can be included in prompts as templates.

### What Makes APS Prompts Different

APS prompts need to account for considerations that don't arise in general productivity or dev contexts:

- **Accountability:** Under the PGPA Act, officials are accountable for advice and decisions. GenAI-assisted work must still be "owned" by the officer. Prompts should produce outputs that the officer can genuinely review, understand, and stand behind — not black-box outputs that are rubber-stamped.
- **Security classification:** The PSPF Policy Advisory allows OFFICIAL information with approved tools, but not OFFICIAL: Sensitive or above. Prompts need to be designed with classification awareness — both in what you input and what the model might infer or generate.
- **Impartiality and APS Values:** Outputs must reflect the APS Values (impartial, committed to service, accountable, respectful, ethical). Prompts for policy work should explicitly request balanced analysis, not advocacy.
- **Ministerial and parliamentary context:** Much APS work ultimately serves Ministers, parliamentary processes, or public accountability. The conventions, formats, and sensitivities of this context need to be embedded in prompts.
- **First Nations considerations:** The DTA guidance explicitly flags that GenAI should not be used to generate content based on Indigenous cultural material. Prompts should include appropriate exclusions.

---

## 3. Prompt Chaining: From Single Prompts to Workflows

### The Core Idea

Prompt chaining means breaking a complex task into a sequence of smaller prompts, where the output of one becomes the input (or context) for the next. This is standard practice in software development with LLMs — a developer might chain: extract requirements → generate code → write tests → review for bugs. The same principle applies to knowledge work.

Instead of asking GenAI to "write a briefing note on aged care reform," a chained workflow might look like:

1. **Research & Scope** → "Identify the 5 key issues in [topic area] that would be relevant to [agency/portfolio]. List each with a one-sentence summary."
2. **Structure** → "Given these issues, propose a structure for a 2-page briefing note for [audience]. Include recommended headings and what each section should cover."
3. **Draft** → "Using this structure, draft the briefing note. Use formal APS tone. Each paragraph should be no more than 4 sentences."
4. **Red-Team / Challenge** → "Review this draft as if you were a sceptical senior adviser. Identify: (a) claims that need stronger evidence, (b) perspectives that are missing, (c) any political sensitivities not addressed, (d) compliance with [relevant framework]."
5. **Refine** → "Revise the draft to address these issues. Maintain the same structure and length."
6. **Compliance Check** → "Review this final draft against [PGPA Act requirements / PSPF guidance / specific policy framework]. Flag any areas of concern."

Each step is a separate prompt. Each produces an inspectable output. The officer can intervene, redirect, or override at any stage. This is fundamentally different from a single massive prompt — it's transparent, controllable, and produces higher-quality results.

### Types of Prompt Chains

**Sequential Chains**
Each step feeds into the next in a linear sequence. Best for tasks with a natural order: research → analyse → draft → review → finalise.

**Branching Chains**
The output of one step determines which of several follow-up paths to take. E.g., a compliance check might branch into "compliant — proceed to finalise" or "issues found — loop back to revision."

**Iterative / Self-Correction Chains**
Generate a draft → have the model critique its own output against criteria → revise based on the critique. This can run multiple loops. Anthropic's own best practice recommends this as the most common and useful chaining pattern.

**Parallel Chains**
Run multiple independent analyses and then synthesise. E.g., analyse a policy proposal from an economic perspective, a social impact perspective, and a legal perspective, then bring the three together.

### Quality Gates: The "Unit Test" Equivalent

In software development, you don't ship code without tests. The same principle should apply to GenAI-assisted knowledge work. After any substantive generation step, a verification prompt should follow. These "quality gates" can check for:

- **Factual accuracy:** "List every specific claim or statistic in this draft. For each, note whether it's verifiable, requires a citation, or is an inference."
- **Completeness:** "Given the original brief, what aspects were requested that this draft doesn't adequately address?"
- **Bias and balance:** "Does this analysis present multiple perspectives fairly? Are there stakeholder groups whose views are absent?"
- **Compliance:** "Does this output comply with [specific framework]? Flag any gaps."
- **Tone and audience fit:** "Is this written at the appropriate level for [specific audience]? Flag any jargon, inappropriate informality, or condescension."

---

## 4. Proposed Prompt Architecture

### How to Structure the Library

The library should be organised around **workflows** (linked sequences of prompts for end-to-end tasks) rather than standalone prompts. Each workflow contains individual prompts, but the value is in the sequence, the quality gates, and the relationships between steps.

### Proposed Structure

```
PROMPT LIBRARY
│
├── WORKFLOWS (end-to-end task sequences)
│   ├── Policy Development
│   │   ├── Briefing Note Workflow
│   │   ├── Policy Options Paper Workflow
│   │   ├── Regulatory Impact Assessment Workflow
│   │   ├── International Comparison Workflow
│   │   └── Question Time Brief Workflow
│   │
│   ├── Program Delivery & Operations
│   │   ├── Program Logic / Theory of Change Workflow
│   │   ├── Grant Assessment Support Workflow
│   │   ├── Process Improvement Analysis Workflow
│   │   ├── Risk Assessment Workflow
│   │   └── Incident / Issue Summary Workflow
│   │
│   ├── Stakeholder Engagement & Communications
│   │   ├── Stakeholder Analysis Workflow
│   │   ├── Consultation Summary Workflow
│   │   ├── Communications Plan Workflow
│   │   ├── Plain Language Rewrite Workflow
│   │   └── Ministerial Correspondence Workflow
│   │
│   ├── Data Analysis & Evaluation
│   │   ├── Data Exploration & Summary Workflow
│   │   ├── Evaluation Framework Design Workflow
│   │   ├── Survey Analysis Workflow
│   │   ├── Performance Reporting Workflow
│   │   └── Literature / Evidence Review Workflow
│   │
│   ├── Compliance & Governance
│   │   ├── PSPF Compliance Check Workflow
│   │   ├── PGPA Act Alignment Workflow
│   │   ├── Privacy Impact Assessment Support Workflow
│   │   ├── AI Ethics Principles Assessment Workflow
│   │   └── Internal Policy Compliance Review Workflow
│   │
│   └── General Productivity
│       ├── Meeting Preparation & Summary Workflow
│       ├── Email Drafting Workflow (internal / external / ministerial)
│       ├── Document Review & Feedback Workflow
│       ├── Agenda & Action Item Workflow
│       └── Onboarding Knowledge Transfer Workflow
│
├── BUILDING BLOCKS (reusable single prompts)
│   ├── Role Definitions (APS-specific personas)
│   ├── Output Format Templates
│   ├── Quality Gate Prompts (verification / challenge)
│   ├── Compliance Check Prompts
│   └── Context-Setting Prompts
│
├── PROMPT METADATA SCHEMA
│   (See Section 5 below)
│
└── GOVERNANCE
    ├── Version Control Approach
    ├── Review & Update Cycle
    ├── Contribution Guidelines
    └── Quality Criteria for New Prompts
```

### Composability: Building Blocks + Workflows

The power of this architecture is composability. A "Quality Gate: Bias and Balance Check" prompt is a building block that can be inserted into *any* workflow. A "Role Definition: Senior Policy Analyst" prompt can be prepended to any policy-related task. This means:

- New workflows can be assembled quickly from proven building blocks.
- Improvements to a building block (e.g., a better compliance check prompt) automatically improve every workflow that uses it.
- Users can start with building blocks (simpler) and graduate to full workflows (more powerful) as their confidence grows.

---

## 5. Prompt Metadata Schema

Every prompt and workflow in the library should carry structured metadata to make it searchable, assessable, and maintainable.

### Proposed Fields

| Field | Description | Example |
|---|---|---|
| **ID** | Unique identifier | `WF-POL-001` |
| **Name** | Human-readable name | Briefing Note Workflow |
| **Domain** | Primary work domain | Policy Development |
| **Task Type** | What it produces | Briefing note, analysis, correspondence |
| **APS Level** | Typical user level | APS 5-6, EL1, EL2, SES |
| **Complexity** | Beginner / Intermediate / Advanced | Intermediate |
| **Chain Position** | Where in a workflow (if applicable) | Step 3 of 6 |
| **Inputs Required** | What the user needs to provide | Topic, audience, key documents |
| **Output Format** | What it produces | Structured prose, table, list |
| **Quality Gates** | Which verification prompts follow | Factual check, bias check, compliance |
| **Compliance Frameworks** | Relevant frameworks | PGPA Act, PSPF, Privacy Act |
| **Security Considerations** | Classification constraints | Suitable for OFFICIAL only |
| **Known Limitations** | What this prompt doesn't do well | Cannot verify current statistics |
| **Version** | Current version | v1.2 |
| **Last Reviewed** | Date of last review | 2026-03-01 |
| **Contributed By** | Team/agency (optional) | Policy Branch, Dept of X |

---

## 6. Example Workflow: Briefing Note

To illustrate the architecture in practice, here's a worked example.

### Workflow: `WF-POL-001 — Briefing Note`

**Purpose:** Produce a draft briefing note on a policy topic for senior executive review.
**Typical user:** APS 6 – EL1 policy officer.
**Total steps:** 6 (plus optional extras).

---

**Step 1: Scope & Research (Building Block: Research Prompt)**

```
<role>You are an experienced Australian Public Service policy analyst 
at the EL1 level, working in [agency/portfolio].</role>

<context>I need to prepare a briefing note on [TOPIC] for [AUDIENCE, 
e.g., First Assistant Secretary / Deputy Secretary]. The brief will 
be used for [PURPOSE, e.g., a meeting with stakeholders / Senate 
Estimates preparation / internal decision-making].</context>

<instructions>
Identify the key issues related to [TOPIC] that would be most relevant 
to [AGENCY/PORTFOLIO]. For each issue:
1. Provide a one-sentence summary
2. Note why it matters to this portfolio
3. Flag any recent developments (if you're aware of them — note that 
   I will need to verify currency)

Limit to the 5-7 most important issues. Do not include any information 
that would be classified above OFFICIAL.
</instructions>

<output_format>Numbered list with sub-points. Keep each issue to 
3-4 sentences maximum.</output_format>
```

---

**Step 2: Structure (Building Block: Structure Prompt)**

```
<context>Based on the issues identified above, I need to structure a 
briefing note of approximately [LENGTH, e.g., 2 pages]. 

The audience is [AUDIENCE] and the purpose is [PURPOSE].</context>

<instructions>
Propose a structure for the briefing note. Use standard APS briefing 
note conventions:
- Recommendation/Action Required (if applicable)
- Key Points (3-5 dot points)
- Background
- Analysis / Current Status
- Options or Considerations (if applicable)
- Next Steps
- Attachments (list what would be useful to attach)

For each section, provide a 1-sentence note on what it should cover 
given the specific topic and audience.
</instructions>
```

---

**Step 3: Draft (Building Block: Generation Prompt)**

```
<role>You are drafting a formal APS briefing note. Use professional, 
concise language appropriate for senior executive readers. Avoid jargon 
unless it is standard terminology in this policy area.</role>

<instructions>
Using the structure above, draft the full briefing note. 

Requirements:
- Each paragraph should be no more than 4 sentences
- Use active voice where possible
- Key Points should be actionable and specific, not vague summaries
- The Recommendation should be clear and implementable
- Flag any claims that would require verification with [source] 
  by marking them as [VERIFY]
- Do not fabricate statistics, dates, or specific program details — 
  use [INSERT DATA] placeholders where specific data is needed
- Maintain impartiality consistent with APS Values
</instructions>
```

---

**Step 4: Red-Team / Challenge (Quality Gate)**

```
<role>You are a sceptical, experienced Deputy Secretary reviewing 
this briefing note before it goes to the Secretary.</role>

<instructions>
Review the draft briefing note and identify:

1. EVIDENCE GAPS: Claims that need stronger evidence or citation
2. MISSING PERSPECTIVES: Stakeholder groups, states/territories, 
   or viewpoints not adequately represented
3. POLITICAL SENSITIVITY: Issues that could be sensitive in a 
   parliamentary, media, or public context
4. LOGICAL WEAKNESSES: Arguments that don't follow, or conclusions 
   not supported by the analysis
5. COMPLIANCE: Any tension with the PGPA Act duty of care, APS Values, 
   or relevant legislative frameworks
6. PRACTICAL ISSUES: Are the recommendations actually implementable? 
   What would the delivery challenges be?

For each issue found, suggest a specific improvement.
</instructions>
```

---

**Step 5: Revise**

```
<instructions>
Revise the briefing note to address the issues identified in the 
review. Maintain the same structure and approximate length.

Where issues cannot be fully resolved without additional information, 
note them as [ACTION REQUIRED: description] for the officer to follow up.
</instructions>
```

---

**Step 6: Compliance Check (Quality Gate)**

```
<instructions>
Review the final briefing note against the following:

1. PGPA ACT: Does this advice support proper use of Commonwealth 
   resources? Are financial implications identified?
2. PSPF: Does the content stay within OFFICIAL classification? 
   Is there any information that should be handled at a higher level?
3. PRIVACY ACT: Does the brief reference or imply use of personal 
   information? If so, is this consistent with the APPs?
4. APS VALUES: Is the advice impartial? Does it serve the government 
   of the day while remaining apolitical?
5. RELEVANT PORTFOLIO LEGISLATION: [Specify if applicable]

Provide a brief compliance assessment (compliant / issues to address) 
for each item.
</instructions>
```

---

## 7. Landscape: Existing Prompt Libraries & Resources

### What Exists Today

**General-Purpose Prompt Libraries**
- **Anthropic's Official Prompt Library** (platform.claude.com): ~50+ prompts covering coding, writing, analysis. Well-structured with system/user prompt separation and XML tags. Focused on demonstrating Claude's capabilities rather than domain-specific productivity.
- **Glean Prompt Library**: Enterprise-focused, includes a Government category, but oriented toward their search product.
- **AI for Education (aiforeducation.io)**: The closest analogue to what we're building — domain-specific prompts for educators, covering lesson planning, assessment, admin tasks. Good model for structure and accessibility, though the prompts themselves are simple (no chaining or quality gates).
- **Promptly.fyi**: General prompt aggregator with save/organise features.
- **PromptX / God of Prompt**: Large-scale prompt libraries (30,000+ prompts) but breadth over depth, no workflow orientation.

**APS/Government-Specific Resources**
- **GovAI (govai.gov.au)**: The primary APS platform. Includes an Interactive Learning Environment, APS Use Case Library, and the GovAI Collaboration Space. Provides sandboxed environments and bite-sized training modules. Does not currently offer a structured prompt library or chaining methodology.
- **DTA Staff Guidance on Public Generative AI**: The authoritative "what you can and can't do" guidance. Includes helpful scenario examples (Jordan the policy analyst, Wei the security-conscious officer) but doesn't extend to prompt technique.
- **APS AI Plan 2025**: Sets the strategic direction (Trust, People, Tools pillars) and commits to foundational training, Chief AI Officers, and GovAI Chat. The capability uplift it envisions is exactly what this project could contribute to.
- **UK AI Playbook for Government**: More mature than Australia's current guidance. Covers a broader range of AI types and includes implementation guidance. Doesn't include a prompt library but provides useful framing.
- **OECD "Governing with AI" (2025)**: 200 real-world government AI use cases across 11 functions. Valuable for identifying where prompts would have most impact, but doesn't provide prompts.

### The Gap

No existing resource combines:
1. Domain-specific prompts for public service work
2. Chaining/workflow methodology
3. Built-in quality gates and verification
4. APS compliance awareness (PSPF, PGPA, Privacy, APS Values)
5. Metadata and governance for organisational scaling

This is the gap this project fills.

---

## 8. Trust Boundaries & Skill-Level Adaptation

### The Trust Problem

One of the biggest pain points in APS GenAI use is *not knowing how much to trust the output*. A well-formatted briefing note from Claude can look just as polished whether the underlying facts are real or hallucinated. This creates two failure modes: over-trust (rubber-stamping AI output without verification) and under-trust (rejecting GenAI entirely after one bad result).

The library addresses this by making trust boundaries explicit at every step:

- **High trust** tasks (structuring, formatting, brainstorming, summarising content you provided) — use with light review
- **Medium trust** tasks (drafting prose, stakeholder analysis, identifying issues) — use as a starting point, verify key claims
- **Low trust** outputs (specific statistics, legislative references, current events, program details) — always independently verify

Every workflow step carries a trust level that tells the user how much to rely on the output and what verification effort is appropriate. Quality gates are mapped to trust levels — low-trust outputs require the Claim Verification Gate; high-trust outputs may only need a Tone & Audience check.

### Skill-Level Adaptation

The same workflow should serve different users differently. A senior EL2 policy expert who's new to GenAI needs different support than an APS 5 who's been experimenting with Claude for months.

Skill level has two independent axes:
1. **GenAI skill** — comfort with prompting, chaining, and evaluating AI outputs
2. **Domain skill** — depth of subject matter expertise

This produces four profiles, each with different risks and opportunities:
- **High domain, low GenAI**: Expert practitioner who may over-trust plausible output or reject AI after one poor result. Support the prompting mechanics; trust their domain judgement.
- **Low domain, low GenAI**: Junior officer who may trust AI as authoritative. Maximum guardrails and verification emphasis.
- **Low domain, high GenAI**: Technically savvy but may miss domain nuance. Extra compliance and domain-specific quality gates.
- **High domain, high GenAI**: Potential workflow contributor and mentor. Risk of automation bias over time.

The library uses progressive disclosure: beginners see simplified workflows with fewer steps; intermediate users see the full workflow; advanced users see parallel chains and customisation options. See the **Technical Architecture document** for the detailed adaptation model, JSON schemas, and implementation guidance.

---

## 9. Design Principles

Based on the research, the following principles should guide the library's development:

1. **Workflows over standalone prompts.** Individual prompts are useful, but the real value is in connected sequences with quality gates. This is what bridges the gap between casual GenAI use and development-grade rigour.

2. **Compliance by design.** PSPF, PGPA, Privacy, and APS Values checks should be woven into workflows as standard steps, not optional add-ons. This builds trust and makes responsible use the path of least resistance.

3. **Progressive complexity.** Structure the library so beginners can start with simple building blocks and gradually adopt full workflows. The DTA's learner segmentation (Beginners through to Advanced) should inform this tiering.

4. **Composable and modular.** Building blocks (role definitions, quality gates, format templates) should be reusable across workflows. This reduces maintenance burden and enables rapid assembly of new workflows.

5. **Living documentation.** Prompts degrade as models change. The library needs version control, review cycles, and usage feedback to stay current. Treat it like code — not like a static document.

6. **Show, don't just tell.** Each workflow should include at least one worked example with realistic APS content (using fictitious but plausible scenarios). People learn from examples more than instructions.

7. **Transparent about limitations.** Every prompt should note what it can't do (e.g., "cannot verify current statistics," "may not reflect recent legislative changes"). This supports the PGPA duty to provide reliable advice.

8. **Platform-agnostic but Claude-optimised.** The prompts should work across approved tools (Claude, ChatGPT, Copilot, GovAI Chat) but can use Claude-specific features (XML tags, extended thinking) where they add value, with notes on adaptation.

---

## 10. Open Questions & Next Steps

### Questions to Resolve

- **Hosting and distribution:** Should this live on GovAI, an internal agency platform, or start as a standalone resource? GovAI's Collaboration Space could be a natural home.
- **Classification of the library itself:** The prompts and workflows are UNCLASSIFIED, but worked examples might approach OFFICIAL. Need to design examples that are realistic without crossing classification boundaries.
- **Agency customisation:** Different agencies have different policy frameworks, internal styles, and compliance obligations. How much of the library should be universal vs. agency-customisable?
- **Feedback and iteration:** How do we capture what works? Usage analytics, user ratings, contribution workflows?
- **Integration with GovAI Chat:** When GovAI Chat launches (April 2026 trial), could workflows be embedded as templates or system prompts within the tool itself?
- **Measuring impact:** How do we demonstrate that structured prompting improves output quality, not just speed? Could we design a simple before/after evaluation?

### Proposed Next Steps

1. **Select 3-5 priority workflows** to develop fully (with all steps, quality gates, worked examples, and metadata).
2. **Test with real users** — identify 5-10 APS officers across levels (APS 5 through EL2) to trial the workflows on actual tasks and provide feedback.
3. **Develop the building blocks library** — role definitions, quality gates, format templates that can be shared across workflows.
4. **Draft governance model** — version control, review cycle, contribution process.
5. **Engage with GovAI team** — explore integration opportunities with the platform and alignment with the APS AI Plan capability uplift objectives.

---

## 11. Reference Materials

### APS Frameworks & Guidance
- APS AI Plan 2025 — digital.gov.au/policy/ai/australian-public-service-ai-plan-2025
- DTA Staff Guidance on Public Generative AI — digital.gov.au/policy/ai/staff-guidance-public-generative-ai
- DTA Agency Guidance on Public Generative AI — digital.gov.au/policy/ai/agency-guidance-public-generative-ai
- PSPF Policy Advisory 001-2025 on OFFICIAL Information Use with Generative AI — protectivesecurity.gov.au
- Policy for Responsible Use of AI in Government — architecture.digital.gov.au/policy/responsible-use-of-ai-in-government
- GovAI Platform — govai.gov.au
- AI Impact Assessment Tool — digital.gov.au/ai/impact-assessment-tool

### Prompt Engineering Resources
- Anthropic Prompting Best Practices — platform.claude.com/docs/en/build-with-claude/prompt-engineering
- Anthropic Prompt Library — platform.claude.com/docs/en/resources/prompt-library/library
- Prompt Engineering Guide (DAIR.AI) — promptingguide.ai (includes prompt chaining techniques)

### International Comparators
- UK AI Playbook for Government — gov.uk/government/publications/ai-playbook-for-the-uk-government
- OECD "Governing with AI" (2025) — oecd.org/en/publications/2025/06/governing-with-artificial-intelligence
- UK Civil Service Copilot Trial Results (2025)
- Hoover Institution Survey on US Public Sector GenAI Use (2024)

### Prompt Library Design
- Manchester Digital: "10 Key Elements of a Prompt Library for Enterprise Tasks"
- Amit Kothari: "The Prompt Library That Changed Our Productivity" (prompt management at scale)

---

*Document version: 0.1 — Research Starting Point*
*Created: March 2026*
*Status: Draft for discussion*
*Next review: [TBD after initial feedback]*