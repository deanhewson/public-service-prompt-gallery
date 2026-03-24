// src/pages/search-index.json.ts
// Build-time endpoint — generates /search-index.json from all workflow JSON files.
// Fuse.js (CDN) loads this file client-side for fuzzy search.

const domainLabels = {
  policy_development:     'Policy Development',
  stakeholder_engagement: 'Stakeholder Engagement',
  general_productivity:   'General Productivity',
  communications:         'Communications',
  career_performance:     'Career & Performance',
};

export async function GET() {
  // import.meta.glob path is relative to THIS file (src/pages/)
  const modules = import.meta.glob('../../data/workflows/*.json', { eager: true });

  const index = Object.values(modules).map((wf: any) => {
    const domainLabel = domainLabels[wf.domain] ?? wf.domain;
    return {
      id: wf.id,
      icon: wf.icon ?? '📋',
      name: wf.name,
      description: wf.description ?? '',
      domain: wf.domain,
      domain_label: domainLabel,
      complexity: wf.complexity ?? '',
      tags: wf.tags ?? [],
      step_count: Array.isArray(wf.steps) ? wf.steps.length : 0,
      estimated_time: wf.estimated_time ?? '',
      url: `/workflows/${wf.slug}`,
      search_text: [
        wf.name,
        wf.description ?? '',
        domainLabel,
        ...(wf.tags ?? []),
        wf.search_keywords ?? ''
      ].join(' ')
    };
  });

  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json' },
  });
}
