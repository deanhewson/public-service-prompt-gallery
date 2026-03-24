# Navigation & Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hardcoded dropdown nav with a two-tier nav + browse page + fuzzy search overlay, all in vanilla Astro/JS.

**Architecture:** New `src/components/nav/` and `src/components/browse/` component trees replace nav code currently duplicated across `WorkflowLayout.astro` and `index.astro`. A build-time Astro endpoint generates `/search-index.json` from workflow JSON files; Fuse.js (CDN) powers fuzzy search on the browse page and a Cmd+K overlay.

**Tech Stack:** Astro 5, vanilla JS, Fuse.js v7 via jsDelivr CDN, static JSON data files in `data/workflows/`

---

## Context

> Read before starting. Do not skip this.

**Codebase basics:**
- `src/layouts/WorkflowLayout.astro` (~1928 lines) — the main layout used by all 6 workflow pages. The current nav (dropdown style) lives here at lines 1106–1150. Nav CSS is at lines 138–278. Hamburger JS is at lines 1914–1923.
- `src/pages/index.astro` — homepage. Has a *duplicate* copy of the nav (same HTML/CSS/JS pattern). Nav HTML is around line 525–580.
- `data/workflows/*.json` — 6 workflow JSON files. No Astro content collections; these are plain imports.
- `src/components/` — **does not exist yet**. You'll create it.
- `src/pages/workflows/` — contains 6 individual workflow pages (`briefing-note.astro` etc.). Do NOT touch these.

**CSS custom properties** (already defined in WorkflowLayout.astro, will be in TopNav too):
```css
--color-primary: #170a1c;   /* deep plum */
--color-bg: #F7F7FF;
--color-border: #dee2e6;
```
The `.hidden { display: none !important; }` class already exists in WorkflowLayout.astro (line 882).

**Build command:** `npm run build` (`astro build`). This IS the test — it either compiles or it doesn't. Run it after each task. There is no other test framework.

**Commit style:** imperative, lowercase, short. E.g. `add topnav component`.

**Spec doc:** `notes/design-nav-search-20260324.md` — read this for full detail on any component.

---

## File Map

**Create:**
```
src/components/nav/TopNav.astro
src/components/nav/WorkflowNav.astro
src/components/nav/MobileMenu.astro
src/components/nav/SearchOverlay.astro
src/components/browse/WorkflowCard.astro
src/components/browse/FilterPills.astro
src/components/browse/SearchBar.astro
src/components/browse/NoResults.astro
src/pages/workflows/index.astro
src/pages/search-index.json.ts
src/pages/about.astro
```

**Modify:**
```
src/layouts/WorkflowLayout.astro   (remove nav HTML/CSS/JS, import components)
src/pages/index.astro              (remove nav HTML/CSS/JS, import components)
data/workflows/*.json              (add slug field — 6 files, Phase 2 only)
```

---

## Phase 1 — Two-Tier Nav

### Task 1: Create TopNav.astro

**Files:**
- Create: `src/components/nav/TopNav.astro`

The TopNav is Tier 1 — the sticky project-level bar (logo + Home/About/Roadmap/Contribute + search icon + hamburger trigger). It replaces the current `<header class="site-header">` block.

- [ ] Create `src/components/nav/TopNav.astro` with this content:

```astro
---
const currentPath = Astro.url.pathname;
---

<header class="site-header">
  <nav class="site-nav">
    <a href="/" class="nav-logo">APS Prompt Gallery</a>
    <div class="nav-links">
      <a href="/"        class={`nav-link-flat${currentPath === '/' ? ' nav-link-flat-active' : ''}`}>Home</a>
      <a href="/about"   class={`nav-link-flat${currentPath === '/about' ? ' nav-link-flat-active' : ''}`}>About</a>
      <a href="/roadmap" class={`nav-link-flat${currentPath === '/roadmap' ? ' nav-link-flat-active' : ''}`}>Roadmap</a>
      <a href="https://github.com/deanhewson/public-service-prompt-gallery" class="nav-link-flat" target="_blank" rel="noopener">Contribute</a>
      <button class="nav-search-btn" id="nav-search-btn" aria-label="Search workflows">🔍</button>
    </div>
    <button class="nav-hamburger" id="nav-hamburger" aria-label="Open navigation" aria-expanded="false">☰</button>
  </nav>
</header>

<style>
  *, *::before, *::after { box-sizing: border-box; }

  .site-header {
    background: #170a1c;
    color: white;
    padding: 0 24px;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .site-nav {
    max-width: 900px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    min-height: 48px;
  }

  .nav-logo {
    color: white;
    font-weight: 700;
    font-size: 0.95rem;
    white-space: nowrap;
    margin-right: 24px;
    padding: 14px 0;
    flex-shrink: 0;
    text-decoration: none;
  }
  .nav-logo:hover { opacity: 0.9; }

  .nav-links {
    display: flex;
    align-items: stretch;
    margin-left: auto;
    gap: 0;
  }

  .nav-link-flat {
    color: rgba(255,255,255,0.8);
    font-size: 0.85rem;
    padding: 14px 12px;
    white-space: nowrap;
    display: flex;
    align-items: center;
    text-decoration: none;
    border-bottom: 3px solid transparent;
  }
  .nav-link-flat:hover { color: white; text-decoration: none; }
  .nav-link-flat-active { color: white; border-bottom-color: rgba(255,255,255,0.7); }

  .nav-search-btn {
    background: none;
    border: none;
    color: rgba(255,255,255,0.8);
    font-size: 1rem;
    padding: 14px 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
  }
  .nav-search-btn:hover { color: white; }

  .nav-hamburger {
    display: none;
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 8px 4px;
    margin-left: auto;
    line-height: 1;
  }

  @media (max-width: 680px) {
    .nav-links { display: none; }
    .nav-hamburger { display: block; }
  }
</style>

<script>
  const searchBtn = document.getElementById('nav-search-btn');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('open-search'));
    });
  }

  const hamburger = document.getElementById('nav-hamburger');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
      hamburger.setAttribute('aria-expanded', String(!isOpen));
      hamburger.textContent = isOpen ? '☰' : '✕';
      window.dispatchEvent(new CustomEvent(isOpen ? 'close-mobile-menu' : 'open-mobile-menu'));
    });
  }
</script>
```

- [ ] Run `npm run build` — expected: builds without errors

---

### Task 2: Create WorkflowNav.astro

**Files:**
- Create: `src/components/nav/WorkflowNav.astro`

Tier 2 — the domain filter bar. Sits below TopNav. Hidden on mobile (its links appear in MobileMenu instead).

- [ ] Create `src/components/nav/WorkflowNav.astro`:

```astro
---
// No props needed — reads query params client-side for active state
---

<nav class="workflow-nav">
  <div class="workflow-nav-inner">
    <a href="/workflows/" class="wf-nav-link" data-match="all">All Workflows</a>
    <a href="/workflows/?domain=policy_development"     class="wf-nav-link" data-domain="policy_development">Policy Development</a>
    <a href="/workflows/?domain=stakeholder_engagement" class="wf-nav-link" data-domain="stakeholder_engagement">Stakeholder Engagement</a>
    <a href="/workflows/?domain=general_productivity"   class="wf-nav-link" data-domain="general_productivity">General Productivity</a>
    <a href="/workflows/?domain=career_performance"     class="wf-nav-link" data-domain="career_performance">Career & Performance</a>
    <a href="/workflows/" class="wf-nav-link" data-match="building-blocks">Building Blocks</a>
  </div>
</nav>

<style>
  .workflow-nav {
    background: #1e0d26;
    border-top: 1px solid rgba(255,255,255,0.1);
    padding: 0 24px;
    overflow-x: auto;
  }

  .workflow-nav-inner {
    max-width: 900px;
    margin: 0 auto;
    display: flex;
    gap: 0;
  }

  .wf-nav-link {
    color: rgba(255,255,255,0.7);
    font-size: 0.82rem;
    padding: 10px 12px;
    white-space: nowrap;
    text-decoration: none;
    border-bottom: 2px solid transparent;
    transition: color 0.15s;
  }
  .wf-nav-link:hover { color: white; text-decoration: none; }
  .wf-nav-link.active { color: white; border-bottom-color: rgba(255,255,255,0.6); }

  @media (max-width: 680px) {
    .workflow-nav { display: none; }
  }
</style>

<script>
  // Highlight the link matching the current ?domain= query param
  const params = new URLSearchParams(window.location.search);
  const domain = params.get('domain');
  if (domain) {
    const link = document.querySelector(`.wf-nav-link[data-domain="${domain}"]`);
    if (link) link.classList.add('active');
  } else if (window.location.pathname === '/workflows/' || window.location.pathname === '/workflows') {
    const allLink = document.querySelector('.wf-nav-link[data-match="all"]');
    if (allLink) allLink.classList.add('active');
  }
</script>
```

- [ ] Run `npm run build` — expected: builds without errors

---

### Task 3: Create MobileMenu.astro

**Files:**
- Create: `src/components/nav/MobileMenu.astro`

Full-viewport slide-out panel. Contains a search input (opens SearchOverlay on focus), Tier 1 links, then Tier 2 domain links. Controlled by `open-mobile-menu` / `close-mobile-menu` custom events dispatched by the hamburger button in TopNav.

- [ ] Create `src/components/nav/MobileMenu.astro`:

```astro
---
const currentPath = Astro.url.pathname;
---

<div class="mobile-menu" id="mobile-menu" aria-hidden="true">
  <div class="mobile-menu-top">
    <input
      type="search"
      id="mobile-search-input"
      class="mobile-search-input"
      placeholder="Search workflows…"
      autocomplete="off"
    />
    <button class="mobile-close" id="mobile-close" aria-label="Close menu">✕</button>
  </div>

  <div class="mobile-section-label">Navigate</div>
  <a href="/"        class={currentPath === '/' ? 'mobile-link active' : 'mobile-link'}>Home</a>
  <a href="/about"   class={currentPath === '/about' ? 'mobile-link active' : 'mobile-link'}>About</a>
  <a href="/roadmap" class={currentPath === '/roadmap' ? 'mobile-link active' : 'mobile-link'}>Roadmap</a>
  <a href="https://github.com/deanhewson/public-service-prompt-gallery" class="mobile-link" target="_blank" rel="noopener">Contribute ↗</a>

  <div class="mobile-divider"></div>

  <div class="mobile-section-label">Workflows</div>
  <a href="/workflows/" class="mobile-link">All Workflows</a>
  <a href="/workflows/?domain=policy_development"     class="mobile-link">Policy Development</a>
  <a href="/workflows/?domain=stakeholder_engagement" class="mobile-link">Stakeholder Engagement</a>
  <a href="/workflows/?domain=general_productivity"   class="mobile-link">General Productivity</a>
  <a href="/workflows/?domain=career_performance"     class="mobile-link">Career & Performance</a>
  <a href="/workflows/" class="mobile-link">Building Blocks</a>
</div>

<style>
  .mobile-menu {
    display: none;
    position: fixed;
    inset: 0;
    background: #1e0d26;
    z-index: 300;
    overflow-y: auto;
    flex-direction: column;
  }
  .mobile-menu.is-open { display: flex; }

  .mobile-menu-top {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }

  .mobile-search-input {
    flex: 1;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 6px;
    color: white;
    font-size: 0.9rem;
    padding: 8px 12px;
    outline: none;
  }
  .mobile-search-input::placeholder { color: rgba(255,255,255,0.45); }

  .mobile-close {
    background: none;
    border: none;
    color: rgba(255,255,255,0.7);
    font-size: 1.2rem;
    cursor: pointer;
    padding: 6px;
  }

  .mobile-section-label {
    color: rgba(255,255,255,0.4);
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 12px 20px 4px;
  }

  .mobile-link {
    display: block;
    color: rgba(255,255,255,0.85);
    font-size: 0.9rem;
    padding: 12px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    text-decoration: none;
  }
  .mobile-link:hover { color: white; background: rgba(255,255,255,0.08); }
  .mobile-link.active { color: white; font-weight: 600; }

  .mobile-divider {
    height: 1px;
    background: rgba(255,255,255,0.15);
    margin: 8px 0;
  }
</style>

<script>
  const menu = document.getElementById('mobile-menu');
  const closeBtn = document.getElementById('mobile-close');
  const searchInput = document.getElementById('mobile-search-input');

  function openMenu() {
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
  }
  function closeMenu() {
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
  }

  window.addEventListener('open-mobile-menu', openMenu);
  window.addEventListener('close-mobile-menu', closeMenu);
  closeBtn?.addEventListener('click', closeMenu);

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) closeMenu();
  });

  // Mobile search input opens the search overlay
  searchInput?.addEventListener('focus', () => {
    closeMenu();
    window.dispatchEvent(new CustomEvent('open-search'));
  });
</script>
```

- [ ] Run `npm run build` — expected: builds without errors

---

### Task 4: Refactor WorkflowLayout.astro

**Files:**
- Modify: `src/layouts/WorkflowLayout.astro`

Remove the old nav HTML (lines ~1106–1150), nav CSS (lines ~138–278), and hamburger JS (lines ~1914–1923). Import `TopNav`, `WorkflowNav`, and `MobileMenu` instead. Also import the (not-yet-created) `SearchOverlay` — add a placeholder comment for now.

- [ ] In `WorkflowLayout.astro` frontmatter (at the top, inside `---`), add:

```astro
import TopNav from '../components/nav/TopNav.astro';
import WorkflowNav from '../components/nav/WorkflowNav.astro';
import MobileMenu from '../components/nav/MobileMenu.astro';
```

- [ ] In the HTML section, replace the entire `<!-- Nav --> <header>...</header>` block (lines 1106–1150) with:

```astro
<TopNav />
<WorkflowNav />
<MobileMenu />
```

- [ ] In the `<style>` block, delete the nav CSS section (lines ~138–278, from `/* ── Site header / nav ──` through the mobile hamburger block ending at line ~278). Leave all other CSS intact.

  Specifically, delete these CSS rule groups:
  - `.site-header` block
  - `.site-nav` block
  - `.nav-logo` and `.nav-logo:hover`
  - `.nav-links`
  - `.nav-group`, `.nav-group-trigger`, `.nav-group-trigger.has-active`
  - `.nav-chevron`
  - `.nav-dropdown` and its nested selectors
  - `.nav-link-flat`, `.nav-link-flat-active`
  - `.nav-hamburger`
  - `.nav-mobile-menu` and its nested selectors (including the `:global()` ones)
  - The `@media (max-width: 680px)` lines that reference `.nav-links` and `.nav-hamburger` (keep the rest of the media query if other rules are there)

- [ ] In the `<script>` block, delete the hamburger JS (lines ~1914–1923, the `// ── Mobile hamburger` section and its `if` block).

- [ ] Also delete the `navGroups` array from the frontmatter (lines 39–66). It is no longer needed.

- [ ] Run `npm run build` — expected: builds without errors

**Note:** After this step, the nav CSS custom properties (`:root` block with `--color-primary` etc.) must remain in WorkflowLayout.astro's `<style>` — do NOT delete them.

---

### Task 5: Refactor index.astro

**Files:**
- Modify: `src/pages/index.astro`

Same operation as Task 4 but for the homepage. The homepage has a separate duplicate copy of the nav.

- [ ] In `index.astro` frontmatter, add imports:

```astro
import TopNav from '../components/nav/TopNav.astro';
import WorkflowNav from '../components/nav/WorkflowNav.astro';
import MobileMenu from '../components/nav/MobileMenu.astro';
```

- [ ] Replace the `<!-- Nav --> <header>...</header>` block (around lines 525–580) with:

```astro
<TopNav />
<WorkflowNav />
<MobileMenu />
```

- [ ] In the `<style>` block, delete all nav-related CSS (`.site-header`, `.site-nav`, `.nav-logo`, `.nav-links`, `.nav-group*`, `.nav-dropdown*`, `.nav-link-flat*`, `.nav-hamburger`, `.nav-mobile-menu*`, and the mobile media query lines referencing them).

- [ ] In the `<script>` block, delete the hamburger JS section.

- [ ] Run `npm run build` — expected: builds without errors

---

### Task 6: Create about.astro

**Files:**
- Create: `src/pages/about.astro`

Placeholder page. The `/about` route must exist so TopNav's "About" link doesn't 404.

- [ ] Create `src/pages/about.astro`:

```astro
---
import TopNav from '../components/nav/TopNav.astro';
import WorkflowNav from '../components/nav/WorkflowNav.astro';
import MobileMenu from '../components/nav/MobileMenu.astro';
---

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="icon" href="/favicon.ico" />
  <link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:ital,wght@0,200..800;1,200..800&family=Lexend:wght@300..700&display=swap" rel="stylesheet" />
  <title>About — APS Prompt Gallery</title>
  <style>
    body { font-family: 'Atkinson Hyperlegible Next', sans-serif; background: #F7F7FF; margin: 0; }
    .container { max-width: 900px; margin: 0 auto; padding: 48px 20px; }
    h1 { font-family: 'Lexend', sans-serif; color: #170a1c; margin: 0 0 16px; }
    p { color: #6c757d; }
  </style>
</head>
<body>
  <TopNav />
  <WorkflowNav />
  <MobileMenu />
  <div class="container">
    <h1>About</h1>
    <p>Content coming soon. This page will explain the project, how it works, and the trust model behind prompt design for Australian Public Service staff.</p>
  </div>
</body>
</html>
```

- [ ] Run `npm run build` — expected: builds without errors

---

### Task 7: Commit Phase 1

- [ ] Verify `npm run build` passes cleanly with zero errors or warnings
- [ ] Manually open the dev server (`npm run dev`) and confirm:
  - Two-tier nav renders (Tier 1 with Home/About/Roadmap/Contribute, Tier 2 with domain links)
  - At mobile width (< 680px), Tier 1 text links hide, hamburger appears
  - Hamburger opens the slide-out MobileMenu
  - All existing workflow pages still render correctly

- [ ] Commit:

```bash
git add src/components/nav/ src/pages/about.astro src/layouts/WorkflowLayout.astro src/pages/index.astro
git commit -m "add two-tier nav components, replace hardcoded nav"
```

---

## Phase 2 — Browse Page + Search

### Task 8: Add slug fields to workflow JSON files

**Files:**
- Modify: `data/workflows/wf-pol-001-briefing-note.json`
- Modify: `data/workflows/wf-pol-002-question-time-brief.json`
- Modify: `data/workflows/wf-eng-001-stakeholder-analysis.json`
- Modify: `data/workflows/wf-eng-002-plain-language-rewrite.json`
- Modify: `data/workflows/wf-gen-001-meeting-preparation.json`
- Modify: `data/workflows/wf-career-001-monthly-performance-check-in.json`

The slug must exactly match the Astro page route in `src/pages/workflows/` (e.g., `briefing-note` for `briefing-note.astro`). This is how the search index generates correct URLs.

- [ ] Add `"slug": "briefing-note"` to `wf-pol-001-briefing-note.json` (anywhere at the top level)
- [ ] Add `"slug": "question-time-brief"` to `wf-pol-002-question-time-brief.json`
- [ ] Add `"slug": "stakeholder-analysis"` to `wf-eng-001-stakeholder-analysis.json`
- [ ] Add `"slug": "plain-language-rewrite"` to `wf-eng-002-plain-language-rewrite.json`
- [ ] Add `"slug": "meeting-preparation"` to `wf-gen-001-meeting-preparation.json`
- [ ] Add `"slug": "monthly-performance-check-in"` to `wf-career-001-monthly-performance-check-in.json`

- [ ] Run `npm run build` — expected: builds without errors (these are data-only changes)

---

### Task 9: Create search-index.json.ts endpoint

**Files:**
- Create: `src/pages/search-index.json.ts`

This Astro endpoint runs at build time and outputs `/search-index.json` — a flat array of all workflow metadata used by Fuse.js.

- [ ] Create `src/pages/search-index.json.ts`:

```typescript
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
        wf.search_keywords ?? '',
      ].join(' '),
    };
  });

  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json' },
  });
}
```

- [ ] Run `npm run build` — expected: builds without errors
- [ ] Check that `dist/search-index.json` was generated (run `ls dist/search-index.json` or open it in the editor) — it should contain an array of 6 objects

---

### Task 10: Create WorkflowCard.astro

**Files:**
- Create: `src/components/browse/WorkflowCard.astro`

A card component for the browse grid. Props map directly from workflow JSON fields.

- [ ] Create `src/components/browse/WorkflowCard.astro`:

```astro
---
interface Props {
  id: string;
  icon: string;
  name: string;
  url: string;
  domain: string;
  domain_label: string;
  complexity: string;
  step_count: number;
  estimated_time: string;
  description: string;
  is_new?: boolean;
}

const { id, icon, name, url, domain, domain_label, complexity, step_count, estimated_time, description, is_new = false } = Astro.props;

const complexityLabel = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };
---

<a
  href={url}
  class="workflow-card"
  data-id={id}
  data-domain={domain}
  data-complexity={complexity}
>
  <div class="card-top">
    <span class="card-icon">{icon}</span>
    <span class="card-name">{name}</span>
    {is_new && <span class="card-new-badge">New</span>}
  </div>
  <span class="card-domain-badge">{domain_label}</span>
  <div class="card-meta">
    {step_count} steps · {complexityLabel[complexity] ?? complexity} · {estimated_time}
  </div>
  <p class="card-description">{description}</p>
</a>

<style>
  .workflow-card {
    display: block;
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 20px;
    text-decoration: none;
    color: #212529;
    transition: box-shadow 0.15s, border-color 0.15s;
  }
  .workflow-card:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    border-color: #170a1c;
    text-decoration: none;
  }
  .workflow-card.hidden { display: none; }

  .card-top {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }
  .card-icon { font-size: 1.2rem; }
  .card-name { font-weight: 600; font-size: 1rem; color: #170a1c; flex: 1; }
  .card-new-badge {
    background: #198754;
    color: white;
    font-size: 0.7rem;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 12px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .card-domain-badge {
    display: inline-block;
    background: #DFD9E2;
    color: #170a1c;
    font-size: 0.75rem;
    font-weight: 500;
    padding: 3px 10px;
    border-radius: 20px;
    margin-bottom: 8px;
  }

  .card-meta {
    font-size: 0.82rem;
    color: #6c757d;
    margin-bottom: 8px;
  }

  .card-description {
    font-size: 0.875rem;
    color: #495057;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
```

- [ ] Run `npm run build` — expected: builds without errors

---

### Task 11: Create FilterPills, SearchBar, NoResults components

**Files:**
- Create: `src/components/browse/FilterPills.astro`
- Create: `src/components/browse/SearchBar.astro`
- Create: `src/components/browse/NoResults.astro`

These are static HTML shells — the browse page script wires up their behaviour.

- [ ] Create `src/components/browse/FilterPills.astro`:

```astro
---
// No props — active state managed client-side via JS + URLSearchParams
---

<div class="filter-area">
  <div class="filter-row" id="domain-pills">
    <button class="pill active" data-domain="">All</button>
    <button class="pill" data-domain="policy_development">Policy Development</button>
    <button class="pill" data-domain="stakeholder_engagement">Stakeholder Engagement</button>
    <button class="pill" data-domain="general_productivity">General Productivity</button>
    <button class="pill" data-domain="career_performance">Career & Performance</button>
  </div>

  <div class="filter-more-row">
    <button class="filter-toggle" id="filter-toggle">+ More filters</button>
  </div>

  <div class="filter-secondary hidden" id="filter-secondary">
    <span class="filter-label">Complexity:</span>
    <div class="pill-group" id="complexity-pills">
      <button class="pill" data-complexity="beginner">Beginner</button>
      <button class="pill" data-complexity="intermediate">Intermediate</button>
      <button class="pill" data-complexity="advanced">Advanced</button>
    </div>
  </div>
</div>

<style>
  .filter-area { margin-bottom: 20px; }

  .filter-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 8px;
  }

  .pill {
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 20px;
    color: #495057;
    font-size: 0.82rem;
    padding: 5px 14px;
    cursor: pointer;
    transition: background 0.1s, color 0.1s, border-color 0.1s;
    font-family: inherit;
  }
  .pill:hover { border-color: #170a1c; color: #170a1c; }
  .pill.active { background: #170a1c; color: white; border-color: #170a1c; }

  .filter-more-row { margin-bottom: 8px; }

  .filter-toggle {
    background: none;
    border: none;
    color: #6c757d;
    font-size: 0.82rem;
    cursor: pointer;
    padding: 0;
    font-family: inherit;
  }
  .filter-toggle:hover { color: #170a1c; }

  .filter-secondary {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    padding: 10px 0;
  }
  .filter-secondary.hidden { display: none; }

  .filter-label { font-size: 0.82rem; color: #6c757d; }
  .pill-group { display: flex; flex-wrap: wrap; gap: 8px; }
</style>
```

- [ ] Create `src/components/browse/SearchBar.astro`:

```astro
---
interface Props {
  placeholder?: string;
}
const { placeholder = 'Search workflows — e.g. briefing, compliance, plain language…' } = Astro.props;
---

<div class="search-bar-wrap">
  <span class="search-icon">🔍</span>
  <input
    type="search"
    id="browse-search"
    class="search-input"
    placeholder={placeholder}
    autocomplete="off"
  />
</div>

<style>
  .search-bar-wrap {
    position: relative;
    margin-bottom: 20px;
  }
  .search-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1rem;
    pointer-events: none;
  }
  .search-input {
    width: 100%;
    padding: 12px 16px 12px 42px;
    font-size: 0.95rem;
    font-family: inherit;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    background: white;
    outline: none;
    box-sizing: border-box;
  }
  .search-input:focus { border-color: #170a1c; box-shadow: 0 0 0 3px rgba(23,10,28,0.1); }
</style>
```

- [ ] Create `src/components/browse/NoResults.astro`:

```astro
<div class="no-results hidden" id="no-results">
  <p>No workflows match your search. Try different keywords or clear your filters.</p>
</div>

<style>
  .no-results { text-align: center; padding: 48px 20px; color: #6c757d; }
  .no-results.hidden { display: none; }
  .no-results p { margin: 0; font-size: 0.95rem; }
</style>
```

- [ ] Run `npm run build` — expected: builds without errors

---

### Task 12: Create the browse page

**Files:**
- Create: `src/pages/workflows/index.astro`

The browse page at `/workflows/`. Loads all 6 workflow JSONs at build time, renders them as `WorkflowCard` components. A `<script type="application/json">` block passes the search index to client JS (instead of `define:vars` — see CLAUDE.md note).

- [ ] Create `src/pages/workflows/index.astro`:

```astro
---
import TopNav from '../../components/nav/TopNav.astro';
import WorkflowNav from '../../components/nav/WorkflowNav.astro';
import MobileMenu from '../../components/nav/MobileMenu.astro';
import WorkflowCard from '../../components/browse/WorkflowCard.astro';
import FilterPills from '../../components/browse/FilterPills.astro';
import SearchBar from '../../components/browse/SearchBar.astro';
import NoResults from '../../components/browse/NoResults.astro';

// Load all workflow JSONs at build time
const modules = import.meta.glob('../../../data/workflows/*.json', { eager: true });
const workflows = Object.values(modules) as any[];

// Sort by domain then name for consistent ordering
workflows.sort((a, b) => a.domain.localeCompare(b.domain) || a.name.localeCompare(b.name));

const domainLabels = {
  policy_development:     'Policy Development',
  stakeholder_engagement: 'Stakeholder Engagement',
  general_productivity:   'General Productivity',
  communications:         'Communications',
  career_performance:     'Career & Performance',
};
---

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="icon" href="/favicon.ico" />
  <link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:ital,wght@0,200..800;1,200..800&family=Lexend:wght@300..700&display=swap" rel="stylesheet" />
  <!-- Fuse.js for fuzzy search -->
  <script src="https://cdn.jsdelivr.net/npm/fuse.js@7.0.0/dist/fuse.min.js"></script>
  <title>Browse Workflows — APS Prompt Gallery</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    :root {
      --color-bg: #F7F7FF;
      --color-primary: #170a1c;
      --font-heading: 'Lexend', sans-serif;
      --font-body: 'Atkinson Hyperlegible Next', sans-serif;
    }
    body { font-family: var(--font-body); background: var(--color-bg); margin: 0; color: #212529; }
    h1, h2 { font-family: var(--font-heading); }
    a { color: var(--color-primary); }

    .container { max-width: 900px; margin: 0 auto; padding: 0 20px; }
    .page-header { padding: 32px 0 24px; }
    .page-header h1 { margin: 0 0 6px; font-size: 1.6rem; color: var(--color-primary); }
    .page-header p { margin: 0; color: #6c757d; }

    .results-count { font-size: 0.85rem; color: #6c757d; margin-bottom: 16px; }

    .workflow-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 48px;
    }
    @media (max-width: 600px) { .workflow-grid { grid-template-columns: 1fr; } }

    .hidden { display: none !important; }
  </style>
</head>
<body>
  <TopNav />
  <WorkflowNav />
  <MobileMenu />

  <div class="container">
    <div class="page-header">
      <h1>Browse Workflows</h1>
      <p>Find AI-assisted workflows for your work in the Australian Public Service.</p>
    </div>

    <SearchBar />
    <FilterPills />

    <div class="results-count" id="results-count">Showing {workflows.length} workflows</div>

    <div class="workflow-grid" id="workflow-grid">
      {workflows.map((wf) => (
        <WorkflowCard
          id={wf.id}
          icon={wf.icon ?? '📋'}
          name={wf.name}
          url={`/workflows/${wf.slug}`}
          domain={wf.domain}
          domain_label={domainLabels[wf.domain] ?? wf.domain}
          complexity={wf.complexity}
          step_count={Array.isArray(wf.steps) ? wf.steps.length : 0}
          estimated_time={wf.estimated_time ?? ''}
          description={wf.description ?? ''}
          is_new={wf.is_new ?? false}
        />
      ))}
    </div>

    <NoResults />
  </div>

  <!-- Pass search index to client script (per CLAUDE.md: no define:vars for complex objects) -->
  <script type="application/json" id="workflow-index-data" set:html={JSON.stringify(
    workflows.map(wf => ({
      id: wf.id,
      name: wf.name,
      description: wf.description ?? '',
      domain: wf.domain,
      domain_label: domainLabels[wf.domain] ?? wf.domain,
      complexity: wf.complexity,
      tags: wf.tags ?? [],
      step_count: Array.isArray(wf.steps) ? wf.steps.length : 0,
      estimated_time: wf.estimated_time ?? '',
      slug: wf.slug,
    }))
  )} />

  <script>
    // ── Filter + Search state ──────────────────────────────────────────────
    let activeDomain = '';
    let activeComplexities = [];
    let searchQuery = '';
    let fuseInstance = null;
    let fuseMatchIds = null; // null = no search active; Set = matched IDs

    const cards = Array.from(document.querySelectorAll('.workflow-card'));
    const grid = document.getElementById('workflow-grid');
    const countEl = document.getElementById('results-count');
    const noResults = document.getElementById('no-results');

    // Read initial ?domain= param on load
    const params = new URLSearchParams(window.location.search);
    activeDomain = params.get('domain') ?? '';

    // ── Visibility logic ──────────────────────────────────────────────────
    function applyFilters() {
      let visibleCount = 0;
      cards.forEach(card => {
        const domainMatch = !activeDomain || card.dataset.domain === activeDomain;
        const complexityMatch = activeComplexities.length === 0 || activeComplexities.includes(card.dataset.complexity);
        const searchMatch = fuseMatchIds === null || fuseMatchIds.has(card.dataset.id);
        const show = domainMatch && complexityMatch && searchMatch;
        card.classList.toggle('hidden', !show);
        if (show) visibleCount++;
      });
      countEl.textContent = `Showing ${visibleCount} workflow${visibleCount !== 1 ? 's' : ''}`;
      noResults.classList.toggle('hidden', visibleCount > 0);
    }

    // ── Run filters on load (handles ?domain= from Tier 2 nav) ───────────
    if (activeDomain) {
      const pill = document.querySelector(`#domain-pills .pill[data-domain="${activeDomain}"]`);
      if (pill) {
        document.querySelectorAll('#domain-pills .pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
      }
    }
    applyFilters();

    // ── Domain pills ──────────────────────────────────────────────────────
    document.querySelectorAll('#domain-pills .pill').forEach(pill => {
      pill.addEventListener('click', () => {
        activeDomain = pill.dataset.domain ?? '';
        document.querySelectorAll('#domain-pills .pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const url = new URL(window.location.href);
        if (activeDomain) url.searchParams.set('domain', activeDomain);
        else url.searchParams.delete('domain');
        history.replaceState(null, '', url.toString());
        applyFilters();
      });
    });

    // ── Complexity pills ──────────────────────────────────────────────────
    document.querySelectorAll('#complexity-pills .pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const c = pill.dataset.complexity;
        if (activeComplexities.includes(c)) {
          activeComplexities = activeComplexities.filter(x => x !== c);
          pill.classList.remove('active');
        } else {
          activeComplexities.push(c);
          pill.classList.add('active');
        }
        applyFilters();
      });
    });

    // ── More filters toggle ───────────────────────────────────────────────
    document.getElementById('filter-toggle')?.addEventListener('click', function() {
      const secondary = document.getElementById('filter-secondary');
      secondary.classList.toggle('hidden');
      this.textContent = secondary.classList.contains('hidden') ? '+ More filters' : '− Fewer filters';
    });

    // ── Fuse.js search ────────────────────────────────────────────────────
    function initFuse() {
      if (fuseInstance) return;
      const raw = document.getElementById('workflow-index-data');
      if (!raw) return;
      const data = JSON.parse(raw.textContent);
      fuseInstance = new Fuse(data, {
        keys: [
          { name: 'name', weight: 3 },
          { name: 'search_text', weight: 1 },
          { name: 'tags', weight: 2 },
          { name: 'domain_label', weight: 1.5 },
        ],
        threshold: 0.4,
        distance: 100,
        includeScore: true,
        minMatchCharLength: 2,
      });
      // Add search_text to data (it's only computed on the endpoint, not here)
      // Re-init with full data from endpoint once available
    }

    let searchTimer = null;
    document.getElementById('browse-search')?.addEventListener('input', function() {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        searchQuery = this.value.trim();
        if (!searchQuery) {
          fuseMatchIds = null;
          applyFilters();
          return;
        }
        initFuse();
        if (!fuseInstance) return;
        const results = fuseInstance.search(searchQuery);
        fuseMatchIds = new Set(results.map(r => r.item.id));
        applyFilters();
      }, 150);
    });

    // Add data-id to each card so search can match by ID
    // (Cards need data-id attribute — see note below)
  </script>
</body>
</html>
```

- [ ] Run `npm run build` — expected: builds without errors

---

### Task 13: Wire Fuse.js to the search index endpoint

The browse page currently inlines the workflow data for Fuse.js. However, the Fuse.js config references `search_text` which is a concatenated field only present in `/search-index.json`. Switch the browse page to fetch from `/search-index.json` on first search, so `search_text` is available.

- [ ] In the browse page `<script>`, replace `initFuse()` to fetch from the endpoint:

```javascript
async function initFuse() {
  if (fuseInstance) return;
  try {
    const res = await fetch('/search-index.json');
    if (!res.ok) throw new Error('fetch failed');
    const data = await res.json();
    fuseInstance = new window.Fuse(data, {
      keys: [
        { name: 'name', weight: 3 },
        { name: 'search_text', weight: 1 },
        { name: 'tags', weight: 2 },
        { name: 'domain_label', weight: 1.5 },
      ],
      threshold: 0.4,
      distance: 100,
      includeScore: true,
      minMatchCharLength: 2,
    });
  } catch (e) {
    console.error('Search index failed to load', e);
  }
}
```

Also update the `initFuse()` call in the `input` handler to await:
```javascript
document.getElementById('browse-search')?.addEventListener('input', function() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(async () => {
    searchQuery = this.value.trim();
    if (!searchQuery) { fuseMatchIds = null; applyFilters(); return; }
    await initFuse();
    if (!fuseInstance) return;
    const results = fuseInstance.search(searchQuery);
    fuseMatchIds = new Set(results.map(r => r.item.id));
    applyFilters();
  }, 150);
});
```

Remove the `<script type="application/json" id="workflow-index-data">` block from the browse page — it's no longer needed (Fuse.js now fetches from the endpoint).

- [ ] Run `npm run build` — expected: builds without errors
- [ ] Check `dist/search-index.json` contains an array with `search_text` fields

---

### Task 14: Update nav links and homepage, then commit Phase 2

- [ ] In `index.astro`, add a "Browse all workflows" link in the hero or workflow-list section. Find the existing workflow cards section and add below it:

```html
<div style="text-align:center;margin-top:24px">
  <a href="/workflows/" style="font-size:0.9rem;color:#170a1c">Browse all workflows →</a>
</div>
```

- [ ] Run `npm run build` — expected: builds without errors

- [ ] Manually test the browse page (`npm run dev`, go to `/workflows/`):
  - All 6 workflow cards render
  - Clicking a domain pill filters cards
  - Typing "briefing" in the search bar filters to briefing note
  - Typing "breifing" (typo) still finds the briefing note
  - Clicking a Tier 2 nav domain link lands on `/workflows/?domain=X` with that pill pre-highlighted
  - "More filters" toggle shows/hides the Complexity pill row

- [ ] Commit:

```bash
git add src/components/browse/ src/pages/workflows/index.astro src/pages/search-index.json.ts data/workflows/ src/pages/index.astro
git commit -m "add browse page with filter pills and fuse.js search"
```

---

## Phase 3 — Cmd+K Search Overlay

### Task 15: Create SearchOverlay.astro

**Files:**
- Create: `src/components/nav/SearchOverlay.astro`

Always in the DOM, hidden by default. Opens on `open-search` event or Ctrl+K/Cmd+K. Lazily fetches `/search-index.json` on first open.

- [ ] Create `src/components/nav/SearchOverlay.astro`:

```astro
<div class="search-overlay" id="search-overlay" aria-hidden="true">
  <div class="search-modal" role="dialog" aria-label="Search workflows">
    <div class="search-modal-top">
      <input
        type="search"
        id="overlay-search-input"
        class="overlay-search-input"
        placeholder="Search workflows…"
        autocomplete="off"
        spellcheck="false"
      />
      <kbd class="search-esc-hint">ESC</kbd>
    </div>
    <div class="search-status" id="search-status"></div>
    <ul class="search-results" id="search-results" role="listbox"></ul>
  </div>
</div>

<style>
  .search-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 400;
    align-items: flex-start;
    justify-content: center;
    padding-top: 10vh;
  }
  .search-overlay.is-open { display: flex; }

  .search-modal {
    background: white;
    border-radius: 10px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    width: 100%;
    max-width: 560px;
    margin: 0 20px;
    overflow: hidden;
  }

  .search-modal-top {
    display: flex;
    align-items: center;
    border-bottom: 1px solid #dee2e6;
    padding: 0 16px;
  }

  .overlay-search-input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 1.05rem;
    font-family: inherit;
    padding: 18px 12px 18px 0;
    background: transparent;
  }

  .search-esc-hint {
    font-size: 0.72rem;
    background: #f1f3f5;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    padding: 2px 6px;
    color: #868e96;
    font-family: inherit;
  }

  .search-status {
    font-size: 0.82rem;
    color: #868e96;
    padding: 0 16px;
    min-height: 2rem;
    display: flex;
    align-items: center;
  }

  .search-results {
    list-style: none;
    margin: 0;
    padding: 0;
    max-height: 360px;
    overflow-y: auto;
  }

  .search-results a {
    display: block;
    padding: 12px 16px;
    border-bottom: 1px solid #f1f3f5;
    text-decoration: none;
    color: #212529;
    transition: background 0.1s;
  }
  .search-results a:hover,
  .search-results a[aria-selected="true"] { background: #f8f9fa; }

  .result-name { font-weight: 600; font-size: 0.9rem; color: #170a1c; display: block; }
  .result-meta { font-size: 0.78rem; color: #868e96; margin-top: 2px; display: block; }
</style>

<script>
  const overlay = document.getElementById('search-overlay');
  const input = document.getElementById('overlay-search-input');
  const resultsList = document.getElementById('search-results');
  const statusEl = document.getElementById('search-status');

  let fuseInstance = null;
  let selectedIndex = -1;

  async function ensureFuse() {
    if (fuseInstance) return true;
    statusEl.textContent = 'Loading…';
    try {
      const res = await fetch('/search-index.json');
      if (!res.ok) throw new Error('network error');
      const data = await res.json();
      fuseInstance = new window.Fuse(data, {
        keys: [
          { name: 'name', weight: 3 },
          { name: 'search_text', weight: 1 },
          { name: 'tags', weight: 2 },
          { name: 'domain_label', weight: 1.5 },
        ],
        threshold: 0.4,
        distance: 100,
        includeScore: true,
        minMatchCharLength: 2,
      });
      statusEl.textContent = '';
      return true;
    } catch {
      statusEl.textContent = 'Search unavailable.';
      return false;
    }
  }

  function openOverlay() {
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    input.value = '';
    resultsList.innerHTML = '';
    statusEl.textContent = '';
    selectedIndex = -1;
    input.focus();
    ensureFuse(); // pre-warm
  }

  function closeOverlay() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
  }

  window.addEventListener('open-search', openOverlay);

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      overlay.classList.contains('is-open') ? closeOverlay() : openOverlay();
    }
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeOverlay();
  });

  // Close on backdrop click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeOverlay();
  });

  // Search on input
  let searchTimer = null;
  input.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(async () => {
      const q = input.value.trim();
      if (!q) { resultsList.innerHTML = ''; selectedIndex = -1; return; }
      const ready = await ensureFuse();
      if (!ready) return;
      const results = fuseInstance.search(q).slice(0, 8);
      selectedIndex = -1;
      resultsList.innerHTML = results.map(r => `
        <li role="option">
          <a href="${r.item.url}" data-result>
            <span class="result-name">${r.item.name}</span>
            <span class="result-meta">${r.item.domain_label} · ${r.item.complexity} · ${r.item.estimated_time}</span>
          </a>
        </li>
      `).join('');
    }, 150);
  });

  // Keyboard navigation
  input.addEventListener('keydown', (e) => {
    const items = resultsList.querySelectorAll('a[data-result]');
    if (!items.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, -1);
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && items[selectedIndex]) {
        closeOverlay();
        window.location.href = items[selectedIndex].getAttribute('href');
      }
      return;
    } else return;

    items.forEach((item, i) => item.setAttribute('aria-selected', i === selectedIndex ? 'true' : 'false'));
    if (selectedIndex >= 0) items[selectedIndex].scrollIntoView({ block: 'nearest' });
  });
</script>
```

- [ ] Run `npm run build` — expected: builds without errors

---

### Task 16: Include SearchOverlay in layouts

**Files:**
- Modify: `src/layouts/WorkflowLayout.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/pages/about.astro`
- Modify: `src/pages/workflows/index.astro`

The overlay must be present on every page for Cmd+K to work site-wide.

- [ ] In each file, add import and include:

In frontmatter:
```astro
import SearchOverlay from '../components/nav/SearchOverlay.astro';
// (adjust relative path as needed per file location)
```

In HTML (just before `</body>`):
```astro
<SearchOverlay />
```

Also add the Fuse.js CDN script to `WorkflowLayout.astro` and `about.astro` `<head>`:
```html
<script src="https://cdn.jsdelivr.net/npm/fuse.js@7.0.0/dist/fuse.min.js"></script>
```

Note: `index.astro` and `workflows/index.astro` already have this script tag.

- [ ] Run `npm run build` — expected: builds without errors

- [ ] Manually test:
  - On a workflow page, press Ctrl+K — overlay opens
  - Type "meet" — Meeting Preparation appears in results
  - Press Escape — overlay closes
  - Arrow keys move highlight through results, Enter navigates

- [ ] Commit:

```bash
git add src/components/nav/SearchOverlay.astro src/layouts/WorkflowLayout.astro src/pages/index.astro src/pages/about.astro src/pages/workflows/index.astro
git commit -m "add cmd+k search overlay"
```

---

## Phase 4 — Complexity Filter

### Task 17: Wire complexity filter (already scaffolded)

The `FilterPills.astro` and browse page script already include the complexity pill UI and filter logic from Phase 2. The only thing left is verifying the "More filters" toggle and combined filtering work end-to-end.

- [ ] Open `npm run dev`, go to `/workflows/`
- [ ] Click "More filters" — complexity pills appear
- [ ] Select "Intermediate" — cards not matching that complexity hide
- [ ] Select a domain pill AND "Intermediate" — only cards matching both show
- [ ] Clear domain pill (click "All") — only complexity filter active, correct cards show
- [ ] Confirm URL updates on domain filter change (check browser address bar)

If anything doesn't work, the fix is in the `applyFilters()` function in `workflows/index.astro`'s script block — check the AND logic there.

- [ ] Commit if any fixes were needed:

```bash
git add src/pages/workflows/index.astro
git commit -m "fix complexity filter combined logic"
```

---

## Final Acceptance Check

Run through the full acceptance criteria from the spec:

- [ ] Two-tier nav renders on desktop (Tier 1 sticky, Tier 2 visible below it)
- [ ] Tier 2 hides on mobile (< 680px); hamburger opens MobileMenu
- [ ] MobileMenu contains search bar + all nav links from both tiers
- [ ] `/workflows/` browse page shows all 6 workflows as cards
- [ ] Domain filter pills filter cards correctly; URL updates
- [ ] Clicking a Tier 2 domain link pre-applies that filter on the browse page
- [ ] Fuse.js search works (including typos: "breifing" → "Briefing Note")
- [ ] Cmd+K / Ctrl+K opens search overlay from any page
- [ ] Escape closes overlay; arrow keys + Enter navigate results
- [ ] `/about` route renders without 404
- [ ] No regressions on existing workflow pages (`/workflows/briefing-note` etc.)
- [ ] `npm run build` passes with zero errors
- [ ] `dist/search-index.json` exists and contains 6 entries

- [ ] Final commit if any last fixes:

```bash
git add -A
git commit -m "finalise nav and search implementation"
```

---

## Notes

**Sticky Tier 2 scroll behaviour:** The spec calls for Tier 2 to slide up on scroll-down and reappear on scroll-up. This is not included in the tasks above to keep scope focused — the nav works fine without it. If you want to add it, implement an `IntersectionObserver` on a sentinel `<div>` below the nav block in `WorkflowNav.astro`.

**Fuse.js version:** The CDN URL pins to `fuse.js@7.0.0`. Check [cdn.jsdelivr.net/npm/fuse.js/](https://cdn.jsdelivr.net/npm/fuse.js/) if you need a different version.

**About page content:** Content is out of scope. The `/about` placeholder is sufficient.

**Architecture doc update:** After implementation, document the two-tier nav architecture (component structure, custom event pattern, Tier 2 scroll behaviour) in `notes/aps-genai-prompt-library-architecture.md`.
