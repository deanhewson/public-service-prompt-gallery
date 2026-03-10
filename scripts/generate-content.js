/**
 * generate-content.js
 *
 * Generates draft JSON for seed building blocks and quality gates using
 * a local LM Studio instance (OpenAI-compatible API at http://localhost:1234/v1).
 *
 * Usage: node scripts/generate-content.js
 *
 * Output: scripts/output/<ID>.json for each item generated
 */

import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, 'output');
const BASE_URL = 'http://localhost:1234/v1';
const DELAY_MS = 1000;
const TODAY = new Date().toISOString().split('T')[0];

// ---------------------------------------------------------------------------
// Seed items to generate (BB-ROLE-001 and QG-TRUST-001 are already done)
// ---------------------------------------------------------------------------

const ITEMS = [
  {
    id: 'BB-ROLE-002',
    name: 'Program Delivery Officer',
    type: 'building_block',
    block_type: 'role_definition',
    description: 'APS 6 program officer focused on implementation and operations',
    domain: 'program_delivery',
  },
  {
    id: 'BB-ROLE-003',
    name: 'Comms Adviser',
    type: 'building_block',
    block_type: 'role_definition',
    description: 'EL1 communications adviser skilled in plain language and stakeholder messaging',
    domain: 'stakeholder_engagement',
  },
  {
    id: 'BB-ROLE-004',
    name: 'Data Analyst',
    type: 'building_block',
    block_type: 'role_definition',
    description: 'APS 6-EL1 data analyst familiar with government reporting requirements',
    domain: 'data_analysis',
  },
  {
    id: 'BB-ROLE-005',
    name: 'Compliance Reviewer',
    type: 'building_block',
    block_type: 'role_definition',
    description: 'EL1-EL2 governance officer with PSPF, PGPA, and Privacy Act expertise',
    domain: 'compliance_governance',
  },
  {
    id: 'BB-ROLE-006',
    name: 'Sceptical Senior Executive',
    type: 'building_block',
    block_type: 'role_definition',
    description: 'Deputy Secretary / First Assistant Secretary red-teaming any piece of work',
    domain: 'general',
  },
  {
    id: 'QG-CHALLENGE-001',
    name: 'Red-Team Challenge',
    type: 'quality_gate',
    gate_type: 'challenge',
    description: 'Sceptical senior executive review — stress-tests a draft from an adversarial perspective',
    domain: 'general',
  },
  {
    id: 'QG-COMPLIANCE-001',
    name: 'PGPA/PSPF/Privacy Check',
    type: 'quality_gate',
    gate_type: 'compliance',
    description: 'Checks a draft against PGPA Act, PSPF, Privacy Act, and APS Values obligations',
    domain: 'compliance_governance',
  },
  {
    id: 'QG-BIAS-001',
    name: 'Balance and Perspectives',
    type: 'quality_gate',
    gate_type: 'bias_balance',
    description: 'Checks for missing stakeholder perspectives, imbalance, or assumptions in a draft',
    domain: 'general',
  },
  {
    id: 'QG-TONE-001',
    name: 'Audience Fit',
    type: 'quality_gate',
    gate_type: 'tone_audience',
    description: 'Validates tone, jargon level, and appropriateness for the intended reader',
    domain: 'general',
  },
  {
    id: 'QG-COMPLETE-001',
    name: 'Completeness Check',
    type: 'quality_gate',
    gate_type: 'completeness',
    description: 'Verifies all required elements of a document or analysis are present',
    domain: 'general',
  },
];

// ---------------------------------------------------------------------------
// Few-shot examples: complete JSON from architecture doc
// ---------------------------------------------------------------------------

const EXAMPLE_BUILDING_BLOCK = {
  id: 'BB-ROLE-001',
  name: 'Senior Policy Analyst Role',
  description: 'Sets the AI\'s persona as an experienced APS policy analyst. Use as a prefix for any policy-related task.',
  version: '1.0',
  last_reviewed: '2026-03-01',
  block_type: 'role_definition',
  domains: ['policy_development', 'compliance_governance'],
  prompt_template: '<role>You are an experienced Australian Public Service policy analyst at the EL1 level, working in {{agency}}. You have 8+ years of experience in {{policy_area}}. You write in formal but clear APS style — concise, evidence-based, and impartial. You understand the machinery of government including ministerial, parliamentary, and cabinet processes.</role>',
  variables: [
    {
      name: 'agency',
      description: 'The agency or portfolio context',
      type: 'text',
      required: true,
      examples: ['Department of Social Services', 'Department of Finance', 'Department of Health and Aged Care'],
    },
    {
      name: 'policy_area',
      description: 'The specific policy domain',
      type: 'text',
      required: true,
      examples: ['aged care reform', 'digital government', 'Indigenous affairs'],
    },
  ],
  skill_adaptations: {
    beginner: {
      notes: 'For users new to GenAI — this block can be used standalone to improve any policy-related prompt. Just paste it before your question.',
      prompt_modification: null,
    },
    intermediate: {
      notes: 'Combine with a context block and specific instructions for better results.',
      prompt_modification: null,
    },
    advanced: {
      notes: 'Consider customising the role definition for your specific branch/team conventions. Add specific frameworks or legislation the analyst should be familiar with.',
      prompt_modification: 'Add after the role block: <expertise>You are particularly familiar with {{frameworks}} and routinely prepare advice that accounts for {{considerations}}.</expertise>',
    },
  },
  platform_notes: {
    claude: 'XML tags are processed natively. Use as-is.',
    chatgpt: 'Remove XML tags and convert to plain instructions: \'Act as an experienced APS policy analyst...\'',
    copilot: 'Use as system-level instructions where possible, or prefix to your prompt.',
    govai_chat: 'Pending — test when available (April 2026 trial).',
  },
  tags: ['role', 'policy', 'reusable', 'prefix'],
  contributed_by: null,
  source: 'upstream',
  status: 'published',
  known_limitations: [
    'Role assignment improves tone and framing but does not give the model actual APS experience or access to internal knowledge.',
    'The model may still produce content that sounds authoritative but is fabricated — role prompts increase this risk if not paired with verification steps.',
  ],
};

const EXAMPLE_QUALITY_GATE = {
  id: 'QG-TRUST-001',
  name: 'Claim Verification Gate',
  description: 'Extracts every factual claim from a draft and categorises each by verifiability. Makes the trust boundary visible — what can you rely on vs. what needs human verification.',
  version: '1.0',
  last_reviewed: '2026-03-01',
  gate_type: 'factual_accuracy',
  severity: 'recommended',
  prompt_template: '<instructions>\nReview the following draft and extract every specific factual claim — statistics, dates, program names, legislative references, organisational details, and causal assertions.\n\nFor each claim, categorise it as:\n\n1. **VERIFIABLE**: A specific, checkable fact (provide suggested verification source)\n2. **PLAUSIBLE BUT UNVERIFIED**: Sounds reasonable but you\'re not certain — needs human verification\n3. **INFERRED**: A conclusion or inference drawn from context, not a direct fact\n4. **POTENTIALLY FABRICATED**: A specific detail (name, number, date) that may be hallucinated\n\nPresent as a numbered table with columns: Claim | Category | Verification Action\n\nAt the end, provide a TRUST SUMMARY:\n- Total claims: X\n- Verified/verifiable: X\n- Needs checking: X\n- Risk level: LOW / MEDIUM / HIGH\n</instructions>\n\n<draft>\n{{draft_content}}\n</draft>',
  variables: [
    {
      name: 'draft_content',
      description: 'The draft text to verify',
      type: 'long_text',
      required: true,
    },
  ],
  trust_pattern: 'extraction_and_categorisation',
  compliance_frameworks: ['pgpa_act'],
  skill_adaptations: {
    beginner: {
      notes: 'This is the single most important quality gate. If you only use one verification step, use this one. Copy the output of your draft, paste it into this prompt.',
      prompt_modification: 'Add to the end of the prompt: \'Explain each categorisation in plain language so I can understand why you flagged it.\'',
    },
    intermediate: {
      notes: 'Use after any substantive drafting step. Pay particular attention to POTENTIALLY FABRICATED items — these are the highest risk.',
      prompt_modification: null,
    },
    advanced: {
      notes: 'Chain this with the Compliance Gate and Bias Gate for comprehensive verification. Consider running this gate twice — once on the draft, once on the revised version — to catch introduced errors.',
      prompt_modification: null,
    },
  },
  platform_notes: {
    claude: 'XML tags are processed natively. Use as-is.',
    chatgpt: 'Remove the <instructions> and <draft> XML tags. Paste instructions as plain text followed by the draft.',
    copilot: 'Paste instructions as plain text. The <draft> section can be replaced with: "Here is the draft to review:" followed by the content.',
    govai_chat: 'Pending — test when available (April 2026 trial).',
  },
  tags: ['verification', 'trust', 'factual', 'essential'],
  contributed_by: null,
  source: 'upstream',
  status: 'published',
  known_limitations: [
    'The model is checking its own work — it may not catch its own hallucinations. This gate surfaces claims for HUMAN verification, not AI self-verification.',
    'Cannot actually verify claims against external sources in a standard chat interface. The value is in making claims explicit so the officer can check them.',
  ],
};

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are generating content for an Australian Public Service (APS) GenAI prompt library.

Your output must be valid JSON only. No markdown code fences, no preamble, no explanation, no trailing text — just the raw JSON object.

Follow the schema exactly as shown in the examples below. Every output must include these fields:
- id, name, description, version ("1.0"), last_reviewed ("${TODAY}")
- block_type (for building blocks) OR gate_type (for quality gates)
- prompt_template — use {{variable_name}} syntax for any user-provided inputs
- variables — array of variable objects (can be empty array [] if the prompt needs no inputs)
- skill_adaptations — object with beginner, intermediate, advanced keys; each has "notes" (string) and "prompt_modification" (string or null)
- platform_notes — object with claude, chatgpt, copilot, govai_chat keys
- tags — array of lowercase strings
- known_limitations — array of at least 2 honest limitation strings
- contributed_by — null
- source — "upstream"
- status — "draft"

For quality gates, also include:
- severity — "required" | "recommended" | "optional"
- trust_pattern — a short string describing the verification approach

All content must be APS-appropriate: formal, compliance-aware, impartial. Prompt templates should follow APS conventions and be directly usable in Claude (with XML tags) and other tools (without).

---

EXAMPLE 1 — Building Block (role_definition type):
${JSON.stringify(EXAMPLE_BUILDING_BLOCK, null, 2)}

---

EXAMPLE 2 — Quality Gate (factual_accuracy type):
${JSON.stringify(EXAMPLE_QUALITY_GATE, null, 2)}

---

Now generate the item described in the user message. Output valid JSON only.`;

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

async function getModelName() {
  const res = await fetch(`${BASE_URL}/models`, {
    headers: { Authorization: 'Bearer lm-studio' },
  });
  if (!res.ok) throw new Error(`GET /v1/models failed: ${res.status} ${res.statusText}`);
  const data = await res.json();
  if (!data.data || data.data.length === 0) throw new Error('No models loaded in LM Studio');
  const model = data.data[0].id;
  console.log(`Using model: ${model}\n`);
  return model;
}

async function generateItem(model, item) {
  const userMessage = item.type === 'building_block'
    ? `Generate a building block with these details:
- ID: ${item.id}
- Name: ${item.name}
- block_type: ${item.block_type}
- Description: ${item.description}
- Primary domain: ${item.domain}

Make the prompt_template rich and APS-appropriate. Include 1-3 variables where they add value. Skill adaptations should give meaningfully different guidance at each level.`
    : `Generate a quality gate with these details:
- ID: ${item.id}
- Name: ${item.name}
- gate_type: ${item.gate_type}
- Description: ${item.description}
- Primary domain: ${item.domain}

The prompt_template should be a thorough, structured gate prompt that produces a clear, actionable output an APS officer can work through. Include a {{draft_content}} variable (or other appropriate variables). Skill adaptations should reflect different depths of verification.`;

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer lm-studio',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.4,
      max_tokens: 3000,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response from model');
  return content;
}

function parseJSON(raw, id) {
  // Strip markdown code fences if the model added them despite instructions
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`JSON parse failed: ${err.message}\n\nRaw output:\n${raw.slice(0, 500)}`);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('=== APS Prompt Library — Content Generator ===\n');

  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true });
  }

  // Get model name from LM Studio
  let model;
  try {
    model = await getModelName();
  } catch (err) {
    console.error(`\nFailed to connect to LM Studio at ${BASE_URL}`);
    console.error('Make sure LM Studio is running and a model is loaded.\n');
    console.error(err.message);
    process.exit(1);
  }

  const results = { succeeded: [], failed: [] };

  for (let i = 0; i < ITEMS.length; i++) {
    const item = ITEMS[i];
    const progress = `[${i + 1}/${ITEMS.length}]`;

    console.log(`${progress} Generating ${item.id} — ${item.name}...`);

    try {
      const raw = await generateItem(model, item);
      const parsed = parseJSON(raw, item.id);

      // Sanity check: must have an id field
      if (!parsed.id) {
        throw new Error('Output JSON missing required "id" field');
      }

      const outPath = path.join(OUTPUT_DIR, `${item.id}.json`);
      await writeFile(outPath, JSON.stringify(parsed, null, 2), 'utf8');
      console.log(`  ✓ Written to scripts/output/${item.id}.json`);
      results.succeeded.push(item.id);
    } catch (err) {
      console.error(`  ✗ Failed: ${err.message}`);
      results.failed.push({ id: item.id, error: err.message });
    }

    // Delay between requests (skip after the last one)
    if (i < ITEMS.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  // Summary
  console.log('\n=== Summary ===');
  console.log(`Succeeded: ${results.succeeded.length} — ${results.succeeded.join(', ') || 'none'}`);
  console.log(`Failed:    ${results.failed.length}${results.failed.length > 0 ? ' — ' + results.failed.map(f => f.id).join(', ') : ''}`);

  if (results.failed.length > 0) {
    console.log('\nFailed items detail:');
    for (const f of results.failed) {
      console.log(`  ${f.id}: ${f.error}`);
    }
  }
}

main();
