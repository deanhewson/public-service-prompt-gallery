// src/pages/search-index.json.ts
const domainLabels = {
  policy_development:     'Policy Development',
  stakeholder_engagement: 'Stakeholder Engagement',
  general_productivity:   'General Productivity',
  communications:         'Communications',
  career_performance:     'Career & Performance',
};

const blockTypeLabels = {
  generation:      'Generation',
  refinement:      'Refinement',
  role_definition: 'Role Definition',
  quality_gate:    'Quality Gate',
};

export async function GET() {
  const wfModules  = import.meta.glob('../../data/workflows/*.json',       { eager: true });
  const bbModules  = import.meta.glob('../../data/building-blocks/*.json', { eager: true });
  const qgModules  = import.meta.glob('../../data/quality-gates/*.json',   { eager: true });

  const workflowIndex = Object.values(wfModules).map((wf: any) => {
    const domainLabel = domainLabels[wf.domain] ?? wf.domain;
    return {
      id:           wf.id,
      type:         'workflow',
      icon:         wf.icon ?? '📋',
      name:         wf.name,
      description:  wf.description ?? '',
      domain:       wf.domain,
      domain_label: domainLabel,
      complexity:   wf.complexity ?? '',
      tags:         wf.tags ?? [],
      step_count:   Array.isArray(wf.steps) ? wf.steps.length : 0,
      estimated_time: wf.estimated_time ?? '',
      url:          `/workflows/${wf.slug}`,
      search_text:  [wf.name, wf.description ?? '', domainLabel, ...(wf.tags ?? []), wf.search_keywords ?? ''].join(' '),
    };
  });

  const allBlocks = [...Object.values(bbModules), ...Object.values(qgModules)];
  const blockIndex = allBlocks.map((block: any) => {
    const blockType  = block.block_type ?? 'quality_gate';
    const domainLabel = domainLabels[block.domains?.[0]] ?? '';
    return {
      id:           block.id,
      type:         'block',
      name:         block.name,
      description:  block.description ?? '',
      search_text:  [block.name, block.description ?? '', ...(block.tags ?? [])].join(' '),
      tags:         block.tags ?? [],
      block_type:   blockType,
      block_type_label: blockTypeLabels[blockType] ?? blockType,
      domain_label: domainLabel,
      url:          '/building-blocks/',
    };
  });

  return new Response(JSON.stringify([...workflowIndex, ...blockIndex]), {
    headers: { 'Content-Type': 'application/json' },
  });
}
