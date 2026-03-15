# APS GenAI Prompt Library — Evaluation, Benchmarking & Self-Improvement
## Automated Quality Assurance for a Public Service Prompt Gallery

**Purpose:** Design the evaluation infrastructure that takes the Public Service Prompt Gallery from "trust me, these prompts are good" to "here's the evidence they're good, and here's how they get better." This document covers the full stack: from judging individual prompt outputs against APS-specific criteria, to CI/CD-integrated test harnesses, to the realistic near-term potential of AI systems that hypothesise and test their own improvements.

**Audience:** The maintainer of this project — a senior APS officer with software development literacy but not a specialist ML engineer.

**Companion documents:**
- `aps-genai-prompt-library-research-1.md` — Problem framing, prompt architecture, design principles
- `aps-genai-prompt-library-architecture.md` — Data schemas, component relationships, seed content

---

## 1. The Problem: Why Prompt Quality Is Hard to Automate

### Not Like Testing Code

Software tests have a fundamental advantage: for most cases, there is a deterministic correct answer. A function either returns `42` or it doesn't. A CSS rule either renders the button blue or it doesn't. You can write assertions that are binary — pass or fail — and trust them.

Evaluating whether a prompt produces *good* output for APS knowledge work has none of these properties:

- **Outputs are long-form prose.** A briefing note draft is 500+ words of interconnected argument. There's no single "correct" output — there are many acceptable outputs that differ in emphasis, structure, and phrasing while being equally good.
- **Quality is partially subjective.** Whether a briefing note "sounds right" for its audience involves judgements about tone, register, and political sensitivity that reasonable people disagree on. An EL2 in PM&C and an EL2 in DSS might have different views on what constitutes appropriate directness.
- **Compliance is domain-specific.** Checking whether a draft respects PGPA Act obligations or PSPF classification boundaries requires understanding what those frameworks actually demand — not just pattern matching keywords.
- **"Correct" outputs don't have a single ground truth.** A briefing note on NDIS participant satisfaction could legitimately emphasise cost pressures, service quality, workforce issues, or participant experience — all correct, all incomplete, all appropriate depending on context.
- **The same prompt behaves differently over time.** Model updates, temperature settings, and even the time of day can shift outputs. A prompt that produces excellent briefing notes in March may drift by June.

This rules out simple diff/similarity approaches. You can't compare a generated briefing note to a "golden answer" using BLEU or ROUGE scores — these metrics measure surface-level textual overlap and would rate a paraphrase of a good brief as "wrong." Semantic similarity gets closer, but still can't distinguish "correct but differently structured" from "plausible but factually wrong."

### The Specific APS Challenge

Beyond the general difficulty of evaluating long-form prose, APS prompts carry domain-specific evaluation challenges:

**Convention adherence varies by agency.** A "standard" briefing note structure exists in theory (Recommendation → Key Points → Background → Analysis → Next Steps) but every agency has its own template, its own conventions for how much context to include, and its own preferences for passive vs. active voice.

**Compliance isn't binary.** A brief doesn't simply "comply" or "not comply" with the PGPA Act. Compliance exists on a spectrum — from "actively misleading about resource implications" (clearly non-compliant) through "doesn't mention resource implications" (potentially non-compliant depending on context) to "thoroughly addresses resource implications" (compliant). An automated evaluator needs to handle this nuance.

**Political sensitivity is invisible to models.** A factually correct statement about a government program might be politically sensitive if it contradicts the Minister's recent public position. No rubric can fully capture this — it requires domain knowledge that changes week to week.

**The trust boundary problem.** The prompt library's entire value proposition rests on making trust boundaries explicit. But how do you evaluate whether a quality gate *correctly categorises* claims as VERIFIABLE vs. POTENTIALLY FABRICATED? The evaluator needs to make the same judgement the quality gate is supposed to help the user make — it's turtles all the way down.

### What This Means for Automation

These challenges don't make automation impossible — they make it necessary to be honest about what automation can and can't do:

| What automation can do well | What automation does poorly | What requires humans |
|---|---|---|
| Check structural conformance (headings, length, format) | Assess political sensitivity | Validate domain-specific accuracy |
| Detect fabricated statistics (flag suspicious specificity) | Judge whether tone matches a specific audience | Determine whether advice is fit for ministerial context |
| Verify prompt template syntax and variable interpolation | Evaluate completeness for a novel policy area | Final compliance sign-off |
| Run consistency checks across model versions | Assess impartiality on contested policy topics | Decide whether a new workflow meets quality bar |
| Score outputs against rubric dimensions | Detect subtle classification boundary issues | Arbitrate edge cases in rubric interpretation |

The architecture proposed in this document is designed around this reality: automate everything that can be reliably automated, surface everything else for efficient human review, and never pretend the automation is more reliable than it is.

---

## 2. The Evaluation Landscape

### A Map of the Territory

The tools and frameworks relevant to prompt library evaluation fall into three categories with different maturity levels. Understanding where each sits — and which parts are stable enough to build on — is essential.

### 2.1 Evaluation Frameworks (Mature — Ready to Use)

These are the test harnesses: tools that run prompts against test cases and score the results.

**Promptfoo** is the strongest fit for this project. It's an open-source CLI tool (MIT licence, 9,000+ GitHub stars) that treats prompt evaluation like unit testing. You define test cases in YAML, specify providers (Claude, ChatGPT, any OpenAI-compatible API), set assertions, and run them from the command line or CI/CD. Key properties:

- Declarative YAML configuration — no heavy SDK required
- Native GitHub Actions integration with quality gates
- Supports LLM-as-Judge assertions out of the box
- Runs locally — no data leaves your machine
- Model-agnostic: works with Claude, GPT, Ollama, and custom APIs
- Built-in red-teaming and security scanning capabilities

For the Gallery, Promptfoo would serve as the test runner — executing prompts against golden test inputs and evaluating outputs against rubric-based assertions.

**DeepEval** is a Python-first framework (also open-source) that functions like pytest for LLMs. It offers 14+ built-in metrics including G-Eval (custom criteria via LLM judge), faithfulness, hallucination detection, and bias checking. Its strengths are the research-backed metric implementations and the ability to define custom G-Eval metrics in natural language. It integrates with CI/CD pipelines and supports structured rubrics with score ranges.

**LangSmith** (by LangChain) provides tracing, evaluation, and prompt versioning. It's powerful for debugging complex multi-step workflows but is tightly coupled to the LangChain ecosystem. For a static prompt library that doesn't use LangChain, it adds unnecessary overhead. Mention it here for completeness — it's the right tool if the Gallery ever evolves into an API-driven service, but not for the current architecture.

**Recommendation for this project:** Start with Promptfoo. It's the simplest to integrate with the existing Astro/GitHub/Netlify stack, runs in CI via GitHub Actions, and its YAML-based test cases can live alongside the JSON prompt data in the repository.

### 2.2 LLM-as-Judge Methodology (Mature Methodology — Implementation Requires Care)

LLM-as-Judge is the technique of using a capable LLM (typically GPT-4-class or Claude Sonnet/Opus) to evaluate the output of another LLM. It's now the dominant approach for evaluating open-ended text generation, with research showing 80-90% agreement with human evaluators when rubrics are well-designed.

**G-Eval** (Liu et al., 2023) is the most cited framework. Its three-step process works as follows: the evaluation criterion is decomposed into chain-of-thought evaluation steps; these steps guide the judge LLM's assessment of the output; and token-level log probabilities normalise the final score. G-Eval is implemented natively in both DeepEval and Promptfoo.

**Key design choices for LLM-as-Judge:**

*Pointwise vs. Pairwise scoring.* Pointwise scoring rates a single output on a rubric (1-5 scale). Pairwise scoring compares two outputs and picks the better one. For the Gallery, pointwise scoring is the right default — we're evaluating whether a prompt meets quality criteria, not choosing between two competing prompts. Pairwise becomes useful during optimisation (comparing a modified prompt against the current version).

*Rubric design matters more than model choice.* Research consistently finds that evaluation quality is more sensitive to rubric specificity than to which judge model is used. A vague criterion like "Is this output good?" produces noisy scores regardless of whether GPT-4 or Claude Opus does the judging. A specific criterion like "Does the Key Points section contain 3-5 actionable dot points, each under 25 words, that a Deputy Secretary could scan in 30 seconds?" produces consistent, useful scores.

*Known biases.* LLM judges exhibit several documented biases: verbosity bias (preferring longer outputs), self-preference bias (rating their own model's outputs higher), position bias (in pairwise comparisons, preferring whichever output is presented first), and authority bias (rating outputs higher when told they come from a "senior" source). Mitigations include randomising presentation order, using rubrics that penalise unnecessary length, and running multiple evaluations with different judge models.

**Maturity assessment:** The methodology is well-established and production-ready. The research is solid, the tooling exists, and the known biases are manageable. The hard part isn't the technique — it's designing rubrics specific enough to be useful for APS work.

### 2.3 Automated Prompt Optimisation (Emerging — Handle with Care)

These tools attempt to automatically improve prompts by testing variations against evaluation metrics.

**DSPy** (Stanford NLP) is the most mature framework in this space. It treats prompts as programs with tuneable parameters — instructions, few-shot examples, chain-of-thought strategies — and uses optimisers to find combinations that maximise a metric. Key optimisers include:

- **MIPROv2**: Uses Bayesian optimisation to search over instruction/demonstration combinations. Requires 50+ training examples for meaningful results.
- **BootstrapFewShot**: Automatically selects few-shot examples from a training set. Works with as few as 10 examples.
- **COPRO**: Generates and refines instructions via coordinate ascent (hill-climbing).
- **GEPA** (newest, July 2025): Uses reflective analysis of program trajectories — examining what worked and what didn't to propose improvements. Can leverage domain-specific textual feedback.

**TextGrad** treats LLM outputs as differentiable and uses textual "gradients" (natural language feedback) to optimise prompts. Conceptually elegant but less practical than DSPy for the Gallery's use case — it's designed for optimising individual prompts in isolation, not multi-step workflows.

**Maturity assessment:** DSPy is production-ready for narrow, well-defined tasks with clear metrics (classification, extraction, Q&A). For long-form generation tasks like briefing notes — where "quality" is multidimensional and partially subjective — it's experimental. The optimiser needs a metric function, and if that metric doesn't capture what "good" actually means, the optimiser will dutifully produce prompts that score well on a bad metric. For the Gallery, DSPy is a Phase 3+ consideration, not a starting point.

---

## 3. A Proposed Layered Architecture for the Gallery

### Overview

The evaluation system has five layers, each building on the one below. Think of it like the testing pyramid in software development: fast, cheap checks at the bottom; slow, expensive checks at the top.

```
┌─────────────────────────────────────────────────────┐
│  LAYER 5: HUMAN GOVERNANCE GATE                     │
│  Domain experts review flagged items                 │
│  Final approval for library changes                  │
│  Frequency: per contribution / quarterly review      │
├─────────────────────────────────────────────────────┤
│  LAYER 4: SELF-IMPROVEMENT / OPTIMISATION            │
│  AI proposes prompt modifications                    │
│  Tests against rubric automatically                  │
│  Surfaces candidates for human review                │
│  Frequency: on-demand / scheduled                    │
├─────────────────────────────────────────────────────┤
│  LAYER 3: AUTOMATED TEST HARNESS (CI/CD)             │
│  Runs on every PR / scheduled nightly                │
│  Executes golden dataset against prompts             │
│  Gates merges on regression                          │
│  Frequency: per commit / nightly                     │
├─────────────────────────────────────────────────────┤
│  LAYER 2: APS-SPECIFIC LLM JUDGE RUBRICS             │
│  Rubric definitions per workflow and block type      │
│  LLM-as-Judge scoring with APS criteria              │
│  Calibrated against human-labelled examples          │
│  Frequency: invoked by Layer 3                       │
├─────────────────────────────────────────────────────┤
│  LAYER 1: GOLDEN DATASET                             │
│  Seed inputs (topics, audiences, contexts)           │
│  Reference outputs (human-approved examples)         │
│  Expected quality ranges (not exact matches)         │
│  Frequency: curated, versioned, grows over time      │
└─────────────────────────────────────────────────────┘
```

### Layer 1: Golden Dataset

**What it does:** Provides the test fixtures — the inputs, contexts, and reference outputs that all other layers run against. Without this, everything else is untethered.

**What it contains:**

```json
{
  "golden_test_case": {
    "id": "GT-POL-001-01",
    "workflow_id": "WF-POL-001",
    "step_order": 1,
    "name": "Briefing Note — Scope & Research — Aged Care Reform",
    
    "inputs": {
      "topic": "Aged care workforce shortages and their impact on service quality",
      "audience": "First Assistant Secretary, Ageing and Aged Care Group",
      "purpose": "Internal decision brief ahead of stakeholder roundtable",
      "agency": "Department of Health and Aged Care",
      "policy_area": "aged care reform"
    },
    
    "reference_output": {
      "text": "...[human-approved example output]...",
      "quality_tier": "good",
      "notes": "This reference was produced by an EL1 policy officer and reviewed by an EL2. It represents a 'good' output — not perfect, but the quality level we'd want the prompt to consistently produce."
    },
    
    "expected_quality_range": {
      "structural_conformance": { "min": 0.7, "target": 0.85 },
      "aps_tone_register": { "min": 0.7, "target": 0.85 },
      "claim_specificity": { "min": 0.6, "target": 0.8 },
      "impartiality": { "min": 0.8, "target": 0.95 },
      "compliance_awareness": { "min": 0.7, "target": 0.85 }
    },
    
    "known_low_trust_elements": [
      "Any specific statistics on workforce numbers",
      "Named individuals in leadership positions",
      "Specific funding amounts or program dates"
    ],
    
    "classification": "unclassified",
    "last_reviewed": "2026-03-01",
    "contributed_by": "Seed dataset — project maintainer"
  }
}
```

**What it requires to build:**
- 3-5 golden test cases per workflow step (so ~20-35 per 7-step workflow)
- Human-authored or human-reviewed reference outputs for each
- Explicit quality ranges, not exact-match expectations
- Realistic but fictitious scenarios (avoiding real classified content)

**Effort estimate:** 2-4 hours per workflow to create initial golden test cases. The Briefing Note workflow (WF-POL-001) has 7 steps, so expect ~15 hours for the first fully-tested workflow.

**Limitations:**
- Golden datasets encode the maintainer's judgement about quality — they're only as good as the examples
- Requires periodic refresh as prompts, models, and APS conventions evolve
- Small initial datasets may not cover edge cases

**How it connects:** Layer 3 (test harness) feeds golden inputs into prompts and passes outputs to Layer 2 (rubrics) for scoring. Layer 4 (optimisation) uses the golden dataset as its training/validation set.

### Layer 2: APS-Specific LLM Judge Rubrics

**What it does:** Defines the scoring criteria that LLM judges use to evaluate prompt outputs. This is the layer that encodes "what good looks like" for APS work — and it's the hardest layer to get right.

**Structure:** Each rubric is a JSON document that maps to a specific workflow step type or building block type. Rubrics are composed from universal APS dimensions (applicable to everything) and workflow-specific dimensions (applicable to a particular document type).

```json
{
  "rubric": {
    "id": "RB-POL-BN-001",
    "name": "Briefing Note Output Rubric",
    "workflow_id": "WF-POL-001",
    "applies_to_steps": [3, 6],
    "version": "1.0",
    
    "universal_dimensions": ["aps_tone_register", "impartiality", "compliance_awareness", "claim_handling"],
    "workflow_dimensions": ["structural_conformance_bn", "executive_readability", "recommendation_clarity"],
    
    "dimensions": {
      "aps_tone_register": {
        "weight": 0.15,
        "criteria": "The output uses formal but clear language appropriate for senior executive readers in the Australian Public Service. It avoids both excessive jargon and inappropriate informality. Active voice is preferred. Sentences are concise (under 25 words on average).",
        "evaluation_steps": [
          "Check if the language register is consistent with formal APS communication",
          "Identify any instances of inappropriate informality, slang, or overly casual phrasing",
          "Check for unnecessary jargon that could be replaced with plain language",
          "Assess whether the writing is concise — flag paragraphs over 5 sentences",
          "Verify active voice is used where possible"
        ],
        "rubric_scale": [
          { "score": 1, "label": "Unacceptable", "description": "Casual, informal, or inappropriately technical tone throughout. Would not be suitable for executive reading." },
          { "score": 2, "label": "Below standard", "description": "Inconsistent tone — mixes formal and informal. Some sections appropriate, others would need significant rework." },
          { "score": 3, "label": "Acceptable", "description": "Generally appropriate tone with minor issues. Could go to an executive with light editing." },
          { "score": 4, "label": "Good", "description": "Consistently appropriate tone. Clear, concise, professional. Minor stylistic preferences only." },
          { "score": 5, "label": "Excellent", "description": "Exemplary APS prose. Would serve as a model for how to write for senior executives." }
        ]
      },
      
      "impartiality": {
        "weight": 0.20,
        "criteria": "The output presents balanced analysis consistent with APS Values. It does not advocate for a particular position unless explicitly presenting options with pros and cons. It acknowledges multiple perspectives where relevant. It serves the government of the day while remaining apolitical.",
        "evaluation_steps": [
          "Check whether the output advocates for a single position without acknowledging alternatives",
          "Identify any language that could be read as politically partisan",
          "Verify that where stakeholder perspectives are presented, they are represented fairly",
          "Check that recommendations are framed as advice, not advocacy",
          "Assess whether the analysis serves the government of the day without being partisan"
        ],
        "rubric_scale": [
          { "score": 1, "label": "Unacceptable", "description": "Clearly advocates for a position. Reads as a lobby document, not impartial analysis." },
          { "score": 2, "label": "Below standard", "description": "Leans toward a position without adequately presenting alternatives. Some balance missing." },
          { "score": 3, "label": "Acceptable", "description": "Generally balanced but could present some perspectives more fully." },
          { "score": 4, "label": "Good", "description": "Balanced analysis with multiple perspectives fairly represented. Appropriate for executive briefing." },
          { "score": 5, "label": "Excellent", "description": "Exemplary impartiality. All relevant perspectives represented. Recommendations clearly distinguished from analysis." }
        ]
      },
      
      "compliance_awareness": {
        "weight": 0.15,
        "criteria": "The output demonstrates awareness of relevant APS compliance frameworks without necessarily citing them. Specifically: resource implications are considered (PGPA Act), information is handled at the appropriate classification level (PSPF), personal information is treated appropriately (Privacy Act), and the advice is consistent with APS Values.",
        "evaluation_steps": [
          "Check whether resource or budget implications are mentioned where relevant",
          "Verify no information that should be classified above OFFICIAL is present",
          "Check whether personal information is referenced appropriately",
          "Assess whether the advice reflects APS Values of accountability and ethical conduct"
        ],
        "rubric_scale": [
          { "score": 1, "label": "Unacceptable", "description": "Contains content that breaches classification boundaries or ignores compliance requirements entirely." },
          { "score": 2, "label": "Below standard", "description": "Shows little awareness of compliance context. Missing obvious compliance considerations." },
          { "score": 3, "label": "Acceptable", "description": "Basic compliance awareness present. Key frameworks acknowledged but not deeply integrated." },
          { "score": 4, "label": "Good", "description": "Compliance considerations woven naturally into the analysis. Key frameworks reflected in advice." },
          { "score": 5, "label": "Excellent", "description": "Compliance frameworks deeply integrated. Demonstrates sophisticated understanding of accountability obligations." }
        ]
      },
      
      "claim_handling": {
        "weight": 0.15,
        "criteria": "The output handles factual claims responsibly. Specific statistics, dates, program details, and legislative references are either flagged with [VERIFY] markers or presented with appropriate hedging. The output does not present fabricated specific details (numbers, names, dates) as fact.",
        "evaluation_steps": [
          "Identify all specific factual claims (statistics, dates, funding amounts, legislative section numbers)",
          "Check whether these claims are flagged with [VERIFY] or [INSERT DATA] markers",
          "Check for suspiciously specific numbers that may be fabricated",
          "Assess whether the output appropriately hedges uncertain claims"
        ],
        "rubric_scale": [
          { "score": 1, "label": "Unacceptable", "description": "Contains multiple specific claims presented as fact without verification markers. Likely hallucinated details." },
          { "score": 2, "label": "Below standard", "description": "Some claims flagged but others presented without hedging. Inconsistent approach to verification." },
          { "score": 3, "label": "Acceptable", "description": "Most specific claims appropriately flagged. May miss one or two." },
          { "score": 4, "label": "Good", "description": "All specific claims flagged or hedged. Clear distinction between analysis and verifiable facts." },
          { "score": 5, "label": "Excellent", "description": "Exemplary claim handling. Every specific detail flagged. Trust boundary clearly communicated." }
        ]
      },
      
      "structural_conformance_bn": {
        "weight": 0.15,
        "criteria": "The output follows standard APS briefing note structure: Recommendation/Action Required, Key Points (3-5 dot points), Background, Analysis/Current Status, Options or Considerations (if applicable), Next Steps. Sections are in the expected order and appropriately proportioned.",
        "evaluation_steps": [
          "Check for the presence of all required sections in the correct order",
          "Verify Key Points contains 3-5 actionable dot points",
          "Assess whether sections are proportioned appropriately (Key Points concise, Analysis substantive)",
          "Check that the Recommendation is specific and implementable"
        ],
        "rubric_scale": [
          { "score": 1, "label": "Unacceptable", "description": "Does not follow briefing note structure. Missing major sections." },
          { "score": 2, "label": "Below standard", "description": "Partially follows structure but missing or misplaced sections." },
          { "score": 3, "label": "Acceptable", "description": "Follows structure with minor deviations. All major sections present." },
          { "score": 4, "label": "Good", "description": "Clean structure following APS conventions. Well-proportioned sections." },
          { "score": 5, "label": "Excellent", "description": "Textbook briefing note structure. Could serve as a template example." }
        ]
      },
      
      "executive_readability": {
        "weight": 0.10,
        "criteria": "A senior executive (SES Band 1+) with 5 minutes could extract the key message, understand the recommendation, and identify any decision points. The brief front-loads the most important information.",
        "evaluation_steps": [
          "Read only the Recommendation and Key Points sections. Can you understand the core message?",
          "Assess whether the brief front-loads critical information",
          "Check if decision points are clearly identified",
          "Verify the brief could be absorbed in under 5 minutes"
        ],
        "rubric_scale": [
          { "score": 1, "label": "Unacceptable", "description": "Buries the key message. Executive would need to read the entire document to understand the point." },
          { "score": 2, "label": "Below standard", "description": "Key message partially obscured. Requires more than a quick scan to extract action items." },
          { "score": 3, "label": "Acceptable", "description": "Key message accessible with moderate effort. Front-loading could be improved." },
          { "score": 4, "label": "Good", "description": "Key message clear from the first few paragraphs. Decision points identified." },
          { "score": 5, "label": "Excellent", "description": "Perfectly structured for executive consumption. Key message, options, and decision points immediately apparent." }
        ]
      },
      
      "recommendation_clarity": {
        "weight": 0.10,
        "criteria": "The recommendation or action required is specific, implementable, and clearly stated. It tells the reader exactly what decision or action is being sought.",
        "evaluation_steps": [
          "Is there an explicit recommendation or action statement?",
          "Is the recommendation specific (not vague like 'consider options')?",
          "Is it implementable — could the reader act on it?",
          "Is it clear who needs to do what?"
        ],
        "rubric_scale": [
          { "score": 1, "label": "Unacceptable", "description": "No clear recommendation. Reader has no idea what action is being sought." },
          { "score": 2, "label": "Below standard", "description": "Vague recommendation. 'It is recommended that the department consider...' with no specifics." },
          { "score": 3, "label": "Acceptable", "description": "Recommendation present and directional but could be more specific." },
          { "score": 4, "label": "Good", "description": "Clear, specific recommendation. Reader knows what's being asked and why." },
          { "score": 5, "label": "Excellent", "description": "Crisp, implementable recommendation with clear ownership and timeframe." }
        ]
      }
    }
  }
}
```

**What it requires to build:**
- Universal APS dimensions (4-5) that apply across all workflows — design once, reuse everywhere
- Workflow-specific dimensions (2-4) per workflow type
- Calibration against human-labelled examples (see Section 5)
- Periodic validation that rubric scores correlate with human quality judgements

**Limitations:**
- LLM judges can be gamed — a prompt optimised against the rubric might score well while being unhelpful
- Rubrics encode the designer's quality model — they may miss dimensions that matter to specific agencies
- Inter-run variance: the same output scored by the same judge twice may get slightly different scores

**How it connects:** Layer 3 invokes these rubrics for every test case. Layer 4 uses the aggregate rubric scores as its optimisation metric. Layer 5 reviews rubric scores alongside outputs to make governance decisions.

### Layer 3: Automated Test Harness (CI/CD)

**What it does:** Runs the evaluation pipeline automatically — on every pull request that touches prompt content, and on a nightly schedule to catch model drift.

**Implementation with Promptfoo + GitHub Actions:**

```yaml
# .github/workflows/prompt-eval.yml
name: Prompt Evaluation

on:
  pull_request:
    paths:
      - 'src/data/building-blocks/**'
      - 'src/data/quality-gates/**'
      - 'src/data/workflows/**'
      - 'eval/**'
  schedule:
    - cron: '0 2 * * *'  # Nightly at 2am AEST

jobs:
  evaluate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      
      - name: Cache promptfoo
        uses: actions/cache@v4
        with:
          path: ~/.cache/promptfoo
          key: ${{ runner.os }}-promptfoo-${{ hashFiles('eval/**') }}
      
      - name: Run prompt evaluation
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          npx promptfoo@latest eval \
            -c eval/promptfooconfig.yaml \
            -o eval/results.json \
            -o eval/report.html
      
      - name: Quality gate check
        run: |
          FAILURES=$(jq '.results.stats.failures' eval/results.json)
          TOTAL=$(jq '.results.stats.total' eval/results.json)
          echo "Results: $((TOTAL - FAILURES))/$TOTAL passed"
          if [ "$FAILURES" -gt 0 ]; then
            echo "❌ Evaluation failed with $FAILURES failures"
            echo "::error::Prompt evaluation failed — $FAILURES test cases below threshold"
            exit 1
          fi
          echo "✅ All evaluations passed"
      
      - name: Upload results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: eval-results-${{ github.sha }}
          path: |
            eval/results.json
            eval/report.html
      
      - name: Comment on PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const results = JSON.parse(fs.readFileSync('eval/results.json', 'utf8'));
            const stats = results.results.stats;
            const body = `## Prompt Evaluation Results\n\n` +
              `| Metric | Value |\n|---|---|\n` +
              `| Total tests | ${stats.total} |\n` +
              `| Passed | ${stats.total - stats.failures} |\n` +
              `| Failed | ${stats.failures} |\n` +
              `| Pass rate | ${((1 - stats.failures/stats.total) * 100).toFixed(1)}% |\n\n` +
              `Full results attached as artifact.`;
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: body
            });
```

**Promptfoo configuration:**

```yaml
# eval/promptfooconfig.yaml
prompts:
  - file://eval/prompts/bb-gen-001-scope-research.txt
  
providers:
  - id: anthropic:messages:claude-sonnet-4-20250514
    config:
      max_tokens: 2000
      temperature: 0.3

tests:
  - description: "Briefing Note Scope — Aged Care"
    vars:
      topic: "Aged care workforce shortages and their impact on service quality"
      audience: "First Assistant Secretary, Ageing and Aged Care Group"
      purpose: "Internal decision brief ahead of stakeholder roundtable"
      agency: "Department of Health and Aged Care"
      policy_area: "aged care reform"
    
    assert:
      # Structural checks (deterministic)
      - type: contains
        value: "1."
        metric: has_numbered_list
      
      - type: javascript
        value: |
          output.split('\n').filter(l => /^\d+\./.test(l.trim())).length >= 5
            && output.split('\n').filter(l => /^\d+\./.test(l.trim())).length <= 7
        metric: issue_count_in_range
      
      # LLM-as-Judge checks (rubric-based)
      - type: llm-rubric
        value: |
          Evaluate this output for APS tone and register. The output should use
          formal but clear language appropriate for senior executive readers.
          Score 1 (unacceptable) to 5 (excellent). Score 3+ to pass.
        threshold: 0.6
        metric: aps_tone
      
      - type: llm-rubric
        value: |
          Evaluate whether this output handles factual claims responsibly.
          Specific statistics, dates, and program details should be hedged
          or flagged for verification. Score 1-5. Score 3+ to pass.
        threshold: 0.6
        metric: claim_handling
      
      - type: llm-rubric
        value: |
          Evaluate this output for impartiality consistent with APS Values.
          The analysis should present multiple perspectives fairly and avoid
          advocating for a single position. Score 1-5. Score 3+ to pass.
        threshold: 0.6
        metric: impartiality
```

**What it requires to build:**
- Promptfoo configuration files per workflow/building block
- GitHub Actions secrets for API keys
- ~$2-10 per CI run (depending on test case count and model used)
- Initial setup: 4-6 hours for the first workflow

**Limitations:**
- API cost scales with test case count × assertion count × model calls
- CI runs add 5-15 minutes to PR review time
- False positives from LLM judge variance can block legitimate PRs

**How it connects:** Pulls inputs from Layer 1 (golden dataset), sends outputs to Layer 2 (rubrics) for scoring, reports results to Layer 5 (human governance) via PR comments and artifacts.

### Layer 4: Self-Improvement / Optimisation

**What it does:** Uses automated prompt optimisation techniques to propose improvements to existing prompts, test them against the rubric, and surface candidates for human review. This layer does NOT autonomously deploy changes — it generates candidates.

**Approach:** A lightweight Python script (not a full DSPy pipeline at this stage) that:

1. Takes a prompt template and its golden test cases
2. Generates N variations (modified instructions, different role framings, added/removed constraints)
3. Runs each variation through the Layer 3 test harness
4. Ranks variations by aggregate rubric score
5. Outputs a comparison report for human review

```python
# eval/optimise.py (pseudocode)
import json
from anthropic import Anthropic

def propose_variations(prompt_template: str, rubric_scores: dict, n: int = 5) -> list[str]:
    """Ask Claude to propose N improved versions of a prompt template,
    given its current rubric scores and known weaknesses."""
    
    client = Anthropic()
    
    system = """You are a prompt engineering specialist for the Australian 
    Public Service. Given a prompt template and its evaluation scores, 
    propose specific improvements. Each variation should target a 
    specific weakness while preserving the template's strengths."""
    
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4000,
        system=system,
        messages=[{
            "role": "user",
            "content": f"""Current prompt template:
{prompt_template}

Current rubric scores (out of 5):
{json.dumps(rubric_scores, indent=2)}

Propose {n} variations that target the lowest-scoring dimensions.
For each variation:
1. State which dimension(s) you're targeting
2. Explain what you changed and why
3. Provide the complete modified prompt template

Return as JSON array."""
        }]
    )
    
    return parse_variations(response.content[0].text)

def evaluate_variation(variation: str, golden_cases: list) -> dict:
    """Run a prompt variation through the test harness and return scores."""
    # Writes temporary promptfoo config, runs eval, returns scores
    pass

def rank_and_report(original_scores: dict, variations: list[dict]) -> str:
    """Generate a comparison report for human review."""
    pass
```

**What it requires to build:**
- Layer 1-3 fully operational (this builds on everything below)
- Python script wrapping the Anthropic API + Promptfoo CLI
- ~$5-20 per optimisation run (depends on golden dataset size)
- Human reviewer with domain expertise to assess candidates

**Limitations:**
- "Goodhart's Law" risk: optimising prompts against a rubric that imperfectly captures quality can produce prompts that score well but aren't actually better
- Long-form generation is harder to optimise than classification or extraction
- Requires significant compute budget if run frequently

**How it connects:** Reads current scores from Layer 3, proposes variations, runs them through Layer 3, and passes ranked candidates to Layer 5 for human review and approval.

### Layer 5: Human Governance Gate

**What it does:** Provides the final human review and approval for all changes to the prompt library. This is where accountability lives — no change ships without a human deciding it should.

**Governance model:**

```
CONTRIBUTION ARRIVES (PR or GitHub Issue)
         │
         ▼
    ┌─────────────┐
    │ Automated    │──fail──→ Return to contributor
    │ CI/CD eval   │          with eval results
    │ (Layer 3)    │
    └──────┬──────┘
           │ pass
           ▼
    ┌─────────────┐
    │ Maintainer   │──reject──→ Close with feedback
    │ review       │
    │ (rubric +    │
    │  domain)     │
    └──────┬──────┘
           │ approve
           ▼
    ┌─────────────┐
    │ Merge to     │
    │ main         │
    └─────────────┘
```

**For Layer 4 (optimisation) candidates:**

```
OPTIMISATION RUN COMPLETES
         │
         ▼
    ┌─────────────┐
    │ Score delta  │──< threshold──→ Discard (not 
    │ > threshold? │                  worth reviewing)
    └──────┬──────┘
           │ yes
           ▼
    ┌─────────────┐
    │ Generate     │
    │ comparison   │
    │ report       │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │ Maintainer   │──reject──→ Log reasoning,
    │ review       │            feed back to L4
    └──────┬──────┘
           │ approve
           ▼
    ┌─────────────┐
    │ Create PR    │──→ Standard CI/CD pipeline
    └─────────────┘
```

**Escalation triggers (things that always require human review):**
- Any change to compliance-related quality gates
- New workflows in domains not previously covered
- Score improvements > 20% (suspicious — may indicate rubric gaming)
- Changes flagged by contributors as "APS Values sensitive"

**What it requires:** A human with domain expertise. Currently that's the project maintainer. At scale, this could be a small review panel (2-3 people from different agencies).

---

## 4. Rubric Design: APS-Specific Evaluation Criteria

### The Rubric Architecture

Rubrics in this system are composable. Rather than building a monolithic rubric for each workflow, we define **universal dimensions** (applicable to all APS outputs) and **workflow-specific dimensions** (applicable to a particular document type). This mirrors the composable building-block architecture of the prompt library itself.

### Universal APS Dimensions

These four dimensions should be evaluated on every substantive output from the library:

| Dimension | What It Measures | Why It Matters |
|---|---|---|
| **APS Tone & Register** | Formal but clear language; appropriate for audience level; active voice preferred; concise | The single most visible quality signal. If it doesn't "sound right," nothing else matters. |
| **Impartiality** | Balanced analysis; multiple perspectives; serves government without being partisan | Core APS Value. Failure here undermines the officer's accountability. |
| **Compliance Awareness** | Resource implications (PGPA); classification boundaries (PSPF); personal information (Privacy Act); ethical conduct (APS Values) | The library's differentiator — compliance by design. |
| **Claim Handling** | Flagging unverifiable claims; hedging uncertain assertions; using [VERIFY] markers | Directly addresses the trust boundary problem. |

### Workflow-Specific Dimensions

Each workflow type adds 2-4 dimensions relevant to its document type:

**Briefing Note** (WF-POL-001): Structural conformance (BN sections), Executive readability, Recommendation clarity

**Question Time Brief** (WF-POL-002): Answer conciseness (30-second delivery), Anticipatory sensitivity (does it anticipate follow-up lines), Defensive framing (avoids creating new attack surface)

**Stakeholder Analysis** (WF-STAKE-001): Stakeholder completeness, Interest/influence mapping accuracy, Engagement strategy specificity

**Plain Language Rewrite** (WF-COMMS-001): Reading level reduction (measurable via Flesch-Kincaid), Meaning preservation, Accessibility compliance

### Worked Example: Briefing Note Rubric

The full rubric for the Briefing Note workflow is presented in the Layer 2 section above (Section 3). To summarise the scoring model:

**Aggregate scoring:**
- Each dimension scored 1-5 by LLM judge
- Weighted sum produces aggregate score (max 5.0)
- **Pass threshold:** 3.0 (all dimensions meet "Acceptable" or above)
- **Quality target:** 3.8+ (most dimensions at "Good" or above)
- **Regression threshold:** If aggregate drops more than 0.3 from previous version, the PR is blocked

**Weight distribution for Briefing Note:**

| Dimension | Weight | Rationale |
|---|---|---|
| Impartiality | 0.20 | Core APS Value — non-negotiable |
| APS Tone & Register | 0.15 | Most visible quality signal |
| Compliance Awareness | 0.15 | Library differentiator |
| Claim Handling | 0.15 | Trust boundary integrity |
| Structural Conformance | 0.15 | BN-specific — format matters |
| Executive Readability | 0.10 | Usability for target audience |
| Recommendation Clarity | 0.10 | Action-orientation |

### Quality Gate Rubrics

Quality gates need their own rubrics — evaluating whether the gate itself is working properly. These are meta-rubrics: they assess whether the quality gate correctly identifies issues in a test output.

```json
{
  "quality_gate_rubric": {
    "id": "RB-QG-TRUST-001",
    "name": "Claim Verification Gate Effectiveness",
    "gate_id": "QG-TRUST-001",
    
    "test_approach": "Feed the gate a draft with known planted issues — 3 verifiable claims, 2 plausible-but-wrong claims, and 2 clearly fabricated details. Measure detection rates.",
    
    "dimensions": {
      "detection_rate": {
        "criteria": "What proportion of planted issues did the gate identify?",
        "target": 0.85,
        "minimum": 0.70
      },
      "categorisation_accuracy": {
        "criteria": "Of the issues identified, what proportion were correctly categorised (VERIFIABLE vs PLAUSIBLE vs FABRICATED)?",
        "target": 0.75,
        "minimum": 0.60
      },
      "false_positive_rate": {
        "criteria": "How many claims were incorrectly flagged as problematic?",
        "target_max": 0.15
      },
      "actionability": {
        "criteria": "Does the gate output provide clear verification actions the officer can take?",
        "scoring": "llm_judge",
        "threshold": 3
      }
    }
  }
}
```

---

## 5. Streamlining the Rubric Process

### The Bottleneck

Rubric creation and maintenance is the hardest part of this system. Building the Briefing Note rubric in Section 4 took significant thought about what "good" means for that specific document type. If every new workflow requires the same level of effort, the evaluation system will bottleneck on rubric creation and the library will stall.

The goal of this section is to reduce rubric creation from hours to minutes for new workflows, while preserving the rigour that makes the rubrics useful.

### Strategy 1: Universal + Specific Composition

The four universal APS dimensions (tone, impartiality, compliance, claim handling) apply to every workflow and never need to be rewritten. They're defined once and referenced by ID. A new workflow rubric only needs to define its 2-4 workflow-specific dimensions.

**Effort reduction:** ~60% of rubric content is reusable. A new workflow needs ~40% custom work.

### Strategy 2: Auto-Scaffolding from Workflow Metadata

The workflow JSON schema already contains metadata that can bootstrap rubric dimensions:

```json
{
  "auto_scaffold_rules": {
    "if_task_type_is": {
      "briefing_note": ["structural_conformance_bn", "executive_readability", "recommendation_clarity"],
      "correspondence": ["tone_matching_audience", "action_clarity", "formatting_conventions"],
      "stakeholder_analysis": ["stakeholder_completeness", "categorisation_quality", "engagement_specificity"],
      "data_summary": ["statistical_accuracy_hedging", "visualisation_appropriateness", "insight_actionability"],
      "plain_language_rewrite": ["reading_level_reduction", "meaning_preservation", "accessibility"]
    },
    
    "if_compliance_frameworks_include": {
      "pgpa_act": "Dimension: compliance_awareness includes resource implications check",
      "privacy_act": "Dimension: compliance_awareness includes personal information handling check",
      "foi_act": "Dimension: compliance_awareness includes discoverability consideration"
    },
    
    "if_typical_user_level_is": {
      "aps3_4": "Dimension: aps_tone_register calibrated for APS 3-4 writing level",
      "ses": "Dimension: executive_readability weight increased to 0.20"
    }
  }
}
```

**Implementation:** A script reads the workflow JSON, applies the mapping rules, and generates a rubric scaffold with pre-filled dimensions, default weights, and template evaluation steps. The maintainer reviews and customises — not creates from scratch.

```python
# eval/scaffold_rubric.py (pseudocode)
def scaffold_rubric(workflow: dict) -> dict:
    rubric = {
        "universal_dimensions": ["aps_tone_register", "impartiality", 
                                  "compliance_awareness", "claim_handling"],
        "workflow_dimensions": [],
        "dimensions": load_universal_dimensions()
    }
    
    # Add workflow-specific dimensions from task type mapping
    task_type = workflow.get("task_type", "")
    if task_type in AUTO_SCAFFOLD_RULES["if_task_type_is"]:
        for dim_id in AUTO_SCAFFOLD_RULES["if_task_type_is"][task_type]:
            rubric["workflow_dimensions"].append(dim_id)
            rubric["dimensions"][dim_id] = load_dimension_template(dim_id)
    
    # Adjust compliance dimension based on frameworks
    for framework in workflow.get("compliance_frameworks", []):
        if framework in AUTO_SCAFFOLD_RULES["if_compliance_frameworks_include"]:
            rubric["dimensions"]["compliance_awareness"]["evaluation_steps"].append(
                AUTO_SCAFFOLD_RULES["if_compliance_frameworks_include"][framework]
            )
    
    return rubric
```

**Effort reduction:** Another ~50% of custom work eliminated. For known task types, rubric scaffolding is automatic. Only truly novel workflow types require manual dimension design.

### Strategy 3: Bootstrap from Golden Examples

The fastest way to calibrate a rubric is to have 3-5 human-labelled examples at different quality levels. Given these, the rubric calibration process is:

1. Human labels 5 outputs as: 1 poor, 1 below-average, 1 acceptable, 1 good, 1 excellent
2. Run the auto-scaffolded rubric against all 5 with the LLM judge
3. Compare LLM scores to human labels
4. Adjust rubric language and weights until correlation exceeds 0.8
5. Document the calibration in the rubric metadata

**Minimum viable calibration:** 3 examples (poor, acceptable, good). Takes ~30 minutes including prompt runs.

**Full calibration:** 5-10 examples across the quality spectrum. Takes ~1-2 hours.

### Strategy 4: Minimum Viable Rubric for New Contributions

Not every contribution needs the full rubric treatment. The evaluation depth should scale with the maturity and criticality of the workflow:

| Contribution Stage | Rubric Requirement | What This Looks Like |
|---|---|---|
| **New workflow proposal** (GitHub Issue) | No rubric | Human review of concept and structure only |
| **Draft workflow** (first PR) | Universal dimensions only | Auto-scaffolded, no custom calibration |
| **Published workflow** (merged to main) | Universal + scaffolded specific dimensions | Auto-scaffolded with light human review |
| **Mature workflow** (3+ months, user feedback) | Full rubric with calibrated weights | Human-calibrated against golden examples |
| **Optimisation candidate** (Layer 4 target) | Full rubric + quality gate meta-rubrics | Comprehensive evaluation for automated improvement |

**Key insight:** The rubric system should grow with the library, not gate it. A new workflow can ship with just the universal dimensions evaluated — workflow-specific rubrics evolve as usage data and feedback accumulate.

---

## 6. The Self-Improving Loop: Can AI Hypothesise Its Own Improvements?

### What's Realistic Today

The honest answer: automated prompt optimisation works for narrow tasks with clear metrics, and gets increasingly unreliable as tasks become more open-ended and quality becomes more multidimensional.

For the Gallery's use case — long-form APS prose generation — here's the realistic assessment:

**What DSPy-style optimisation can do now:**
- Optimise the instruction framing of individual building blocks (e.g., finding that "You are a senior APS policy analyst" produces better tone scores than "Act as a government analyst")
- Select optimal few-shot examples from a corpus of golden outputs
- Identify which constraint phrases (e.g., "each paragraph no more than 4 sentences") most improve structural conformance scores
- Compare performance across model versions (e.g., does this prompt work better with Claude Sonnet 4 than Claude Sonnet 3.5?)

**What it can't reliably do yet:**
- Rewrite entire workflow step prompts to be "better" in a holistic sense
- Invent new quality gate strategies
- Optimise across multiple steps simultaneously (the interaction effects between steps in a chain are hard to model)
- Navigate the impartiality–completeness tradeoff (making a brief more comprehensive often makes it less impartial, and vice versa)

### A Responsible Implementation

If the Gallery implements self-improvement, it should follow this architecture:

```
SCHEDULED OPTIMISATION RUN (monthly)
         │
         ▼
    ┌─────────────────────┐
    │ Select target        │
    │ (worst-scoring       │
    │  dimension on a      │
    │  mature workflow)     │
    └──────────┬──────────┘
               │
               ▼
    ┌─────────────────────┐
    │ Generate 5-10        │
    │ prompt variations    │
    │ targeting that       │
    │ dimension            │
    └──────────┬──────────┘
               │
               ▼
    ┌─────────────────────┐
    │ Evaluate all         │
    │ variations on        │
    │ full golden dataset  │
    │ + all dimensions     │
    └──────────┬──────────┘
               │
               ▼
    ┌─────────────────────┐
    │ Filter: improved     │──no improvement──→ Stop. Log results.
    │ target dimension     │
    │ AND no regression    │
    │ on other dimensions? │
    └──────────┬──────────┘
               │ yes
               ▼
    ┌─────────────────────┐
    │ Generate comparison  │
    │ report with:         │
    │ - Score deltas       │
    │ - Example outputs    │
    │ - Change rationale   │
    └──────────┬──────────┘
               │
               ▼
    ┌─────────────────────┐
    │ HUMAN REVIEW         │
    │ Maintainer decides:  │
    │ - Accept             │
    │ - Reject with reason │
    │ - Request more data  │
    └─────────────────────┘
```

### APS-Specific Risks

**Automation bias.** If the system regularly produces good suggestions, the human reviewer may start rubber-stamping. Mitigations: require the reviewer to document specific reasoning for acceptance; periodically include deliberately suboptimal candidates to test reviewer vigilance.

**Compliance drift.** Small incremental changes, each individually benign, could gradually shift prompts away from compliance awareness. Mitigations: compliance dimension scores must be monotonically non-decreasing — any regression blocks the change regardless of other improvements.

**Domain nuance erosion.** Optimisation toward aggregate scores can smooth away important qualitative features that rubrics don't capture. A prompt might score 4.2 instead of 4.0 on average while losing a subtle quality (e.g., the way it frames Indigenous considerations) that the rubric doesn't measure. Mitigation: human reviewers must read actual example outputs, not just score summaries.

**Loss of provenance.** After several rounds of automated optimisation, the original prompt design rationale may be lost. Mitigation: every accepted change is logged with its rationale, the score deltas, and the human reviewer's acceptance reasoning. Version control handles the rest.

### Minimum Human Oversight

Even with a highly reliable automated system, the APS context demands:

1. **Every accepted change reviewed by a human** — no autonomous deployment
2. **Compliance dimensions cannot degrade** — hard constraint, not a tradeoff
3. **Quarterly human review** of rubric calibration — are the scores still meaningful?
4. **Any change > 15% score improvement flagged as suspicious** — may indicate rubric gaming rather than genuine improvement
5. **Domain expert sign-off for new workflows** — automated evaluation doesn't replace domain expertise for deciding whether a workflow belongs in the library

---

## 7. How Larger Organisations Approach This

### The Common Pattern

Across enterprise AI deployments and government digital service teams, a consistent pattern has emerged for managing prompt quality at scale:

**What they automate:**
- Regression testing: every prompt change runs against test cases before deployment
- Format and structural validation: deterministic checks for output structure
- Safety and security scanning: red-teaming for prompt injection, PII leakage, toxic outputs
- Model performance comparison: side-by-side evaluation when switching or upgrading models

**What they keep human:**
- Final approval for prompt changes in high-stakes contexts
- Rubric design and calibration
- Edge case adjudication
- Compliance sign-off in regulated industries
- Strategic decisions about what workflows to build

**What governance structures have emerged:**
- Prompt versioning treated like code versioning (Git-based, PR review, CI gates)
- Role-based access: who can propose vs. who can approve prompt changes
- Audit trails: every change logged with rationale and approval chain
- Periodic review cycles (quarterly or biannually) for rubric recalibration

### UK Government Digital Service

The UK GDS launched its AI Playbook in February 2025, covering safe and responsible AI use across the public sector. While the playbook provides principles and guidance, it doesn't include a structured prompt library or automated evaluation framework. GDS has established a Responsible AI Advisory Panel (first meeting March 2026) bringing together experts from government, industry, academia, and civil society. Their approach emphasises transparency (the Algorithmic Transparency Recording Standard) and human oversight, but systematic prompt evaluation at scale is not yet a solved problem in UK government.

The UK's approach reinforces a key lesson: government AI governance tends to start with policy and principles, and arrives at technical evaluation tooling later. The Gallery's approach of building evaluation infrastructure early — before scaling — is the opposite order, and potentially more sustainable.

### US Federal Government

The US Office of Management and Budget has issued guidance (M-25-21, M-25-22) requiring agencies to evaluate LLM providers on bias, accuracy, and governance tooling. The guidance mandates that agencies require vendors to provide benchmark scores, bias evaluation results, and governance tools including customisable system instructions. This is procurement-level governance — ensuring the underlying models are trustworthy — rather than prompt-level evaluation. The gap between "the model is trustworthy" and "the prompts using it produce good outputs" is exactly the gap the Gallery addresses.

### Enterprise Patterns

The enterprise AI governance landscape in 2025 has matured around a common stack: an AI gateway (unified API access with policy enforcement), evaluation as CI/CD (treating prompts as first-class software artefacts), and human-in-the-loop for high-stakes decisions. The TrueFoundry/Promptfoo partnership exemplifies this: Promptfoo handles the evaluation, the AI Gateway handles policy enforcement, and humans handle strategic decisions.

For the Gallery specifically, the relevant takeaway is: **treat prompts like code, evaluation like tests, and governance like code review.** This is exactly what the proposed architecture does.

---

## 8. A Phased Implementation Roadmap

### Phase 0: Foundations (Weekend Sprint — 1 person, 1-2 days)

**Entry criteria:** The Gallery exists and has at least one workflow (WF-POL-001 Briefing Note) with full prompt templates.

**Deliverables:**
1. Install Promptfoo: `npm install -g promptfoo`
2. Create `eval/` directory in the repository
3. Write 3 golden test cases for the Briefing Note workflow Step 1 (Scope & Research)
4. Write a basic `promptfooconfig.yaml` with:
   - 2-3 deterministic assertions (structural checks)
   - 1-2 LLM-as-Judge assertions (tone, claim handling)
5. Run locally: `promptfoo eval` — verify it works
6. Create a simple GitHub Actions workflow that runs on PRs touching `src/data/`
7. Document: add `EVALUATION.md` to the repo explaining the evaluation approach

**Effort:** 6-8 hours. $2-5 in API costs.

**What this gives you:** Automated regression testing for the most important workflow. Every PR touching prompt data runs against golden test cases. You'll catch obvious regressions before they merge.

### Phase 1: Universal Rubrics + Expanded Coverage (1-2 weeks, part-time)

**Entry criteria:** Phase 0 complete. Evaluation runs on PRs. You've seen at least 5 eval runs and have a feel for score stability.

**Deliverables:**
1. Define the 4 universal APS rubric dimensions as reusable JSON files in `eval/rubrics/`
2. Expand golden test cases: 3-5 per step for the Briefing Note workflow (7 steps × 3-5 = 21-35 test cases)
3. Add golden test cases for 2 additional building blocks (e.g., BB-ROLE-001, QG-TRUST-001)
4. Calibrate rubric scores against 3 human-labelled examples per step
5. Set up nightly scheduled evaluation runs (model drift detection)
6. Write the rubric auto-scaffolding script (Strategy 2 from Section 5)

**Effort:** 15-20 hours over 1-2 weeks. $15-30 in API costs.

**What this gives you:** Robust evaluation for the core workflow. Universal rubrics that new workflows can inherit immediately. Early drift detection.

### Phase 2: Multi-Workflow Coverage + Quality Gate Testing (2-4 weeks, part-time)

**Entry criteria:** Phase 1 complete. Universal rubrics calibrated. At least 2 workflows published.

**Deliverables:**
1. Extend evaluation to all published workflows (scaffold rubrics using the auto-scaffolding script)
2. Add quality gate meta-rubrics: test that QG-TRUST-001 (Claim Verification) actually detects planted issues
3. Create "adversarial" golden test cases — inputs designed to trigger common failure modes (fabricated statistics, biased framing, classification boundary issues)
4. PR comment bot that summarises rubric scores by dimension (not just pass/fail)
5. Evaluation dashboard: simple static page generated from eval results (can be an Astro page in the Gallery itself)
6. Contributor documentation: "How to write a golden test case" guide

**Effort:** 20-30 hours. $30-50 in API costs.

**What this gives you:** Comprehensive evaluation across the library. Contributors can see evaluation results on their PRs. Quality gates are themselves tested.

### Phase 3: Self-Improvement Pipeline (4-8 weeks, exploratory)

**Entry criteria:** Phase 2 complete. At least 3 mature workflows with calibrated rubrics. At least 50 golden test cases. Monthly API budget of $50+ allocated.

**Deliverables:**
1. Build the optimisation script (Section 6 architecture)
2. Run first optimisation cycle on the lowest-scoring dimension of WF-POL-001
3. Establish the human review process for optimisation candidates
4. Document: "Optimisation candidate review guide" for the maintainer
5. Implement compliance dimension hard constraint (no regression allowed)
6. Run 3 full optimisation cycles, documenting what works and what doesn't

**Effort:** 30-40 hours. $50-100 in API costs. High uncertainty — may require significant iteration.

**What this gives you:** Evidence of whether automated optimisation is viable for this use case. A process for incorporating AI-suggested improvements with human oversight.

### Phase 4: Scale and Community (Ongoing)

**Entry criteria:** Phase 3 complete. Optimisation process validated. Community contributions arriving.

**Deliverables:**
1. Automated rubric scaffolding for contributor-submitted workflows
2. Contributor leaderboard: which contributions improved library scores
3. Cross-model evaluation: test prompts against Claude, GPT, and Copilot to maintain platform-agnostic claims
4. Evaluation API: allow agency instances to run evaluations against their customised prompts
5. Investigate DSPy integration for more sophisticated optimisation

**Effort:** Ongoing. This is where the project shifts from solo to community.

---

## 9. Open Questions and Risk Register

### Genuinely Uncertain

1. **How stable are LLM judge scores across model versions?** If Anthropic ships Claude Sonnet 4.5 and the judge scores shift, do all our rubric calibrations need re-doing? Initial evidence suggests modern judge models are reasonably stable, but we need data specific to our rubrics.

2. **Will the rubrics transfer across agencies?** The universal dimensions should, but agency-specific conventions (tone preferences, template variations) may mean a prompt that scores 4.0 for DSS scores 3.2 for PM&C. How much agency-specific calibration is needed?

3. **Is the evaluation cost sustainable at scale?** At ~$0.10-0.50 per test case (depending on model and assertion count), a library with 50 workflows × 7 steps × 5 test cases = 1,750 test cases per full eval run. That's $175-875 per nightly run. Is this justifiable?

4. **Can quality gate meta-rubrics actually validate gate effectiveness?** Testing whether a claim verification gate "works" requires knowing which claims are actually fabricated — which requires either planted errors (artificial) or human labelling (expensive).

5. **What's the minimum golden dataset size for meaningful evaluation?** We've proposed 3-5 per step, but is 3 enough for statistical stability? How much variance should we expect between runs?

### Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Rubric scores don't correlate with human quality judgements** | Medium | High | Calibrate against human labels before trusting. Re-calibrate quarterly. |
| **Automated optimisation produces prompts that game the rubric** | Medium | High | Require human review of example outputs, not just scores. Compliance hard constraint. |
| **API costs exceed budget as library grows** | High | Medium | Cache results aggressively. Run full evals nightly, not per-PR. Use cheaper models for screening. |
| **Contributors find evaluation too complex/intimidating** | Medium | Medium | Abstract evaluation behind GitHub Actions. Contributors never need to run eval locally. |
| **Model updates break evaluation stability** | Medium | Medium | Pin model versions in eval config. Test new models separately before switching. |
| **False positives block legitimate PRs** | Medium | Low | Set thresholds conservatively (pass at 3.0, not 4.0). Allow maintainer override. |
| **Compliance dimension fails to catch real compliance issues** | Low | Very High | Compliance evaluation augments, never replaces, human compliance review. Make this explicit in documentation. |
| **Single-maintainer bottleneck on human review** | High | High | Design the system to minimise review burden. Automated triage. Consider recruiting a second reviewer from another agency. |
| **Evaluation infrastructure becomes harder to maintain than the prompts themselves** | Medium | High | Keep it simple. Promptfoo YAML + golden JSON + GitHub Actions. Resist adding complexity without clear need. |

### Questions for the Project to Resolve

- **Should evaluation results be public?** Showing evaluation scores on the Gallery website would build credibility but also set expectations. If scores drop during a model transition, does that undermine trust?
- **How should agency-customised prompts be evaluated?** If an agency forks a workflow and customises it, should they inherit the evaluation infrastructure? Who maintains their rubrics?
- **What's the governance model for rubric changes?** Changing a rubric retroactively changes the scores of all existing prompts. Who decides when rubric changes are warranted?
- **Should the GovAI team be involved in evaluation design?** If GovAI Chat launches with template support, evaluation criteria could influence which prompts are featured. Is this a collaboration opportunity or a governance risk?

---

## Reference Materials

### Evaluation Frameworks
- Promptfoo — https://www.promptfoo.dev/docs/intro/ (MIT licence, GitHub Actions integration, LLM-as-Judge support)
- Promptfoo CI/CD Integration — https://www.promptfoo.dev/docs/integrations/ci-cd/
- Promptfoo GitHub Repository — https://github.com/promptfoo/promptfoo
- DeepEval — https://deepeval.com/docs/getting-started (Python-first, G-Eval implementation, CI/CD integration)
- DeepEval G-Eval Documentation — https://deepeval.com/docs/metrics-llm-evals
- DeepEval GitHub Repository — https://github.com/confident-ai/deepeval
- LangSmith — https://smith.langchain.com (LangChain ecosystem, tracing + evaluation)
- Evidently AI LLM-as-Judge Guide — https://www.evidentlyai.com/llm-guide/llm-as-a-judge
- Langfuse LLM-as-Judge Documentation — https://langfuse.com/docs/evaluation/evaluation-methods/llm-as-a-judge

### LLM-as-Judge Research
- Liu et al. (2023), "NLG Evaluation using GPT-4 with Better Human Alignment" (G-Eval paper) — https://arxiv.org/abs/2303.16634
- Zheng et al. (2023), "Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena" — https://arxiv.org/abs/2306.05685
- Pan et al. (2024), EvalAssist — https://ojs.aaai.org/index.php/AAAI/article/view/35351
- Wolfe, C.R. (2024), "Using LLMs for Evaluation" — https://cameronrwolfe.substack.com/p/llm-as-a-judge
- Emergent Mind LLM-as-Judge topic overview — https://www.emergentmind.com/topics/llm-as-a-judge-evaluations
- Monte Carlo, "LLM-As-Judge: 7 Best Practices & Evaluation Templates" — https://www.montecarlodata.com/blog-llm-as-judge/

### Automated Prompt Optimisation
- DSPy Framework — https://dspy.ai/
- DSPy Optimizers Documentation — https://dspy.ai/learn/optimization/optimizers/
- DSPy Optimization Overview — https://dspy.ai/learn/optimization/overview/
- DSPy GitHub Repository — https://github.com/stanfordnlp/dspy
- Rivest, M. (2025), "Hacking DSPy into doing Automatic System Prompt Optimization" — https://maximerivest.com/posts/automatic-system-prompt-optimization.html
- Towards Data Science (2025), "Systematic LLM Prompt Engineering Using DSPy Optimization" — https://towardsdatascience.com/systematic-llm-prompt-engineering-using-dspy-optimization/
- Haystack, "Prompt Optimization with DSPy" — https://haystack.deepset.ai/cookbook/prompt_optimization_with_dspy

### Government AI Governance
- UK AI Playbook for Government (February 2025) — https://www.gov.uk/government/publications/ai-playbook-for-the-uk-government/artificial-intelligence-playbook-for-the-uk-government-html
- UK GDS AI Playbook Launch Blog — https://gds.blog.gov.uk/2025/02/10/launching-the-artificial-intelligence-playbook-for-the-uk-government/
- UK GDS Responsible AI Advisory Panel (March 2026) — https://www.gov.uk/government/groups/gds-responsible-ai-advisory-panel
- UK GDS Data Ethics Frameworks — https://cddo.blog.gov.uk/2025/03/10/developing-frameworks-and-tools-to-support-responsible-data-and-ai-use-across-the-public-sector/
- UK GDS User Research on AI in Government — https://cddo.blog.gov.uk/2025/03/27/gdss-user-research-on-ai-in-government/
- US OMB M-25-21, Accelerating Federal Use of AI — https://www.whitehouse.gov/wp-content/uploads/2025/02/M-25-21-Accelerating-Federal-Use-of-AI-through-Innovation-Governance-and-Public-Trust.pdf
- US OMB M-26-04, Unbiased AI Principles — https://www.whitehouse.gov/wp-content/uploads/2025/12/M-26-04-Increasing-Public-Trust-in-Artificial-Intelligence-Through-Unbiased-AI-Principles-1.pdf
- APS AI Plan 2025 — https://digital.gov.au/policy/ai/australian-public-service-ai-plan-2025
- PSPF Policy Advisory 001-2025 — https://protectivesecurity.gov.au
- GovAI Platform — https://govai.gov.au
- DTA Staff Guidance on Public Generative AI — https://digital.gov.au/policy/ai/staff-guidance-public-generative-ai

### Enterprise Prompt Governance
- TrueFoundry + Promptfoo Enterprise Integration (December 2025) — https://www.truefoundry.com/blog/enterprise-ready-prompt-evaluation-how-truefoundry-and-promptfoo-enable-confident-ai-at-scale
- Braintrust, "The 5 Best Prompt Evaluation Tools in 2025" — https://www.braintrust.dev/articles/best-prompt-evaluation-tools-2025
- Helicone, "Top Prompt Evaluation Frameworks in 2025" — https://www.helicone.ai/blog/prompt-evaluation-frameworks
- AiMultiple, "The LLM Evaluation Landscape with Frameworks" — https://aimultiple.com/llm-eval-tools
- Lumenova, "State of AI 2025: Year in Review & Analysis" — https://www.lumenova.ai/blog/state-of-ai-2025/

### Evaluation Landscape Overviews
- Tutorials Dojo, "Amazon Bedrock + Promptfoo: Rethinking LLM Evaluation Methods" — https://tutorialsdojo.com/amazon-bedrock-promptfoo-rethinking-llm-evaluation-methods/
- Confident AI, "LLM Evaluation Metrics: The Ultimate Guide" — https://www.confident-ai.com/blog/llm-evaluation-metrics-everything-you-need-for-llm-evaluation
- Confident AI, "G-Eval: The Definitive Guide" — https://www.confident-ai.com/blog/g-eval-the-definitive-guide

---

*Document version: 0.1 — Evaluation, Benchmarking & Self-Improvement*
*Created: March 2026*
*Companion to: aps-genai-prompt-library-research-1.md, aps-genai-prompt-library-architecture.md*
*Status: Draft for discussion and implementation planning*
*Next review: After Phase 0 implementation provides empirical data*
